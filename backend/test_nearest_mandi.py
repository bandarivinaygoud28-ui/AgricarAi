import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app
from market.mandi_db import haversine_distance, find_nearest_mandi, get_nearby_mandis
from market.routing_service import get_driving_distance

def test_nearest_mandi_calculations():
    print("=== 1. Testing Road Driving Distance vs Haversine ===")
    # Yenkapally area (Ranga Reddy)
    farmer_lat, farmer_lon = 17.3228, 78.2713
    shamshabad_lat, shamshabad_lon = 17.2600, 78.3970
    
    h_dist = haversine_distance(farmer_lat, farmer_lon, shamshabad_lat, shamshabad_lon)
    route_info = get_driving_distance(farmer_lat, farmer_lon, shamshabad_lat, shamshabad_lon)
    
    print(f"Haversine straight-line: {h_dist} km")
    print(f"Road Driving distance: {route_info['formatted_distance']} ({route_info['duration_minutes']} mins, label: {route_info['label']})")
    assert route_info["is_road_distance"] is True
    assert route_info["distance_km"] > h_dist, "Road distance should exceed or equal straight-line distance"

    print("\n=== 2. Testing find_nearest_mandi (Sorted by Road Distance) ===")
    nearest = find_nearest_mandi(farmer_lat, farmer_lon)
    print(f"Nearest Mandi found: {nearest['name']} ({nearest.get('formatted_distance')})")
    assert nearest["distance_km"] is not None

    print("\n=== 3. Testing get_nearby_mandis (Sorted strictly by Road Distance) ===")
    nearby = get_nearby_mandis(farmer_lat, farmer_lon, limit=4)
    print("Top 4 nearby mandis by road distance:")
    for idx, m in enumerate(nearby, 1):
        print(f"  {idx}. {m['name']} - {m.get('formatted_distance')} ({m['district']}, {m['state']})")
    assert len(nearby) == 4
    assert nearby[0]["distance_km"] <= nearby[1]["distance_km"] <= nearby[2]["distance_km"]

def test_api_endpoints():
    client = TestClient(app)

    print("\n=== 4. Testing GET /api/market-prices with road distance ===")
    res = client.get("/api/market-prices?lat=17.3457&lon=78.5528&crop=Tomato")
    assert res.status_code == 200
    data = res.json()
    assert "nearest_mandi" in data
    assert "formatted_distance" in data["nearest_mandi"]
    assert "distance_label" in data["nearest_mandi"]
    assert "nearby_markets" in data
    assert len(data["records"]) > 0
    assert "formatted_distance" in data["records"][0]
    print(f"Nearest Mandi: {data['nearest_mandi']['name']} - {data['nearest_mandi']['formatted_distance']}")
    print(f"Routing Explanation: {data.get('routing_explanation')}")

    print("\n=== 5. Testing GET /api/market-prices/best-market with transport cost ===")
    res_best = client.get("/api/market-prices/best-market?lat=17.3457&lon=78.5528&crop=Tomato")
    assert res_best.status_code == 200
    best_data = res_best.json()
    assert best_data["has_recommendation"] is True
    assert "routing_explanation" in best_data
    assert "comparisons" in best_data
    print("Best Market Recommendation Text:\n", best_data["recommendation_text"])

    print("\nALL NEAREST MANDI ROAD DISTANCE TESTS PASSED SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    test_nearest_mandi_calculations()
    test_api_endpoints()
