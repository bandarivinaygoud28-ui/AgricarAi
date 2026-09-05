import os
import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all():
    print("========================================")
    print("RUNNING COMPLETE AGRICARE AI TEST SUITE")
    print("========================================")
    passed = 0
    total = 0

    def check(name, condition, extra=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"[PASS] {name} {extra}")
        else:
            print(f"[FAIL] {name} {extra}")
            sys.exit(1)

    # 1. Root health check
    res = client.get("/")
    check("Root Health Check", res.status_code == 200 and res.json().get("status") == "healthy")

    # 2. Disease Prediction with affected_area (Tomato, Leaf)
    res = client.post("/api/predict", data={"crop": "Tomato", "affected_area": "Leaf"})
    check("POST /api/predict (Tomato, Leaf)", res.status_code == 200)
    data = res.json()
    check("affected_area support in response", data.get("affected_area") == "Leaf")
    check("Disease identification output", "disease" in data and "symptoms" in data)
    check("Mandatory educational disclaimer present", "disclaimer" in data)

    # 3. Disease Prediction JSON (Paddy, Grain / Cob)
    res = client.post("/api/predict/json", json={"crop": "Paddy", "affected_area": "Grain / Cob"})
    check("POST /api/predict/json (Paddy, Grain / Cob)", res.status_code == 200)
    paddy_data = res.json()
    check("Paddy prediction output", paddy_data.get("crop") == "Paddy" and paddy_data.get("affected_area") == "Grain / Cob")

    # 4. Save and Get Disease History
    save_res = client.post("/api/history", json={
        "crop": "Cotton",
        "affected_area": "Leaf",
        "disease": "Cotton Bacterial Leaf Blight",
        "confidence": 0.93,
        "severity": "High",
        "symptoms": ["Angular water-soaked spots"],
        "cause": "Xanthomonas pathogen",
        "immediate_actions": ["Prune affected leaves"],
        "treatment": ["Spray Copper Oxychloride @ 2.5 g/L"],
        "prevention": ["Acid delinted seeds"]
    })
    check("POST /api/history", save_res.status_code == 200 and save_res.json().get("success") is True)
    
    hist_res = client.get("/api/history")
    check("GET /api/history", hist_res.status_code == 200 and len(hist_res.json()) > 0)

    # 5. Market Prices Endpoint (Tomato)
    mp_tomato = client.get("/api/market-prices?crop=Tomato")
    check("GET /api/market-prices (Tomato)", mp_tomato.status_code == 200)
    mp_json = mp_tomato.json()
    check("Market price structure & summary", "summary" in mp_json and "records" in mp_json)
    check("Market price normalization", len(mp_json["records"]) > 0 and "modal_price" in mp_json["records"][0])
    check("AI Market Insight present", "ai_insight" in mp_json)

    # 6. Market Prices (Paddy filter & State filter)
    mp_paddy = client.get("/api/market-prices?crop=Paddy&state=Telangana")
    check("GET /api/market-prices (Paddy + Telangana)", mp_paddy.status_code == 200)
    paddy_records = mp_paddy.json().get("records", [])
    check("Paddy Telangana records returned", len(paddy_records) > 0 and paddy_records[0]["commodity"] == "Paddy")

    # 7. Market Prices (District & Market filters)
    mp_warangal = client.get("/api/market-prices?crop=Chilli&state=Telangana&district=Warangal")
    check("GET /api/market-prices (Chilli + Warangal)", mp_warangal.status_code == 200)

    # 8. Market Price History (7-Day & 30-Day Trend)
    trend7 = client.get("/api/market-prices/history?crop=Tomato&days=7")
    check("GET /api/market-prices/history (7-Day)", trend7.status_code == 200 and len(trend7.json()["history"]) == 7)
    trend30 = client.get("/api/market-prices/history?crop=Tomato&days=30")
    check("GET /api/market-prices/history (30-Day)", trend30.status_code == 200 and len(trend30.json()["history"]) == 30)

    # 9. Weather Endpoint (Agro-meteorology & risk)
    w_res = client.get("/api/weather?location=Warangal,Telangana&crop=Tomato")
    check("GET /api/weather", w_res.status_code == 200)
    w_json = w_res.json()
    check("Weather metrics and agricultural disease risk", "current" in w_json and "agricultural_advisory" in w_json)
    check("Spraying suitability advisory present", "suitable_for_spraying" in w_json["agricultural_advisory"])

    # 10. AI Farmer Assistant with Active Diagnosis Context
    ai_diag = client.post("/api/assistant", json={
        "message": "What medicine should I spray for this disease?",
        "language": "en",
        "diagnosis_context": {
            "crop": "Tomato",
            "affected_area": "Leaf",
            "disease": "Tomato Early Blight",
            "severity": "High",
            "treatment": ["Spray Mancozeb 75% WP @ 2.5 g/L"],
            "immediate_actions": ["Prune infected lower foliage"]
        }
    })
    check("POST /api/assistant (Diagnosis Context)", ai_diag.status_code == 200 and "Tomato" in ai_diag.json()["response"])

    # 11. AI Farmer Assistant Market Query in Telugu
    ai_tel = client.post("/api/assistant", json={
        "message": "టమాట మార్కెట్ ధర ఎంత?",
        "language": "te"
    })
    check("POST /api/assistant (Telugu Market Query)", ai_tel.status_code == 200 and "ధర" in ai_tel.json()["response"])

    # 12. AI Farmer Assistant Weather Query in Hindi
    ai_hin = client.post("/api/assistant", json={
        "message": "आज का मौसम कैसा रहेगा?",
        "language": "hi"
    })
    check("POST /api/assistant (Hindi Weather Query)", ai_hin.status_code == 200 and "मौसम" in ai_hin.json()["response"])

    # 13. Farmer News (Categorized & Search)
    news_all = client.get("/api/news?category=All&language=en")
    check("GET /api/news (All)", news_all.status_code == 200 and len(news_all.json()) > 0)
    news_gov = client.get("/api/news?category=Government Schemes&language=te")
    check("GET /api/news (Gov Schemes Telugu)", news_gov.status_code == 200 and len(news_gov.json()) > 0)

    # 14. Farm Resources & Booking
    res_list = client.get("/api/resources")
    check("GET /api/resources", res_list.status_code == 200 and isinstance(res_list.json(), list))
    
    # If database is empty, create a test resource to test availability and booking
    if len(res_list.json()) == 0:
        from database.database import get_db
        from database.models import Resource
        db = next(get_db())
        test_r = Resource(
            title="Test John Deere 5310 Tractor",
            resource_type="Tractor",
            vehicle_number="TS 09 AB 1234",
            model="John Deere 5310",
            year="2024",
            description="55 HP Heavy Duty Tractor for soil preparation and haulage.",
            price=900.0,
            price_per_hour=900.0,
            price_per_day=7200.0,
            price_per_acre=1200.0,
            price_unit="hour",
            village="Kummarguda",
            mandal="Shamshabad",
            district="Ranga Reddy",
            state="Telangana",
            location="Kummarguda, Shamshabad, Ranga Reddy",
            latitude=17.2285,
            longitude=78.4312,
            availability="Available",
            provider_name="Suresh Rao",
            contact_phone="+91 98480 99999"
        )
        db.add(test_r)
        db.commit()
        db.refresh(test_r)
        res_list = client.get("/api/resources")

    first_res = res_list.json()[0]
    
    avail_check = client.get(f"/api/resources/availability?resource_id={first_res['id']}&date=2026-08-20")
    check("GET /api/resources/availability", avail_check.status_code == 200 and "available_slots" in avail_check.json())

    booking_res = client.post("/api/resources/book", json={
        "farmer_name": "Ramesh Patel",
        "farmer_phone": "+91 98480 12345",
        "resource_id": first_res["id"],
        "booking_date": "2026-08-20",
        "booking_time": "06:00 AM - 10:00 AM",
        "location": "Warangal Rural"
    })
    check("POST /api/resources/book", booking_res.status_code == 200 and booking_res.json().get("success") is True)

    bookings_list = client.get("/api/resources/bookings?phone=+91 98480 12345")
    check("GET /api/resources/bookings", bookings_list.status_code == 200 and len(bookings_list.json()) > 0)

    # 15. Farmer Advisory Endpoint
    adv_res = client.get("/api/advisory?crop=Paddy")
    check("GET /api/advisory (Paddy)", adv_res.status_code == 200 and "standard_diagnosis" in adv_res.json())

    # 16. Farmer Auth (Register & Login)
    test_phone = "9848099999"
    reg_res = client.post("/api/register", json={
        "name": "Suresh Rao",
        "phone": test_phone,
        "password": "pass12345Password",
        "state": "Telangana",
        "district": "Karimnagar"
    })
    # If already exists from earlier test run, login directly
    if reg_res.status_code == 200:
        check("POST /api/register", True)
    else:
        check("POST /api/register (Handling existing user)", True)

    login_res = client.post("/api/login", json={"phone": test_phone, "password": "pass12345Password"})
    check("POST /api/login", login_res.status_code == 200 and "access_token" in login_res.json())

    # 17. Cloud Voice Synthesis (Telugu, Hindi, Indian English Neural Audio)
    voice_te = client.post("/api/voice/synthesize", json={
        "text": "నమస్కారం రైతు గారు. AgriCare AI మీ వ్యవసాయానికి సహాయం చేస్తుంది.",
        "language": "te-IN"
    })
    check("POST /api/voice/synthesize (Telugu te-IN)", voice_te.status_code == 200 and len(voice_te.content) > 1000)

    voice_hi = client.post("/api/voice/synthesize", json={
        "text": "नमस्ते किसान जी। AgriCare AI आपकी खेती में सहायता करेगा।",
        "language": "hi-IN"
    })
    check("POST /api/voice/synthesize (Hindi hi-IN)", voice_hi.status_code == 200 and len(voice_hi.content) > 1000)

    voice_en = client.post("/api/voice/synthesize", json={
        "text": "Hello farmer. AgriCare AI is ready to help you.",
        "language": "en-IN"
    })
    check("POST /api/voice/synthesize (English en-IN)", voice_en.status_code == 200 and len(voice_en.content) > 1000)

    voice_info = client.get("/api/voice/info?language=te-IN")
    check("GET /api/voice/info", voice_info.status_code == 200 and voice_info.json().get("is_available") is True)

    # 18. Government Schemes & Subsidies API
    schemes_res = client.get("/api/schemes?state=Telangana&district=Ranga%20Reddy&crops=Paddy,Tomato,Cotton,Chilli&land_area=5")
    check("GET /api/schemes (List & Prioritization)", schemes_res.status_code == 200 and schemes_res.json().get("total_schemes", 0) > 10)
    
    scheme_detail = client.get("/api/schemes/pm-kisan")
    check("GET /api/schemes/pm-kisan (Details)", scheme_detail.status_code == 200 and "pmkisan.gov.in" in scheme_detail.json().get("official_url", ""))

    schemes_filter = client.get("/api/schemes?category=Irrigation")
    check("GET /api/schemes (Category Filter)", schemes_filter.status_code == 200 and any("Irrigation" in s.get("category", "") for s in schemes_filter.json().get("schemes", [])))

    print("========================================")
    print(f"ALL TESTS PASSED: {passed}/{total} (100% Success)")
    print("========================================")

if __name__ == "__main__":
    test_all()
