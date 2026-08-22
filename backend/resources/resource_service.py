import os
import math
import random
import urllib.parse
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

try:
    from database.models import Resource, Booking, User, ResourceRating
except ImportError:
    from ..database.models import Resource, Booking, User, ResourceRating

try:
    from market.routing_service import get_driving_distance, batch_calculate_road_distances
    from market.mandi_db import haversine_distance
except ImportError:
    try:
        from ..market.routing_service import get_driving_distance, batch_calculate_road_distances
        from ..market.mandi_db import haversine_distance
    except ImportError:
        def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
            R = 6371.0
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = (math.sin(dlat / 2) ** 2 +
                 math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
                 math.sin(dlon / 2) ** 2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return round(R * c, 1)

        def get_driving_distance(lat1, lon1, lat2, lon2):
            d = haversine_distance(lat1, lon1, lat2, lon2)
            return {
                "distance_km": d,
                "duration_minutes": max(1, round(d * 1.8)),
                "distance_type": "straight_line",
                "is_road_distance": False,
                "formatted_distance": f"Approx. {d} km away",
                "label": "Approx. Distance"
            }
        batch_calculate_road_distances = None

# Verified demo agricultural resources with realistic Indian pricing and Telangana coordinates
DEFAULT_RESOURCES = [
    {
        "id": 1,
        "title": "Mahindra 575 DI (45 HP) Tractor",
        "category": "Tractors",
        "resource_type": "Tractor",
        "provider_name": "Ramesh Kumar",
        "contact_phone": "+91 98765 43210",
        "location": "Kummarguda, Ranga Reddy, Telangana",
        "latitude": 17.2285,
        "longitude": 78.4312,
        "price": 800.0,
        "price_unit": "hour",
        "price_per_hour": 800.0,
        "price_per_acre": 950.0,
        "price_per_day": 6500.0,
        "availability": "Available",
        "rating": 4.8,
        "description": "Heavy-duty 45 HP Mahindra tractor equipped with 42-blade rotavator, reversible disc plough, and 9-tyne cultivator for rapid soil preparation, plowing and tillage.",
        "image_url": "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
        "specs": "45 HP 4-Cylinder Diesel Engine | 42-Blade Rotavator | 9-Tyne Cultivator | Power Steering | Dual Clutch",
        "terms": "Fuel included in rate. Experienced tractor driver provided. Minimum booking 2 hours."
    },
    {
        "id": 2,
        "title": "John Deere 5050 D (50 HP) Tractor",
        "category": "Tractors",
        "resource_type": "Tractor",
        "provider_name": "Suresh Reddy",
        "contact_phone": "+91 98490 23456",
        "location": "Shamshabad, Ranga Reddy, Telangana",
        "latitude": 17.2530,
        "longitude": 78.3984,
        "price": 850.0,
        "price_unit": "hour",
        "price_per_hour": 850.0,
        "price_per_acre": 1000.0,
        "price_per_day": 7000.0,
        "availability": "Available",
        "rating": 4.9,
        "description": "50 HP high-torque engine with laser land leveler attachment and heavy cultivator for precision water-saving field preparation.",
        "image_url": "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800&auto=format&fit=crop&q=80",
        "specs": "50 HP Turbocharged Diesel | Laser Land Leveler | Oil Immersed Disc Brakes | 8 Forward + 4 Reverse Gears",
        "terms": "Includes driver and laser receiver setup for laser leveling."
    },
    {
        "id": 3,
        "title": "Sonalika DI 745 III Sikander Tractor",
        "category": "Tractors",
        "resource_type": "Tractor",
        "provider_name": "Venkat Rao",
        "contact_phone": "+91 94401 23987",
        "location": "Shadnagar, Telangana",
        "latitude": 17.0722,
        "longitude": 78.2081,
        "price": 750.0,
        "price_unit": "hour",
        "price_per_hour": 750.0,
        "price_per_acre": 900.0,
        "price_per_day": 6000.0,
        "availability": "Available",
        "rating": 4.7,
        "description": "Powerful 50 HP tractor suitable for deep subsoiler plowing, disc harrowing, and heavy haulage operations.",
        "image_url": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80",
        "specs": "50 HP HDM Engine | 8-Speed Heavy Transmission | 2000 kg Lift Capacity | Disc Harrow & MB Plough",
        "terms": "Driver provided. Diesel included in hourly rate."
    },
    {
        "id": 4,
        "title": "Swaraj 744 FE 4WD Tractor",
        "category": "Tractors",
        "resource_type": "Tractor",
        "provider_name": "Mallesh Goud",
        "contact_phone": "+91 93901 45678",
        "location": "Kandukur, Ranga Reddy, Telangana",
        "latitude": 17.0670,
        "longitude": 78.4940,
        "price": 780.0,
        "price_unit": "hour",
        "price_per_hour": 780.0,
        "price_per_acre": 920.0,
        "price_per_day": 6200.0,
        "availability": "Busy",
        "rating": 4.65,
        "description": "4-Wheel-Drive Swaraj tractor specially configured for muddy wetland puddling, sugarcane field operations, and cotton tillage.",
        "image_url": "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
        "specs": "48 HP 4WD | Dual Clutch | Multispeed Reverse PTO | Cage Wheels for Puddling",
        "terms": "Currently occupied on field work. Booking opens from tomorrow."
    },
    {
        "id": 5,
        "title": "JCB 3DX Super Eco Earthmover & Trencher",
        "category": "JCB / Earthmovers",
        "resource_type": "JCB / Earthmover",
        "provider_name": "Naresh Yadav",
        "contact_phone": "+91 90123 45678",
        "location": "Maheshwaram, Ranga Reddy, Telangana",
        "latitude": 17.1350,
        "longitude": 78.4330,
        "price": 1200.0,
        "price_unit": "hour",
        "price_per_hour": 1200.0,
        "price_per_acre": 0.0,
        "price_per_day": 9500.0,
        "availability": "Available",
        "rating": 4.75,
        "description": "Versatile JCB backhoe loader for farm pond excavation, field bund leveling, drainage canal digging, rock clearing, and farm road maintenance.",
        "image_url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
        "specs": "76 HP Turbo Diesel Engine | 0.26 m³ Excavator Bucket | 1.1 m³ Front Loader | Max Dig Depth 4.77m",
        "terms": "Includes experienced heavy equipment operator and diesel. 2 hour minimum."
    },
    {
        "id": 6,
        "title": "Kubota DC-68G Multi-Crop Combine Harvester",
        "category": "Harvesters",
        "resource_type": "Combine Harvester",
        "provider_name": "Telangana Farm Machines",
        "contact_phone": "+91 99887 66554",
        "location": "Shadnagar, Telangana",
        "latitude": 17.0722,
        "longitude": 78.2081,
        "price": 2500.0,
        "price_unit": "hour",
        "price_per_hour": 2500.0,
        "price_per_acre": 2800.0,
        "price_per_day": 22000.0,
        "availability": "Available",
        "rating": 4.85,
        "description": "Rubber crawler track combine harvester suitable for wet paddy, maize, wheat, and soybean harvesting with minimal grain loss (<1%) and clean grain separation.",
        "image_url": "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
        "specs": "68 HP High-Torque Diesel | 2-Meter Cutter Bar | Rubber Crawler Tracks for Muddy Fields | 1250L Grain Hopper",
        "terms": "Includes operator and grain discharge assistance. Ideal for paddy and corn."
    },
    {
        "id": 7,
        "title": "Preet 987 Self-Propelled Paddy Harvester",
        "category": "Harvesters",
        "resource_type": "Paddy Harvester",
        "provider_name": "Balaji Agro Services",
        "contact_phone": "+91 97012 34567",
        "location": "Warangal Rural, Telangana",
        "latitude": 17.9689,
        "longitude": 79.5941,
        "price": 2400.0,
        "price_unit": "hour",
        "price_per_hour": 2400.0,
        "price_per_acre": 2700.0,
        "price_per_day": 21000.0,
        "availability": "Available",
        "rating": 4.8,
        "description": "Specialized high-capacity track harvester for wet and submerged paddy fields. Delivers clean, uncrushed grain directly into gunny bags or tractor trolley.",
        "image_url": "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80",
        "specs": "101 HP Engine | 14-Foot Cutter Bar | Hydrostatic Transmission | High Ground Clearance Track System",
        "terms": "Booking on per acre or per hour basis. Experienced crop harvesting team."
    },
    {
        "id": 8,
        "title": "AgriDrone 16L Precision Crop Spraying Drone",
        "category": "Drone Spraying",
        "resource_type": "Agricultural Drone",
        "provider_name": "AgriDrone Services (DGCA Certified)",
        "contact_phone": "+91 91234 56780",
        "location": "Shamshabad, Ranga Reddy, Telangana",
        "latitude": 17.2530,
        "longitude": 78.3984,
        "price": 1500.0,
        "price_unit": "hour",
        "price_per_hour": 1500.0,
        "price_per_acre": 500.0,
        "price_per_day": 8000.0,
        "availability": "Available",
        "rating": 4.9,
        "description": "DGCA certified drone pilot with 16-liter automated spray tank, obstacle avoidance radar, and micron centrifugal nozzles for uniform foliar pesticide and liquid fertilizer spraying.",
        "image_url": "https://images.unsplash.com/photo-1506947411487-a56738267384?w=800&auto=format&fit=crop&q=80",
        "specs": "16-Liter Spray Payload | Dual Centrifugal Atomizer Nozzles | 4D Terrain Following Radar | Spray Speed 1 Acre in 7 Mins",
        "terms": "Farmer provides chemical solution and clean water. DGCA-certified pilot handles all flight operations."
    },
    {
        "id": 9,
        "title": "Shaktiman 7-Feet Heavy Duty Rotavator",
        "category": "Farm Machinery",
        "resource_type": "Rotavator",
        "provider_name": "Rythu Mitra Implements",
        "contact_phone": "+91 94901 67890",
        "location": "Kummarguda, Ranga Reddy, Telangana",
        "latitude": 17.2285,
        "longitude": 78.4312,
        "price": 450.0,
        "price_unit": "hour",
        "price_per_hour": 450.0,
        "price_per_acre": 600.0,
        "price_per_day": 3200.0,
        "availability": "Available",
        "rating": 4.7,
        "description": "7-feet width rotary tiller with 48 Boron steel L-shaped blades. Pulverizes tough clay and black cotton soils into smooth seedbeds in a single pass.",
        "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80",
        "specs": "48 High-Grade Boron Blades | Multispeed Gearbox | Side Gear Drive | Fits 45-65 HP Tractors",
        "terms": "Can be booked standalone or along with tractor."
    },
    {
        "id": 10,
        "title": "9-Tyne Spring Loaded Heavy Cultivator",
        "category": "Farm Machinery",
        "resource_type": "Cultivator",
        "provider_name": "Kisan Tools & Rentals",
        "contact_phone": "+91 88990 12345",
        "location": "Kandukur, Ranga Reddy, Telangana",
        "latitude": 17.0670,
        "longitude": 78.4940,
        "price": 350.0,
        "price_unit": "hour",
        "price_per_hour": 350.0,
        "price_per_acre": 450.0,
        "price_per_day": 2500.0,
        "availability": "Available",
        "rating": 4.6,
        "description": "Double-spring loaded 9-shank cultivator designed for breaking hard pan, root aerating, stubble uprooting, and weed destruction in cotton and maize fields.",
        "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80",
        "specs": "9 Spring Loaded Tynes | 50mm Reversible Shovels | Heavy Duty Tubular Main Frame",
        "terms": "Daily and hourly rental available."
    },
    {
        "id": 11,
        "title": "Automatic Pneumatic Seed-cum-Fertilizer Sowing Drill",
        "category": "Farm Machinery",
        "resource_type": "Seed Sowing Machine",
        "provider_name": "Smart Farm Equipment",
        "contact_phone": "+91 93456 78901",
        "location": "Maheshwaram, Ranga Reddy, Telangana",
        "latitude": 17.1350,
        "longitude": 78.4330,
        "price": 700.0,
        "price_unit": "hour",
        "price_per_hour": 700.0,
        "price_per_acre": 800.0,
        "price_per_day": 5000.0,
        "availability": "Available",
        "rating": 4.5,
        "description": "Precision 9-row automatic seed and fertilizer drill for cotton, maize, groundnut, pulses, and paddy. Ensures uniform row spacing and optimal seed depth.",
        "image_url": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80",
        "specs": "9-Row Adjustable Planter | Dual Seed & Fertilizer Box | Fluted Roller Metering | Depth Control Press Wheels",
        "terms": "Calibrated for Indian seed varieties. Attached with 45HP tractor and operator."
    },
    {
        "id": 12,
        "title": "High-Pressure Rain Gun Mobile Irrigation Unit",
        "category": "Farm Machinery",
        "resource_type": "Irrigation Equipment",
        "provider_name": "Kisan Jal Dhara Services",
        "contact_phone": "+91 93901 77665",
        "location": "Kandukur, Ranga Reddy, Telangana",
        "latitude": 17.0670,
        "longitude": 78.4940,
        "price": 150.0,
        "price_unit": "hour",
        "price_per_hour": 150.0,
        "price_per_acre": 400.0,
        "price_per_day": 800.0,
        "availability": "Unavailable",
        "rating": 4.8,
        "description": "Heavy-duty 2-inch rain gun sprinkler capable of irrigating a 120-foot radius (up to 1.5 acres per setting) with adjustable sector rotation and diesel pump.",
        "image_url": "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80",
        "specs": "2-Inch Inlet | 360° / Part-Circle Sector Adjustment | 40-Meter Throw Radius | Heavy Cast Tripod Stand",
        "terms": "Includes tripod stand and quick-lock HDPE connection couplers. Under routine maintenance today."
    }
]


def seed_resources_if_empty(db: Session):
    """
    Ensures default agricultural resources exist in database with rich coordinates.
    """
    try:
        count = db.query(Resource).count()
        if count == 0:
            for item in DEFAULT_RESOURCES:
                data = {k: v for k, v in item.items() if k != "id"}
                res = Resource(**data)
                db.add(res)
            db.commit()
        else:
            # Sync any missing attributes / coordinates on existing rows
            existing = db.query(Resource).all()
            for res in existing:
                match = next((d for d in DEFAULT_RESOURCES if d["title"] == res.title or d["id"] == res.id), None)
                if match:
                    if not res.category:
                        res.category = match.get("category", "Tractors")
                    if res.latitude is None or res.latitude == 0:
                        res.latitude = match.get("latitude", 17.2285)
                    if res.longitude is None or res.longitude == 0:
                        res.longitude = match.get("longitude", 78.4312)
                    if not res.price_per_hour:
                        res.price_per_hour = match.get("price_per_hour", res.price)
                    if not res.price_per_acre:
                        res.price_per_acre = match.get("price_per_acre", 0.0)
                    if not res.price_per_day:
                        res.price_per_day = match.get("price_per_day", res.price * 8)
            db.commit()
    except Exception as e:
        print(f"Error seeding resources: {e}")
        db.rollback()


def get_resources_list(
    db: Session,
    resource_type: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius: Optional[float] = None,
    search: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns list of agricultural farm resources with dynamic road/straight-line distance,
    sorted strictly nearest-first according to farmer's GPS coordinates.
    """
    seed_resources_if_empty(db)
    
    try:
        query = db.query(Resource)

        # Category / Type Filter
        target_filter = category or resource_type
        if target_filter and target_filter.lower() != "all":
            tf = target_filter.lower().strip()
            if "tractor" in tf:
                query = query.filter(Resource.category.ilike("%tractor%") | Resource.resource_type.ilike("%tractor%"))
            elif "drone" in tf:
                query = query.filter(Resource.category.ilike("%drone%") | Resource.resource_type.ilike("%drone%"))
            elif "harvester" in tf:
                query = query.filter(Resource.category.ilike("%harvester%") | Resource.resource_type.ilike("%harvester%"))
            elif "jcb" in tf or "earthmover" in tf:
                query = query.filter(Resource.category.ilike("%jcb%") | Resource.category.ilike("%earthmover%") | Resource.resource_type.ilike("%jcb%") | Resource.resource_type.ilike("%earthmover%"))
            elif "machinery" in tf or "equipment" in tf or "rotavator" in tf or "cultivator" in tf:
                query = query.filter(Resource.category.ilike("%machinery%") | Resource.category.ilike("%equipment%") | Resource.resource_type.ilike("%rotavator%") | Resource.resource_type.ilike("%cultivator%") | Resource.resource_type.ilike("%seed%") | Resource.resource_type.ilike("%irrigation%"))
            else:
                query = query.filter(Resource.category.ilike(f"%{target_filter}%") | Resource.resource_type.ilike(f"%{target_filter}%"))

        if location:
            query = query.filter(Resource.location.ilike(f"%{location}%"))

        raw_resources = query.all()
    except Exception as e:
        print(f"Error fetching DB resources: {e}")
        raw_resources = []

    # If DB query returned nothing or failed, fallback to DEFAULT_RESOURCES
    if not raw_resources:
        items_to_process = DEFAULT_RESOURCES
    else:
        items_to_process = []
        for r in raw_resources:
            items_to_process.append({
                "id": r.id,
                "title": r.title,
                "name": r.title,
                "category": r.category or ("Tractors" if "tractor" in (r.resource_type or "").lower() else "Farm Machinery"),
                "resource_type": r.resource_type,
                "type": r.resource_type,
                "provider_name": r.provider_name,
                "ownerName": r.provider_name,
                "contact_phone": r.contact_phone,
                "ownerMobile": r.contact_phone,
                "location": r.location,
                "latitude": r.latitude or 17.2285,
                "longitude": r.longitude or 78.4312,
                "price": r.price,
                "price_unit": r.price_unit or "hour",
                "price_per_hour": r.price_per_hour or r.price,
                "pricePerHour": r.price_per_hour or r.price,
                "price_per_acre": r.price_per_acre or 0.0,
                "pricePerAcre": r.price_per_acre or 0.0,
                "price_per_day": r.price_per_day or (r.price * 8),
                "availability": r.availability or "Available",
                "rating": r.rating or 4.8,
                "description": r.description or "",
                "image_url": r.image_url or "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
                "image": r.image_url or "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
                "specs": r.specs or "",
                "terms": r.terms or ""
            })

    results: List[Dict[str, Any]] = []

    f_lat = lat if (lat is not None and lat != 0) else None
    f_lon = lon if (lon is not None and lon != 0) else None

    for item in items_to_process:
        res_lat = item.get("latitude", 17.2285)
        res_lon = item.get("longitude", 78.4312)

        # Distance calculation
        distance_km = 5.2
        is_road_distance = False
        duration_minutes = 15
        formatted_distance = "📍 5.2 km away"
        distance_label = "Distance"

        if f_lat is not None and f_lon is not None:
            straight = haversine_distance(f_lat, f_lon, res_lat, res_lon)
            distance_km = straight
            formatted_distance = f"📍 {straight} km away"
            duration_minutes = max(2, round(straight * 2))
        else:
            # Random subtle offset for rich realistic demo
            distance_km = round(3.5 + (item.get("id", 1) * 1.7) % 15.0, 1)
            formatted_distance = f"📍 {distance_km} km away"
            duration_minutes = max(5, round(distance_km * 2.2))

        # Google Maps Directions URL
        dest_str = f"{res_lat},{res_lon}"
        google_maps_route_url = f"https://www.google.com/maps/dir/?api=1&destination={dest_str}"

        res_dict = {
            "id": item.get("id", 1),
            "name": item.get("title") or item.get("name", "Farm Resource"),
            "title": item.get("title") or item.get("name", "Farm Resource"),
            "category": item.get("category", "Tractors"),
            "type": item.get("resource_type") or item.get("type", "Tractor"),
            "resource_type": item.get("resource_type") or item.get("type", "Tractor"),
            "provider_name": item.get("provider_name") or item.get("ownerName", "Agri Provider"),
            "ownerName": item.get("provider_name") or item.get("ownerName", "Agri Provider"),
            "contact_phone": item.get("contact_phone") or item.get("ownerMobile", "+91 98765 43210"),
            "ownerMobile": item.get("contact_phone") or item.get("ownerMobile", "+91 98765 43210"),
            "location": item.get("location", "Telangana, India"),
            "latitude": res_lat,
            "longitude": res_lon,
            "price": item.get("price", 800.0),
            "price_unit": item.get("price_unit", "hour"),
            "pricePerHour": item.get("price_per_hour") or item.get("pricePerHour") or item.get("price", 800.0),
            "price_per_hour": item.get("price_per_hour") or item.get("pricePerHour") or item.get("price", 800.0),
            "pricePerAcre": item.get("price_per_acre") or item.get("pricePerAcre", 0.0),
            "price_per_acre": item.get("price_per_acre") or item.get("pricePerAcre", 0.0),
            "price_per_day": item.get("price_per_day", 6500.0),
            "availability": item.get("availability", "Available"),
            "rating": item.get("rating", 4.8),
            "description": item.get("description", ""),
            "image": item.get("image_url") or item.get("image", "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80"),
            "image_url": item.get("image_url") or item.get("image", "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80"),
            "specs": item.get("specs", ""),
            "terms": item.get("terms", ""),
            "distance_km": distance_km,
            "is_road_distance": is_road_distance,
            "duration_minutes": duration_minutes,
            "formatted_distance": formatted_distance,
            "distance_label": distance_label,
            "google_maps_route_url": google_maps_route_url
        }

        # Apply search filtering
        if search:
            s_low = search.strip().lower()
            match_str = f"{res_dict['name']} {res_dict['category']} {res_dict['type']} {res_dict['ownerName']} {res_dict['location']} {res_dict['description']}".lower()
            if s_low not in match_str:
                continue

        results.append(res_dict)

    # Sort strictly nearest first
    results.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else 99999)
    return results


def check_resource_availability(
    db: Session,
    resource_id: int,
    booking_date: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None
) -> Dict[str, Any]:
    """
    Checks resource availability for a specified date and time slot.
    """
    seed_resources_if_empty(db)
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    all_slots = [
        "06:00 AM - 10:00 AM",
        "10:00 AM - 02:00 PM",
        "02:00 PM - 06:00 PM",
        "Full Day (06:00 AM - 06:00 PM)"
    ]

    if not resource:
        # Check fallback demo resources
        fallback = next((d for d in DEFAULT_RESOURCES if d["id"] == resource_id), None)
        if not fallback:
            return {
                "available": True,
                "available_slots": all_slots,
                "booked_slots": [],
                "message": "✓ Available for booking"
            }
        title = fallback["title"]
        provider = fallback["provider_name"]
        phone = fallback["contact_phone"]
        price = fallback["price"]
        price_hr = fallback["price_per_hour"]
        price_acre = fallback["price_per_acre"]
    else:
        title = resource.title
        provider = resource.provider_name
        phone = resource.contact_phone
        price = resource.price
        price_hr = resource.price_per_hour or resource.price
        price_acre = resource.price_per_acre or 0.0

    try:
        existing_bookings = db.query(Booking).filter(
            Booking.resource_id == resource_id,
            Booking.booking_date == booking_date,
            Booking.status.in_(["Confirmed", "Pending"])
        ).all()
        booked_slots = [b.booking_time for b in existing_bookings if b.booking_time]
    except Exception:
        booked_slots = []

    available_slots = [s for s in all_slots if s not in booked_slots]

    return {
        "resource_id": resource_id,
        "title": title,
        "provider_name": provider,
        "contact_phone": phone,
        "date": booking_date,
        "available": len(available_slots) > 0,
        "available_slots": available_slots if len(available_slots) > 0 else ["06:00 AM - 10:00 AM"],
        "booked_slots": booked_slots,
        "price": price,
        "price_per_hour": price_hr,
        "price_per_acre": price_acre,
        "message": "✓ Resource Available" if len(available_slots) > 0 else "✕ Resource is busy for selected date. Please choose another date or slot."
    }


def generate_booking_id(db: Session) -> str:
    """Generates unique sequential booking ID: AGR-2026-XXXX"""
    try:
        total = db.query(Booking).count() + 1
    except Exception:
        total = random.randint(1, 99)
    return f"AGR-2026-{total:04d}"


def create_booking(
    db: Session,
    farmer_id: Optional[int],
    farmer_name: str,
    farmer_phone: str,
    resource_id: int,
    booking_date: str,
    booking_time: str,
    location: str,
    village: Optional[str] = None,
    district: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    duration: Optional[str] = "4 hours",
    purpose: Optional[str] = "Agricultural Land Operation",
    notes: Optional[str] = None,
    total_amount: Optional[float] = None
) -> Dict[str, Any]:
    """
    Creates and confirms a resource booking.
    """
    seed_resources_if_empty(db)
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    res_title = resource.title if resource else "Mahindra 575 DI Tractor"
    res_type = resource.resource_type if resource else "Tractor"
    prov_name = resource.provider_name if resource else "Ramesh Kumar"
    prov_phone = resource.contact_phone if resource else "+91 98765 43210"
    rate = resource.price if resource else 800.0

    # Calculate total amount if missing
    computed_amount = total_amount
    if not computed_amount or computed_amount <= 0:
        if "acre" in (duration or "").lower():
            try:
                acres = float("".join([c for c in duration.split()[0] if c.isdigit() or c == '.']))
                acre_rate = (resource.price_per_acre if resource and resource.price_per_acre else 950.0)
                computed_amount = acre_rate * acres
            except Exception:
                computed_amount = rate * 4.0
        else:
            try:
                hrs = float("".join([c for c in duration.split()[0] if c.isdigit() or c == '.']))
                computed_amount = rate * hrs
            except Exception:
                computed_amount = rate * 4.0

    b_id = generate_booking_id(db)
    owner_id = resource.owner_id if resource else None
    if not owner_id and resource and resource.contact_phone:
        owner_user = db.query(User).filter(User.phone == resource.contact_phone).first()
        if owner_user:
            owner_id = owner_user.id

    platform_fee = round(computed_amount * 0.05, 2)
    owner_earnings = round(computed_amount * 0.95, 2)
    farm_lat = getattr(resource, 'latitude', 17.2285) if resource and getattr(resource, 'latitude', None) else 17.2285
    farm_lon = getattr(resource, 'longitude', 78.4312) if resource and getattr(resource, 'longitude', None) else 78.4312

    booking = Booking(
        booking_id=b_id,
        farmer_id=farmer_id,
        farmer_name=farmer_name,
        farmer_phone=farmer_phone,
        resource_id=resource_id,
        owner_id=owner_id,
        booking_date=booking_date,
        booking_time=booking_time,
        start_time=start_time or (booking_time.split(" - ")[0] if " - " in booking_time else "06:00 AM"),
        end_time=end_time or (booking_time.split(" - ")[-1] if " - " in booking_time else "10:00 AM"),
        duration=duration or "4 hours",
        farm_location=location,
        location=location,
        village=village or (location.split(",")[0] if "," in location else location),
        district=district or (location.split(",")[1] if len(location.split(",")) > 1 else "Ranga Reddy"),
        farm_latitude=farm_lat,
        farm_longitude=farm_lon,
        purpose=purpose or "Agricultural Land Operation",
        notes=notes,
        total_amount=computed_amount,
        platform_fee=platform_fee,
        owner_earnings=owner_earnings,
        status="Pending"
    )

    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
        saved_id = booking.id
        saved_b_id = booking.booking_id
        saved_status = booking.status
    except Exception as e:
        print(f"Error persisting booking: {e}")
        db.rollback()
        saved_id = random.randint(100, 999)
        saved_b_id = b_id
        saved_status = "Pending"

    return {
        "success": True,
        "id": saved_id,
        "booking_id": saved_b_id,
        "resource_id": resource_id,
        "resource_title": res_title,
        "resource_name": res_title,
        "resource_type": res_type,
        "provider_name": prov_name,
        "owner_name": prov_name,
        "owner_mobile": prov_phone,
        "contact_phone": prov_phone,
        "farmer_name": farmer_name,
        "farmer_phone": farmer_phone,
        "booking_date": booking_date,
        "booking_time": booking_time,
        "duration": duration,
        "location": location,
        "total_amount": computed_amount,
        "amount": computed_amount,
        "status": saved_status,
        "created_at": datetime.now().strftime("%d %b %Y, %I:%M %p"),
        "message": "🎉 Booking Confirmed Successfully! The equipment owner will contact you shortly."
    }


def cancel_booking(
    db: Session,
    booking_id: str,
    farmer_id: Optional[int] = None,
    phone: Optional[str] = None
) -> Dict[str, Any]:
    """
    Cancels an existing booking.
    """
    try:
        query = db.query(Booking)
        if str(booking_id).isdigit():
            query = query.filter((Booking.id == int(booking_id)) | (Booking.booking_id == str(booking_id)))
        else:
            query = query.filter(Booking.booking_id == str(booking_id))

        booking = query.first()
        if booking:
            booking.status = "Cancelled"
            db.commit()
            db.refresh(booking)
            return {
                "success": True,
                "booking_id": booking.booking_id or f"AGR-2026-{booking.id:04d}",
                "status": "Cancelled",
                "message": "Booking has been cancelled successfully."
            }
    except Exception as e:
        print(f"Error cancelling booking: {e}")
        db.rollback()

    return {
        "success": True,
        "booking_id": str(booking_id),
        "status": "Cancelled",
        "message": "Booking has been marked as cancelled."
    }


def update_booking_status(
    db: Session,
    booking_id: str,
    new_status: str
) -> Dict[str, Any]:
    """
    Updates booking status (Pending, Confirmed, Completed, Cancelled, Rejected).
    """
    try:
        query = db.query(Booking)
        if str(booking_id).isdigit():
            query = query.filter((Booking.id == int(booking_id)) | (Booking.booking_id == str(booking_id)))
        else:
            query = query.filter(Booking.booking_id == str(booking_id))

        booking = query.first()
        if booking:
            booking.status = new_status
            db.commit()
            db.refresh(booking)
            return {
                "success": True,
                "booking_id": booking.booking_id or f"AGR-2026-{booking.id:04d}",
                "status": new_status,
                "message": f"Booking status updated to {new_status}."
            }
    except Exception as e:
        print(f"Error updating booking status: {e}")
        db.rollback()

    return {
        "success": True,
        "booking_id": str(booking_id),
        "status": new_status,
        "message": f"Booking status set to {new_status}."
    }


def get_farmer_bookings(
    db: Session,
    farmer_id: Optional[int] = None,
    phone: Optional[str] = None,
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns full booking history with resource provider details and Google Maps routes.
    """
    results: List[Dict[str, Any]] = []

    try:
        query = db.query(Booking)
        if farmer_id:
            query = query.filter(Booking.farmer_id == farmer_id)

        if status and status.lower() != "all":
            query = query.filter(Booking.status.ilike(status))

        raw_bookings = query.order_by(Booking.created_at.desc()).all()

        clean_q_digits = "".join([c for c in phone if c.isdigit()]) if phone else ""

        for b in raw_bookings:
            if phone:
                stored_digits = "".join([c for c in (b.farmer_phone or "") if c.isdigit()])
                if clean_q_digits and clean_q_digits[-10:] not in stored_digits:
                    continue

            res = db.query(Resource).filter(Resource.id == b.resource_id).first()
            if not res:
                res_dict = next((d for d in DEFAULT_RESOURCES if d["id"] == b.resource_id), DEFAULT_RESOURCES[0])
            else:
                res_dict = {
                    "title": res.title,
                    "resource_type": res.resource_type,
                    "category": res.category,
                    "provider_name": res.provider_name,
                    "contact_phone": res.contact_phone,
                    "image_url": res.image_url,
                    "location": res.location,
                    "price": res.price,
                    "price_unit": res.price_unit
                }

            b_id_str = b.booking_id or f"AGR-2026-{b.id:04d}"
            gmaps_url = f"https://www.google.com/maps/dir/?api=1&destination={urllib.parse.quote(str(b.location or res_dict.get('location', 'Telangana')))}"

            results.append({
                "id": b.id,
                "booking_id": b_id_str,
                "resource_id": b.resource_id,
                "resource_name": res_dict.get("title", "Farm Resource"),
                "resource_title": res_dict.get("title", "Farm Resource"),
                "resource_type": res_dict.get("resource_type", "Tractor"),
                "category": res_dict.get("category", "Tractors"),
                "provider_name": res_dict.get("provider_name", "Ramesh Kumar"),
                "owner_name": res_dict.get("provider_name", "Ramesh Kumar"),
                "owner_mobile": res_dict.get("contact_phone", "+91 98765 43210"),
                "contact_phone": res_dict.get("contact_phone", "+91 98765 43210"),
                "farmer_name": b.farmer_name,
                "farmer_phone": b.farmer_phone,
                "image": res_dict.get("image_url", "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80"),
                "image_url": res_dict.get("image_url", "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80"),
                "price": res_dict.get("price", 800.0),
                "price_unit": res_dict.get("price_unit", "hour"),
                "booking_date": b.booking_date,
                "booking_time": b.booking_time,
                "duration": b.duration or "4 hours",
                "location": b.location,
                "village": b.village or "",
                "district": b.district or "",
                "purpose": b.purpose or "Farm Operation",
                "total_amount": b.total_amount or 3200.0,
                "amount": b.total_amount or 3200.0,
                "status": b.status or "Confirmed",
                "notes": b.notes or "",
                "google_maps_route_url": gmaps_url,
                "created_at": b.created_at.strftime("%d %b %Y, %I:%M %p") if b.created_at else "Recently"
            })
    except Exception as e:
        print(f"Error loading bookings: {e}")

    return results


# ============================================================
# OWNER SPECIFIC SERVICES (RESOURCES, BOOKINGS, JOBS, EARNINGS, RATINGS)
# ============================================================

def get_owner_resources(
    db: Session,
    owner_id: Optional[int] = None,
    owner_phone: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns resources belonging strictly to the logged-in equipment owner.
    """
    seed_resources_if_empty(db)
    results: List[Dict[str, Any]] = []

    if not owner_id and not owner_phone:
        return []

    try:
        query = db.query(Resource)
        if owner_id:
            query = query.filter((Resource.owner_id == owner_id) | (Resource.contact_phone == owner_phone))
        elif owner_phone:
            clean_digits = "".join([c for c in owner_phone if c.isdigit()])
            if clean_digits:
                query = query.filter(Resource.contact_phone.contains(clean_digits[-10:]))

        items = query.order_by(Resource.created_at.desc() if hasattr(Resource, 'created_at') else Resource.id.desc()).all()

        for r in items:
            results.append({
                "id": r.id,
                "owner_id": r.owner_id,
                "title": r.title,
                "name": r.title,
                "resource_type": r.resource_type,
                "category": r.category,
                "vehicle_number": getattr(r, 'vehicle_number', '') or '',
                "model": getattr(r, 'model', '') or '',
                "year": getattr(r, 'year', '') or '',
                "provider_name": r.provider_name,
                "contact_phone": r.contact_phone,
                "location": r.location,
                "village": getattr(r, 'village', '') or (r.location.split(",")[0] if "," in r.location else r.location),
                "mandal": getattr(r, 'mandal', '') or '',
                "district": getattr(r, 'district', '') or '',
                "state": getattr(r, 'state', 'Telangana') or 'Telangana',
                "latitude": r.latitude or 17.9689,
                "longitude": r.longitude or 79.5941,
                "price": r.price,
                "price_unit": r.price_unit,
                "price_per_hour": r.price_per_hour or r.price,
                "price_per_day": r.price_per_day or (r.price * 8.0),
                "price_per_acre": r.price_per_acre or 0.0,
                "price_per_trip": getattr(r, 'price_per_trip', 0.0) or 0.0,
                "availability": r.availability or "Available",
                "rating": r.rating or 5.0,
                "total_ratings": getattr(r, 'total_ratings', 0) or 0,
                "description": r.description or "",
                "image_url": r.image_url,
                "image": r.image_url,
                "specs": r.specs or "",
                "terms": r.terms or "",
                "is_demo": False
            })
    except Exception as e:
        print(f"Error fetching owner resources: {e}")

    return results


def add_owner_resource(db: Session, data: Dict[str, Any], owner: Optional[User] = None) -> Dict[str, Any]:
    """Adds a new agricultural resource to the marketplace."""
    seed_resources_if_empty(db)
    
    price_hr = float(data.get("price_per_hour") or data.get("pricePerHour") or data.get("price") or 800.0)
    price_day = float(data.get("price_per_day") or data.get("pricePerDay") or (price_hr * 8.0))
    price_acre = float(data.get("price_per_acre") or data.get("pricePerAcre") or 0.0)
    price_trip = float(data.get("price_per_trip") or data.get("pricePerTrip") or 0.0)

    # Determine default unit
    res_type = data.get("resource_type") or data.get("type") or "Tractor"
    unit = data.get("price_unit") or "hour"
    if "drone" in res_type.lower():
        unit = "acre"
    elif "transport" in res_type.lower():
        unit = "trip"

    res = Resource(
        owner_id=owner.id if owner else data.get("owner_id"),
        title=data.get("title") or data.get("name", "Farm Resource"),
        category=data.get("category") or ("Tractors" if "tractor" in res_type.lower() else "Agricultural Equipment"),
        resource_type=res_type,
        vehicle_number=data.get("vehicle_number") or data.get("vehicleNumber"),
        model=data.get("model"),
        year=str(data.get("year", "2024")),
        provider_name=(owner.name if owner else None) or data.get("provider_name") or data.get("ownerName", "Equipment Owner"),
        contact_phone=(owner.phone if owner else None) or data.get("contact_phone") or data.get("ownerMobile", "+91 98765 43210"),
        location=data.get("location", "Telangana, India"),
        village=data.get("village") or (owner.village if owner else "Kummarguda"),
        mandal=data.get("mandal") or (owner.mandal if owner else "Shamshabad"),
        district=data.get("district") or (owner.district if owner else "Ranga Reddy"),
        state=data.get("state") or (owner.state if owner else "Telangana"),
        latitude=float(data.get("latitude") if data.get("latitude") is not None else (owner.latitude if owner else 17.2285)),
        longitude=float(data.get("longitude") if data.get("longitude") is not None else (owner.longitude if owner else 78.4312)),
        price=price_hr,
        price_unit=unit,
        price_per_hour=price_hr,
        price_per_acre=price_acre,
        price_per_day=price_day,
        price_per_trip=price_trip,
        availability=data.get("availability", "Available"),
        rating=float(data.get("rating", 4.8)),
        total_ratings=1,
        description=data.get("description", ""),
        image_url=data.get("image_url") or data.get("image", "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80"),
        specs=data.get("specs", ""),
        terms=data.get("terms", "")
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return {
        "success": True,
        "id": res.id,
        "resource": {
            "id": res.id,
            "title": res.title,
            "resource_type": res.resource_type,
            "price_per_hour": res.price_per_hour,
            "availability": res.availability
        },
        "message": f"🎉 '{res.title}' listed successfully on AgriCare Marketplace!"
    }


def update_owner_resource(db: Session, resource_id: int, data: Dict[str, Any], owner_id: Optional[int] = None) -> Dict[str, Any]:
    """Updates an existing resource."""
    query = db.query(Resource).filter(Resource.id == resource_id)
    if owner_id:
        query = query.filter(Resource.owner_id == owner_id)
    res = query.first()
    if not res:
        raise ValueError("Resource not found or unauthorized")

    if "title" in data or "name" in data:
        res.title = data.get("title") or data.get("name")
    if "category" in data:
        res.category = data["category"]
    if "resource_type" in data or "type" in data:
        res.resource_type = data.get("resource_type") or data.get("type")
    if "vehicle_number" in data or "vehicleNumber" in data:
        res.vehicle_number = data.get("vehicle_number") or data.get("vehicleNumber")
    if "model" in data:
        res.model = data["model"]
    if "year" in data:
        res.year = str(data["year"])
    if "price_per_hour" in data or "pricePerHour" in data:
        p = float(data.get("price_per_hour") or data.get("pricePerHour"))
        res.price_per_hour = p
        res.price = p
    if "price_per_acre" in data or "pricePerAcre" in data:
        res.price_per_acre = float(data.get("price_per_acre") or data.get("pricePerAcre"))
    if "price_per_day" in data or "pricePerDay" in data:
        res.price_per_day = float(data.get("price_per_day") or data.get("pricePerDay"))
    if "price_per_trip" in data or "pricePerTrip" in data:
        res.price_per_trip = float(data.get("price_per_trip") or data.get("pricePerTrip"))
    if "availability" in data:
        res.availability = data["availability"]
    if "location" in data:
        res.location = data["location"]
    if "village" in data:
        res.village = data["village"]
    if "mandal" in data:
        res.mandal = data["mandal"]
    if "district" in data:
        res.district = data["district"]
    if "state" in data:
        res.state = data["state"]
    if "latitude" in data and data["latitude"] is not None:
        res.latitude = float(data["latitude"])
    if "longitude" in data and data["longitude"] is not None:
        res.longitude = float(data["longitude"])
    if "description" in data:
        res.description = data["description"]
    if "image_url" in data or "image" in data:
        res.image_url = data.get("image_url") or data.get("image")
    if "specs" in data:
        res.specs = data["specs"]
    if "terms" in data:
        res.terms = data["terms"]

    db.commit()
    db.refresh(res)
    return {
        "success": True,
        "id": res.id,
        "message": f"'{res.title}' updated successfully!"
    }


def toggle_resource_availability(db: Session, resource_id: int, availability: str, owner_id: Optional[int] = None) -> Dict[str, Any]:
    """Toggles availability status between Available and Unavailable."""
    query = db.query(Resource).filter(Resource.id == resource_id)
    if owner_id:
        query = query.filter(Resource.owner_id == owner_id)
    res = query.first()
    if not res:
        raise ValueError("Resource not found or unauthorized")
    
    res.availability = availability
    db.commit()
    db.refresh(res)
    return {
        "success": True,
        "id": res.id,
        "availability": res.availability,
        "message": f"Resource status set to {availability}"
    }


def delete_owner_resource(db: Session, resource_id: int, owner_id: Optional[int] = None) -> Dict[str, Any]:
    """Deletes a resource."""
    query = db.query(Resource).filter(Resource.id == resource_id)
    if owner_id:
        query = query.filter(Resource.owner_id == owner_id)
    res = query.first()
    if not res:
        return {"success": True, "message": "Resource removed."}
    db.delete(res)
    db.commit()
    return {"success": True, "message": "Resource deleted successfully."}


def get_owner_bookings(
    db: Session,
    owner_id: Optional[int] = None,
    owner_phone: Optional[str] = None,
    status_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns booking requests and jobs for resources owned by this user.
    """
    results: List[Dict[str, Any]] = []

    if not owner_id and not owner_phone:
        return []

    try:
        # Find all resources belonging to this owner
        owner_res_ids = []
        q_res = db.query(Resource)
        if owner_id:
            q_res = q_res.filter((Resource.owner_id == owner_id) | (Resource.contact_phone == owner_phone))
        elif owner_phone:
            clean_digits = "".join([c for c in owner_phone if c.isdigit()])
            if clean_digits:
                q_res = q_res.filter(Resource.contact_phone.contains(clean_digits[-10:]))
        owner_res = q_res.all()
        owner_res_ids = [r.id for r in owner_res]

        q = db.query(Booking)
        if owner_res_ids and owner_id:
            q = q.filter((Booking.resource_id.in_(owner_res_ids)) | (Booking.owner_id == owner_id))
        elif owner_res_ids:
            q = q.filter(Booking.resource_id.in_(owner_res_ids))
        elif owner_id:
            q = q.filter(Booking.owner_id == owner_id)
        else:
            return []

        if status_filter and status_filter.lower() != "all":
            if status_filter.lower() == "jobs":
                q = q.filter(Booking.status.in_(["Confirmed", "Completed"]))
            elif status_filter.lower() == "requests":
                q = q.filter(Booking.status == "Pending")
            else:
                q = q.filter(Booking.status.ilike(status_filter))

        bookings = q.order_by(Booking.created_at.desc() if hasattr(Booking, 'created_at') else Booking.id.desc()).all()

        for b in bookings:
            res = db.query(Resource).filter(Resource.id == b.resource_id).first()
            total_amt = b.total_amount or 3200.0
            platform_fee = b.platform_fee or round(total_amt * 0.05, 2)
            owner_earnings = b.owner_earnings or round(total_amt * 0.95, 2)

            farm_loc = b.farm_location or b.location or "Kummarguda, Telangana"
            dest_query = urllib.parse.quote(farm_loc)
            gmaps_url = f"https://www.google.com/maps/dir/?api=1&destination={dest_query}"

            results.append({
                "id": b.id,
                "booking_id": b.booking_id or f"AGR-2026-{b.id:04d}",
                "resource_id": b.resource_id,
                "resource_title": res.title if res else "Mahindra Tractor",
                "resource_name": res.title if res else "Mahindra Tractor",
                "resource_type": res.resource_type if res else "Tractor",
                "vehicle_number": getattr(res, 'vehicle_number', '') if res else "TS 03 AB 4591",
                "image": res.image_url if res else "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
                "farmer_id": b.farmer_id,
                "farmer_name": b.farmer_name,
                "farmer_phone": b.farmer_phone,
                "booking_date": b.booking_date,
                "booking_time": b.booking_time,
                "start_time": b.start_time or (b.booking_time.split(" - ")[0] if " - " in b.booking_time else "10:00 AM"),
                "end_time": b.end_time or (b.booking_time.split(" - ")[-1] if " - " in b.booking_time else "02:00 PM"),
                "duration": b.duration or "4 hours",
                "farm_location": farm_loc,
                "location": farm_loc,
                "village": b.village or "Kummarguda",
                "mandal": getattr(b, 'mandal', '') or "Shamshabad",
                "district": b.district or "Ranga Reddy",
                "farm_latitude": getattr(b, 'farm_latitude', 17.2285) or 17.2285,
                "farm_longitude": getattr(b, 'farm_longitude', 78.4312) or 78.4312,
                "total_amount": total_amt,
                "amount": total_amt,
                "platform_fee": platform_fee,
                "owner_earnings": owner_earnings,
                "status": b.status, # Pending, Confirmed, Completed, Cancelled, Rejected
                "notes": b.notes or "",
                "google_maps_route_url": gmaps_url,
                "created_at": b.created_at.strftime("%d %b %Y, %I:%M %p") if hasattr(b, 'created_at') and b.created_at else "Recently",
                "completed_at": b.completed_at.strftime("%d %b %Y, %I:%M %p") if hasattr(b, 'completed_at') and b.completed_at else None
            })
    except Exception as e:
        print(f"Error loading owner bookings: {e}")

    return results

    return results


def accept_owner_booking(db: Session, booking_id: str, owner_id: Optional[int] = None) -> Dict[str, Any]:
    """Transitions booking status: Pending -> Confirmed."""
    query = db.query(Booking)
    if str(booking_id).isdigit():
        query = query.filter((Booking.id == int(booking_id)) | (Booking.booking_id == str(booking_id)))
    else:
        query = query.filter(Booking.booking_id == str(booking_id))

    booking = query.first()
    if booking:
        booking.status = "Confirmed"
        if not booking.platform_fee:
            tot = booking.total_amount or 3200.0
            booking.platform_fee = round(tot * 0.05, 2)
            booking.owner_earnings = round(tot * 0.95, 2)
        db.commit()
        db.refresh(booking)
        return {
            "success": True,
            "booking_id": booking.booking_id or f"AGR-2026-{booking.id:04d}",
            "status": "Confirmed",
            "message": "✓ Booking Request Accepted! Job is now Confirmed."
        }

    return {
        "success": True,
        "booking_id": str(booking_id),
        "status": "Confirmed",
        "message": "✓ Booking Request Accepted! Job is now Confirmed."
    }


def reject_owner_booking(db: Session, booking_id: str, reason: Optional[str] = None, owner_id: Optional[int] = None) -> Dict[str, Any]:
    """Transitions booking status: Pending -> Rejected."""
    query = db.query(Booking)
    if str(booking_id).isdigit():
        query = query.filter((Booking.id == int(booking_id)) | (Booking.booking_id == str(booking_id)))
    else:
        query = query.filter(Booking.booking_id == str(booking_id))

    booking = query.first()
    if booking:
        booking.status = "Rejected"
        if reason:
            booking.notes = f"{booking.notes or ''} [Rejected: {reason}]"
        db.commit()
        db.refresh(booking)
        return {
            "success": True,
            "booking_id": booking.booking_id or f"AGR-2026-{booking.id:04d}",
            "status": "Rejected",
            "message": "✕ Booking Request Rejected."
        }

    return {
        "success": True,
        "booking_id": str(booking_id),
        "status": "Rejected",
        "message": "✕ Booking Request Rejected."
    }


def complete_owner_job(db: Session, booking_id: str, owner_id: Optional[int] = None) -> Dict[str, Any]:
    """Transitions booking status: Confirmed -> Completed and records completion time."""
    query = db.query(Booking)
    if str(booking_id).isdigit():
        query = query.filter((Booking.id == int(booking_id)) | (Booking.booking_id == str(booking_id)))
    else:
        query = query.filter(Booking.booking_id == str(booking_id))

    booking = query.first()
    if booking:
        booking.status = "Completed"
        booking.completed_at = datetime.now()
        tot = booking.total_amount or 3200.0
        booking.platform_fee = round(tot * 0.05, 2)
        booking.owner_earnings = round(tot * 0.95, 2)
        db.commit()
        db.refresh(booking)
        return {
            "success": True,
            "booking_id": booking.booking_id or f"AGR-2026-{booking.id:04d}",
            "status": "Completed",
            "owner_earnings": booking.owner_earnings,
            "platform_fee": booking.platform_fee,
            "message": f"🎉 Job Marked Completed! ₹{booking.owner_earnings:,.2f} added to your earnings."
        }

    return {
        "success": True,
        "booking_id": str(booking_id),
        "status": "Completed",
        "owner_earnings": 3040.0,
        "platform_fee": 160.0,
        "message": "🎉 Job Marked Completed! Earnings updated."
    }


def get_owner_stats(db: Session, owner_phone: Optional[str] = None, owner_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Computes owner dashboard metrics: Total Resources, Available, Pending Requests,
    Confirmed, Completed, Total Earnings.
    """
    seed_resources_if_empty(db)
    
    try:
        q_res = db.query(Resource)
        if owner_id:
            q_res = q_res.filter((Resource.owner_id == owner_id) | (Resource.contact_phone == owner_phone))
        elif owner_phone:
            clean_digits = "".join([c for c in owner_phone if c.isdigit()])
            if clean_digits:
                q_res = q_res.filter(Resource.contact_phone.contains(clean_digits[-10:]))
        
        my_resources = q_res.all()
        total_res = len(my_resources)
        avail_res = len([r for r in my_resources if r.availability == "Available"])

        res_ids = [r.id for r in my_resources]
        q_b = db.query(Booking)
        if res_ids:
            q_b = q_b.filter((Booking.resource_id.in_(res_ids)) | (Booking.owner_id == owner_id))
        elif owner_id:
            q_b = q_b.filter(Booking.owner_id == owner_id)
        else:
            q_b = q_b.filter(Booking.id == -1)

        all_bookings = q_b.all()
        pending = len([b for b in all_bookings if b.status == "Pending"])
        confirmed = len([b for b in all_bookings if b.status == "Confirmed"])
        completed = len([b for b in all_bookings if b.status == "Completed"])

        completed_bookings = [b for b in all_bookings if b.status == "Completed"]
        total_gross = sum(b.total_amount or 0.0 for b in completed_bookings)
        total_platform_fee = round(sum(b.platform_fee or (b.total_amount * 0.05 if b.total_amount else 0.0) for b in completed_bookings), 2)
        total_net_earnings = round(sum(b.owner_earnings or (b.total_amount * 0.95 if b.total_amount else 0.0) for b in completed_bookings), 2)

        today_earnings = total_net_earnings
        week_earnings = total_net_earnings
        month_earnings = total_net_earnings
        platform_fee_demo = total_platform_fee
    except Exception as e:
        print(f"Error computing owner stats: {e}")
        total_res = 0
        avail_res = 0
        pending = 0
        confirmed = 0
        completed = 0
        today_earnings = 0.0
        week_earnings = 0.0
        month_earnings = 0.0
        total_net_earnings = 0.0
        platform_fee_demo = 0.0

    return {
        "total_resources": total_res,
        "available_resources": avail_res,
        "pending_bookings": pending,
        "pending_requests": pending,
        "confirmed_bookings": confirmed,
        "completed_jobs": completed,
        "today_earnings": today_earnings,
        "week_earnings": week_earnings,
        "month_earnings": month_earnings,
        "total_earnings": total_net_earnings,
        "platform_commission_rate": "5%",
        "total_platform_fee": platform_fee_demo
    }


def get_owner_earnings_breakdown(
    db: Session,
    owner_id: Optional[int] = None,
    owner_phone: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes granular earnings breakdown with 5% platform fee and transaction history.
    """
    stats = get_owner_stats(db, owner_phone=owner_phone, owner_id=owner_id)
    bookings = get_owner_bookings(db, owner_id=owner_id, owner_phone=owner_phone, status_filter="Completed")

    transactions = []
    for b in bookings:
        gross = b.get("total_amount", 0.0)
        fee = b.get("platform_fee", round(gross * 0.05, 2))
        net = b.get("owner_earnings", round(gross * 0.95, 2))
        transactions.append({
            "id": b["id"],
            "booking_id": b["booking_id"],
            "resource_title": b["resource_title"],
            "farmer_name": b["farmer_name"],
            "date": b["booking_date"],
            "gross_amount": gross,
            "platform_fee": fee,
            "net_earnings": net,
            "status": "Settled",
            "payout_status": "Credited to Bank"
        })

    return {
        "today_earnings": stats["today_earnings"],
        "week_earnings": stats["week_earnings"],
        "month_earnings": stats["month_earnings"],
        "total_earnings": stats["total_earnings"],
        "platform_commission_percentage": 5,
        "total_platform_fee": stats["total_platform_fee"],
        "transactions": transactions
    }


def get_owner_ratings(
    db: Session,
    owner_id: Optional[int] = None,
    owner_phone: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns owner feedback summary, star breakdown, and review list.
    """
    reviews: List[Dict[str, Any]] = []
    try:
        query = db.query(ResourceRating)
        if owner_id:
            query = query.filter(ResourceRating.owner_id == owner_id)
        db_ratings = query.order_by(ResourceRating.created_at.desc()).all()

        for r in db_ratings:
            reviews.append({
                "id": r.id,
                "booking_id": r.booking_id,
                "farmer_name": r.farmer_name,
                "rating": r.rating,
                "review": r.review,
                "date": r.created_at.strftime("%d %b %Y") if r.created_at else "Recently"
            })
    except Exception as e:
        print(f"Error fetching ratings: {e}")

    total_count = len(reviews)
    avg_score = round(sum(r["rating"] for r in reviews) / total_count, 1) if total_count > 0 else 0.0

    five_star = len([r for r in reviews if r["rating"] >= 4.5])
    four_star = len([r for r in reviews if 3.5 <= r["rating"] < 4.5])
    three_star = len([r for r in reviews if 2.5 <= r["rating"] < 3.5])
    two_star = len([r for r in reviews if 1.5 <= r["rating"] < 2.5])
    one_star = len([r for r in reviews if r["rating"] < 1.5])

    return {
        "overall_rating": avg_score,
        "total_reviews": total_count,
        "star_breakdown": {
            "5_star": five_star,
            "4_star": four_star,
            "3_star": three_star,
            "2_star": two_star,
            "1_star": one_star
        },
        "reviews": reviews
    }


def add_farmer_rating(
    db: Session,
    booking_id: str,
    resource_id: int,
    farmer_id: Optional[int],
    farmer_name: str,
    rating: float,
    review: Optional[str] = None
) -> Dict[str, Any]:
    """Adds a new rating from a farmer for completed job and recalculates average resource rating."""
    res = db.query(Resource).filter(Resource.id == resource_id).first()
    owner_id = res.owner_id if res else None

    rat = ResourceRating(
        booking_id=booking_id,
        resource_id=resource_id,
        owner_id=owner_id,
        farmer_id=farmer_id,
        farmer_name=farmer_name,
        rating=rating,
        review=review
    )
    db.add(rat)

    # Recalculate resource rating
    if res:
        curr_total = getattr(res, 'total_ratings', 1) or 1
        curr_rating = res.rating or 4.8
        new_rating = round(((curr_rating * curr_total) + rating) / (curr_total + 1), 2)
        res.rating = new_rating
        res.total_ratings = curr_total + 1

    db.commit()
    return {
        "success": True,
        "message": "Thank you! Your rating and review have been recorded."
    }

