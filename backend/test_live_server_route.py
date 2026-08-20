import requests
import json

url = "http://127.0.0.1:8000/api/market-prices?crop=Tomato&lat=17.171542&lon=78.282619"
print(f"Fetching: {url}")
res = requests.get(url, timeout=10)
print(f"Status: {res.status_code}")
data = res.json()

print("\n--- NEAREST MANDI ---")
print(json.dumps(data["nearest_mandi"], indent=2))

print("\n--- OTHER NEARBY MARKETS ---")
for m in data["nearby_markets"]:
    print(f"{m['name']}: {m.get('distance_km')} km ({m.get('duration_minutes')} min drive) [type: {m.get('distance_type')}]")

print("\n--- BEST MARKET TO SELL ---")
print(json.dumps(data.get("best_market_to_sell"), indent=2))
