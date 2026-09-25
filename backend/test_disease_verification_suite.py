import urllib.request
import urllib.parse
import json
import os

BASE_URL_BACKEND = "http://127.0.0.1:8000"
BASE_URL_FRONTEND = "http://localhost:5173"

def send_multipart_request(url, fields, files):
    path = url.replace(BASE_URL_BACKEND, "")
    files_dict = {}
    for key, (filename, content, content_type) in files.items():
        files_dict[key] = (filename, content, content_type)
    response = client.post(path, data=fields, files=files_dict)
    return response.status_code, response.json()


from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("1. TESTING HEALTH ENDPOINT")
    print("=" * 60)
    
    # 1. Test Backend Health
    res = client.get("/api/health")
    health_data = res.json()
    print("Backend GET /api/health Response:")
    print(json.dumps(health_data, indent=2))
    assert health_data.get("status") in ["ok", "healthy"]
    assert health_data.get("leaf_model_loaded") is True
    assert health_data.get("disease_model_loaded") is True
    print("[PASS] Backend Health Check PASSED")

    print("\n" + "=" * 60)
    print("2. TESTING DISEASE API WITH PEN IMAGE (EXPECT REJECT)")
    print("=" * 60)
    pen_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "leaf_validation", "non_leaf", "non_leaf_pen_0000.png"))
    with open(pen_path, "rb") as f:
        pen_bytes = f.read()
    
    status, res_pen = send_multipart_request(
        f"{BASE_URL_BACKEND}/api/disease/predict",
        {"crop": "Tomato", "affected_area": "Leaf"},
        {"image": ("pen.png", pen_bytes, "image/png")}
    )
    print("Pen Prediction Response:")
    print(json.dumps(res_pen, indent=2))
    assert res_pen.get("success") is False
    assert res_pen.get("is_plant_leaf") is False
    assert res_pen.get("stage") == "plant_validation"
    assert res_pen.get("reason") == "NON_PLANT"
    print("[PASS] Pen Test PASSED -> Correctly REJECTED as NON_PLANT")

    print("\n" + "=" * 60)
    print("3. TESTING DISEASE API WITH PHONE IMAGE (EXPECT REJECT)")
    print("=" * 60)
    phone_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "leaf_validation", "non_leaf", "non_leaf_mobile_phone_0005.png"))
    with open(phone_path, "rb") as f:
        phone_bytes = f.read()
    
    status, res_phone = send_multipart_request(
        f"{BASE_URL_BACKEND}/api/disease/predict",
        {"crop": "Tomato", "affected_area": "Leaf"},
        {"image": ("phone.png", phone_bytes, "image/png")}
    )
    print("Phone Prediction Response:")
    print(json.dumps(res_phone, indent=2))
    assert res_phone.get("success") is False
    assert res_phone.get("is_plant_leaf") is False
    assert res_phone.get("reason") == "NON_PLANT"
    print("[PASS] Phone Test PASSED -> Correctly REJECTED")

    print("\n" + "=" * 60)
    print("4. TESTING DISEASE API WITH SOIL IMAGE (EXPECT REJECT)")
    print("=" * 60)
    soil_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "leaf_validation", "non_leaf", "non_leaf_soil_0003.png"))
    with open(soil_path, "rb") as f:
        soil_bytes = f.read()
    
    status, res_soil = send_multipart_request(
        f"{BASE_URL_BACKEND}/api/disease/predict",
        {"crop": "Tomato", "affected_area": "Leaf"},
        {"image": ("soil.png", soil_bytes, "image/png")}
    )
    print("Soil Prediction Response:")
    print(json.dumps(res_soil, indent=2))
    assert res_soil.get("success") is False
    assert res_soil.get("is_plant_leaf") is False
    assert res_soil.get("reason") == "NON_PLANT"
    print("[PASS] Soil Test PASSED -> Correctly REJECTED")

    print("\n" + "=" * 60)
    print("5. TESTING DISEASE API WITH BLURRY IMAGE (EXPECT REJECT)")
    print("=" * 60)
    blur_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "leaf_validation", "non_leaf", "non_leaf_blur_0006.png"))
    with open(blur_path, "rb") as f:
        blur_bytes = f.read()
    
    status, res_blur = send_multipart_request(
        f"{BASE_URL_BACKEND}/api/disease/predict",
        {"crop": "Tomato", "affected_area": "Leaf"},
        {"image": ("blur.png", blur_bytes, "image/png")}
    )
    print("Blur Prediction Response:")
    print(json.dumps(res_blur, indent=2))
    assert res_blur.get("success") is False
    assert res_blur.get("is_plant_leaf") is False
    print("[PASS] Blur Test PASSED -> Correctly REJECTED")

    print("\n" + "=" * 60)
    print("6. TESTING DISEASE API WITH REAL TOMATO LEAF (EXPECT ACCEPT)")
    print("=" * 60)
    tomato_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "crop_disease", "Tomato", "Early_Blight", "Tomato_Early_Blight_0000.png"))
    with open(tomato_path, "rb") as f:
        tomato_bytes = f.read()
    
    status, res_tomato = send_multipart_request(
        f"{BASE_URL_BACKEND}/api/disease/predict",
        {"crop": "Tomato", "affected_area": "Leaf"},
        {"image": ("tomato_leaf.png", tomato_bytes, "image/png")}
    )
    print("Tomato Leaf Prediction Response:")
    print(json.dumps(res_tomato, indent=2))
    assert res_tomato.get("success") is True
    assert res_tomato.get("is_plant_leaf") is True
    assert res_tomato.get("crop") == "Tomato"
    assert "disease" in res_tomato
    assert "confidence" in res_tomato
    assert "symptoms" in res_tomato
    assert "management" in res_tomato
    print("[PASS] Tomato Leaf Test PASSED -> ACCEPTED with full ML Health Report")

    print("\n" + "=" * 60)
    print("ALL 6 TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
