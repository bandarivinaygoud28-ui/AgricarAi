import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app
from news.news_service import (
    is_farmer_relevant,
    compute_priority_tier_and_score,
    validate_and_score_image,
    is_source_image_valid_agri,
    fetch_live_agri_news
)

def test_relevance_and_noise_filtering():
    print("=== 1. Testing Strict Noise & Non-Farmer Filtering ===")
    assert not is_farmer_relevant("World Economic Forum meets in Davos to discuss generic trends", "Leaders talk about global trade")
    assert not is_farmer_relevant("Bollywood celebrity marries in destination wedding", "Fashion designer dresses bride")
    assert not is_farmer_relevant("Scottish MSP debates local council road budget", "Road construction in Scotland")
    assert not is_farmer_relevant("Top 10 pasta recipes for your dinner restaurant", "Italian culinary dishes")

    assert is_farmer_relevant("Ranga Reddy District Farmer Subsidy Announced for Drip Irrigation", "Farmers get 90% subsidy")
    assert is_farmer_relevant("PM-KISAN 17th Installment Date Released for Eligible Farmers", "eKYC verification mandatory")
    assert is_farmer_relevant("Tomato Mandi Prices Surge Across Telangana APMC Yards", "Arrivals down due to rainfall")
    assert is_farmer_relevant("India's Fertilizer Subsidy Bill May Reach ₹3.3 Lakh Crore", "Union government approves subsidy outlay for Urea and DAP")
    assert is_farmer_relevant("The vexed problem of fertilizer overuse and subsidy", "Farmers face soil nutrient challenges with chemical fertilizer")
    assert is_farmer_relevant("Crop insurance for farmers", "PMFBY coverage guidelines and claim settlement process")
    print("Noise filtering tests passed [OK]")

def test_image_validation_and_semantic_matching():
    print("\n=== 2. Testing Image Semantic Matching & Validation ===")

    # Test 1: "India's Fertilizer Subsidy Bill May Reach ₹3.3 Lakh Crore"
    img1, score1, desc1 = validate_and_score_image(
        title="India's Fertilizer Subsidy Bill May Reach ₹3.3 Lakh Crore",
        summary="Union government approves subsidy outlay for Urea and DAP fertilizers.",
        crop=None,
        priority_tier=5,
        article_id="art_fert_1"
    )
    print(f"Article: Fertilizer Subsidy Bill -> Image Desc: {desc1}, Score: {score1}, URL: {img1}")
    assert "fertilizer" in desc1.lower() or "soil" in desc1.lower()
    assert score1 >= 95
    assert not any(bad in img1.lower() for bad in ["suit", "supermarket", "fashion", "model"])

    # Test 2: "The vexed problem of fertilizer overuse and subsidy"
    img2, score2, desc2 = validate_and_score_image(
        title="The vexed problem of fertilizer overuse and subsidy",
        summary="Agricultural experts discuss nitrogen balance and DAP usage among farmers.",
        crop=None,
        priority_tier=5,
        article_id="art_fert_2"
    )
    print(f"Article: Fertilizer Overuse -> Image Desc: {desc2}, Score: {score2}")
    assert "fertilizer" in desc2.lower() or "soil" in desc2.lower()
    assert score2 >= 95
    assert not any(bad in img2.lower() for bad in ["supermarket", "grocery", "suit"])

    # Test 3: "Crop insurance for farmers"
    img3, score3, desc3 = validate_and_score_image(
        title="Crop insurance for farmers",
        summary="Pradhan Mantri Fasal Bima Yojana (PMFBY) protects cultivators from unseasonal weather risks.",
        crop=None,
        priority_tier=5,
        article_id="art_ins_1"
    )
    print(f"Article: Crop insurance -> Image Desc: {desc3}, Score: {score3}")
    assert "insurance" in desc3.lower() or "protection" in desc3.lower()
    assert score3 >= 95

    # Test 4: Source Image Filtering
    assert not is_source_image_valid_agri("https://example.com/businessman-in-suit-smiling.jpg")
    assert not is_source_image_valid_agri("https://example.com/supermarket-grocery-aisle.jpg")
    assert not is_source_image_valid_agri("https://example.com/fashion-model-portrait.jpg")
    assert is_source_image_valid_agri("https://example.com/paddy-field-harvest-tractor.jpg")
    print("Image semantic validation tests passed [OK]")

def test_priority_tier_scoring():
    print("\n=== 3. Testing 5-Tier Fallback Priority & Scoring ===")
    farmer_crops = ["Paddy", "Tomato", "Cotton", "Chilli"]

    # Tier 1: District
    tier1, score1, loc1, tier_name1, _ = compute_priority_tier_and_score(
        "Ranga Reddy Farmers receive Tomato seed subsidies",
        "Agriculture officer announces high yield seeds for Ranga Reddy",
        district="Ranga Reddy",
        state="Telangana",
        farmer_crops=farmer_crops
    )
    print(f"Tier 1 District: {tier1}, Score: {score1}, Loc: {loc1}")
    assert tier1 == 1
    assert score1 >= 95

    # Tier 2: State
    tier2, score2, loc2, tier_name2, _ = compute_priority_tier_and_score(
        "Telangana Government advances Rythu Bharosa farm loan waiver schedule",
        "Chief Minister reviews farmer welfare disbursement",
        district="Ranga Reddy",
        state="Telangana",
        farmer_crops=farmer_crops
    )
    print(f"Tier 2 State: {tier2}, Score: {score2}, Loc: {loc2}")
    assert tier2 == 2
    assert score2 >= 80

    # Tier 3: Crop
    tier3, score3, loc3, tier_name3, _ = compute_priority_tier_and_score(
        "Chilli exports to Southeast Asia surge with high modal prices",
        "Red chilli prices increase across wholesale yards",
        district="Ranga Reddy",
        state="Telangana",
        farmer_crops=farmer_crops
    )
    print(f"Tier 3 Crop: {tier3}, Score: {score3}, Loc: {loc3}")
    assert tier3 == 3
    assert score3 >= 75

    # Tier 5: National
    tier5, score5, loc5, tier_name5, _ = compute_priority_tier_and_score(
        "Government of India approves revised National MSP for Rabi Season",
        "Cabinet committee announces minimum support price increase",
        district="Ranga Reddy",
        state="Telangana",
        farmer_crops=farmer_crops
    )
    print(f"Tier 5 National: {tier5}, Score: {score5}, Loc: {loc5}")
    assert tier5 == 5
    assert score5 >= 60

    print("5-Tier priority scoring tests passed [OK]")

def test_live_news_api_endpoint():
    print("\n=== 4. Testing GET /api/news for Ranga Reddy District & Crops ===")
    client = TestClient(app)
    res = client.get("/api/news?district=Ranga+Reddy&state=Telangana&crops=Tomato,Paddy,Cotton,Chilli&lat=17.25&lon=78.4&force_refresh=true")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "sections" in data
    assert "farmer_context" in data
    print(f"Total articles returned: {len(data['articles'])}")

    fc = data["farmer_context"]
    print(f"Farmer context breakdown: District: {fc.get('district_count')}, State: {fc.get('state_count')}, Crops: {fc.get('crop_count')}, Mandi: {fc.get('mandi_count')}, National: {fc.get('national_count')}")
    assert len(data["articles"]) > 0
    assert fc.get("district_count", 0) > 0, "Ranga Reddy must not show 0 articles!"

    # Verify first article priority is Tier 1
    first_art = data['articles'][0]
    print(f"Top priority article: '{first_art['title']}' (Tier {first_art['priority_tier']}, Score {first_art['relevance_score']})")
    assert first_art['priority_tier'] == 1

    print("\nALL AGRI MARKET NEWS TESTS PASSED SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    test_relevance_and_noise_filtering()
    test_image_validation_and_semantic_matching()
    test_priority_tier_scoring()
    test_live_news_api_endpoint()
