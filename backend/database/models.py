from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(30), default="farmer", index=True) # farmer, resource_owner
    state: Mapped[str] = mapped_column(String(100), default="Telangana")
    district: Mapped[str] = mapped_column(String(100), default="Warangal")
    mandal: Mapped[str] = mapped_column(String(100), default="Enumamula")
    village: Mapped[str] = mapped_column(String(100), default="Enumamula")
    location: Mapped[str] = mapped_column(String(200), default="Enumamula, Warangal")
    latitude: Mapped[float] = mapped_column(Float, default=17.9689)
    longitude: Mapped[float] = mapped_column(Float, default=79.5941)
    main_crops: Mapped[str] = mapped_column(String(255), default="Tomato,Paddy,Cotton,Chilli")
    preferred_language: Mapped[str] = mapped_column(String(10), default="en") # en, te, hi
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)


class DiseaseScan(Base):
    __tablename__ = "disease_scans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farmer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    crop: Mapped[str] = mapped_column(String(50), nullable=False)
    affected_area: Mapped[str] = mapped_column(String(50), default="Leaf")
    disease: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    severity: Mapped[str] = mapped_column(String(20), default="Moderate") # Low, Moderate, High
    symptoms: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON or newline separated
    cause: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    immediate_actions: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON string
    treatment: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON string
    prevention: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON string
    weather_risk: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON string
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)


class MarketPriceCache(Base):
    __tablename__ = "market_prices"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    commodity: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    district: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    market: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    variety: Mapped[str] = mapped_column(String(100), default="Standard")
    min_price: Mapped[float] = mapped_column(Float, default=0.0)
    max_price: Mapped[float] = mapped_column(Float, default=0.0)
    modal_price: Mapped[float] = mapped_column(Float, default=0.0)
    unit: Mapped[str] = mapped_column(String(20), default="Quintal")
    arrival_date: Mapped[str] = mapped_column(String(30), nullable=False)
    source: Mapped[str] = mapped_column(String(100), default="Government of India OGD")
    fetched_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    resource_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # Tractor, JCB / Earthmover, Harvester, Agricultural Drone, Sprayer, Seed Sowing Machine, Water Pump, Farm Transport, Other Farm Machinery
    category: Mapped[str] = mapped_column(String(50), index=True, default="Tractors")
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    vehicle_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # e.g. TS 03 AB 1234
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) # e.g. 575 DI Sarpanch
    year: Mapped[Optional[str]] = mapped_column(String(20), nullable=True) # e.g. 2023
    provider_name: Mapped[str] = mapped_column(String(100), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    location: Mapped[str] = mapped_column(String(150), nullable=False)
    village: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    mandal: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), default="Telangana")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=17.9689)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=79.5941)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    price_unit: Mapped[str] = mapped_column(String(50), default="per hour") # per hour, per day, per acre, per trip
    price_per_hour: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    price_per_day: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    price_per_acre: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    price_per_trip: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    availability: Mapped[str] = mapped_column(String(50), default="Available") # Available, Unavailable, Busy, Booked
    rating: Mapped[float] = mapped_column(Float, default=4.8)
    total_ratings: Mapped[int] = mapped_column(default=1)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    specs: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON or newline text of specifications
    terms: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # Terms and conditions
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    booking_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True, nullable=True) # e.g. AGR-2026-0001
    farmer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    farmer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    farmer_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    resource_id: Mapped[int] = mapped_column(ForeignKey("resources.id"), nullable=False)
    booking_date: Mapped[str] = mapped_column(String(30), nullable=False)
    booking_time: Mapped[str] = mapped_column(String(30), nullable=False)
    start_time: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    end_time: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    duration: Mapped[str] = mapped_column(String(50), default="4 hours")
    farm_location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    village: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    mandal: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    farm_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    farm_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    purpose: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0)
    platform_fee: Mapped[float] = mapped_column(Float, default=0.0) # 5% demo platform fee
    owner_earnings: Mapped[float] = mapped_column(Float, default=0.0) # 95% owner net earnings
    status: Mapped[str] = mapped_column(String(30), default="Pending") # Pending, Confirmed, Completed, Cancelled, Rejected
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class ResourceRating(Base):
    __tablename__ = "resource_ratings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    booking_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    resource_id: Mapped[int] = mapped_column(ForeignKey("resources.id"), nullable=False, index=True)
    owner_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    farmer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    farmer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=5.0)
    review: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=True)
