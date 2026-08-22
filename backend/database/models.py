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
    role = Column(String(30), default="farmer", index=True) # farmer, resource_owner
    state = Column(String(100), default="Telangana")
    district = Column(String(100), default="Warangal")
    mandal = Column(String(100), default="Enumamula")
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
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resource_type = Column(String(50), index=True, nullable=False) # Tractor, JCB / Earthmover, Harvester, Agricultural Drone, Sprayer, Seed Sowing Machine, Water Pump, Farm Transport, Other Farm Machinery
    category = Column(String(50), index=True, default="Tractors")
    title = Column(String(150), nullable=False)
    vehicle_number = Column(String(50), nullable=True) # e.g. TS 03 AB 1234
    model = Column(String(100), nullable=True) # e.g. 575 DI Sarpanch
    year = Column(String(20), nullable=True) # e.g. 2023
    provider_name = Column(String(100), nullable=False)
    contact_phone = Column(String(20), nullable=False)
    location = Column(String(150), nullable=False)
    village = Column(String(100), nullable=True)
    mandal = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), default="Telangana")
    latitude = Column(Float, nullable=True, default=17.9689)
    longitude = Column(Float, nullable=True, default=79.5941)
    price = Column(Float, nullable=False)
    price_unit = Column(String(50), default="per hour") # per hour, per day, per acre, per trip
    price_per_hour = Column(Float, nullable=True)
    price_per_day = Column(Float, nullable=True)
    price_per_acre = Column(Float, nullable=True)
    price_per_trip = Column(Float, nullable=True)
    availability = Column(String(50), default="Available") # Available, Unavailable, Busy, Booked
    rating = Column(Float, default=4.8)
    total_ratings = Column(Integer, default=1)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    specs = Column(Text, nullable=True) # JSON or newline text of specifications
    terms = Column(Text, nullable=True) # Terms and conditions
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(50), unique=True, index=True, nullable=True) # e.g. AGR-2026-0001
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    farmer_name = Column(String(100), nullable=False)
    farmer_phone = Column(String(20), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    booking_date = Column(String(30), nullable=False)
    booking_time = Column(String(30), nullable=False)
    start_time = Column(String(30), nullable=True)
    end_time = Column(String(30), nullable=True)
    duration = Column(String(50), default="4 hours")
    farm_location = Column(String(200), nullable=True)
    location = Column(String(200), nullable=False)
    village = Column(String(100), nullable=True)
    mandal = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    farm_latitude = Column(Float, nullable=True)
    farm_longitude = Column(Float, nullable=True)
    purpose = Column(String(150), nullable=True)
    total_amount = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0) # 5% demo platform fee
    owner_earnings = Column(Float, default=0.0) # 95% owner net earnings
    status = Column(String(30), default="Pending") # Pending, Confirmed, Completed, Cancelled, Rejected
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


class ResourceRating(Base):
    __tablename__ = "resource_ratings"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(50), index=True, nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    farmer_name = Column(String(100), nullable=False)
    rating = Column(Float, nullable=False, default=5.0)
    review = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

