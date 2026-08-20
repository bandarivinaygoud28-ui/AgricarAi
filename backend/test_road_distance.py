import sys
import unittest
from market.routing_service import get_driving_distance, batch_calculate_road_distances
from market.mandi_db import find_nearest_mandi, get_nearby_mandis, haversine_distance
from market.market_service import get_market_prices, get_best_market_recommendation

class TestRoadDistanceAndMarketRouting(unittest.TestCase):

    def test_routing_service_identical_coords(self):
        result = get_driving_distance(17.345, 78.163, 17.345, 78.163)
        self.assertIsNotNone(result)
        self.assertEqual(result["distance_km"], 0.0)

    def test_routing_service_distance_calculation(self):
        # Yenkapally / Moinabad area coordinates to Shamshabad Market
        result = get_driving_distance(17.3457, 78.1633, 17.2600, 78.3970)
        self.assertIn("distance_km", result)
        self.assertIn("duration_minutes", result)
        self.assertIn("is_road_distance", result)
        self.assertIn("formatted_distance", result)
        self.assertGreater(result["distance_km"], 0)

    def test_find_nearest_mandi_sorted_by_road(self):
        # Test nearest mandi for Yenkapally GPS
        nearest = find_nearest_mandi(17.3457, 78.1633)
        self.assertIsNotNone(nearest)
        self.assertIn("name", nearest)
        self.assertIn("distance_km", nearest)
        self.assertIn("formatted_distance", nearest)
        self.assertTrue(nearest["distance_km"] > 0)

    def test_nearby_mandis_road_sorted(self):
        nearby = get_nearby_mandis(17.3457, 78.1633, limit=4)
        self.assertGreater(len(nearby), 0)
        # Check ascending order of road distance
        for i in range(len(nearby) - 1):
            d1 = nearby[i].get("distance_km") or 0
            d2 = nearby[i+1].get("distance_km") or 0
            self.assertLessEqual(d1, d2)

    def test_market_recommendation_transport_aware(self):
        rec = get_best_market_recommendation(17.3457, 78.1633, crop="Tomato")
        self.assertTrue(rec.get("has_recommendation"))
        self.assertIn("nearest_market", rec)
        self.assertIn("best_price_market", rec)
        self.assertIn("recommendation_text", rec)
        self.assertIn("routing_explanation", rec)
        self.assertIn("disclaimer", rec)

        # Check that freight cost calculation exists
        for item in rec.get("comparisons", []):
            self.assertIn("estimated_transport_cost_per_qtl", item)
            self.assertIn("net_realized_price", item)
            self.assertEqual(
                round(item["modal_price"] - item["estimated_transport_cost_per_qtl"], 2),
                item["net_realized_price"]
            )

    def test_market_prices_payload_structure(self):
        prices = get_market_prices(crop="Tomato", lat=17.3457, lon=78.1633)
        self.assertIn("nearest_mandi", prices)
        self.assertIn("nearby_markets", prices)
        self.assertIn("best_market_to_sell", prices)
        self.assertIn("routing_explanation", prices)
        self.assertTrue(prices["nearest_mandi"]["is_road_distance"])
        self.assertIn("by road", prices["nearest_mandi"]["formatted_distance"])

if __name__ == '__main__':
    unittest.main()
