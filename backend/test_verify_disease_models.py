import os
import sys
import json

sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(0, os.path.abspath('ai'))
sys.path.insert(0, os.path.abspath('training'))

from ai.inference import predict_crop_disease, get_model_info, pipeline

def main():
    print("=" * 60)
    print("1. VERIFY MODEL LOADING")
    print("=" * 60)
    print("Leaf Validator:", type(pipeline.leaf_validator))
    print("Crop Classifier:", type(pipeline.crop_classifier))
    print("Disease Classifier:", type(pipeline.disease_classifier))
    print("Knowledge Base entries:", len(pipeline.knowledge_base))

    print("\n" + "=" * 60)
    print("2. REAL TOMATO LEAF PREDICTIONS")
    print("=" * 60)

    eb_path = os.path.abspath(os.path.join("..", "dataset", "disease", "Tomato", "Early_Blight", "Tomato_Early_Blight_0000.png"))
    with open(eb_path, "rb") as f:
        eb_bytes = f.read()

    res_eb = predict_crop_disease(image_bytes=eb_bytes, crop_hint="Tomato", affected_area="Leaf")
    print("TOMATO EARLY BLIGHT:")
    print("  Success:", res_eb.get("success"))
    print("  Crop:", res_eb.get("crop"), "Confidence:", res_eb.get("crop_confidence"))
    print("  Disease:", res_eb.get("disease"), "Confidence:", res_eb.get("confidence"))
    print("  Pathogen:", res_eb.get("pathogen"))
    print("  Symptoms count:", len(res_eb.get("symptoms", [])))
    print("  Treatment count:", len(res_eb.get("treatment", [])))

    healthy_path = os.path.abspath(os.path.join("..", "dataset", "disease", "Tomato", "Healthy", "Tomato_Healthy_0000.png"))
    with open(healthy_path, "rb") as f:
        h_bytes = f.read()

    res_h = predict_crop_disease(image_bytes=h_bytes, crop_hint="Tomato", affected_area="Leaf")
    print("\nTOMATO HEALTHY:")
    print("  Success:", res_h.get("success"))
    print("  Crop:", res_h.get("crop"), "Confidence:", res_h.get("crop_confidence"))
    print("  Disease:", res_h.get("disease"), "Confidence:", res_h.get("confidence"))

    print("\n" + "=" * 60)
    print("3. MODEL INFO ENDPOINT")
    print("=" * 60)
    print(json.dumps(get_model_info(), indent=2))

if __name__ == "__main__":
    main()
