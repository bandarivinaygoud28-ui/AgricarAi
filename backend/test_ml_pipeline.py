import os
import sys
import json
from PIL import Image

sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(0, os.path.abspath('ai'))
sys.path.insert(0, os.path.abspath('training'))

from ai.inference import predict_crop_disease, get_model_info, pipeline
from prepare_dataset import generate_non_plant_image

def run_ml_pipeline_tests():
    print("=" * 60)
    print("AGRICARE DISEASE DETECTION ML PIPELINE VALIDATION")
    print("=" * 60)

    # 1. Model Artifact Verification
    print("\n[STEP 1] Checking Model Loading:")
    assert pipeline.leaf_validator is not None, "Leaf validator model failed to load"
    assert pipeline.crop_classifier is not None, "Crop classifier model failed to load"
    assert pipeline.disease_classifier is not None, "Disease classifier model failed to load"
    print(f"  [OK] Leaf Validator:     {type(pipeline.leaf_validator).__name__} (LOADED)")
    print(f"  [OK] Crop Classifier:    {type(pipeline.crop_classifier).__name__} (LOADED)")
    print(f"  [OK] Disease Classifier: {type(pipeline.disease_classifier).__name__} (LOADED)")
    print(f"  [OK] Knowledge Base:     {len(pipeline.knowledge_base)} disease profiles (LOADED)")

    # 2. Real Leaf Disease Prediction Test
    print("\n[STEP 2] Testing Real Crop Leaf Disease Prediction:")
    eb_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset", "disease", "Tomato", "Early_Blight", "Tomato_Early_Blight_0000.png"))
    assert os.path.exists(eb_path), f"Dataset image not found at {eb_path}"

    with open(eb_path, "rb") as f:
        img_bytes = f.read()

    res_leaf = predict_crop_disease(image_bytes=img_bytes, crop_hint="Tomato", affected_area="Leaf")
    print("  Prediction Response:")
    print(f"    - Success:            {res_leaf.get('success')}")
    print(f"    - Stage:              {res_leaf.get('stage')}")
    print(f"    - Crop:               {res_leaf.get('crop')} (Confidence: {res_leaf.get('crop_confidence')})")
    print(f"    - Disease:            {res_leaf.get('disease')} (Confidence: {res_leaf.get('confidence')})")
    print(f"    - Severity:           {res_leaf.get('severity')}")
    print(f"    - Pathogen:           {res_leaf.get('pathogen')}")
    print(f"    - Immediate Actions:  {len(res_leaf.get('immediate_actions', []))} recommendations")
    print(f"    - Treatment:          {len(res_leaf.get('treatment', []))} recommendations")

    assert res_leaf.get("success") is True, "Leaf prediction failed"
    assert res_leaf.get("is_plant_leaf") is True, "Leaf validation failed"
    assert res_leaf.get("crop") == "Tomato", "Crop classification failed"
    assert "Early Blight" in res_leaf.get("disease", ""), "Disease classification mismatch"
    assert res_leaf.get("confidence", 0) > 0.75, "Confidence threshold not met"

    # 3. Non-Plant Rejection (Fail-Closed) Tests
    print("\n[STEP 3] Testing Non-Plant / Invalid Object Rejection:")
    non_plant_types = ["pen_desk", "mobile_phone", "laptop_keyboard", "human_face", "soil_only", "bottle_glass"]
    for obj in non_plant_types:
        img = generate_non_plant_image(obj)
        res_non_plant = pipeline.predict(img, crop_hint="Tomato")
        print(f"  [OK] Object [{obj:16}]: Success={res_non_plant.get('success')} | Is Leaf={res_non_plant.get('is_plant_leaf')} | Error={res_non_plant.get('error_type')}")
        assert res_non_plant.get("success") is False, f"Failed to reject {obj}"
        assert res_non_plant.get("is_plant_leaf") is False, f"Non-plant marked as leaf: {obj}"
        assert res_non_plant.get("error_type") == "NON_LEAF_DETECTED"

    print("\n" + "=" * 60)
    print("ALL PIPELINE VALIDATION TESTS COMPLETED SUCCESSFULLY (100% PASS)")
    print("=" * 60)

if __name__ == "__main__":
    run_ml_pipeline_tests()
