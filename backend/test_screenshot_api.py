from market.market_service import get_market_prices

# Coordinates from Image 1 & Image 2: (17.1715, 78.2826)
lat, lon = 17.1715, 78.2826
res = get_market_prices(crop='Tomato', lat=lat, lon=lon)

print("=== NEAREST MANDI DETERMINED BY ROAD DISTANCE ===")
print("Nearest Mandi Name:", res['nearest_mandi']['name'])
print("Distance (km):", res['nearest_mandi'].get('distance_km'))
print("Formatted Distance:", res['nearest_mandi'].get('formatted_distance'))
print("Duration (minutes):", res['nearest_mandi'].get('duration_minutes'))
print("Is Road Distance:", res['nearest_mandi'].get('is_road_distance'))
print("Distance Label:", res['nearest_mandi'].get('distance_label'))

print("\n=== OTHER NEARBY MARKETS (SORTED BY ROAD DISTANCE) ===")
for m in res['nearby_markets']:
    print(f"  - {m['name']}: {m.get('distance_km')} km ({m.get('duration_minutes')} min drive) [Road: {m.get('is_road_distance')}]")

print("\n=== BEST NEARBY MARKET TO SELL (ACCOUNTING FOR FREIGHT) ===")
best = res.get('best_market_to_sell', {})
print("Recommendation text:\n", best.get('recommendation_text'))
print("\nComparisons:")
for c in best.get('comparisons', []):
    print(f"  * {c['mandi_name']}: Modal ₹{c['modal_price']}/Qtl, {c['distance_km']} km by road ({c.get('duration_minutes')} min drive), Est Freight ₹{c.get('estimated_transport_cost_per_qtl')}/Qtl")
