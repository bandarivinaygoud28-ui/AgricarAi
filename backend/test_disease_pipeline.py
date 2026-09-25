import os
import sys
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "training")))
from prepare_dataset import generate_non_plant_image, draw_leaf_base, add_disease_symptoms
from inference import pipeline

def run_tests():
    print("=" * 70)
    print("AGRICARE DISEASE DETECTION & VALIDATION PIPELINE TEST SUITE (15 MATRIX CASES)")
    print("=" * 70)

    # 1. PEN -> Expected: REJECT
    img_pen = generate_non_plant_image("pen_desk")
    res_pen = pipeline.predict(img_pen, crop_hint="Tomato")
    print("\n--- TEST 1: PEN IMAGE ---")
    print(f"Success: {res_pen.get('success')} | Is Plant Leaf: {res_pen.get('is_plant_leaf')} | Error: {res_pen.get('error_type')}")
    print(f"Reason: {res_pen.get('reason')} | Title: {res_pen.get('title')} | Message: {res_pen.get('message')}")
    assert res_pen.get("success") is False
    assert res_pen.get("is_plant_leaf") is False
    assert res_pen.get("error_type") == "NON_LEAF_DETECTED"
    assert "disease" not in res_pen

    # 2. MOBILE PHONE -> Expected: REJECT
    img_phone = generate_non_plant_image("mobile_phone")
    res_phone = pipeline.predict(img_phone, crop_hint="Tomato")
    print("\n--- TEST 2: MOBILE PHONE ---")
    print(f"Success: {res_phone.get('success')} | Error: {res_phone.get('error_type')}")
    assert res_phone.get("success") is False
    assert res_phone.get("is_plant_leaf") is False

    # 3. LAPTOP -> Expected: REJECT
    img_laptop = generate_non_plant_image("laptop_keyboard")
    res_laptop = pipeline.predict(img_laptop, crop_hint="Tomato")
    print("\n--- TEST 3: LAPTOP ---")
    print(f"Success: {res_laptop.get('success')} | Error: {res_laptop.get('error_type')}")
    assert res_laptop.get("success") is False
    assert res_laptop.get("is_plant_leaf") is False

    # 4. HUMAN FACE -> Expected: REJECT
    img_face = generate_non_plant_image("human_face")
    res_face = pipeline.predict(img_face, crop_hint="Tomato")
    print("\n--- TEST 4: HUMAN FACE ---")
    print(f"Success: {res_face.get('success')} | Error: {res_face.get('error_type')}")
    assert res_face.get("success") is False
    assert res_face.get("is_plant_leaf") is False

    # 5. BOTTLE -> Expected: REJECT
    img_bottle = generate_non_plant_image("bottle_glass")
    res_bottle = pipeline.predict(img_bottle, crop_hint="Tomato")
    print("\n--- TEST 5: BOTTLE ---")
    print(f"Success: {res_bottle.get('success')} | Error: {res_bottle.get('error_type')}")
    assert res_bottle.get("success") is False
    assert res_bottle.get("is_plant_leaf") is False

    # 6. BOOK -> Expected: REJECT
    img_book = generate_non_plant_image("book_notebook")
    res_book = pipeline.predict(img_book, crop_hint="Tomato")
    print("\n--- TEST 6: BOOK ---")
    print(f"Success: {res_book.get('success')} | Error: {res_book.get('error_type')}")
    assert res_book.get("success") is False
    assert res_book.get("is_plant_leaf") is False

    # 7. SOIL ONLY -> Expected: REJECT
    img_soil = generate_non_plant_image("soil_earth")
    res_soil = pipeline.predict(img_soil, crop_hint="Tomato")
    print("\n--- TEST 7: SOIL ONLY ---")
    print(f"Success: {res_soil.get('success')} | Error: {res_soil.get('error_type')}")
    assert res_soil.get("success") is False
    assert res_soil.get("is_plant_leaf") is False

    # 8. RANDOM OBJECT -> Expected: REJECT
    img_rand = generate_non_plant_image("chair_table")
    res_rand = pipeline.predict(img_rand, crop_hint="Tomato")
    print("\n--- TEST 8: RANDOM OBJECT ---")
    print(f"Success: {res_rand.get('success')} | Error: {res_rand.get('error_type')}")
    assert res_rand.get("success") is False
    assert res_rand.get("is_plant_leaf") is False

    # 9. TOMATO LEAF -> Expected: ACCEPT
    img_tomato = Image.new("RGB", (224, 224), (255, 255, 255))
    img_tomato, bbox = draw_leaf_base(img_tomato, leaf_type="broad", base_color=(40, 135, 45))
    img_tomato = add_disease_symptoms(img_tomato, "Early_Blight", bbox)
    res_tomato = pipeline.predict(img_tomato, crop_hint="Tomato")
    print("\n--- TEST 9: TOMATO EARLY BLIGHT LEAF ---")
    print(f"Success: {res_tomato.get('success')} | Plant Conf: {res_tomato.get('plant_confidence')} | Crop: {res_tomato.get('crop')} | Disease: {res_tomato.get('disease')} | Conf: {res_tomato.get('disease_confidence')}")
    assert res_tomato.get("success") is True
    assert res_tomato.get("is_plant_leaf") is True
    assert res_tomato.get("crop") == "Tomato"
    assert "Early Blight" in res_tomato.get("disease")

    # 10. PADDY LEAF -> Expected: ACCEPT
    img_paddy = Image.new("RGB", (224, 224), (255, 255, 255))
    img_paddy, bbox_p = draw_leaf_base(img_paddy, leaf_type="grass", base_color=(60, 150, 50))
    img_paddy = add_disease_symptoms(img_paddy, "Rice_Blast", bbox_p)
    res_paddy = pipeline.predict(img_paddy, crop_hint="Paddy")
    print("\n--- TEST 10: PADDY RICE BLAST LEAF ---")
    print(f"Success: {res_paddy.get('success')} | Plant Conf: {res_paddy.get('plant_confidence')} | Crop: {res_paddy.get('crop')} | Disease: {res_paddy.get('disease')}")
    assert res_paddy.get("success") is True
    assert res_paddy.get("crop") == "Paddy"

    # 11. COTTON LEAF -> Expected: ACCEPT
    img_cotton = Image.new("RGB", (224, 224), (255, 255, 255))
    img_cotton, bbox_c = draw_leaf_base(img_cotton, leaf_type="lobed", base_color=(35, 115, 40))
    img_cotton = add_disease_symptoms(img_cotton, "Cotton_Leaf_Curl", bbox_c)
    res_cotton = pipeline.predict(img_cotton, crop_hint="Cotton")
    print("\n--- TEST 11: COTTON LEAF CURL ---")
    print(f"Success: {res_cotton.get('success')} | Plant Conf: {res_cotton.get('plant_confidence')} | Crop: {res_cotton.get('crop')} | Disease: {res_cotton.get('disease')}")
    assert res_cotton.get("success") is True
    assert res_cotton.get("crop") == "Cotton"

    # 12. CHILLI LEAF -> Expected: ACCEPT
    img_chilli = Image.new("RGB", (224, 224), (255, 255, 255))
    img_chilli, bbox_ch = draw_leaf_base(img_chilli, leaf_type="chilli", base_color=(45, 140, 48))
    img_chilli = add_disease_symptoms(img_chilli, "Healthy", bbox_ch)
    res_chilli = pipeline.predict(img_chilli, crop_hint="Chilli")
    print("\n--- TEST 12: CHILLI HEALTHY LEAF ---")
    print(f"Success: {res_chilli.get('success')} | Plant Conf: {res_chilli.get('plant_confidence')} | Crop: {res_chilli.get('crop')} | Disease: {res_chilli.get('disease')}")
    assert res_chilli.get("success") is True
    assert res_chilli.get("crop") == "Chilli"

    # 13. BLURRY LEAF -> Expected: REJECT (Quality Check)
    img_blur = img_tomato.filter(ImageFilter.GaussianBlur(radius=15))
    res_blur = pipeline.predict(img_blur, crop_hint="Tomato")
    print("\n--- TEST 13: BLURRY LEAF ---")
    print(f"Success: {res_blur.get('success')} | Stage: {res_blur.get('stage')} | Error: {res_blur.get('error_type')}")
    assert res_blur.get("success") is False
    assert res_blur.get("error_type") == "INSUFFICIENT_QUALITY"

    # 14. LOW-CONFIDENCE / BLANK PLANT IMAGE -> Expected: REJECT
    img_blank = Image.new("RGB", (224, 224), (200, 200, 200))
    res_blank = pipeline.predict(img_blank, crop_hint="Tomato")
    print("\n--- TEST 14: BLANK / LOW-CONFIDENCE IMAGE ---")
    print(f"Success: {res_blank.get('success')} | Error: {res_blank.get('error_type')}")
    assert res_blank.get("success") is False

    # 15. TOMATO SELECTED + PADDY LEAF UPLOADED -> Expected: CROP MISMATCH
    img_paddy_raw = Image.new("RGB", (224, 224), (255, 255, 255))
    img_paddy_raw, bbox_pr = draw_leaf_base(img_paddy_raw, leaf_type="grass", base_color=(60, 150, 50))
    res_mismatch = pipeline.predict(img_paddy_raw, crop_hint="Tomato")
    print("\n--- TEST 15: TOMATO SELECTED + PADDY LEAF UPLOADED ---")
    print(f"Success: {res_mismatch.get('success')} | Error Type: {res_mismatch.get('error_type')} | Selected: {res_mismatch.get('selected_crop')} | Detected: {res_mismatch.get('detected_crop')}")
    assert res_mismatch.get("success") is False
    assert res_mismatch.get("error_type") == "CROP_MISMATCH"
    assert res_mismatch.get("selected_crop") == "Tomato"
    assert res_mismatch.get("detected_crop") == "Paddy"

    print("\n" + "=" * 70)
    print("ALL 15 TEST CASES PASSED WITH 100% MATHEMATICAL PRECISION!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
