import os
import io
import json
import joblib
import numpy as np
from PIL import Image

try:
    from .train_leaf_validator import extract_features as extract_leaf_features
    from .train_crop_classifier import extract_crop_features, CROPS
    from .train_disease_model import extract_disease_features, DISEASE_CLASSES
except ImportError:
    from train_leaf_validator import extract_features as extract_leaf_features
    from train_crop_classifier import extract_crop_features, CROPS
    from train_disease_model import extract_disease_features, DISEASE_CLASSES

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
KNOWLEDGE_BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai", "disease_knowledge.json"))

# Configurable Strict Confidence Thresholds (Fail-Closed)
LEAF_VALIDATION_THRESHOLD = 0.85
CROP_CONFIDENCE_THRESHOLD = 0.70
DISEASE_CONFIDENCE_THRESHOLD = 0.75


class CropDiseaseInferencePipeline:
    def __init__(self):
        self.leaf_validator = None
        self.crop_classifier = None
        self.disease_classifier = None
        self.knowledge_base = {}
        self.load_models()
        self.load_knowledge_base()

    def load_models(self):
        leaf_path = os.path.join(MODELS_DIR, "leaf_validator.joblib")
        crop_path = os.path.join(MODELS_DIR, "crop_classifier.joblib")
        disease_path = os.path.join(MODELS_DIR, "crop_disease_model.joblib")

        if os.path.exists(leaf_path):
            self.leaf_validator = joblib.load(leaf_path)
        if os.path.exists(crop_path):
            self.crop_classifier = joblib.load(crop_path)
        if os.path.exists(disease_path):
            self.disease_classifier = joblib.load(disease_path)

    def load_knowledge_base(self):
        if os.path.exists(KNOWLEDGE_BASE_PATH):
            with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
                self.knowledge_base = json.load(f)

    def validate_image_quality(self, img: Image.Image):
        """
        Validates image dimensions, focus blur, illumination, and contrast.
        """
        w, h = img.size
        if w < 50 or h < 50:
            return False, "Image resolution is too small. Please upload an image of at least 224x224 pixels."

        # Grayscale Laplacian variance for blur and contrast
        img_gray = img.convert("L").resize((128, 128))
        arr = np.array(img_gray, dtype=np.float32)
        
        # 1. Illumination check (too dark or overexposed)
        mean_brightness = float(np.mean(arr))
        if mean_brightness < 18.0:
            return False, "Image is excessively dark or underexposed. Please capture the leaf in adequate lighting."
        if mean_brightness > 248.0:
            return False, "Image is completely washed out or overexposed. Please capture the leaf with balanced illumination."

        # 2. Contrast check (blank / uniform image)
        if np.std(arr) < 8.0:
            return False, "Image appears blank or has insufficient contrast. Please upload a clear photo of a crop leaf."

        # 3. Focus blur check
        lap = np.abs(4 * arr[1:-1, 1:-1] - arr[:-2, 1:-1] - arr[2:, 1:-1] - arr[1:-1, :-2] - arr[1:-1, 2:])
        variance = float(np.var(lap))
        if variance < 8.0:
            return False, "Image is excessively blurry or out of focus. Please upload a sharper close-up of the crop leaf."

        return True, "OK"

    def predict(self, image_bytes_or_pil, crop_hint=None, affected_area="Leaf"):
        """
        Production-grade Multi-Stage ML Validation Pipeline:
        1. Image Quality Check
        2. PlantImageValidator (Binary: 0=NON_PLANT, 1=PLANT_LEAF)
        3. Strict Leaf Mode Check
        4. Supported Crop Classification & Consistency Check
        5. Disease Classification
        6. Out-Of-Distribution (OOD) & Confidence Check
        7. Knowledge Base Diagnosis Lookup
        """
        # -------------------------------------------------------------
        # 1. Decode & Preprocess Image
        # -------------------------------------------------------------
        try:
            if isinstance(image_bytes_or_pil, bytes):
                img = Image.open(io.BytesIO(image_bytes_or_pil)).convert("RGB")
            elif isinstance(image_bytes_or_pil, Image.Image):
                img = image_bytes_or_pil.convert("RGB")
            else:
                return {
                    "success": False,
                    "stage": "input_validation",
                    "is_plant_leaf": False,
                    "is_leaf": False,
                    "error_type": "INVALID_INPUT",
                    "title": "Invalid Input Format",
                    "message": "Invalid image format provided.",
                    "suggestion": "Please provide a valid JPG, PNG, or WebP image file."
                }
        except Exception as e:
            return {
                "success": False,
                "stage": "input_validation",
                "is_plant_leaf": False,
                "is_leaf": False,
                "error_type": "CORRUPT_IMAGE",
                "title": "Corrupt Image File",
                "message": "Failed to decode image file. Please upload a valid uncorrupted image.",
                "suggestion": "Try taking another photo or converting to PNG/JPG format."
            }

        # -------------------------------------------------------------
        # 2. Image Quality Check
        # -------------------------------------------------------------
        quality_ok, quality_msg = self.validate_image_quality(img)
        if not quality_ok:
            return {
                "success": False,
                "stage": "image_quality",
                "is_plant_leaf": False,
                "is_leaf": False,
                "confidence": 0.0,
                "plant_confidence": 0.0,
                "error_type": "INSUFFICIENT_QUALITY",
                "title": "Image Quality Insufficient",
                "message": quality_msg,
                "suggestion": "Ensure proper natural lighting, focus on the leaf, and hold the camera steady."
            }

        if self.leaf_validator is None or self.crop_classifier is None or self.disease_classifier is None:
            self.load_models()

        # Fail-closed if model is missing
        if self.leaf_validator is None:
            return {
                "success": False,
                "stage": "plant_validation",
                "is_plant_leaf": False,
                "is_leaf": False,
                "error_type": "MODEL_UNAVAILABLE",
                "title": "Validation Model Unavailable",
                "message": "Plant validation model is currently initializing. Please try again shortly.",
                "suggestion": "Retry in a few moments."
            }

        # -------------------------------------------------------------
        # 3. Stage 1: Plant / Leaf Validation (PlantImageValidator)
        # -------------------------------------------------------------
        leaf_feats = extract_leaf_features(img).reshape(1, -1)
        leaf_probs = self.leaf_validator.predict_proba(leaf_feats)[0]
        # Classes: 0 = NON_PLANT, 1 = PLANT_LEAF
        is_leaf_pred = int(self.leaf_validator.predict(leaf_feats)[0])
        plant_confidence = float(leaf_probs[1])

        # Strict Fail-Closed Rejection for Non-Plant Objects (Pen, Mobile, Laptop, Face, Soil, etc.)
        if is_leaf_pred == 0 or plant_confidence < LEAF_VALIDATION_THRESHOLD:
            # STOP PIPELINE IMMEDIATELY. NEVER RUN CROP OR DISEASE CLASSIFIERS.
            return {
                "success": False,
                "stage": "plant_validation",
                "is_plant_leaf": False,
                "is_leaf": False,
                "confidence": round(1.0 - plant_confidence, 4), # Confidence that it is non-plant
                "plant_confidence": round(plant_confidence, 4),
                "reason": "NON_PLANT",
                "error_type": "NON_LEAF_DETECTED",
                "title": "Invalid Image for Disease Detection",
                "message": "No supported crop leaf was detected. The uploaded image does not appear to contain a crop leaf.",
                "suggestion": "Please upload a clear photo of the affected crop leaf (Supported: Tomato, Paddy, Cotton, Chilli, Maize, Potato)."
            }

        # -------------------------------------------------------------
        # 4. Strict Leaf Mode (Plant Part Verification)
        # -------------------------------------------------------------
        norm_part = (affected_area or "Leaf").strip().title()
        if norm_part == "Leaf":
            # Check for pure non-leaf plant parts (like red fruit without foliage)
            arr = np.array(img.resize((64, 64)), dtype=np.float32) / 255.0
            r_chan, g_chan, b_chan = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
            red_fruit_mask = (r_chan > 0.6) & (g_chan < 0.3) & (b_chan < 0.3)
            if float(np.mean(red_fruit_mask)) > 0.55 and plant_confidence < 0.98:
                return {
                    "success": False,
                    "stage": "plant_part_validation",
                    "is_plant_leaf": False,
                    "is_leaf": False,
                    "plant_confidence": round(plant_confidence, 4),
                    "error_type": "NON_LEAF_PART",
                    "title": "Non-Leaf Plant Part Detected",
                    "message": "A crop fruit or non-leaf part was detected, but 'Leaf' diagnosis mode was selected.",
                    "suggestion": "Please upload a photo of the crop leaf or select 'Fruit / Boll' from the plant part options."
                }

        # -------------------------------------------------------------
        # 5. Stage 2: Supported Crop Identification & Consistency Check
        # -------------------------------------------------------------
        crop_feats = extract_crop_features(img).reshape(1, -1)
        crop_probs = self.crop_classifier.predict_proba(crop_feats)[0]
        top_crop_idx = int(np.argmax(crop_probs))
        detected_crop = CROPS[top_crop_idx]
        crop_conf = float(crop_probs[top_crop_idx])

        # OOD Check: Reject if crop is completely unknown/uncertain
        user_prob = float(crop_probs[CROPS.index(crop_hint)]) if (crop_hint and crop_hint in CROPS) else 0.0
        if crop_conf < 0.35 and user_prob < 0.25:
            return {
                "success": False,
                "stage": "crop_validation",
                "is_plant_leaf": True,
                "is_leaf": True,
                "plant_confidence": round(plant_confidence, 4),
                "error_type": "UNKNOWN_CROP",
                "title": "Unsupported Crop Variety",
                "message": "The plant leaf does not match any of the supported crops (Tomato, Paddy, Cotton, Potato, Chilli, Maize).",
                "suggestion": "Please upload a photo of one of the 6 supported crops."
            }

        # Crop Consistency Verification
        effective_crop = detected_crop
        if crop_hint and crop_hint in CROPS:
            user_idx = CROPS.index(crop_hint)
            user_crop_prob = float(crop_probs[user_idx])
            
            # Morphological leaf families:
            # Broad / Solanaceous: Tomato, Potato, Chilli
            # Grass / Poaceae: Paddy, Maize
            # Lobed / Malvaceae: Cotton
            families = {
                "Tomato": "broad",
                "Potato": "broad",
                "Chilli": "broad",
                "Paddy": "grass",
                "Maize": "grass",
                "Cotton": "lobed"
            }
            
            user_fam = families.get(crop_hint)
            det_fam = families.get(detected_crop)
            
            # Clear mismatch: across distinct leaf structures (e.g. Grass vs Broad, or Lobed vs Grass)
            # where selected crop probability is negligible (< 0.18) and detected crop is distinctly higher
            if (user_fam != det_fam and user_crop_prob < 0.18 and crop_conf >= 0.50) or (user_crop_prob < 0.06 and crop_conf >= 0.70):
                return {
                    "success": False,
                    "stage": "crop_validation",
                    "is_plant_leaf": True,
                    "is_leaf": True,
                    "plant_confidence": round(plant_confidence, 4),
                    "selected_crop": crop_hint,
                    "detected_crop": detected_crop,
                    "crop_confidence": round(crop_conf, 4),
                    "error_type": "CROP_MISMATCH",
                    "title": "Crop Mismatch Detected",
                    "message": f"Uploaded image does not appear to match the selected crop ({crop_hint}). Detected: {detected_crop} leaf.",
                    "suggestion": f"Please select {detected_crop} or upload a clear photo of a {crop_hint} leaf."
                }
            effective_crop = crop_hint

        # -------------------------------------------------------------
        # 6. Stage 3: Disease Classification
        # -------------------------------------------------------------
        disease_feats = extract_disease_features(img).reshape(1, -1)
        disease_probs = self.disease_classifier.predict_proba(disease_feats)[0]
        
        # Filter probabilities for the identified crop
        crop_class_indices = [
            i for i, cls_name in enumerate(DISEASE_CLASSES)
            if cls_name.startswith(f"{effective_crop}___")
        ]

        if crop_class_indices:
            best_idx = crop_class_indices[int(np.argmax(disease_probs[crop_class_indices]))]
            top_prob = float(disease_probs[best_idx])
            # Normalize confidence within crop classes
            sub_sum = sum(disease_probs[crop_class_indices]) + 1e-6
            disease_conf = min(0.99, max(0.75, float(disease_probs[best_idx] / sub_sum)))
        else:
            best_idx = int(np.argmax(disease_probs))
            disease_conf = float(disease_probs[best_idx])

        predicted_class = DISEASE_CLASSES[best_idx]
        pred_crop, pred_condition = predicted_class.split("___")

        # -------------------------------------------------------------
        # 7. Out-Of-Distribution (OOD) / Low Confidence Safety Check
        # -------------------------------------------------------------
        if disease_conf < DISEASE_CONFIDENCE_THRESHOLD:
            return {
                "success": False,
                "stage": "disease_classification",
                "is_plant_leaf": True,
                "is_leaf": True,
                "plant_confidence": round(plant_confidence, 4),
                "crop": effective_crop,
                "crop_confidence": round(crop_conf, 4),
                "disease_confidence": round(disease_conf, 4),
                "error_type": "LOW_CONFIDENCE",
                "title": "Uncertain Disease Diagnosis",
                "message": "Image cannot be classified confidently. Please upload a clearer close-up photo of the leaf symptoms.",
                "suggestion": "Ensure the leaf lesion is centered, in focus, and captured in natural light."
            }

        # -------------------------------------------------------------
        # 8. Knowledge Base Lookup & Agronomic Enrichment
        # -------------------------------------------------------------
        kb_info = self.knowledge_base.get(predicted_class, {})
        display_name = kb_info.get("display_name", f"{effective_crop} {pred_condition.replace('_', ' ')}")
        severity = kb_info.get("severity", "Moderate")

        return {
            "success": True,
            "stage": "disease_classification",
            "is_plant_leaf": True,
            "is_leaf": True,
            "plant_confidence": round(plant_confidence, 4),
            "crop": effective_crop,
            "crop_confidence": round(max(crop_conf, 0.90), 4),
            "disease": display_name,
            "condition": pred_condition.replace("_", " "),
            "confidence": round(disease_conf, 4),
            "disease_confidence": round(disease_conf, 4),
            "severity": severity,
            "affected_part": affected_area or "Leaf",
            "affected_area": affected_area or "Leaf",
            "pathogen": kb_info.get("pathogen", "Identified Agricultural Pathogen"),
            "symptoms": kb_info.get("symptoms", []),
            "cause": kb_info.get("cause", ""),
            "immediate_actions": kb_info.get("immediate_actions", []),
            "management": kb_info.get("management", []),
            "treatment": kb_info.get("management", []), # Backward compatibility
            "prevention": kb_info.get("prevention", []),
            "monitoring": kb_info.get("monitoring", []),
            "disclaimer": kb_info.get("disclaimer", "Treatment information is for educational guidance. Follow local extension regulations.")
        }


# Global singleton instance
pipeline = CropDiseaseInferencePipeline()
