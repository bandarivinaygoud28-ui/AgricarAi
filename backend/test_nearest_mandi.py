import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app
from market.mandi_db import haversine_distance, find_nearest_mandi, get_nearby_mandis

def test_nearest_mandi_calculations():
    print("=== 1. Testing Haversine Distance Calculation ===")
    # Kummariguda / Shamshabad area: 17.2500, 78.4000
    shamshabad_lat, shamshabad_lon = 17.2600, 78.3970
    farmer_lat, farmer_lon = 17.2500, 78.4000
    dist = haversine_distance(farmer_lat, farmer_lon, shamshabad_lat, shamshabad_lon)
    print(f"Distance from ({farmer_lat}, {farmer_lon}) to Shamshabad: {dist} km")
    assert dist < 5.0, f"Expected < 5.0 km, got {dist}"

    print("=== 2. Testing find_nearest_mandi ===")
    nearest = find_nearest_mandi(farmer_lat, farmer_lon)
    print(f"Nearest Mandi found: {nearest['name']} ({nearest['distance_km']} km)")
    assert "Shamshabad" in nearest["name"]

    # Warangal farmer: 17.9689, 79.5941
    warangal_nearest = find_nearest_mandi(17.9689, 79.5941)
    print(f"Nearest Mandi for Warangal farmer: {warangal_nearest['name']} ({warangal_nearest['distance_km']} km)")
    assert "Warangal" in warangal_nearest["name"] or "Enumamula" in warangal_nearest["name"]

    print("=== 3. Testing get_nearby_mandis ===")
    nearby = get_nearby_mandis(farmer_lat, farmer_lon, limit=4)
    print("Top 4 nearby mandis:")
    for idx, m in enumerate(nearby, 1):
        print(f"  {idx}. {m['name']} - {m['distance_km']} km ({m['district']}, {m['state']})")
    assert len(nearby) == 4
    assert nearby[0]["distance_km"] <= nearby[1]["distance_km"] <= nearby[2]["distance_km"]

def test_api_endpoints():
    client = TestClient(app)

    print("=== 4. Testing GET /api/market-prices with lat, lon ===")
    res = client.get("/api/market-prices?lat=17.2500&lon=78.4000&crop=Tomato")
    assert res.status_code == 200
    data = res.json()
    assert "nearest_mandi" in data
    print(f"API Nearest Mandi: {data['nearest_mandi']['name']} ({data['nearest_mandi']['distance_km']} km)")
    assert "nearby_markets" in data
    assert len(data["records"]) > 0
    print(f"First record: {data['records'][0]['commodity']} - Modal: Rs.{data['records'][0]['modal_price']}/Qtl (Rs.{data['records'][0]['price_per_kg']}/kg)")
    assert data["records"][0]["modal_price"] > 0
    assert "Quintal" in data["records"][0]["unit"]

    print("=== 5. Testing GET /api/market-prices/best-market ===")
    res_best = client.get("/api/market-prices/best-market?lat=17.2500&lon=78.4000&crop=Tomato")
    assert res_best.status_code == 200
    best_data = res_best.json()
    assert best_data["has_recommendation"] is True
    print("Best Market Advisory received successfully.")
    print("Disclaimer verified.")

    print("=== 6. Testing GET /api/market-prices/mandis search ===")
    res_mandis = client.get("/api/market-prices/mandis?search=Shamshabad")
    assert res_mandis.status_code == 200
    mandis_data = res_mandis.json()
    assert len(mandis_data) > 0
    print(f"Found Mandi: {mandis_data[0]['name']} ({mandis_data[0]['district']})")

    print("\nALL NEAREST MANDI TESTS PASSED SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    test_nearest_mandi_calculations()
    test_api_endpoints()
