import os
import requests
from typing import Dict, Any, List, Optional

# Curated fallback for common agricultural regions in case network is down
KNOWN_INDIAN_LOCATIONS = [
    {"name": "Warangal", "district": "Warangal", "state": "Telangana", "country": "India", "lat": 17.9689, "lon": 79.5941},
    {"name": "Karimnagar", "district": "Karimnagar", "state": "Telangana", "country": "India", "lat": 18.4386, "lon": 79.1288},
    {"name": "Nalgonda", "district": "Nalgonda", "state": "Telangana", "country": "India", "lat": 17.0500, "lon": 79.2700},
    {"name": "Khammam", "district": "Khammam", "state": "Telangana", "country": "India", "lat": 17.2473, "lon": 80.1514},
    {"name": "Nizamabad", "district": "Nizamabad", "state": "Telangana", "country": "India", "lat": 18.6725, "lon": 78.0941},
    {"name": "Guntur", "district": "Guntur", "state": "Andhra Pradesh", "country": "India", "lat": 16.3067, "lon": 80.4365},
    {"name": "Chittoor", "district": "Chittoor", "state": "Andhra Pradesh", "country": "India", "lat": 13.2172, "lon": 79.1003},
    {"name": "Vijayawada", "district": "NTR", "state": "Andhra Pradesh", "country": "India", "lat": 16.5062, "lon": 80.6480},
    {"name": "Nashik", "district": "Nashik", "state": "Maharashtra", "country": "India", "lat": 19.9975, "lon": 73.7898},
    {"name": "Pune", "district": "Pune", "state": "Maharashtra", "country": "India", "lat": 18.5204, "lon": 73.8567},
    {"name": "Nagpur", "district": "Nagpur", "state": "Maharashtra", "country": "India", "lat": 21.1458, "lon": 79.0882},
    {"name": "Kolar", "district": "Kolar", "state": "Karnataka", "country": "India", "lat": 13.1367, "lon": 78.1292},
    {"name": "Belagavi", "district": "Belagavi", "state": "Karnataka", "country": "India", "lat": 15.8497, "lon": 74.4977},
    {"name": "Ludhiana", "district": "Ludhiana", "state": "Punjab", "country": "India", "lat": 30.9010, "lon": 75.8573},
    {"name": "Amritsar", "district": "Amritsar", "state": "Punjab", "country": "India", "lat": 31.6340, "lon": 74.8723},
    {"name": "Varanasi", "district": "Varanasi", "state": "Uttar Pradesh", "country": "India", "lat": 25.3176, "lon": 82.9739},
    {"name": "Lucknow", "district": "Lucknow", "state": "Uttar Pradesh", "country": "India", "lat": 26.8467, "lon": 80.9462},
    {"name": "Rajkot", "district": "Rajkot", "state": "Gujarat", "country": "India", "lat": 22.3039, "lon": 70.8022},
    {"name": "Surat", "district": "Surat", "state": "Gujarat", "country": "India", "lat": 21.1702, "lon": 72.8311},
    {"name": "Jaipur", "district": "Jaipur", "state": "Rajasthan", "country": "India", "lat": 26.9124, "lon": 75.7873},
]

def search_locations(query: str, limit: int = 8) -> List[Dict[str, Any]]:
    """
    Searches for villages, towns, cities, districts, and states worldwide / in India
    using Open-Meteo Geocoding & OpenStreetMap Nominatim APIs.
    """
    q_clean = query.strip()
    if not q_clean or len(q_clean) < 2:
        return []

    results: List[Dict[str, Any]] = []
    seen_coords = set()

    # 1. Primary: Open-Meteo Geocoding API (Fast, comprehensive, supports Indian places)
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={requests.utils.quote(q_clean)}&count={limit}&language=en&format=json"
        res = requests.get(url, timeout=4)
        if res.status_code == 200:
            data = res.json()
            for item in data.get("results", []):
                name = item.get("name", "")
                admin1 = item.get("admin1", "") # State
                admin2 = item.get("admin2", "") # District / County
                country = item.get("country", "")
                lat = round(float(item.get("latitude")), 4)
                lon = round(float(item.get("longitude")), 4)

                coord_key = (round(lat, 2), round(lon, 2))
                if coord_key in seen_coords:
                    continue
                seen_coords.add(coord_key)

                # Formatted name
                parts = [name]
                if admin2 and admin2.lower() != name.lower():
                    parts.append(admin2)
                if admin1 and admin1.lower() != name.lower() and admin1.lower() != (admin2 or "").lower():
                    parts.append(admin1)
                if country:
                    parts.append(country)

                formatted = f"{name}, {admin1}" if admin1 else (f"{name}, {country}" if country else name)
                display_name = ", ".join(parts)

                results.append({
                    "name": name,
                    "district": admin2 or admin1 or name,
                    "state": admin1 or country or "India",
                    "country": country or "India",
                    "lat": lat,
                    "lon": lon,
                    "formatted_location": formatted,
                    "display_name": display_name,
                    "source": "Open-Meteo Geocoding"
                })
    except Exception as e:
        print(f"Open-Meteo geocoding error: {e}")

    # 2. Fallback / Secondary: Nominatim OpenStreetMap (if results < limit)
    if len(results) < 3:
        try:
            headers = {
                "User-Agent": "AgriCareAI/2.0 (agricare.farmer.platform; contact@agricare.ai)"
            }
            url = f"https://nominatim.openstreetmap.org/search?q={requests.utils.quote(q_clean)}&format=json&addressdetails=1&limit={limit}"
            res = requests.get(url, headers=headers, timeout=4)
            if res.status_code == 200:
                data = res.json()
                for item in data:
                    addr = item.get("address", {})
                    name = addr.get("village") or addr.get("town") or addr.get("city") or addr.get("suburb") or addr.get("county") or item.get("name") or q_clean
                    state = addr.get("state") or addr.get("region") or "India"
                    district = addr.get("state_district") or addr.get("county") or name
                    country = addr.get("country") or "India"
                    lat = round(float(item.get("lat")), 4)
                    lon = round(float(item.get("lon")), 4)

                    coord_key = (round(lat, 2), round(lon, 2))
                    if coord_key in seen_coords:
                        continue
                    seen_coords.add(coord_key)

                    formatted = f"{name}, {state}" if state else name
                    results.append({
                        "name": name,
                        "district": district,
                        "state": state,
                        "country": country,
                        "lat": lat,
                        "lon": lon,
                        "formatted_location": formatted,
                        "display_name": item.get("display_name", formatted),
                        "source": "OpenStreetMap Nominatim"
                    })
        except Exception as e:
            print(f"Nominatim search error: {e}")

    # 3. Local Known Indian Agricultural Regions matching
    if not results:
        q_lower = q_clean.lower()
        for loc in KNOWN_INDIAN_LOCATIONS:
            if (q_lower in loc["name"].lower() or 
                q_lower in loc["district"].lower() or 
                q_lower in loc["state"].lower()):
                formatted = f"{loc['name']}, {loc['state']}"
                results.append({
                    "name": loc["name"],
                    "district": loc["district"],
                    "state": loc["state"],
                    "country": loc["country"],
                    "lat": loc["lat"],
                    "lon": loc["lon"],
                    "formatted_location": formatted,
                    "display_name": f"{loc['name']}, {loc['district']}, {loc['state']}, India",
                    "source": "AgriCare Regional Knowledge"
                })

    return results[:limit]

def reverse_geocode(lat: float, lon: float) -> Dict[str, Any]:
    """
    Performs reverse geocoding to resolve GPS coordinates (lat, lon)
    into Indian village/city, district, state, and formatted location string.
    """
    try:
        headers = {
            "User-Agent": "AgriCareAI/2.0 (agricare.farmer.platform; contact@agricare.ai)"
        }
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1"
        res = requests.get(url, headers=headers, timeout=5)
        
        if res.status_code == 200:
            data = res.json()
            address = data.get("address", {})
            
            village = address.get("village") or address.get("hamlet") or address.get("suburb") or address.get("neighbourhood") or address.get("town") or address.get("city") or "Farm Location"
            city = address.get("city") or address.get("town") or village
            district = address.get("state_district") or address.get("county") or address.get("district") or city
            state = address.get("state") or "India"
            country = address.get("country") or "India"
            postcode = address.get("postcode") or ""

            formatted = f"{village}, {district}, {state}" if district != village else f"{village}, {state}"

            return {
                "success": True,
                "lat": lat,
                "lon": lon,
                "village": village,
                "city": city,
                "district": district,
                "state": state,
                "country": country,
                "postcode": postcode,
                "formatted_location": formatted,
                "display_name": data.get("display_name", formatted),
                "source": "OpenStreetMap Nominatim Live GPS"
            }
    except Exception as e:
        print(f"Reverse geocode error: {e}")

    # Fallback default
    return {
        "success": True,
        "lat": lat,
        "lon": lon,
        "village": "Farm Location",
        "city": "Farm Location",
        "district": "Local Agricultural Region",
        "state": "India",
        "country": "India",
        "postcode": "",
        "formatted_location": f"Coordinates ({lat:.4f}°, {lon:.4f}°)",
        "display_name": f"Latitude: {lat}, Longitude: {lon}",
        "source": "AgriCare GPS Location Service"
    }

def detect_ip_location(client_ip: Optional[str] = None) -> Dict[str, Any]:
    """
    Estimates location using IP address if GPS permissions are unavailable.
    """
    try:
        url = f"https://ipapi.co/{client_ip}/json/" if client_ip and client_ip not in ["127.0.0.1", "localhost", "::1"] else "https://ipapi.co/json/"
        res = requests.get(url, timeout=4)
        if res.status_code == 200:
            data = res.json()
            city = data.get("city", "Warangal")
            region = data.get("region", "Telangana")
            lat = data.get("latitude", 17.9689)
            lon = data.get("longitude", 79.5941)
            formatted = f"{city}, {region}"

            return {
                "success": True,
                "lat": lat,
                "lon": lon,
                "city": city,
                "district": city,
                "state": region,
                "country": data.get("country_name", "India"),
                "formatted_location": formatted,
                "source": "IP Geolocation Service"
            }
    except Exception:
        pass

    return {
        "success": True,
        "lat": 17.9689,
        "lon": 79.5941,
        "city": "Warangal",
        "district": "Warangal",
        "state": "Telangana",
        "country": "India",
        "formatted_location": "Warangal, Telangana",
        "source": "Default Agro-Hub Location"
    }
