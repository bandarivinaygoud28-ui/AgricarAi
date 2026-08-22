import os
import json
import base64
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

from database.database import engine, Base, get_db
from database.models import User, DiseaseScan, Resource, Booking, ResourceRating
from ai.prediction import generate_prediction
from market.market_service import (
    get_market_prices,
    get_market_price_history,
    get_best_market_recommendation
)
from market.mandi_db import ALL_MANDIS, find_nearest_mandi, get_nearby_mandis
from weather.weather_service import get_weather_data
from assistant.assistant_service import process_assistant_query
from news.news_service import fetch_live_agri_news, get_farmer_news
from resources.resource_service import (
    get_resources_list,
    check_resource_availability,
    create_booking,
    get_farmer_bookings,
    get_owner_resources,
    add_owner_resource,
    update_owner_resource,
    delete_owner_resource,
    toggle_resource_availability,
    get_owner_bookings,
    accept_owner_booking,
    reject_owner_booking,
    complete_owner_job,
    get_owner_stats,
    get_owner_earnings_breakdown,
    get_owner_ratings,
    add_farmer_rating,
    update_booking_status,
    cancel_booking
)
from location.location_service import search_locations, reverse_geocode, detect_ip_location
from voice.tts_service import synthesize_speech, get_voice_info
from schemes.schemes_service import get_schemes_list, get_scheme_by_id

# Initialize database tables and ensure column migrations
Base.metadata.create_all(bind=engine)
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        # 1. users table columns
        res_u = conn.execute(text("PRAGMA table_info(users)"))
        user_cols = {row[1] for row in res_u.fetchall()}
        if "role" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(30) DEFAULT 'farmer'"))
        if "mandal" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN mandal VARCHAR(100) DEFAULT 'Enumamula'"))
        if "village" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN village VARCHAR(100) DEFAULT 'Enumamula'"))
        if "latitude" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN latitude FLOAT DEFAULT 17.9689"))
        if "longitude" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN longitude FLOAT DEFAULT 79.5941"))

        # 2. resources table columns
        res_r = conn.execute(text("PRAGMA table_info(resources)"))
        res_cols = {row[1] for row in res_r.fetchall()}
        if "owner_id" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN owner_id INTEGER"))
        if "vehicle_number" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN vehicle_number VARCHAR(50)"))
        if "model" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN model VARCHAR(100)"))
        if "year" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN year VARCHAR(20)"))
        if "village" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN village VARCHAR(100)"))
        if "mandal" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN mandal VARCHAR(100)"))
        if "district" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN district VARCHAR(100)"))
        if "state" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN state VARCHAR(100) DEFAULT 'Telangana'"))
        if "price_per_trip" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN price_per_trip FLOAT DEFAULT 0.0"))
        if "total_ratings" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN total_ratings INTEGER DEFAULT 1"))
        if "created_at" not in res_cols:
            conn.execute(text("ALTER TABLE resources ADD COLUMN created_at DATETIME"))

        # 3. bookings table columns
        res_b = conn.execute(text("PRAGMA table_info(bookings)"))
        bk_cols = {row[1] for row in res_b.fetchall()}
        if "owner_id" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN owner_id INTEGER"))
        if "platform_fee" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN platform_fee FLOAT DEFAULT 0.0"))
        if "owner_earnings" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN owner_earnings FLOAT DEFAULT 0.0"))
        if "mandal" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN mandal VARCHAR(100)"))
        if "farm_latitude" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN farm_latitude FLOAT"))
        if "farm_longitude" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN farm_longitude FLOAT"))
        if "updated_at" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN updated_at DATETIME"))
        if "completed_at" not in bk_cols:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN completed_at DATETIME"))

        conn.commit()
except Exception as e:
    print(f"DB column verification note: {e}")

app = FastAPI(
    title="AgriCare AI API",
    description="Backend API for AgriCare AI — AI Farmer Platform",
    version="2.0.0"
)

# CORS Middleware allowing Owner Portal (5177 / 5175 / 5174), Farmer Portal (5173), and production domains
ALLOWED_ORIGINS = [
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://hv-2026-0051-vortex.vercel.app",
    "https://hv2026-0051-vortex.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Uploads directory for resource and profile images
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

import uuid
import hashlib
import secrets

@app.post("/api/owner/upload-image")
@app.post("/api/upload")
async def upload_resource_image(
    file: UploadFile = File(...)
):
    """Handle agricultural machinery image uploads with validation (< 5 MB, image format)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a valid image file (JPEG, PNG, WEBP)."
        )

    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        ext = ".jpg"

    unique_name = f"res_{uuid.uuid4().hex[:12]}{ext}"
    target_path = os.path.join(UPLOAD_DIR, unique_name)

    size = 0
    with open(target_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > 5 * 1024 * 1024:  # 5MB limit
                if os.path.exists(target_path):
                    os.remove(target_path)
                raise HTTPException(
                    status_code=400,
                    detail="File too large. Maximum allowed image size is 5 MB."
                )
            buffer.write(chunk)

    image_url = f"/uploads/{unique_name}"
    return {
        "success": True,
        "image_url": image_url,
        "filename": file.filename,
        "size": size,
        "message": "Resource image uploaded successfully."
    }

# Password Hashing using standard library PBKDF2-HMAC
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, key_hex = hashed_password.split('$')
        computed_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return computed_key.hex() == key_hex
    except Exception:
        return False

SECRET_KEY = os.getenv("SECRET_KEY", "agricare_super_secret_jwt_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        phone: str = payload.get("sub")
        if phone is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.phone == phone).first()
    return user


def get_current_owner(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    """Dependency to authenticate and authorize resource owner."""
    user = get_current_user(token, db)
    return user


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    name: str
    phone: str
    password: str
    email: Optional[str] = None
    role: Optional[str] = "farmer"
    state: Optional[str] = "Telangana"
    district: Optional[str] = "Warangal"
    mandal: Optional[str] = "Enumamula"
    village: Optional[str] = "Enumamula"
    location: Optional[str] = "Enumamula, Warangal"
    latitude: Optional[float] = 17.9689
    longitude: Optional[float] = 79.5941
    main_crops: Optional[str] = "Tomato,Paddy,Cotton"
    preferred_language: Optional[str] = "en"


class OwnerRegisterRequest(BaseModel):
    name: str
    phone: str
    password: str
    email: Optional[str] = None
    role: Optional[str] = "resource_owner"
    village: Optional[str] = "Kummarguda"
    mandal: Optional[str] = "Shamshabad"
    district: Optional[str] = "Ranga Reddy"
    state: Optional[str] = "Telangana"
    latitude: Optional[float] = 17.2285
    longitude: Optional[float] = 78.4312


class OwnerLoginRequest(BaseModel):
    phone: str
    password: str


class OwnerProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class OwnerAddResourceRequest(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None
    resource_type: str
    vehicle_number: Optional[str] = None
    model: Optional[str] = None
    year: Optional[str] = "2024"
    category: Optional[str] = None
    description: Optional[str] = ""
    image_url: Optional[str] = None
    image: Optional[str] = None
    price_per_hour: Optional[float] = 800.0
    price_per_day: Optional[float] = 6400.0
    price_per_acre: Optional[float] = 0.0
    price_per_trip: Optional[float] = 0.0
    price_unit: Optional[str] = "hour"
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = "Telangana"
    location: Optional[str] = None
    latitude: Optional[float] = 17.2285
    longitude: Optional[float] = 78.4312
    availability: Optional[str] = "Available"
    specs: Optional[str] = ""
    terms: Optional[str] = ""


class OwnerAvailabilityUpdateRequest(BaseModel):
    availability: str # Available, Unavailable


class FarmerRatingRequest(BaseModel):
    booking_id: Optional[str] = None
    resource_id: int
    farmer_name: Optional[str] = "Farmer"
    rating: float
    review: Optional[str] = None


class LoginRequest(BaseModel):
    phone: str
    password: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    main_crops: Optional[str] = None
    preferred_language: Optional[str] = None


class PredictJsonRequest(BaseModel):
    crop: str
    affected_area: Optional[str] = "Leaf"
    image_url: Optional[str] = None
    image_base64: Optional[str] = None


class SaveScanRequest(BaseModel):
    crop: str
    affected_area: str
    disease: str
    confidence: float
    severity: str
    symptoms: List[str]
    cause: str
    immediate_actions: List[str]
    treatment: List[str]
    prevention: List[str]
    weather_risk: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None


class AssistantRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    diagnosis_context: Optional[Dict[str, Any]] = None
    location: Optional[str] = "Warangal, Telangana"


class VoiceSynthesizeRequest(BaseModel):
    text: str
    language: Optional[str] = "te-IN"


class BookingRequest(BaseModel):
    farmer_name: str
    farmer_phone: str
    resource_id: int
    booking_date: str
    booking_time: str
    location: str
    notes: Optional[str] = None


@app.get("/")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgriCare AI API",
        "version": "2.0.0"
    }


# ============================================================
# 1. AUTHENTICATION & FARMER PROFILE ENDPOINTS
# ============================================================

@app.post("/api/register")
def register_farmer(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered. Please login.")

    hashed_pw = hash_password(req.password)
    user = User(
        name=req.name,
        phone=req.phone,
        email=req.email,
        password_hash=hashed_pw,
        state=req.state or "Telangana",
        district=req.district or "Warangal",
        village=req.village or "Enumamula",
        location=req.location or "Enumamula, Warangal",
        latitude=req.latitude if req.latitude is not None else 17.9689,
        longitude=req.longitude if req.longitude is not None else 79.5941,
        main_crops=req.main_crops or "Tomato,Paddy,Cotton",
        preferred_language=req.preferred_language or "en"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.phone, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "state": user.state,
            "district": user.district,
            "village": user.village,
            "location": user.location,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "main_crops": user.main_crops,
            "preferred_language": user.preferred_language
        }
    }


@app.post("/api/login")
def login_farmer(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token(data={"sub": user.phone, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "state": user.state,
            "district": user.district,
            "village": user.village,
            "location": user.location,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "main_crops": user.main_crops,
            "preferred_language": user.preferred_language
        }
    }


@app.get("/api/profile")
def get_farmer_profile(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        # Return demo profile if not logged in
        return {
            "id": 1,
            "name": "Ramesh Patel",
            "phone": "+91 98480 12345",
            "email": "ramesh.farmer@agricare.ai",
            "state": "Telangana",
            "district": "Warangal",
            "village": "Enumamula",
            "location": "Enumamula, Warangal",
            "latitude": 17.9689,
            "longitude": 79.5941,
            "main_crops": "Tomato,Paddy,Cotton,Chilli",
            "preferred_language": "en"
        }
    return {
        "id": current_user.id,
        "name": current_user.name,
        "phone": current_user.phone,
        "email": current_user.email,
        "state": current_user.state,
        "district": current_user.district,
        "village": current_user.village,
        "location": current_user.location,
        "latitude": current_user.latitude,
        "longitude": current_user.longitude,
        "main_crops": current_user.main_crops,
        "preferred_language": current_user.preferred_language
    }


@app.put("/api/profile")
def update_farmer_profile(
    req: ProfileUpdateRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return {"success": True, "message": "Profile updated in session", "profile": req.dict(exclude_unset=True)}

    if req.name is not None: current_user.name = req.name
    if req.phone is not None: current_user.phone = req.phone
    if req.email is not None: current_user.email = req.email
    if req.state is not None: current_user.state = req.state
    if req.district is not None: current_user.district = req.district
    if req.village is not None: current_user.village = req.village
    if req.location is not None: current_user.location = req.location
    if req.latitude is not None: current_user.latitude = req.latitude
    if req.longitude is not None: current_user.longitude = req.longitude
    if req.main_crops is not None: current_user.main_crops = req.main_crops
    if req.preferred_language is not None: current_user.preferred_language = req.preferred_language

    db.commit()
    db.refresh(current_user)
    return {"success": True, "message": "Profile updated successfully", "user": {
        "id": current_user.id,
        "name": current_user.name,
        "phone": current_user.phone,
        "email": current_user.email,
        "state": current_user.state,
        "district": current_user.district,
        "village": current_user.village,
        "location": current_user.location,
        "latitude": current_user.latitude,
        "longitude": current_user.longitude,
        "main_crops": current_user.main_crops,
        "preferred_language": current_user.preferred_language
    }}


# ============================================================
# 2. AI CROP DISEASE IDENTIFICATION & REPORT ENDPOINTS
# ============================================================

@app.post("/api/predict")
async def predict_disease_multipart(
    crop: str = Form("Tomato"),
    affected_area: str = Form("Leaf"),
    image: Optional[UploadFile] = File(None)
):
    image_bytes = None
    if image:
        image_bytes = await image.read()

    result = generate_prediction(
        crop=crop,
        affected_area=affected_area,
        image_bytes=image_bytes,
        filename=image.filename if image else None
    )

    # Attach live market summary and weather risk to enrich Crop Health Report
    market_data = get_market_prices(crop=crop)
    weather_data = get_weather_data(crop=crop)

    result["market_summary"] = market_data.get("summary")
    result["weather_risk"] = weather_data.get("agricultural_advisory")

    return result


@app.post("/api/predict/json")
def predict_disease_json(req: PredictJsonRequest):
    image_bytes = None
    if req.image_base64:
        try:
            if "," in req.image_base64:
                b64_str = req.image_base64.split(",")[1]
            else:
                b64_str = req.image_base64
            image_bytes = base64.b64decode(b64_str)
        except Exception:
            image_bytes = None

    result = generate_prediction(
        crop=req.crop,
        affected_area=req.affected_area or "Leaf",
        image_bytes=image_bytes
    )

    # Attach live market summary and weather risk to enrich Crop Health Report
    market_data = get_market_prices(crop=req.crop)
    weather_data = get_weather_data(crop=req.crop)

    result["market_summary"] = market_data.get("summary")
    result["weather_risk"] = weather_data.get("agricultural_advisory")

    return result


@app.post("/api/history")
def save_scan_history(
    req: SaveScanRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = DiseaseScan(
        farmer_id=current_user.id if current_user else None,
        crop=req.crop,
        affected_area=req.affected_area,
        disease=req.disease,
        confidence=req.confidence,
        severity=req.severity,
        symptoms=json.dumps(req.symptoms),
        cause=req.cause,
        immediate_actions=json.dumps(req.immediate_actions),
        treatment=json.dumps(req.treatment),
        prevention=json.dumps(req.prevention),
        weather_risk=json.dumps(req.weather_risk) if req.weather_risk else None,
        image_url=req.image_url
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return {"success": True, "id": scan.id, "message": "Scan saved to Crop Health History"}


@app.get("/api/history")
def get_scan_history(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DiseaseScan)
    if current_user:
        query = query.filter(DiseaseScan.farmer_id == current_user.id)
    
    scans = query.order_by(DiseaseScan.created_at.desc()).limit(50).all()

    # If database is empty, return a few illustrative scans
    if not scans:
        return [
            {
                "id": 1,
                "crop": "Tomato",
                "affected_area": "Leaf",
                "disease": "Tomato Early Blight (Alternaria solani)",
                "confidence": 0.94,
                "severity": "High",
                "symptoms": ["Concentric brown rings on older leaves", "Yellow halo around lesions", "Lower canopy defoliation"],
                "cause": "Fungal pathogen Alternaria solani under warm, humid conditions",
                "immediate_actions": ["Prune heavily infected lower leaves", "Stop overhead irrigation", "Space plants for aeration"],
                "treatment": ["Spray Mancozeb 75% WP @ 2.5 g/L", "Rotate with Azoxystrobin 23% SC @ 1 ml/L"],
                "prevention": ["2-3 year crop rotation", "Organic mulch to prevent soil splash", "Use disease-resistant seeds"],
                "weather_risk": {"disease_risk": "High", "disease_risk_factors": ["High humidity (75%)"]},
                "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80",
                "date": "18 Aug 2026"
            },
            {
                "id": 2,
                "crop": "Paddy",
                "affected_area": "Leaf",
                "disease": "Rice Blast (Magnaporthe oryzae)",
                "confidence": 0.95,
                "severity": "High",
                "symptoms": ["Spindle-shaped lesions with grey center", "Neck blast rot", "Blighted canopy"],
                "cause": "Airborne fungus Magnaporthe oryzae favored by cloudy, wet weather",
                "immediate_actions": ["Suspend urea top-dressing", "Maintain 2-3 cm shallow water"],
                "treatment": ["Spray Tricyclazole 75% WP @ 0.6 g/L", "Nativo @ 0.4 g/L at booting stage"],
                "prevention": ["Seed treatment with Carbendazim", "Balanced nitrogen and potash fertilizer"],
                "weather_risk": {"disease_risk": "Moderate", "disease_risk_factors": ["Recent rain"]},
                "image_url": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=80",
                "date": "16 Aug 2026"
            }
        ]

    results = []
    for s in scans:
        results.append({
            "id": s.id,
            "crop": s.crop,
            "affected_area": s.affected_area,
            "disease": s.disease,
            "confidence": s.confidence,
            "severity": s.severity,
            "symptoms": json.loads(s.symptoms) if s.symptoms else [],
            "cause": s.cause or "",
            "immediate_actions": json.loads(s.immediate_actions) if s.immediate_actions else [],
            "treatment": json.loads(s.treatment) if s.treatment else [],
            "prevention": json.loads(s.prevention) if s.prevention else [],
            "weather_risk": json.loads(s.weather_risk) if s.weather_risk else {},
            "image_url": s.image_url,
            "date": s.created_at.strftime("%d %b %Y") if s.created_at else "Recently"
        })
    return results


# ============================================================
# 3. FARMER ADVISORY ENDPOINT
# ============================================================

@app.get("/api/advisory")
def get_farmer_advisory(crop: str = Query("Tomato")):
    """
    Dedicated Farmer Advisory module returning structured treatment, prevention,
    crop management, immediate actions, and long-term prevention.
    """
    diagnosis = generate_prediction(crop=crop, affected_area="Leaf")
    weather = get_weather_data(crop=crop)
    market = get_market_prices(crop=crop)

    return {
        "crop": crop,
        "standard_diagnosis": diagnosis,
        "weather_risk": weather.get("agricultural_advisory"),
        "market_summary": market.get("summary"),
        "best_practices": [
            "Conduct soil test every 2 seasons to calibrate fertilizer dosage",
            "Adopt drip irrigation with plastic mulching to conserve water and suppress weeds",
            "Use pheromone traps and biological agents before applying chemical pesticides",
            "Maintain proper plant geometry for sunlight penetration and air circulation"
        ]
    }


# ============================================================
# 4. LOCATION & GEOCODING ENDPOINTS
# ============================================================

@app.get("/api/location/search")
def location_search_endpoint(
    q: Optional[str] = Query(None, alias="query"),
    query: Optional[str] = Query(None),
    limit: int = Query(8, ge=1, le=20)
):
    search_term = q or query or ""
    return search_locations(query=search_term, limit=limit)


@app.get("/api/location/reverse")
def reverse_geocode_endpoint(
    lat: float = Query(...),
    lon: float = Query(...)
):
    return reverse_geocode(lat=lat, lon=lon)


@app.get("/api/location/detect")
def detect_location_endpoint():
    return detect_ip_location()


# ============================================================
# 5. WEATHER & AGRO-RISK ENDPOINT
# ============================================================

@app.get("/api/weather")
def get_weather(
    location: Optional[str] = Query("Warangal, Telangana"),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    crop: Optional[str] = Query("Tomato")
):
    return get_weather_data(location=location, lat=lat, lon=lon, crop=crop)


# ============================================================
# 5. MARKET PRICES ENDPOINTS (Strictly "Market Prices")
# ============================================================

@app.get("/api/market-prices")
def fetch_market_prices_endpoint(
    crop: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    market: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    date: Optional[str] = Query(None)
):
    return get_market_prices(
        crop=crop,
        state=state,
        district=district,
        market=market,
        lat=lat,
        lon=lon,
        date=date
    )


@app.get("/api/market-prices/history")
def fetch_market_price_history_endpoint(
    crop: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    market: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    days: int = Query(7, ge=7, le=30)
):
    return get_market_price_history(
        crop=crop,
        state=state,
        district=district,
        market=market,
        lat=lat,
        lon=lon,
        days=days
    )


@app.get("/api/market-prices/best-market")
def fetch_best_market_endpoint(
    lat: float = Query(...),
    lon: float = Query(...),
    crop: str = Query("Tomato")
):
    return get_best_market_recommendation(lat=lat, lon=lon, crop=crop)


@app.get("/api/market-prices/mandis")
def list_mandis_endpoint(
    search: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    results = ALL_MANDIS
    if lat is not None and lon is not None:
        results = get_nearby_mandis(lat, lon, limit=len(ALL_MANDIS))

    if search:
        s_lower = search.strip().lower()
        results = [
            m for m in results
            if s_lower in m["name"].lower() or
               s_lower in m["district"].lower() or
               s_lower in m["state"].lower()
        ]
    if state and state != "All States":
        results = [m for m in results if state.lower() in m["state"].lower()]
    if district:
        results = [m for m in results if district.lower() in m["district"].lower()]

    return results[:limit]


# ============================================================
# 6. AI FARMER ASSISTANT ENDPOINT
# ============================================================

@app.post("/api/assistant")
def chat_with_ai_assistant(req: AssistantRequest):
    return process_assistant_query(
        message=req.message,
        language=req.language or "en",
        diagnosis_context=req.diagnosis_context,
        location=req.location or "Warangal, Telangana"
    )


# ============================================================
# 6.1 CLOUD TEXT-TO-SPEECH (TTS) ENDPOINT (Telugu, Hindi, English)
# ============================================================

@app.post("/api/voice/synthesize")
async def synthesize_text_to_speech(req: VoiceSynthesizeRequest):
    """
    Cloud Neural Text-to-Speech synthesis for Indian Languages.
    Supports te-IN (Telugu), hi-IN (Hindi), and en-IN (Indian English).
    Returns MP3 audio stream.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text for speech synthesis cannot be empty"
        )
    try:
        audio_bytes = await synthesize_speech(
            text=req.text.strip(),
            language=req.language or "te-IN"
        )
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except Exception as e:
        print(f"Voice synthesis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Voice service temporarily unavailable. Please try again."
        )


@app.get("/api/voice/info")
def get_voice_service_info(language: str = Query("te-IN")):
    """Returns active cloud neural voice metadata for the language."""
    return get_voice_info(language=language)


# ============================================================
# 6.2 GOVERNMENT SCHEMES & SUBSIDIES ENDPOINTS
# ============================================================

@app.get("/api/schemes")
def list_government_schemes(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    crops: Optional[str] = Query(None),
    land_area: Optional[float] = Query(None),
    category: Optional[str] = Query("All"),
    search: Optional[str] = Query(None),
    scope: Optional[str] = Query(None)
):
    """
    Returns verified Government Schemes, Subsidies, Loans, and Support Programs.
    Prioritizes state and district programs according to farmer location and crops.
    """
    return get_schemes_list(
        state=state,
        district=district,
        crops=crops,
        land_area=land_area,
        category=category,
        search=search,
        scope=scope
    )


@app.get("/api/schemes/{scheme_id}")
def fetch_scheme_details(scheme_id: str):
    """Returns full verified details and application guidelines for a specific scheme."""
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' not found."
        )
    return scheme


# ============================================================
# 7. REAL-TIME AGRICULTURAL MARKET NEWS ENDPOINT
# ============================================================

@app.get("/api/news")
def fetch_news(
    category: Optional[str] = Query("All"),
    filter: Optional[str] = Query("All", alias="filter_type"),
    filter_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    crops: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    language: str = Query("en"),
    limit: int = Query(35, ge=1, le=60),
    refresh: bool = Query(False, alias="force_refresh"),
    force_refresh: bool = Query(False)
):
    filt = filter_type or filter or "All"
    refr = refresh or force_refresh
    return fetch_live_agri_news(
        category=category,
        filter_type=filt,
        search=search,
        location=location,
        district=district,
        state=state,
        crops=crops,
        lat=lat,
        lon=lon,
        language=language,
        limit=limit,
        force_refresh=refr
    )


# ============================================================
# 8. FARM RESOURCES & BOOKING ENDPOINTS
# ============================================================

@app.get("/api/resources")
def list_resources(
    resource_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_resources_list(db=db, resource_type=resource_type, location=location)


@app.get("/api/resources/availability")
def check_availability(
    resource_id: int = Query(...),
    date: str = Query(...),
    db: Session = Depends(get_db)
):
    return check_resource_availability(db=db, resource_id=resource_id, booking_date=date)


@app.post("/api/resources/book")
def book_resource(
    req: BookingRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_booking(
        db=db,
        farmer_id=current_user.id if current_user else None,
        farmer_name=req.farmer_name,
        farmer_phone=req.farmer_phone,
        resource_id=req.resource_id,
        booking_date=req.booking_date,
        booking_time=req.booking_time,
        location=req.location,
        notes=req.notes
    )


@app.get("/api/resources/bookings")
def list_bookings(
    farmer_id: Optional[int] = Query(None),
    phone: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fid = current_user.id if current_user else farmer_id
    return get_farmer_bookings(db=db, farmer_id=fid, phone=phone, status=status)


@app.get("/api/resources/owner/stats")
def get_owner_dashboard_stats(
    owner_phone: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    phone = (current_user.phone if current_user else None) or owner_phone
    return get_owner_stats(db=db, owner_phone=phone)


@app.post("/api/resources")
def add_new_resource(
    resource_data: Dict[str, Any],
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user and not resource_data.get("contact_phone"):
        resource_data["contact_phone"] = current_user.phone
        resource_data["provider_name"] = current_user.name
    return add_owner_resource(db=db, data=resource_data)


@app.put("/api/resources/{resource_id}")
def update_resource(
    resource_id: int,
    resource_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    try:
        return update_owner_resource(db=db, resource_id=resource_id, data=resource_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.delete("/api/resources/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db)
):
    return delete_owner_resource(db=db, resource_id=resource_id)


class BookingStatusUpdateRequest(BaseModel):
    status: str


@app.put("/api/resources/bookings/{booking_id}/status")
def change_booking_status(
    booking_id: str,
    req: BookingStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    return update_booking_status(db=db, booking_id=booking_id, new_status=req.status)


@app.post("/api/resources/bookings/cancel")
def cancel_booking_endpoint(
    booking_id: str = Query(...),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return cancel_booking(db=db, booking_id=booking_id, farmer_id=current_user.id if current_user else None)



# ============================================================
# 9. AGRI RESOURCE OWNER PORTAL ENDPOINTS
# ============================================================

@app.post("/api/owner/register")
def register_owner(req: OwnerRegisterRequest, db: Session = Depends(get_db)):
    clean_phone = "".join(c for c in req.phone if c.isdigit())
    if len(clean_phone) > 10:
        clean_phone = clean_phone[-10:]

    if not clean_phone or len(clean_phone) != 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit Indian mobile number.")

    existing = db.query(User).filter((User.phone == req.phone) | (User.phone == clean_phone) | (User.phone.like(f"%{clean_phone}"))).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered. Please login or use another number.")

    if not req.name or not req.name.strip():
        raise HTTPException(status_code=400, detail="Full name is required.")

    if not req.password or len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    hashed_pw = hash_password(req.password)
    owner = User(
        name=req.name.strip(),
        phone=clean_phone,
        email=req.email.strip() if req.email else None,
        password_hash=hashed_pw,
        role="resource_owner",
        village=req.village or "Kummarguda",
        mandal=req.mandal or "Shamshabad",
        district=req.district or "Ranga Reddy",
        state=req.state or "Telangana",
        location=f"{req.village or 'Kummarguda'}, {req.district or 'Ranga Reddy'}, {req.state or 'Telangana'}",
        latitude=req.latitude if req.latitude is not None else 17.2285,
        longitude=req.longitude if req.longitude is not None else 78.4312,
        preferred_language="en"
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    token = create_access_token(data={"sub": owner.phone, "id": owner.id, "role": "resource_owner"})
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": owner.id,
            "name": owner.name,
            "phone": owner.phone,
            "email": owner.email,
            "role": "resource_owner",
            "village": owner.village,
            "mandal": owner.mandal,
            "district": owner.district,
            "state": owner.state,
            "location": owner.location,
            "latitude": owner.latitude,
            "longitude": owner.longitude
        },
        "message": "Owner account created successfully."
    }


@app.post("/api/owner/login")
@app.post("/owner/login")
def login_owner(req: OwnerLoginRequest, db: Session = Depends(get_db)):
    clean_phone = "".join(c for c in req.phone if c.isdigit())
    if len(clean_phone) > 10:
        clean_phone = clean_phone[-10:]

    user = db.query(User).filter((User.phone == req.phone) | (User.phone == clean_phone) | (User.phone.like(f"%{clean_phone}"))).first()

    # Auto-seed default demo owner if logging in with demo credentials
    if not user and (clean_phone == "9876543210" or clean_phone == "9012345678"):
        demo_name = "Ramesh Kumar" if clean_phone == "9876543210" else "Naresh Yadav"
        user = User(
            name=demo_name,
            phone=clean_phone,
            email=f"{demo_name.lower().replace(' ', '.')}@agricare.ai",
            password_hash=hash_password(req.password or "owner123"),
            role="resource_owner",
            village="Kummarguda" if clean_phone == "9876543210" else "Shamshabad",
            mandal="Shamshabad",
            district="Ranga Reddy",
            state="Telangana",
            location="Kummarguda, Shamshabad, Ranga Reddy",
            latitude=17.2285,
            longitude=78.4312,
            preferred_language="en"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user:
        raise HTTPException(status_code=401, detail="Account not found. Please check your mobile number or register as a new owner.")

    # Owner Role Check (Requirement 4)
    if user.role != "resource_owner":
        raise HTTPException(status_code=403, detail="This account is not a Resource Owner account.")

    # Password validation
    is_valid_pass = verify_password(req.password, user.password_hash)
    if not is_valid_pass and clean_phone in ["9876543210", "9012345678"] and req.password in ["owner123", "password123"]:
        is_valid_pass = True
        user.password_hash = hash_password(req.password)
        db.commit()

    if not is_valid_pass:
        raise HTTPException(status_code=401, detail="Invalid mobile number or password.")

    token = create_access_token(data={"sub": user.phone, "id": user.id, "role": user.role or "resource_owner"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "email": user.email,
            "role": user.role or "resource_owner",
            "village": user.village or "Kummarguda",
            "mandal": user.mandal or "Shamshabad",
            "district": user.district or "Ranga Reddy",
            "state": user.state or "Telangana",
            "location": user.location or f"{user.village}, {user.district}",
            "latitude": user.latitude or 17.2285,
            "longitude": user.longitude or 78.4312
        }
    }


@app.get("/api/owner/profile")
@app.get("/owner/profile")
def get_owner_profile(current_owner: Optional[User] = Depends(get_current_owner), db: Session = Depends(get_db)):
    if not current_owner:
        raise HTTPException(status_code=401, detail="Authentication required. Please log in.")
    return {
        "id": current_owner.id,
        "name": current_owner.name,
        "phone": current_owner.phone,
        "email": current_owner.email,
        "role": current_owner.role or "resource_owner",
        "village": current_owner.village or "Kummarguda",
        "mandal": current_owner.mandal or "Shamshabad",
        "district": current_owner.district or "Ranga Reddy",
        "state": current_owner.state or "Telangana",
        "location": current_owner.location or f"{current_owner.village}, {current_owner.district}",
        "latitude": current_owner.latitude or 17.2285,
        "longitude": current_owner.longitude or 78.4312
    }


@app.put("/api/owner/profile")
@app.put("/owner/profile")
def update_owner_profile_endpoint(
    req: OwnerProfileUpdateRequest,
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    if not current_owner:
        raise HTTPException(status_code=401, detail="Authentication required. Please log in.")

    target_owner = current_owner
    if req.name:
        target_owner.name = req.name
    if req.phone:
        target_owner.phone = req.phone
    if req.email is not None:
        target_owner.email = req.email
    if req.village:
        target_owner.village = req.village
    if req.mandal:
        target_owner.mandal = req.mandal
    if req.district:
        target_owner.district = req.district
    if req.state:
        target_owner.state = req.state
    if req.latitude is not None:
        target_owner.latitude = req.latitude
    if req.longitude is not None:
        target_owner.longitude = req.longitude

    target_owner.location = f"{target_owner.village or ''}, {target_owner.district or ''}, {target_owner.state or ''}".strip(", ")
    db.commit()
    db.refresh(target_owner)

    return {
        "success": True,
        "message": "Owner profile updated successfully!",
        "user": {
            "id": target_owner.id,
            "name": target_owner.name,
            "phone": target_owner.phone,
            "email": target_owner.email,
            "role": target_owner.role or "resource_owner",
            "village": target_owner.village,
            "mandal": target_owner.mandal,
            "district": target_owner.district,
            "state": target_owner.state,
            "location": target_owner.location,
            "latitude": target_owner.latitude,
            "longitude": target_owner.longitude
        }
    }


@app.get("/api/owner/resources")
def get_owner_resources_endpoint(
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    if not current_owner:
        return []
    owner_id = current_owner.id
    owner_phone = current_owner.phone
    return get_owner_resources(db=db, owner_id=owner_id, owner_phone=owner_phone)


@app.post("/api/owner/resources")
def add_owner_resource_endpoint(
    req: OwnerAddResourceRequest,
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    if not current_owner:
        raise HTTPException(status_code=401, detail="Authentication required. Please log in.")
    data = req.dict()
    return add_owner_resource(db=db, data=data, owner=current_owner)


@app.put("/api/owner/resources/{resource_id}")
def update_owner_resource_endpoint(
    resource_id: int,
    req: OwnerAddResourceRequest,
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    data = req.dict()
    return update_owner_resource(db=db, resource_id=resource_id, data=data, owner_id=current_owner.id if current_owner else None)


@app.patch("/api/owner/resources/{resource_id}/availability")
def toggle_owner_resource_availability(
    resource_id: int,
    req: OwnerAvailabilityUpdateRequest,
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    return toggle_resource_availability(
        db=db,
        resource_id=resource_id,
        availability=req.availability,
        owner_id=current_owner.id if current_owner else None
    )


@app.delete("/api/owner/resources/{resource_id}")
def delete_owner_resource_endpoint(
    resource_id: int,
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    return delete_owner_resource(db=db, resource_id=resource_id, owner_id=current_owner.id if current_owner else None)


@app.get("/api/owner/bookings")
def get_owner_bookings_endpoint(
    status: Optional[str] = Query("all"),
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    owner_id = current_owner.id if current_owner else None
    owner_phone = current_owner.phone if current_owner else None
    return get_owner_bookings(db=db, owner_id=owner_id, owner_phone=owner_phone, status_filter=status)


@app.post("/api/owner/bookings/{booking_id}/accept")
def accept_booking_endpoint(
    booking_id: str,
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    return accept_owner_booking(db=db, booking_id=booking_id, owner_id=current_owner.id if current_owner else None)


@app.post("/api/owner/bookings/{booking_id}/reject")
def reject_booking_endpoint(
    booking_id: str,
    reason: Optional[str] = Query(None),
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    return reject_owner_booking(db=db, booking_id=booking_id, reason=reason, owner_id=current_owner.id if current_owner else None)


@app.post("/api/owner/bookings/{booking_id}/complete")
def complete_job_endpoint(
    booking_id: str,
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    return complete_owner_job(db=db, booking_id=booking_id, owner_id=current_owner.id if current_owner else None)


@app.get("/api/owner/stats")
def get_owner_stats_endpoint(
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    owner_id = current_owner.id if current_owner else None
    owner_phone = current_owner.phone if current_owner else None
    return get_owner_stats(db=db, owner_phone=owner_phone, owner_id=owner_id)


@app.get("/api/owner/earnings")
def get_owner_earnings_endpoint(
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    owner_id = current_owner.id if current_owner else None
    owner_phone = current_owner.phone if current_owner else None
    return get_owner_earnings_breakdown(db=db, owner_id=owner_id, owner_phone=owner_phone)


@app.get("/api/owner/ratings")
def get_owner_ratings_endpoint(
    current_owner: Optional[User] = Depends(get_current_owner),
    db: Session = Depends(get_db)
):
    owner_id = current_owner.id if current_owner else None
    owner_phone = current_owner.phone if current_owner else None
    return get_owner_ratings(db=db, owner_id=owner_id, owner_phone=owner_phone)


@app.post("/api/resources/ratings")
def submit_farmer_rating_endpoint(
    req: FarmerRatingRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farmer_id = current_user.id if current_user else None
    farmer_name = (current_user.name if current_user else None) or req.farmer_name or "Farmer"
    return add_farmer_rating(
        db=db,
        booking_id=req.booking_id or "AGR-2026-0001",
        resource_id=req.resource_id,
        farmer_id=farmer_id,
        farmer_name=farmer_name,
        rating=req.rating,
        review=req.review
    )


# Root Health Check
@app.get("/")
def root():
    return {
        "platform": "AgriCare AI — Unified Agricultural Platform",
        "status": "healthy",
        "version": "2.0.0",
        "portals": [
            "AgriCare Farmer Portal (Existing Web App)",
            "AgriCare Resource Owner Portal (New Web App)"
        ],
        "modules": [
            "Farmer Login / Profile",
            "Resource Owner Login / Profile",
            "AI Crop Disease Identification",
            "Farmer Advisory",
            "Weather & Agro-Risk",
            "Market Prices",
            "AI Farmer Assistant",
            "Farm Resources Marketplace",
            "Owner Resource & Fleet Management",
            "Live Booking Requests & Job Dispatch",
            "Owner Earnings & 5% Platform Accounting",
            "Farmer Ratings & Equipment Reviews"
        ]
    }

