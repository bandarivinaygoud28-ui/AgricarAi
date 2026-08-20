from market.routing_service import get_driving_distance
from market.mandi_db import haversine_distance, ALL_MANDIS

# Location from user's screenshot: (17.1715, 78.2826) - Palmakole / Muchintal area on NH 44
f_lat, f_lon = 17.1715, 78.2826
print(f"=== Farmer Location: ({f_lat}, {f_lon}) ===")

# Test all mandis
for m in ALL_MANDIS[:5]:
    m_lat, m_lon = m['lat'], m['lon']
    h = haversine_distance(f_lat, f_lon, m_lat, m_lon)
    r = get_driving_distance(f_lat, f_lon, m_lat, m_lon)
    print(f"\n{m['name']}:")
    print(f"  Haversine Straight-line: {h} km")
    print(f"  Driving Road Distance:   {r['formatted_distance']}")
    print(f"  Driving Time:            {r['duration_minutes']} min drive")
    print(f"  Label:                   {r['label']}")
    print(f"  Routing Source:          {r['routing_source']}")
