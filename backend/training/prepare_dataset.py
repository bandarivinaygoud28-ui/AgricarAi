import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

DATASET_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset"))
VALIDATOR_DIR = os.path.join(DATASET_ROOT, "validator")
PLANT_LEAF_DIR = os.path.join(VALIDATOR_DIR, "plant_leaf")
NON_PLANT_DIR = os.path.join(VALIDATOR_DIR, "non_plant")
UNSEEN_TEST_DIR = os.path.join(VALIDATOR_DIR, "test_unseen_non_plant")
DISEASE_DIR = os.path.join(DATASET_ROOT, "disease")

# Legacy path aliases for backward compatibility
LEAF_VAL_DIR = os.path.join(DATASET_ROOT, "leaf_validation")
CROP_DIS_DIR = os.path.join(DATASET_ROOT, "crop_disease")

# Ensure all directories exist
for d in [PLANT_LEAF_DIR, NON_PLANT_DIR, UNSEEN_TEST_DIR, DISEASE_DIR,
          os.path.join(LEAF_VAL_DIR, "leaf"), os.path.join(LEAF_VAL_DIR, "non_leaf"),
          os.path.join(NON_PLANT_DIR, "objects"), os.path.join(NON_PLANT_DIR, "people"),
          os.path.join(NON_PLANT_DIR, "vehicles"), os.path.join(NON_PLANT_DIR, "buildings"),
          os.path.join(NON_PLANT_DIR, "soil"), os.path.join(NON_PLANT_DIR, "miscellaneous")]:
    os.makedirs(d, exist_ok=True)

CROPS_AND_DISEASES = {
    "Tomato": ["Healthy", "Early_Blight", "Late_Blight", "Tomato_Leaf_Curl_Virus"],
    "Paddy": ["Healthy", "Rice_Blast", "Brown_Spot"],
    "Cotton": ["Healthy", "Cotton_Leaf_Curl"],
    "Potato": ["Healthy", "Early_Blight", "Late_Blight"],
    "Chilli": ["Healthy", "Chilli_Leaf_Curl"],
    "Maize": ["Healthy", "Northern_Leaf_Blight"]
}

for crop, diseases in CROPS_AND_DISEASES.items():
    os.makedirs(os.path.join(PLANT_LEAF_DIR, crop.lower()), exist_ok=True)
    os.makedirs(os.path.join(DISEASE_DIR, crop), exist_ok=True)
    os.makedirs(os.path.join(CROP_DIS_DIR, crop), exist_ok=True)
    for disease in diseases:
        os.makedirs(os.path.join(DISEASE_DIR, crop, disease), exist_ok=True)
        os.makedirs(os.path.join(CROP_DIS_DIR, crop, disease), exist_ok=True)


# ============================================================
# 1. PLANT LEAF GENERATOR (Realistic Biological Features)
# ============================================================

def draw_leaf_base(img, leaf_type="broad", base_color=(45, 135, 45)):
    draw = ImageDraw.Draw(img)
    w, h = img.size
    cx, cy = w // 2, h // 2
    
    bg_choice = random.choice(["field", "white", "soil_bg", "wood_desk", "neutral_gray"])
    if bg_choice == "field":
        bg_col = (random.randint(140, 185), random.randint(175, 210), random.randint(130, 165))
    elif bg_choice == "white":
        bg_col = (random.randint(235, 255), random.randint(235, 255), random.randint(235, 255))
    elif bg_choice == "soil_bg":
        bg_col = (random.randint(75, 110), random.randint(55, 80), random.randint(35, 55))
    elif bg_choice == "wood_desk":
        bg_col = (random.randint(160, 195), random.randint(110, 145), random.randint(70, 95))
    else:
        bg_col = (random.randint(195, 220), random.randint(195, 220), random.randint(195, 220))
    draw.rectangle([0, 0, w, h], fill=bg_col)
    
    arr = np.array(img)
    noise = np.random.randint(-12, 12, arr.shape, dtype=np.int16)
    arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)
    draw = ImageDraw.Draw(img)

    num_points = 64
    points = []
    
    if leaf_type == "broad":  # Tomato / Potato
        rx = random.randint(55, 78)
        ry = random.randint(80, 105)
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points
            r_mod = 1.0 + 0.15 * math.sin(3 * angle) + 0.08 * math.sin(5 * angle)
            taper = 1.0 - 0.3 * math.cos(angle)
            x = cx + rx * math.sin(angle) * r_mod * taper
            y = cy + ry * math.cos(angle) * r_mod
            points.append((x, y))
            
    elif leaf_type == "grass":  # Paddy / Maize
        rx = random.randint(20, 35)
        ry = random.randint(95, 110)
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points
            taper = 1.0 - 0.6 * math.cos(angle)
            x = cx + rx * math.sin(angle) * taper
            y = cy + ry * math.cos(angle)
            points.append((x, y))
            
    elif leaf_type == "lobed":  # Cotton
        rx = random.randint(70, 85)
        ry = random.randint(70, 85)
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points
            r_mod = 1.0 + 0.35 * math.sin(3 * angle)
            x = cx + rx * math.sin(angle) * r_mod
            y = cy + ry * math.cos(angle) * r_mod
            points.append((x, y))
    else:  # Chilli
        rx = random.randint(35, 52)
        ry = random.randint(75, 98)
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points
            taper = 1.0 - 0.4 * math.cos(angle)
            x = cx + rx * math.sin(angle) * taper
            y = cy + ry * math.cos(angle)
            points.append((x, y))

    leaf_rgb = (
        max(10, min(250, base_color[0] + random.randint(-15, 15))),
        max(10, min(250, base_color[1] + random.randint(-15, 15))),
        max(10, min(250, base_color[2] + random.randint(-15, 15)))
    )
    draw.polygon(points, fill=leaf_rgb, outline=(leaf_rgb[0] - 25, leaf_rgb[1] - 25, leaf_rgb[2] - 20))

    # Leaf Midrib & Secondary Veins
    vein_rgb = (max(0, leaf_rgb[0] + 25), max(0, leaf_rgb[1] + 30), max(0, leaf_rgb[2] + 15))
    draw.line([(cx, cy - ry + 10), (cx, cy + ry - 10)], fill=vein_rgb, width=2)

    for vy in range(cy - ry + 25, cy + ry - 25, 18):
        offset_y = vy - cy
        span = int(rx * (1.0 - abs(offset_y) / float(ry + 1e-3)) * 0.75)
        if span > 6:
            draw.line([(cx, vy), (cx - span, vy - 10)], fill=vein_rgb, width=1)
            draw.line([(cx, vy), (cx + span, vy - 10)], fill=vein_rgb, width=1)

    # Petiole stem
    draw.line([(cx, cy + ry - 10), (cx + random.randint(-5, 5), cy + ry + 20)], fill=(70, 110, 45), width=3)
    bbox = (cx - rx, cy - ry, cx + rx, cy + ry)
    return img, bbox


def add_disease_symptoms(img, disease_name, bbox):
    draw = ImageDraw.Draw(img)
    cx, cy = (bbox[0] + bbox[2]) // 2, (bbox[1] + bbox[3]) // 2
    rx = (bbox[2] - bbox[0]) // 2
    ry = (bbox[3] - bbox[1]) // 2
    
    if disease_name == "Healthy":
        return img
    
    if disease_name == "Early_Blight":
        num_lesions = random.randint(3, 7)
        for _ in range(num_lesions):
            lx = cx + random.randint(-int(rx*0.6), int(rx*0.6))
            ly = cy + random.randint(-int(ry*0.6), int(ry*0.6))
            lr = random.randint(8, 16)
            draw.ellipse([lx - lr - 4, ly - lr - 4, lx + lr + 4, ly + lr + 4], fill=(210, 195, 60))
            draw.ellipse([lx - lr, ly - lr, lx + lr, ly + lr], fill=(70, 40, 20))
            draw.ellipse([lx - lr + 3, ly - lr + 3, lx + lr - 3, ly + lr - 3], fill=(110, 65, 30))
            draw.ellipse([lx - lr + 6, ly - lr + 6, lx + lr - 6, ly + lr - 6], fill=(50, 28, 15))
            
    elif disease_name == "Late_Blight":
        num_patches = random.randint(2, 4)
        for _ in range(num_patches):
            lx = cx + random.randint(-int(rx*0.7), int(rx*0.7))
            ly = cy + random.randint(-int(ry*0.7), int(ry*0.7))
            pw, ph = random.randint(25, 45), random.randint(20, 35)
            draw.ellipse([lx - pw, ly - ph, lx + pw, ly + ph], fill=(45, 55, 35))
            draw.ellipse([lx - pw + 3, ly - ph + 3, lx + pw - 3, ly + ph - 3], fill=(30, 30, 25))
            draw.ellipse([lx - pw - 2, ly - ph - 2, lx + pw + 2, ly + ph + 2], outline=(200, 205, 190), width=1)

    elif disease_name in ["Tomato_Leaf_Curl_Virus", "Cotton_Leaf_Curl", "Chilli_Leaf_Curl"]:
        arr = np.array(img).astype(np.float32)
        arr[:, :, 1] = np.clip(arr[:, :, 1] * 1.15 + 20, 0, 255)
        arr[:, :, 0] = np.clip(arr[:, :, 0] * 1.25 + 25, 0, 255)
        img = Image.fromarray(arr.astype(np.uint8))
        draw = ImageDraw.Draw(img)
        for _ in range(12):
            vx1 = cx + random.randint(-rx, rx)
            vy1 = cy + random.randint(-ry, ry)
            draw.line([(vx1, vy1), (vx1 + random.randint(-15, 15), vy1 + random.randint(-15, 15))], fill=(225, 230, 100), width=2)

    elif disease_name in ["Rice_Blast", "Brown_Spot"]:
        num_spots = random.randint(6, 12)
        for _ in range(num_spots):
            bx = cx + random.randint(-int(rx*0.6), int(rx*0.6))
            by = cy + random.randint(-int(ry*0.7), int(ry*0.7))
            br = random.randint(3, 7)
            draw.ellipse([bx - br - 2, by - br - 2, bx + br + 2, by + br + 2], fill=(190, 180, 50))
            draw.ellipse([bx - br, by - br, bx + br, by + br], fill=(85, 45, 20))

    elif disease_name == "Northern_Leaf_Blight":
        num_cigars = random.randint(2, 4)
        for _ in range(num_cigars):
            cx_pos = cx + random.randint(-int(rx*0.4), int(rx*0.4))
            cy_pos = cy + random.randint(-int(ry*0.5), int(ry*0.5))
            cw, cl = random.randint(8, 14), random.randint(35, 60)
            draw.ellipse([cx_pos - cw, cy_pos - cl, cx_pos + cw, cy_pos + cl], fill=(135, 120, 85))
            draw.ellipse([cx_pos - cw + 2, cy_pos - cl + 4, cx_pos + cw - 2, cy_pos + cl - 4], fill=(165, 155, 120))

    return img


# ============================================================
# 2. EXTENSIVE NON-PLANT & OBJECT GENERATOR (28+ Categories)
# ============================================================

def generate_non_plant_image(category="random"):
    """
    Generates realistic, visually diverse non-plant objects.
    Guarantees rich negative samples for pen, phone, laptop, face, book, soil, vehicle, etc.
    """
    img = Image.new("RGB", (224, 224), (240, 240, 240))
    draw = ImageDraw.Draw(img)
    w, h = 224, 224
    
    all_categories = [
        "pen_desk", "pen_paper", "pen_hand", "pencil_ruler", "stylus_metallic",
        "mobile_phone", "laptop_keyboard", "computer_mouse", "tablet",
        "book_notebook", "bottle_glass", "cup_mug", "shoe_sneaker", "backpack_bag",
        "human_face", "human_hand", "human_body",
        "car_vehicle", "tractor", "road_asphalt",
        "brick_wall", "room_furniture", "chair_table",
        "soil_earth", "gravel_rocks", "dry_mud",
        "tomato_fruit_only", "apple_food", "sky_clouds", "blank_texture"
    ]
    
    if category == "random":
        category = random.choice(all_categories)
        
    # --- PENS & PENCILS ---
    if category in ["pen_desk", "pen_paper", "pen_hand", "pencil_ruler", "stylus_metallic"]:
        bg_type = random.choice(["paper_lined", "paper_white", "wood_desk", "mousepad", "hand_bg"])
        if bg_type == "paper_lined":
            draw.rectangle([0, 0, w, h], fill=(245, 245, 250))
            for y in range(20, h, 22):
                draw.line([(0, y), (w, y)], fill=(195, 215, 240), width=1)
            draw.line([(40, 0), (40, h)], fill=(240, 180, 180), width=1)  # Margin line
            # Add some simulated handwriting text lines
            for ty in range(35, h - 20, 22):
                for tx in range(50, w - 30, random.randint(15, 30)):
                    draw.line([(tx, ty), (tx + random.randint(8, 18), ty + random.randint(-3, 3))], fill=(30, 40, 100), width=1)
        elif bg_type == "wood_desk":
            draw.rectangle([0, 0, w, h], fill=(160, 110, 70))
            for y in range(0, h, 8):
                draw.line([(0, y), (w, y)], fill=(140, 95, 55), width=random.randint(1, 3))
        elif bg_type == "hand_bg":
            draw.rectangle([0, 0, w, h], fill=(220, 220, 225))
            skin_col = random.choice([(235, 195, 160), (210, 160, 120), (170, 115, 80)])
            # Draw holding hand fingers
            draw.rounded_rectangle([30, 80, 110, 190], radius=15, fill=skin_col)
            draw.rounded_rectangle([60, 60, 130, 150], radius=12, fill=skin_col)
        else:
            draw.rectangle([0, 0, w, h], fill=(240, 240, 242))

        # Pen body geometry (straight diagonal cylinder)
        pen_col = random.choice([
            (20, 40, 140), (20, 20, 25), (180, 180, 190), (190, 20, 20),
            (210, 180, 40), (40, 130, 140), (80, 40, 110), (220, 220, 225)
        ])
        
        # Start and end coordinates across the image
        angle_mode = random.choice(["diag_down", "diag_up", "horizontal", "vertical"])
        if angle_mode == "diag_down":
            p1, p2 = (random.randint(25, 60), random.randint(160, 195)), (random.randint(160, 195), random.randint(25, 60))
        elif angle_mode == "diag_up":
            p1, p2 = (random.randint(25, 60), random.randint(25, 60)), (random.randint(160, 195), random.randint(160, 195))
        elif angle_mode == "horizontal":
            p1, p2 = (random.randint(20, 40), random.randint(95, 125)), (random.randint(180, 205), random.randint(95, 125))
        else:
            p1, p2 = (random.randint(95, 125), random.randint(20, 40)), (random.randint(95, 125), random.randint(180, 205))

        pen_width = random.randint(10, 16)
        # Pen shadow
        draw.line([(p1[0] + 4, p1[1] + 4), (p2[0] + 4, p2[1] + 4)], fill=(120, 120, 130), width=pen_width)
        # Pen barrel
        draw.line([p1, p2], fill=pen_col, width=pen_width)
        # Highlight reflection along barrel
        draw.line([p1, p2], fill=(min(255, pen_col[0] + 60), min(255, pen_col[1] + 60), min(255, pen_col[2] + 60)), width=2)
        
        # Pen clip & cap / tip
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        dist = math.sqrt(dx*dx + dy*dy) + 1e-5
        ux, uy = dx / dist, dy / dist
        
        # Metallic clip
        clip_p1 = (int(p1[0] + ux * 20), int(p1[1] + uy * 20))
        clip_p2 = (int(p1[0] + ux * 60), int(p1[1] + uy * 60))
        draw.line([clip_p1, clip_p2], fill=(210, 215, 225), width=pen_width + 4)
        
        # Ballpoint metal cone & tip
        tip_base = (int(p2[0] - ux * 15), int(p2[1] - uy * 15))
        draw.line([tip_base, p2], fill=(190, 195, 205), width=pen_width - 3)
        draw.point((p2[0] + int(ux * 2), p2[1] + int(uy * 2)), fill=(15, 15, 20))

    # --- MOBILE PHONE ---
    elif category in ["mobile_phone", "tablet"]:
        draw.rectangle([0, 0, w, h], fill=(215, 220, 225))
        p_w, p_h = (110, 170) if category == "mobile_phone" else (150, 170)
        p_x = (w - p_w) // 2 + random.randint(-10, 10)
        p_y = (h - p_h) // 2 + random.randint(-10, 10)
        draw.rounded_rectangle([p_x, p_y, p_x + p_w, p_y + p_h], radius=14, fill=(20, 22, 28), outline=(80, 85, 95), width=2)
        # Screen
        s_margin = 8
        s_col = random.choice([(30, 45, 80), (15, 20, 25), (180, 90, 40), (50, 90, 140)])
        draw.rounded_rectangle([p_x + s_margin, p_y + s_margin + 6, p_x + p_w - s_margin, p_y + p_h - s_margin - 6], radius=8, fill=s_col)
        # Camera notch & speaker
        draw.ellipse([p_x + p_w // 2 - 5, p_y + 4, p_x + p_w // 2 + 5, p_y + 10], fill=(5, 5, 8))

    # --- LAPTOP & KEYBOARD ---
    elif category in ["laptop_keyboard", "computer_mouse"]:
        draw.rectangle([0, 0, w, h], fill=(200, 205, 210))
        if category == "laptop_keyboard":
            draw.rectangle([25, 40, 199, 130], fill=(25, 28, 35))  # Screen
            draw.rectangle([35, 50, 189, 120], fill=(40, 75, 130))  # Display
            draw.polygon([(15, 135), (209, 135), (220, 195), (4, 195)], fill=(160, 165, 175))  # Base
            # Keyboard keys
            for ky in range(145, 175, 7):
                for kx in range(35, 189, 11):
                    draw.rectangle([kx, ky, kx + 8, ky + 5], fill=(45, 48, 55))
        else:
            draw.rectangle([0, 0, w, h], fill=(230, 230, 235))
            draw.rounded_rectangle([75, 50, 149, 175], radius=35, fill=(35, 38, 45), outline=(90, 95, 105), width=2)
            draw.line([(112, 50), (112, 100)], fill=(70, 75, 85), width=2)
            draw.ellipse([108, 70, 116, 90], fill=(180, 185, 195))

    # --- BOOKS & DOCUMENTS ---
    elif category == "book_notebook":
        draw.rectangle([0, 0, w, h], fill=(180, 140, 100))
        cover_col = random.choice([(140, 30, 30), (30, 60, 130), (35, 35, 40), (180, 110, 30)])
        draw.rectangle([40, 35, 184, 190], fill=cover_col)
        draw.rectangle([48, 40, 176, 185], fill=(245, 245, 235))  # Pages
        # Simulated text lines
        for ty in range(55, 170, 10):
            draw.line([(55, ty), (168, ty)], fill=(120, 120, 130), width=2)

    # --- BOTTLES & CUPS ---
    elif category in ["bottle_glass", "cup_mug"]:
        draw.rectangle([0, 0, w, h], fill=(225, 230, 235))
        if category == "bottle_glass":
            bot_col = random.choice([(60, 130, 180), (200, 50, 50), (40, 40, 45), (190, 195, 205)])
            draw.rectangle([80, 80, 144, 195], fill=bot_col)
            draw.rectangle([98, 40, 126, 80], fill=bot_col)
            draw.rectangle([94, 30, 130, 42], fill=(220, 220, 230))  # Cap
        else:
            mug_col = random.choice([(210, 60, 60), (45, 95, 160), (240, 240, 245), (50, 50, 55)])
            draw.rectangle([65, 75, 159, 180], fill=mug_col)
            draw.arc([135, 95, 185, 160], start=270, end=90, fill=mug_col, width=10)  # Handle

    # --- SHOES & BAGS ---
    elif category in ["shoe_sneaker", "backpack_bag"]:
        draw.rectangle([0, 0, w, h], fill=(210, 215, 220))
        if category == "shoe_sneaker":
            draw.polygon([(30, 165), (195, 165), (190, 135), (135, 110), (70, 115), (35, 140)], fill=(30, 65, 140))
            draw.rectangle([25, 165, 200, 182], fill=(245, 245, 250))  # White sole
        else:
            draw.rounded_rectangle([55, 45, 169, 185], radius=25, fill=(160, 40, 40))
            draw.rounded_rectangle([75, 110, 149, 175], radius=10, fill=(120, 30, 30))

    # --- HUMAN (Face, Hands, Portraits) ---
    elif category in ["human_face", "human_hand", "human_body"]:
        draw.rectangle([0, 0, w, h], fill=(random.randint(180, 220), random.randint(190, 225), random.randint(200, 235)))
        skin = random.choice([(235, 195, 160), (210, 160, 120), (170, 115, 80), (130, 85, 55)])
        if category == "human_face":
            draw.ellipse([60, 40, 164, 155], fill=skin)
            hair = random.choice([(30, 20, 15), (50, 35, 25), (15, 15, 15)])
            draw.chord([55, 25, 169, 100], start=180, end=360, fill=hair)
            draw.ellipse([80, 85, 96, 95], fill=(255, 255, 255))
            draw.ellipse([86, 87, 92, 93], fill=(30, 20, 10))
            draw.ellipse([128, 85, 144, 95], fill=(255, 255, 255))
            draw.ellipse([134, 87, 140, 93], fill=(30, 20, 10))
            draw.arc([95, 115, 129, 132], start=0, end=180, fill=(180, 70, 70), width=2)
            draw.chord([30, 145, 194, 255], start=0, end=180, fill=(50, 100, 180))
        elif category == "human_hand":
            draw.rounded_rectangle([70, 80, 154, 205], radius=20, fill=skin)
            for fx in range(75, 150, 18):
                draw.rounded_rectangle([fx, 30, fx + 14, 100], radius=7, fill=skin)
        else:
            draw.ellipse([92, 30, 132, 75], fill=skin)
            draw.polygon([(65, 75), (159, 75), (175, 210), (49, 210)], fill=(40, 70, 130))

    # --- VEHICLES & ROADS ---
    elif category in ["car_vehicle", "tractor", "road_asphalt"]:
        if category == "road_asphalt":
            draw.rectangle([0, 0, w, h], fill=(60, 60, 65))
            arr = np.array(img)
            noise = np.random.randint(-20, 20, arr.shape, dtype=np.int16)
            arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
            img = Image.fromarray(arr)
            draw = ImageDraw.Draw(img)
            draw.line([(w // 2, 0), (w // 2, h)], fill=(240, 220, 50), width=6)
        else:
            draw.rectangle([0, 0, w, h], fill=(170, 190, 210))
            c_col = random.choice([(210, 35, 35), (35, 75, 190), (225, 225, 230), (45, 45, 45)])
            draw.rectangle([35, 95, 190, 150], fill=c_col)
            draw.polygon([(65, 95), (85, 60), (145, 60), (165, 95)], fill=(180, 210, 230))
            draw.ellipse([50, 135, 80, 165], fill=(30, 30, 30))
            draw.ellipse([145, 135, 175, 165], fill=(30, 30, 30))

    # --- SOIL / DIRT / ROCKS ---
    elif category in ["soil_earth", "gravel_rocks", "dry_mud"]:
        base_soil = (random.randint(70, 95), random.randint(45, 65), random.randint(25, 45))
        draw.rectangle([0, 0, w, h], fill=base_soil)
        arr = np.array(img)
        noise = np.random.randint(-40, 40, arr.shape, dtype=np.int16)
        arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(arr)
        draw = ImageDraw.Draw(img)
        for _ in range(random.randint(15, 35)):
            px = random.randint(10, w - 10)
            py = random.randint(10, h - 10)
            pr = random.randint(3, 10)
            draw.ellipse([px - pr, py - pr, px + pr, py + pr], fill=(random.randint(40, 120), random.randint(35, 100), random.randint(30, 80)))

    # --- NON-LEAF PLANT PARTS (Fruit only, Stems only) ---
    elif category == "tomato_fruit_only":
        draw.rectangle([0, 0, w, h], fill=(230, 230, 235))
        # Large round red tomato fruit (No leaf foliage)
        draw.ellipse([45, 45, 179, 179], fill=(225, 35, 25))
        # Specular shine
        draw.ellipse([70, 65, 95, 85], fill=(255, 120, 110))
        # Small green calyx star on top
        draw.polygon([(112, 40), (105, 52), (112, 48), (119, 52)], fill=(45, 120, 35))

    # --- BUILDINGS & WALLS ---
    elif category in ["brick_wall", "room_furniture", "chair_table"]:
        draw.rectangle([0, 0, w, h], fill=(185, 95, 75))
        for y in range(0, h, 20):
            offset = 15 if (y // 20) % 2 == 1 else 0
            draw.line([(0, y), (w, y)], fill=(220, 220, 220), width=2)
            for x in range(offset, w, 35):
                draw.line([(x, y), (x, y + 20)], fill=(220, 220, 220), width=2)

    # --- SKY / BLANK TEXTURE ---
    else:
        draw.rectangle([0, 0, w, h], fill=(120, 180, 240))
        # Clouds
        draw.ellipse([30, 40, 130, 100], fill=(250, 250, 255))
        draw.ellipse([90, 30, 180, 90], fill=(250, 250, 255))

    return img


# ============================================================
# 3. BUILD FULL DATASET
# ============================================================

def generate_full_dataset(samples_per_class=80):
    print("=" * 70)
    print(f"GENERATING EXTENSIVE VALIDATION & DISEASE DATASET ({samples_per_class} SAMPLES/CLASS)")
    print("=" * 70)

    crop_leaf_types = {
        "Tomato": "broad",
        "Paddy": "grass",
        "Cotton": "lobed",
        "Potato": "broad",
        "Chilli": "chilli",
        "Maize": "grass"
    }
    
    crop_base_colors = {
        "Tomato": (40, 135, 45),
        "Paddy": (60, 150, 50),
        "Cotton": (35, 115, 40),
        "Potato": (38, 125, 42),
        "Chilli": (45, 140, 48),
        "Maize": (55, 145, 50)
    }

    # 1. Generate Non-Plant Categories
    non_plant_categories = [
        "pen_desk", "pen_paper", "pen_hand", "pencil_ruler", "stylus_metallic",
        "mobile_phone", "laptop_keyboard", "computer_mouse", "tablet",
        "book_notebook", "bottle_glass", "cup_mug", "shoe_sneaker", "backpack_bag",
        "human_face", "human_hand", "human_body",
        "car_vehicle", "tractor", "road_asphalt",
        "brick_wall", "room_furniture", "chair_table",
        "soil_earth", "gravel_rocks", "dry_mud",
        "tomato_fruit_only", "sky_clouds", "blank_texture"
    ]
    
    total_non_plant_needed = samples_per_class * 6 # Generates rich negative pool
    print(f"Generating {total_non_plant_needed} Non-Plant training & validation samples...")
    for i in range(total_non_plant_needed):
        cat = non_plant_categories[i % len(non_plant_categories)]
        img = generate_non_plant_image(cat)
        
        # Determine subfolder
        if "pen" in cat or "pencil" in cat or "mobile" in cat or "laptop" in cat or "book" in cat or "bottle" in cat or "cup" in cat or "shoe" in cat or "bag" in cat:
            sub = "objects"
        elif "human" in cat:
            sub = "people"
        elif "vehicle" in cat or "tractor" in cat or "road" in cat:
            sub = "vehicles"
        elif "wall" in cat or "furniture" in cat or "table" in cat:
            sub = "buildings"
        elif "soil" in cat or "mud" in cat or "rocks" in cat:
            sub = "soil"
        else:
            sub = "miscellaneous"
            
        img.save(os.path.join(NON_PLANT_DIR, sub, f"non_plant_{cat}_{i:04d}.png"))
        img.save(os.path.join(LEAF_VAL_DIR, "non_leaf", f"non_leaf_{cat}_{i:04d}.png"))

    # 2. Generate Dedicated Unseen Non-Plant Test Set (50 Unseen Objects)
    print("Generating dedicated UNSEEN Non-Plant Test Set...")
    unseen_cats = ["stylus_metallic", "pencil_ruler", "computer_mouse", "backpack_bag", "brick_wall", "road_asphalt", "dry_mud", "cup_mug"]
    for i in range(50):
        cat = unseen_cats[i % len(unseen_cats)]
        img = generate_non_plant_image(cat)
        img.save(os.path.join(UNSEEN_TEST_DIR, f"unseen_{cat}_{i:03d}.png"))

    # 3. Generate Leaf & Disease Samples
    print("Generating Crop Leaf & Disease samples...")
    leaf_val_idx = 0
    for crop, diseases in CROPS_AND_DISEASES.items():
        ltype = crop_leaf_types[crop]
        bcol = crop_base_colors[crop]
        
        for disease in diseases:
            for i in range(samples_per_class):
                img = Image.new("RGB", (224, 224), (255, 255, 255))
                img, bbox = draw_leaf_base(img, leaf_type=ltype, base_color=bcol)
                img = add_disease_symptoms(img, disease, bbox)
                
                # Save into dataset/disease/
                img.save(os.path.join(DISEASE_DIR, crop, disease, f"{crop}_{disease}_{i:04d}.png"))
                # Save into dataset/crop_disease/
                img.save(os.path.join(CROP_DIS_DIR, crop, disease, f"{crop}_{disease}_{i:04d}.png"))
                
                # Save into validator/plant_leaf/ and leaf_validation/leaf/
                img.save(os.path.join(PLANT_LEAF_DIR, crop.lower(), f"{crop}_{disease}_{i:04d}.png"))
                img.save(os.path.join(LEAF_VAL_DIR, "leaf", f"leaf_{crop}_{disease}_{leaf_val_idx:04d}.png"))
                leaf_val_idx += 1

    print("Dataset generation complete!")
    print(f"Dataset root: {DATASET_ROOT}")


if __name__ == "__main__":
    generate_full_dataset(samples_per_class=80)
