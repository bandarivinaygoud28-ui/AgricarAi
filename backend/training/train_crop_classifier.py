import os
import json
import joblib
import numpy as np
from PIL import Image, ImageEnhance
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
from sklearn.ensemble import HistGradientBoostingClassifier, ExtraTreesClassifier

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "crop_disease"))
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
os.makedirs(MODELS_DIR, exist_ok=True)

CROPS = ["Tomato", "Paddy", "Cotton", "Potato", "Chilli", "Maize"]


def extract_crop_features(image_path_or_img):
    if isinstance(image_path_or_img, str):
        img = Image.open(image_path_or_img).convert("RGB")
    else:
        img = image_path_or_img.convert("RGB")
        
    img_resized = img.resize((128, 128))
    arr = np.array(img_resized, dtype=np.float32) / 255.0
    
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    # Color metrics
    r_mean, r_std = np.mean(r), np.std(r)
    g_mean, g_std = np.mean(g), np.std(g)
    b_mean, b_std = np.mean(b), np.std(b)
    
    exg = 2.0 * g - r - b
    exg_mean, exg_std = np.mean(exg), np.std(exg)
    
    # Morphological leaf shape aspect ratio (horizontal vs vertical projection profiles)
    leaf_mask = (g > r) & (g > b)
    if np.sum(leaf_mask) > 10:
        y_indices, x_indices = np.where(leaf_mask)
        width_span = np.max(x_indices) - np.min(x_indices) + 1
        height_span = np.max(y_indices) - np.min(y_indices) + 1
        aspect_ratio = float(height_span) / float(width_span + 1e-5)
    else:
        aspect_ratio = 1.0
        
    # Vertical and horizontal projection signatures (8 bins each)
    v_proj = np.mean(exg, axis=1) # 128
    h_proj = np.mean(exg, axis=0) # 128
    v_bins = [np.mean(v_proj[i*16:(i+1)*16]) for i in range(8)]
    h_bins = [np.mean(h_proj[i*16:(i+1)*16]) for i in range(8)]
    
    # Venation / edge directionality (horizontal vs vertical gradients)
    dx = np.mean(np.abs(arr[:, 1:, :] - arr[:, :-1, :]))
    dy = np.mean(np.abs(arr[1:, :, :] - arr[:-1, :, :]))
    grad_ratio = dy / (dx + 1e-6)
    
    # 8-bin color histograms
    r_hist, _ = np.histogram(r, bins=8, range=(0.0, 1.0), density=True)
    g_hist, _ = np.histogram(g, bins=8, range=(0.0, 1.0), density=True)
    b_hist, _ = np.histogram(b, bins=8, range=(0.0, 1.0), density=True)

    features = [
        r_mean, r_std, g_mean, g_std, b_mean, b_std,
        exg_mean, exg_std,
        aspect_ratio,
        dx, dy, grad_ratio
    ]
    features.extend(v_bins)
    features.extend(h_bins)
    features.extend(r_hist.tolist())
    features.extend(g_hist.tolist())
    features.extend(b_hist.tolist())
    
    return np.array(features, dtype=np.float32)


def train_crop_classifier():
    print("=" * 60)
    print("TRAINING CROP CLASSIFIER (Stage 2 Crop Identification)")
    print("=" * 60)
    
    X = []
    y = []
    
    for label_idx, crop in enumerate(CROPS):
        crop_path = os.path.join(DATASET_DIR, crop)
        if not os.path.exists(crop_path):
            continue
        print(f"Loading samples for crop: {crop}...")
        for root, _, files in os.walk(crop_path):
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    p = os.path.join(root, f)
                    img = Image.open(p).convert("RGB")
                    # Original + flips/rotations
                    for aug in [img, img.transpose(Image.FLIP_LEFT_RIGHT), img.transpose(Image.ROTATE_90)]:
                        X.append(extract_crop_features(aug))
                        y.append(label_idx)
                        
    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.int32)
    
    print(f"Total crop dataset samples: {X.shape[0]} | Classes: {len(CROPS)}")
    
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.1765, random_state=42, stratify=y_train_val
    )
    
    clf = ExtraTreesClassifier(
        n_estimators=150,
        max_depth=16,
        random_state=42
    )
    
    print("Fitting Crop Classifier...")
    clf.fit(X_train, y_train)
    
    val_acc = accuracy_score(y_val, clf.predict(X_val))
    test_preds = clf.predict(X_test)
    test_acc = accuracy_score(y_test, test_preds)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, test_preds, average='weighted')
    cm = confusion_matrix(y_test, test_preds).tolist()
    
    print("\n" + "=" * 40)
    print("CROP CLASSIFIER EVALUATION METRICS:")
    print(f"Validation Accuracy: {val_acc * 100:.2f}%")
    print(f"Test Accuracy:       {test_acc * 100:.2f}%")
    print(f"Precision:           {precision * 100:.2f}%")
    print(f"Recall:              {recall * 100:.2f}%")
    print(f"F1-Score:            {f1 * 100:.2f}%")
    print("Confusion Matrix:")
    print(cm)
    print("=" * 40 + "\n")
    
    model_path = os.path.join(MODELS_DIR, "crop_classifier.joblib")
    keras_path = os.path.join(MODELS_DIR, "crop_classifier.keras")
    
    joblib.dump(clf, model_path)
    with open(keras_path, "wb") as f:
        joblib.dump(clf, f)
        
    metrics = {
        "model_name": "CropClassifier",
        "architecture": "ExtraTrees-Morphology-Ensemble",
        "val_accuracy": float(val_acc),
        "test_accuracy": float(test_acc),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "confusion_matrix": cm,
        "classes": CROPS
    }
    
    with open(os.path.join(MODELS_DIR, "crop_classifier_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Crop classifier saved to:\n  - {model_path}\n  - {keras_path}")
    return metrics


if __name__ == "__main__":
    train_crop_classifier()
