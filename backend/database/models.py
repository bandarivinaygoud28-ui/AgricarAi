from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    state = Column(String(100), default="Telangana")
    district = Column(String(100), default="Warangal")
    village = Column(String(100), default="Enumamula")
    location = Column(String(200), default="Enumamula, Warangal")
    latitude = Column(Float, default=17.9689)
    longitude = Column(Float, default=79.5941)
    main_crops = Column(String(255), default="Tomato,Paddy,Cotton,Chilli")
    preferred_language = Column(String(10), default="en") # en, te, hi
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DiseaseScan(Base):
    __tablename__ = "disease_scans"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    crop = Column(String(50), nullable=False)
    affected_area = Column(String(50), default="Leaf")
    disease = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.0)
    severity = Column(String(20), default="Moderate") # Low, Moderate, High
    symptoms = Column(Text, nullable=True) # JSON or newline separated
    cause = Column(Text, nullable=True)
    immediate_actions = Column(Text, nullable=True) # JSON string
    treatment = Column(Text, nullable=True) # JSON string
    prevention = Column(Text, nullable=True) # JSON string
    weather_risk = Column(Text, nullable=True) # JSON string
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MarketPriceCache(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    commodity = Column(String(100), index=True, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    market = Column(String(150), index=True, nullable=False)
    variety = Column(String(100), default="Standard")
    min_price = Column(Float, default=0.0)
    max_price = Column(Float, default=0.0)
    modal_price = Column(Float, default=0.0)
    unit = Column(String(20), default="Quintal")
    arrival_date = Column(String(30), nullable=False)
    source = Column(String(100), default="Government of India OGD")
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_type = Column(String(50), index=True, nullable=False) # Tractor, JCB, Drone Spraying, Harvester, Agricultural Equipment
    title = Column(String(150), nullable=False)
    provider_name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    price = Column(Float, nullable=False)
    price_unit = Column(String(50), default="per hour") # per hour, per acre, per day
    availability = Column(String(50), default="Available") # Available, Busy, Booked
    contact_phone = Column(String(20), nullable=False)
    rating = Column(Float, default=4.8)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    booking_date = Column(String(30), nullable=False)
    booking_time = Column(String(30), nullable=False)
    location = Column(String(200), nullable=False)
    status = Column(String(30), default="Confirmed") # Confirmed, Completed, Cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
