import os
import math
import requests
from typing import Dict, Any, List, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

# In-memory routing cache:
# (origin_lat, origin_lon, dest_lat, dest_lon) -> routing_result
ROUTING_CACHE: Dict[Tuple[float, float, float, float], Dict[str, Any]] = {}

def get_driving_distance(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> Dict[str, Any]:
    """
    Calculates genuine driving road distance and duration between two GPS coordinates
    using real road-routing engine (Google Maps Routes API / OSRM Driving Engine).
    
    Returns structured routing response:
    {
        "distance_km": float,
        "duration_minutes": int,
        "distance_type": "road" | "straight_line" | "unavailable",
        "is_road_distance": bool,
        "formatted_distance": str,
        "label": str,
        "routing_source": str
    }
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return {
            "distance_km": None,
            "duration_minutes": None,
            "distance_type": "unavailable",
            "is_road_distance": False,
            "formatted_distance": "⚠️ Road distance unavailable",
            "label": "⚠️ Road distance unavailable",
            "routing_source": "None"
        }

    # Normalize coordinates to 4 decimal places for cache key
    key = (round(float(lat1), 4), round(float(lon1), 4), round(float(lat2), 4), round(float(lon2), 4))
    if key in ROUTING_CACHE:
        return ROUTING_CACHE[key]

    # Check identical or near-identical coordinates
    if abs(lat1 - lat2) < 0.0001 and abs(lon1 - lon2) < 0.0001:
        zero_res = {
            "distance_km": 0.0,
            "duration_minutes": 0,
            "distance_type": "road",
            "is_road_distance": True,
            "formatted_distance": "0.0 km by road",
            "label": "🚗 Road Distance",
            "routing_source": "Local"
        }
        ROUTING_CACHE[key] = zero_res
        return zero_res

    # 1. Google Maps Routes / Distance Matrix API if configured in environment
    google_key = os.getenv("GOOGLE_MAPS_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if google_key:
        try:
            url = (
                f"https://maps.googleapis.com/maps/api/distancematrix/json"
                f"?origins={lat1},{lon1}&destinations={lat2},{lon2}&mode=driving&key={google_key}"
            )
            res = requests.get(url, timeout=2.5)
            if res.status_code == 200:
                data = res.json()
                if data.get("rows") and data["rows"][0].get("elements"):
                    elem = data["rows"][0]["elements"][0]
                    if elem.get("status") == "OK":
                        meters = elem["distance"]["value"]
                        seconds = elem["duration"]["value"]
                        km = round(meters / 1000.0, 1)
                        mins = max(round(seconds / 60.0), 1)
                        result = {
                            "distance_km": km,
                            "duration_minutes": mins,
                            "distance_type": "road",
                            "is_road_distance": True,
                            "formatted_distance": f"{km} km by road",
                            "label": "🚗 Road Distance",
                            "routing_source": "Google Maps Routes API"
                        }
                        ROUTING_CACHE[key] = result
                        return result
        except Exception:
            pass

    # 2. OSRM Car Driving Routing Engine (High Accuracy Public Routing Service)
    osrm_endpoints = [
        f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false",
        f"https://routing.openstreetmap.de/routed-car/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
    ]
    headers = {"User-Agent": "AgriCare-AI-Platform/2.0 (Agricultural Intelligence)"}

    for url in osrm_endpoints:
        try:
            res = requests.get(url, headers=headers, timeout=4.0)
            if res.status_code == 200:
                data = res.json()
                if data.get("routes") and len(data["routes"]) > 0:
                    route = data["routes"][0]
                    meters = route.get("distance", 0)
                    seconds = route.get("duration", 0)
                    km = round(meters / 1000.0, 1)
                    mins = max(round(seconds / 60.0), 1)
                    result = {
                        "distance_km": km,
                        "duration_minutes": mins,
                        "distance_type": "road",
                        "is_road_distance": True,
                        "formatted_distance": f"{km} km by road",
                        "label": "🚗 Road Distance",
                        "routing_source": "OSRM Driving Engine"
                    }
                    ROUTING_CACHE[key] = result
                    return result
        except Exception:
            continue

    # 3. Explicit Fallback: Haversine Geodesic Distance
    # Explicitly flagged with is_road_distance=False and distance_type="straight_line"
    # NEVER mislabeled as "by road" or "Road Distance"
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    straight_km = round(R * c, 1)

    result = {
        "distance_km": straight_km,
        "duration_minutes": max(round((straight_km / 35.0) * 60), 1),
        "distance_type": "straight_line",
        "is_road_distance": False,
        "formatted_distance": f"Approx. straight-line distance: {straight_km} km",
        "label": "⚠️ Road distance unavailable",
        "routing_source": "Haversine Straight-Line Fallback"
    }
    ROUTING_CACHE[key] = result
    return result


def _resolve_single_destination(args: Tuple[float, float, Dict[str, Any]]) -> Dict[str, Any]:
    origin_lat, origin_lon, item = args
    dest_lat = item.get("lat")
    dest_lon = item.get("lon")
    if dest_lat is not None and dest_lon is not None:
        route_info = get_driving_distance(origin_lat, origin_lon, dest_lat, dest_lon)
        item_copy = dict(item)
        item_copy["distance_km"] = route_info["distance_km"]
        item_copy["duration_minutes"] = route_info["duration_minutes"]
        item_copy["distance_type"] = route_info["distance_type"]
        item_copy["is_road_distance"] = route_info["is_road_distance"]
        item_copy["formatted_distance"] = route_info["formatted_distance"]
        item_copy["distance_label"] = route_info["label"]
        item_copy["routing_source"] = route_info["routing_source"]
        return item_copy
    return dict(item)


def batch_calculate_road_distances(
    origin_lat: float,
    origin_lon: float,
    destinations: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Computes road distance concurrently for candidate mandis using ThreadPoolExecutor.
    """
    if not destinations:
        return []

    tasks = [(origin_lat, origin_lon, item) for item in destinations]
    with ThreadPoolExecutor(max_workers=min(len(destinations), 8)) as executor:
        results = list(executor.map(_resolve_single_destination, tasks))
    return results
