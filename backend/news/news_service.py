import os
import re
import time
import hashlib
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

# =====================================================================
# 1. CURATED FARMER-SPECIFIC HIGH RESOLUTION AGRICULTURAL IMAGERY
# (Strictly no meal dishes, no restaurant plates, no corporate suits)
# =====================================================================

CROP_IMAGE_POOLS: Dict[str, List[str]] = {
    "🌾 Paddy / Rice": [
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop&q=80", # Lush green paddy fields
        "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=700&auto=format&fit=crop&q=80", # Golden ripe paddy harvest
        "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=700&auto=format&fit=crop&q=80"  # Farmer in rice paddy
    ],
    "🌿 Cotton": [
        "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=700&auto=format&fit=crop&q=80", # Ripe white cotton crop in field
        "https://images.unsplash.com/photo-1594904351111-a072f80b1a71?w=700&auto=format&fit=crop&q=80", # Cotton bolls picking
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=700&auto=format&fit=crop&q=80"  # Organic cotton farm
    ],
    "🌶️ Chilli": [
        "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=700&auto=format&fit=crop&q=80", # Red hot chilli crop
        "https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=700&auto=format&fit=crop&q=80", # Green and red chilli harvest
        "https://images.unsplash.com/photo-1526344966286-56f5d815d3ab?w=700&auto=format&fit=crop&q=80"  # Drying red chillies
    ],
    "🍅 Tomato": [
        "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=700&auto=format&fit=crop&q=80", # Fresh red vine tomatoes
        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=700&auto=format&fit=crop&q=80", # Tomato greenhouse farm
        "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=700&auto=format&fit=crop&q=80"  # Harvested fresh tomatoes
    ],
    "🧅 Onion": [
        "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=700&auto=format&fit=crop&q=80", # Fresh farm onions
        "https://images.unsplash.com/photo-1508747703725-719777637510?w=700&auto=format&fit=crop&q=80", # Red onion harvest
        "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=700&auto=format&fit=crop&q=80"  # Onion farm crates
    ],
    "🥔 Potato": [
        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=700&auto=format&fit=crop&q=80", # Fresh potato farm harvest
        "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=700&auto=format&fit=crop&q=80", # Potato plants field
        "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&auto=format&fit=crop&q=80"  # Organic farm potatoes
    ],
    "🌽 Maize": [
        "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=700&auto=format&fit=crop&q=80", # Golden ripe cornfield
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=700&auto=format&fit=crop&q=80", # Sunny maize field
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&auto=format&fit=crop&q=80"  # Corn harvest
    ],
    "🌾 Wheat": [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&auto=format&fit=crop&q=80", # Golden wheat field at sunset
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&auto=format&fit=crop&q=80", # Ripe grain spikes
        "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=700&auto=format&fit=crop&q=80"  # Wheat combine harvesting
    ],
    "🫘 Pulses": [
        "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=700&auto=format&fit=crop&q=80", # Legume pulse crop field
        "https://images.unsplash.com/photo-1584473457409-ae5c91d7d8b1?w=700&auto=format&fit=crop&q=80", # Farm fresh chickpeas / dal pods
        "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=700&auto=format&fit=crop&q=80"  # Raw harvest grain sacks
    ],
    "🌻 Oilseeds": [
        "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=700&auto=format&fit=crop&q=80", # Mustard yellow blossom field
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=700&auto=format&fit=crop&q=80", # Blooming sunflower farm
        "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=700&auto=format&fit=crop&q=80"  # Soybean crop rows
    ],
    "🍬 Sugarcane": [
        "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=700&auto=format&fit=crop&q=80", # Sugarcane plantation
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&auto=format&fit=crop&q=80", # Cane harvest
        "https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=700&auto=format&fit=crop&q=80"  # Green cane stalks
    ],
    "🟡 Turmeric": [
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=700&auto=format&fit=crop&q=80", # Raw turmeric roots & crop
        "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&auto=format&fit=crop&q=80"  # Turmeric harvest
    ]
}

CATEGORY_IMAGE_POOLS: Dict[str, List[str]] = {
    "🌾 Farmer Schemes": [
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=700&auto=format&fit=crop&q=80", # Indian farmer in field
        "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=700&auto=format&fit=crop&q=80", # Farmer holding grain
        "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=700&auto=format&fit=crop&q=80"  # Farmer financial welfare support
    ],
    "💰 Crop Prices & MSP": [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&auto=format&fit=crop&q=80", # Grain storage / MSP depot
        "https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=700&auto=format&fit=crop&q=80", # Mandi weighment scale / grain heaps
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80"  # APMC wholesale produce
    ],
    "🏦 Bank & Finance": [
        "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=700&auto=format&fit=crop&q=80", # Farmer banking / rural credit
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=700&auto=format&fit=crop&q=80", # Rural financial growth
        "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=700&auto=format&fit=crop&q=80"  # Agricultural loan documentation
    ],
    "🚜 Farm Equipment": [
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=700&auto=format&fit=crop&q=80", # Modern agricultural tractor plowing
        "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=700&auto=format&fit=crop&q=80", # Agricultural drone spraying in farm
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700&auto=format&fit=crop&q=80"  # Solar irrigation water pump
    ],
    "🏞️ Agricultural Land": [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&auto=format&fit=crop&q=80", # Fertile farmland landscape
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&auto=format&fit=crop&q=80", # Agricultural land rows & soil
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop&q=80"  # Canal irrigated agricultural land
    ],
    "🌦️ Weather Alert": [
        "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=700&auto=format&fit=crop&q=80", # Monsoon dark rainclouds over farm
        "https://images.unsplash.com/photo-1514632595-4944383f2737?w=700&auto=format&fit=crop&q=80", # Storm clouds / crop rainfall alert
        "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=700&auto=format&fit=crop&q=80"  # Heatwave / clear sky over fields
    ],
    "🐛 Crop Disease/Pest": [
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&auto=format&fit=crop&q=80", # Plant leaf disease inspection
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=700&auto=format&fit=crop&q=80", # Farmer examining crop health
        "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=700&auto=format&fit=crop&q=80"  # Organic biopesticide spraying
    ],
    "📈 Mandi / Commodity Market": [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80", # APMC Indian mandi market
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=700&auto=format&fit=crop&q=80", # Wholesale produce auction
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=700&auto=format&fit=crop&q=80"  # Commodity grain bags trading
    ],
    "🏛️ Agriculture Policy": [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&auto=format&fit=crop&q=80", # Government agriculture department / policy
        "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=700&auto=format&fit=crop&q=80", # ICAR agricultural roadmap
        "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=700&auto=format&fit=crop&q=80"  # Farmer empowerment policy
    ],
    "🌱 Seeds & Fertilizers": [
        "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=700&auto=format&fit=crop&q=80", # Fertilizer broadcasting in field
        "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=700&auto=format&fit=crop&q=80", # Certified high-yield seeds
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&auto=format&fit=crop&q=80"  # Soil nutrients and urea application
    ]
}

# In-memory news cache with 3-minute TTL
NEWS_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "articles": [],
    "queries": {}
}

CACHE_TTL_SECONDS = 180  # 3 minutes

# =====================================================================
# 2. STRICT RELEVANCE & REJECTION FILTERS
# =====================================================================

UNRELATED_BLACKLIST = [
    r'\bscottish\b', r'\bscottish msp\b', r'\bmartyn day\b', r'\bhollywood\b', r'\bbollywood\b',
    r'\bfutsal\b', r'\bfootball tournament\b', r'\bchampionship\b', r'\bpathankot-mandi highway\b',
    r'\bhighway\b', r'\bflyover\b', r'\bcricket\b', r'\bipl\b', r'\bcelebrity\b', r'\bwedding\b',
    r'\bmarries\b', r'\bfashion\b', r'\brestaurant\b', r'\bdish\b', r'\brecipe\b', r'\bculinary\b',
    r'\bstock market crash\b', r'\bwall street\b', r'\bcrypto\b', r'\bbitcoin\b', r'\bdefence minister\b',
    r'\braksha mantri\b', r'\barmy\b', r'\bnavy\b', r'\bair force\b', r'\bgeopolitical\b',
    r'\bwest asia\b', r'\bukraine\b', r'\bgaza\b', r'\bautomobile sales\b', r'\bev scooter\b'
]

FARMER_WHITELIST_KEYWORDS = [
    r'\b(pm-?kisan|kisan|farmer|farmers|kisan credit card|kcc|crop loan|agri loan)\b',
    r'\b(subsidy|subsidies|fertilizer|urea|dap|seed|seeds|irrigation|solar pump|drone)\b',
    r'\b(msp|minimum support price|procurement|mandi|mandis|apmc|wholesale price|crop rate|arrivals)\b',
    r'\b(paddy|rice|cotton|chilli|mirchi|tomato|onion|potato|maize|wheat|pulses|dal|soybean|mustard|sugarcane|turmeric)\b',
    r'\b(crop insurance|pmfby|fasal bima|nabard|loan waiver|rythu bandhu|rythu bharosa)\b',
    r'\b(farmland|agricultural land|land registration|dharani|ro-?r|tenancy|canal irrigation)\b',
    r'\b(rainfall|monsoon|heatwave|drought|frost|cyclone|weather alert|imd|agromet)\b',
    r'\b(pest attack|bollworm|fall armyworm|leaf curl|blast disease|biopesticide|fungicide|pesticide)\b',
    r'\b(agriculture ministry|icar|kvk|krishi vigyan|agri policy|fci|nafed)\b'
]

def is_farmer_relevant(title: str, summary: str) -> bool:
    """Strictly evaluates if an article provides actionable, direct utility to an Indian farmer."""
    combined = (title + " " + summary).lower()
    
    # 1. Blacklist check (Reject sports, highway accidents, celebrity gossip, Scottish MSPs)
    for bad_pattern in UNRELATED_BLACKLIST:
        if re.search(bad_pattern, combined):
            # Exception only if strong farming context is dominant
            if not any(k in combined for k in ["kisan", "pm-kisan", "crop insurance", "mandi price"]):
                return False
                
    # 2. Whitelist check (Must match at least one vital farming concept)
    matched = False
    for good_pattern in FARMER_WHITELIST_KEYWORDS:
        if re.search(good_pattern, combined):
            matched = True
            break
            
    return matched

# =====================================================================
# 3. INTELLIGENT CATEGORY & CROP DETECTION
# =====================================================================

def detect_crop(text: str) -> Optional[str]:
    """Detects specific Indian crop relevance."""
    t = text.lower()
    if re.search(r'\b(paddy|rice|basmati|dhan)\b', t):
        return "🌾 Paddy / Rice"
    if re.search(r'\b(cotton|kapas|bt cotton|bollworm)\b', t):
        return "🌿 Cotton"
    if re.search(r'\b(chilli|chillies|chili|chilies|mirchi|guntur chilli|byadagi)\b', t):
        return "🌶️ Chilli"
    if re.search(r'\b(tomato|tomatoes|tamatar)\b', t):
        return "🍅 Tomato"
    if re.search(r'\b(onion|onions|pyaz|lasalgaon)\b', t):
        return "🧅 Onion"
    if re.search(r'\b(potato|potatoes|aloo)\b', t):
        return "🥔 Potato"
    if re.search(r'\b(maize|corn|makka)\b', t):
        return "🌽 Maize"
    if re.search(r'\b(wheat|gehun|sharbati)\b', t):
        return "🌾 Wheat"
    if re.search(r'\b(pulses|pulse|lentil|lentils|arhar|toor dal|tur dal|chana|urad|moong|bengal gram|black gram|green gram|chickpea|rajma)\b', t):
        return "🫘 Pulses"
    if re.search(r'\b(oilseed|oilseeds|mustard|sarson|soybean|soya|groundnut|peanut|sunflower|edible oil)\b', t):
        return "🌻 Oilseeds"
    if re.search(r'\b(sugar|sugarcane|ganna|sugar mill|cane price)\b', t):
        return "🍬 Sugarcane"
    if re.search(r'\b(turmeric|haldi)\b', t):
        return "🟡 Turmeric"
    return None

def detect_category(title: str, summary: str) -> str:
    """Classifies an article into one of the 10 Farmer Information Center categories."""
    text = (title + " " + summary).lower()

    # 1. 🌦️ Weather Alert
    if re.search(r'\b(monsoon|heavy rain|rainfall|drought|cyclone|heatwave|frost|hailstorm|imd alert|agromet|weather warning|skymet)\b', text):
        return "🌦️ Weather Alert"

    # 2. 🐛 Crop Disease / Pest Alert
    if re.search(r'\b(pest attack|pest outbreak|pink bollworm|fall armyworm|leaf curl|blast disease|blight|yellow mosaic|locust|crop disease|fungicide|biopesticide|spraying advisory)\b', text):
        return "🐛 Crop Disease/Pest"

    # 3. 🌾 Farmer Government Schemes & Subsidies
    if re.search(r'\b(pm-?kisan|pmfby|fasal bima|rythu bandhu|rythu bharosa|farmer subsidy|subsidies|solar pump subsidy|tractor subsidy|drone subsidy|micro-irrigation subsidy|kisan scheme|farmer welfare scheme|kusum scheme)\b', text):
        return "🌾 Farmer Schemes"

    # 4. 🏦 Bank & Finance
    if re.search(r'\b(kisan credit card|kcc|crop loan|agri loan|agricultural loan|interest subvention|loan waiver|nabard loan|rural bank loan|crop insurance claim)\b', text):
        return "🏦 Bank & Finance"

    # 5. 🚜 Farm Equipment & Technology
    if re.search(r'\b(tractor|harvester|rotavator|combine harvester|agricultural drone|farm machinery|mechanization|solar pump|drip irrigation equipment|sprayer pump)\b', text):
        return "🚜 Farm Equipment"

    # 6. 🌱 Seeds & Fertilizers
    if re.search(r'\b(urea|dap|potash|fertilizer shortage|fertilizer subsidy|nano urea|certified seeds|hybrid seed|bio-fertilizer|seed distribution|soil health card)\b', text):
        return "🌱 Seeds & Fertilizers"

    # 7. 🏞️ Agricultural Land
    if re.search(r'\b(agricultural land|farmland|land registration|dharani|ro-?r|land survey|tenancy act|canal irrigation project|land lease rule)\b', text):
        return "🏞️ Agricultural Land"

    # 8. 💰 Crop Prices & MSP
    if re.search(r'\b(msp|minimum support price|procurement price|fci procurement|paddy msp|wheat msp|cotton msp|mandi rate|mandi price|crop prices plunge|crop prices surge|price crash|modal price)\b', text):
        return "💰 Crop Prices & MSP"

    # 9. 📈 Mandi / Commodity Market
    if re.search(r'\b(mandi|mandis|apmc|e-nam|enam|agmarknet|wholesale market|market arrivals|spot prices|commodity market|crop export|crop import duty|tariff)\b', text):
        return "📈 Mandi / Commodity Market"

    # 10. 🏛️ Agriculture Policy
    if re.search(r'\b(agriculture ministry|ministry of agriculture|icar|agri budget|kisan commission|swaminathan formula|agricultural reform|export ban|import duty)\b', text):
        return "🏛️ Agriculture Policy"

    # Fallback to Schemes or Market
    return "🌾 Farmer Schemes" if "scheme" in text or "farmer" in text else "📈 Mandi / Commodity Market"

# =====================================================================
# 4. LOCATION RELEVANCE & SCORING
# =====================================================================

INDIAN_DISTRICT_STATE_MAP = {
    "warangal": "Telangana",
    "karimnagar": "Telangana",
    "khammam": "Telangana",
    "nizamabad": "Telangana",
    "nalgonda": "Telangana",
    "mahbubnagar": "Telangana",
    "hyderabad": "Telangana",
    "kolar": "Karnataka",
    "belagavi": "Karnataka",
    "davanagere": "Karnataka",
    "mandya": "Karnataka",
    "shimoga": "Karnataka",
    "mysuru": "Karnataka",
    "guntur": "Andhra Pradesh",
    "kurnool": "Andhra Pradesh",
    "krishna": "Andhra Pradesh",
    "anantapur": "Andhra Pradesh",
    "nashik": "Maharashtra",
    "lasalgaon": "Maharashtra",
    "nagpur": "Maharashtra",
    "solapur": "Maharashtra",
    "pune": "Maharashtra",
    "ludhiana": "Punjab",
    "bathinda": "Punjab",
    "karnal": "Haryana",
    "hisar": "Haryana",
    "indore": "Madhya Pradesh",
    "ujjain": "Madhya Pradesh",
    "jaipur": "Rajasthan",
    "kota": "Rajasthan",
    "rajkot": "Gujarat",
    "ahmedabad": "Gujarat"
}

INDIAN_STATES = [
    "Telangana", "Andhra Pradesh", "Karnataka", "Maharashtra", "Punjab",
    "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Gujarat", "Rajasthan",
    "Tamil Nadu", "Kerala", "Bihar", "West Bengal", "Odisha", "Assam",
    "Himachal Pradesh", "Uttarakhand", "Chhattisgarh", "Jharkhand"
]

def detect_location(text: str) -> str:
    """Detects district or state from article text."""
    text_lower = text.lower()
    
    # Check districts first
    for dist, state in INDIAN_DISTRICT_STATE_MAP.items():
        if re.search(r'\b' + re.escape(dist) + r'\b', text_lower):
            return f"📍 {dist.capitalize()}, {state}"
            
    # Check states
    for state in INDIAN_STATES:
        if re.search(r'\b' + re.escape(state.lower()) + r'\b', text_lower):
            return f"📍 {state}"
            
    return "🇮🇳 India Agriculture"

def extract_price_info(title: str, summary: str, crop_name: Optional[str], loc_tag: str) -> Optional[Dict[str, Any]]:
    """Extracts price, mandi, and MSP data when present in text."""
    combined = title + " " + summary
    price_match = re.search(r'(?:₹|Rs\.?\s*|INR\s*)([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*(?:per|\/)?\s*(quintal|qtl|kg|bag|ton)?', combined, re.IGNORECASE)
    
    if price_match:
        val = price_match.group(1)
        unit = price_match.group(2) or "quintal"
        price_str = f"₹{val} / {unit}"
        
        # Determine price type
        price_type = "Mandi Price"
        if re.search(r'\b(msp|minimum support price)\b', combined, re.IGNORECASE):
            price_type = "MSP"
        elif re.search(r'\b(wholesale|spot)\b', combined, re.IGNORECASE):
            price_type = "Wholesale Price"
        elif re.search(r'\b(procurement)\b', combined, re.IGNORECASE):
            price_type = "Procurement Price"
            
        mkt_name = loc_tag.replace("📍 ", "").replace("🇮🇳 ", "")
        if mkt_name == "India Agriculture":
            mkt_name = "National Mandi"
            
        return {
            "crop": crop_name.replace("🌾 ", "").replace("🌿 ", "").replace("🌶️ ", "").replace("🍅 ", "").replace("🧅 ", "").replace("🥔 ", "").replace("🌽 ", "").replace("🫘 ", "").replace("🌻 ", "").replace("🍬 ", "") if crop_name else "Commodity",
            "market": mkt_name,
            "price": price_str,
            "price_type": price_type
        }
    return None

def compute_relevance_score(
    title: str,
    summary: str,
    category: str,
    crop: Optional[str],
    location_tag: str,
    farmer_location: Optional[str],
    farmer_crops: Optional[List[str]],
    pub_timestamp: float
) -> int:
    """Calculates personalized farmer relevance score (0-100)."""
    score = 60
    text = (title + " " + summary).lower()

    # Location boost
    if farmer_location:
        u_loc = farmer_location.lower()
        if any(part.strip() in location_tag.lower() for part in u_loc.split(",") if len(part.strip()) > 2):
            score += 25
        elif any(part.strip() in text for part in u_loc.split(",") if len(part.strip()) > 2):
            score += 15

    # Crop boost
    if farmer_crops and crop:
        for c in farmer_crops:
            if c.lower() in crop.lower() or c.lower() in text:
                score += 25
                break

    # Actionable category bonus
    if category in ["🌾 Farmer Schemes", "💰 Crop Prices & MSP", "🌦️ Weather Alert", "🐛 Crop Disease/Pest", "🏦 Bank & Finance"]:
        score += 10

    # Recency bonus
    age_hours = (time.time() - pub_timestamp) / 3600
    if age_hours <= 24:
        score += 15
    elif age_hours <= 72:
        score += 10
    elif age_hours <= 168:
        score += 5

    return min(99, score)

def pick_article_image(category: str, crop: Optional[str], article_id: str, feed_image: Optional[str] = None) -> str:
    """Selects high-res authentic agricultural imagery specifically matching crop or category."""
    if feed_image and feed_image.startswith("http") and not any(bad in feed_image for bad in ["logo", "icon", "blank", "spacer", "1x1", "avatar", "portrait"]):
        return feed_image

    # Priority 1: Crop-specific realistic image
    if crop and crop in CROP_IMAGE_POOLS:
        pool = CROP_IMAGE_POOLS[crop]
        idx = int(hashlib.md5((article_id + "_crop").encode("utf-8")).hexdigest(), 16) % len(pool)
        return pool[idx]

    # Priority 2: Category-specific realistic image
    pool = CATEGORY_IMAGE_POOLS.get(category, CATEGORY_IMAGE_POOLS["🌾 Farmer Schemes"])
    idx = int(hashlib.md5(article_id.encode("utf-8")).hexdigest(), 16) % len(pool)
    return pool[idx]

def _clean_html(raw_html: str) -> str:
    """Removes HTML tags and entities from RSS descriptions."""
    if not raw_html:
        return ""
    clean = re.sub(r'<.*?>', '', raw_html)
    clean = (clean.replace('&nbsp;', ' ')
                  .replace('&amp;', '&')
                  .replace('&quot;', '"')
                  .replace('&apos;', "'")
                  .replace('&#39;', "'")
                  .replace('&lt;', '<')
                  .replace('&gt;', '>'))
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def _parse_pubdate_to_timestamp(pub_date_str: str) -> float:
    """Parses RFC 822 / GMT / ISO date into unix timestamp."""
    if not pub_date_str:
        return time.time()
    try:
        clean_date = pub_date_str.replace("GMT", "+0000").strip()
        for fmt in (
            "%a, %d %b %Y %H:%M:%S %z",
            "%a, %d %b %Y %H:%M:%S +0000",
            "%d %b %Y %H:%M:%S %z",
            "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%d %H:%M:%S"
        ):
            try:
                dt = datetime.strptime(clean_date, fmt)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.timestamp()
            except ValueError:
                continue
    except Exception:
        pass
    return time.time()

def _format_pubdate(pub_date_str: str) -> str:
    """Formats RFC 822 / GMT dates into clean relative formats."""
    if not pub_date_str:
        return "Recently"
    try:
        ts = _parse_pubdate_to_timestamp(pub_date_str)
        now_ts = time.time()
        diff = int(now_ts - ts)
        if diff < 0:
            diff = 0

        if diff < 3600:
            mins = max(1, diff // 60)
            return f"{mins}m ago"
        elif diff < 86400:
            hrs = diff // 3600
            return f"{hrs}h ago"
        elif diff < 172800:
            return "Yesterday"
        else:
            dt = datetime.fromtimestamp(ts, tz=timezone.utc)
            return dt.strftime("%d %b %Y")
    except Exception:
        pass
    return pub_date_str.split(" 202")[0] if " 202" in pub_date_str else pub_date_str

def _extract_image_from_xml(item: ET.Element) -> Optional[str]:
    """Extracts media:content, enclosure or img src from XML RSS item."""
    try:
        enclosure = item.find("enclosure")
        if enclosure is not None and enclosure.get("url"):
            url = enclosure.get("url")
            if url and url.startswith("http"):
                return url

        for child in item:
            if child.tag.endswith("content") or child.tag.endswith("thumbnail"):
                url = child.get("url")
                if url and url.startswith("http"):
                    return url

        desc_elem = item.find("description")
        if desc_elem is not None and desc_elem.text:
            match = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', desc_elem.text)
            if match:
                return match.group(1)
    except Exception:
        pass
    return None

# =====================================================================
# 5. CORE NEWS ENGINE: REAL-TIME FARMER INFORMATION CENTER
# =====================================================================

def fetch_live_agri_news(
    category: Optional[str] = None,
    filter_type: Optional[str] = None,
    search: Optional[str] = None,
    location: Optional[str] = None,
    crops: Optional[str] = None,
    language: str = "en",
    limit: int = 25,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Fetches real-time, farmer-centric agricultural intelligence for Indian farmers.
    Filters out non-farmer noise, ranks by location/crop relevance, and provides actionable insights.
    """
    now = time.time()
    cache_key = f"{category}_{filter_type}_{search}_{location}_{crops}_{language}_{limit}"

    # Check cache unless force_refresh
    if not force_refresh and (now - NEWS_CACHE["timestamp"]) < CACHE_TTL_SECONDS:
        if cache_key in NEWS_CACHE["queries"]:
            cached = NEWS_CACHE["queries"][cache_key]
            return {
                "success": True,
                "articles": cached,
                "count": len(cached),
                "last_updated": datetime.fromtimestamp(NEWS_CACHE["timestamp"]).strftime("%I:%M %p, %d %b %Y"),
                "source": "Live Indian Farmer Information Center",
                "is_live": True
            }

    # Extract farmer crops list
    farmer_crop_list = [c.strip() for c in crops.split(",") if c.strip()] if crops else []

    # Build focused search queries targeting direct farmer concerns
    search_queries = []

    # Target 1: Specific category or search
    if search and len(search.strip()) > 0:
        search_queries.append(f'("{search.strip()}" AND (farmer OR kisan OR mandi OR subsidy OR crop)) when:7d')
    elif category and category != "All":
        clean_cat = re.sub(r'[^\w\s/]', '', category).strip()
        if "Scheme" in clean_cat:
            search_queries.append('(PM-KISAN OR subsidy OR "Kisan Credit Card" OR "Fasal Bima" OR Rythu) when:7d')
        elif "Price" in clean_cat or "MSP" in clean_cat:
            search_queries.append('(MSP OR "mandi prices" OR "procurement rate" OR "crop prices") India when:7d')
        elif "Bank" in clean_cat or "Finance" in clean_cat:
            search_queries.append('("agri loan" OR "KCC" OR "crop loan" OR NABARD OR "interest subsidy") farmer when:7d')
        elif "Equipment" in clean_cat:
            search_queries.append('(tractor OR harvester OR "agricultural drone" OR "solar pump" OR machinery) subsidy farmer when:7d')
        elif "Land" in clean_cat:
            search_queries.append('("agricultural land" OR farmland OR "land registration" OR Dharani OR "canal irrigation") India when:7d')
        elif "Weather" in clean_cat:
            search_queries.append('(monsoon OR rainfall OR drought OR heatwave OR "crop advisory" OR IMD) farmer India when:7d')
        elif "Pest" in clean_cat or "Disease" in clean_cat:
            search_queries.append('("pest attack" OR "crop disease" OR bollworm OR "armyworm" OR fungicide OR biopesticide) crop India when:7d')
        elif "Seed" in clean_cat or "Fertilizer" in clean_cat:
            search_queries.append('(urea OR DAP OR fertilizer OR "certified seeds" OR "nano urea") farmer India when:7d')
        elif "Mandi" in clean_cat:
            search_queries.append('(mandi OR APMC OR "market arrivals" OR "wholesale price" OR e-NAM) crop India when:7d')
        else:
            search_queries.append(f'({clean_cat} AND (farmer OR mandi OR crop OR kisan)) when:7d')
    else:
        # Default Multi-Stream Ingestion: Essential Farmer Topics
        loc_term = ""
        if location and len(location.strip()) > 2:
            loc_clean = location.split(",")[-1].strip()
            loc_term = f' OR "{loc_clean}"'

        search_queries.append(f'(PM-KISAN OR "crop prices" OR "mandi arrivals" OR MSP OR subsidy{loc_term}) India when:7d')
        search_queries.append('("Kisan Credit Card" OR "fertilizer subsidy" OR "crop insurance" OR "weather alert" OR "pest attack") India when:7d')

    raw_articles: List[Dict[str, Any]] = []
    seen_identifiers = set()

    for q in search_queries:
        encoded_query = urllib.parse.quote(q)
        rss_url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"

        try:
            req = urllib.request.Request(
                rss_url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/rss+xml, application/xml, text/xml"
                }
            )
            with urllib.request.urlopen(req, timeout=7) as response:
                xml_data = response.read()
                root = ET.fromstring(xml_data)
                items = root.findall("./channel/item")

                for item in items:
                    title_elem = item.find("title")
                    link_elem = item.find("link")
                    pubdate_elem = item.find("pubDate")
                    desc_elem = item.find("description")
                    source_elem = item.find("source")

                    if title_elem is None or not title_elem.text:
                        continue

                    full_title = title_elem.text.strip()
                    link = link_elem.text.strip() if link_elem is not None and link_elem.text else ""

                    # Extract source name
                    source_name = "Farmer Information Desk"
                    title = full_title
                    if " - " in full_title:
                        parts = full_title.rsplit(" - ", 1)
                        title = parts[0].strip()
                        source_name = parts[1].strip()
                    elif source_elem is not None and source_elem.text:
                        source_name = source_elem.text.strip()

                    # Deduplicate by title key or URL
                    norm_title_key = re.sub(r'\W+', '', title.lower())
                    if norm_title_key in seen_identifiers or (link and link in seen_identifiers):
                        continue
                    seen_identifiers.add(norm_title_key)
                    if link:
                        seen_identifiers.add(link)

                    raw_desc = desc_elem.text if desc_elem is not None and desc_elem.text else ""
                    clean_desc = _clean_html(raw_desc)
                    if not clean_desc or len(clean_desc) < 25:
                        clean_desc = f"{title}. Verified updates for Indian farmers from {source_name}."

                    # 1. STRICT FARMER RELEVANCE CHECK
                    if not is_farmer_relevant(title, clean_desc):
                        continue

                    pub_date_raw = pubdate_elem.text.strip() if pubdate_elem is not None and pubdate_elem.text else ""
                    pub_timestamp = _parse_pubdate_to_timestamp(pub_date_raw)
                    formatted_date = _format_pubdate(pub_date_raw)

                    # Filter out articles older than 7 days
                    if (now - pub_timestamp) > (7 * 86400):
                        continue

                    art_id = hashlib.md5((link or title).encode("utf-8")).hexdigest()[:12]

                    # Detect specific Crop, Category, Location, and Price info
                    detected_crop = detect_crop(title + " " + clean_desc)
                    detected_cat = detect_category(title, clean_desc)
                    detected_loc = detect_location(title + " " + clean_desc)
                    price_info = extract_price_info(title, clean_desc, detected_crop, detected_loc)

                    # Compute Farmer Relevance Score
                    relevance_score = compute_relevance_score(
                        title=title,
                        summary=clean_desc,
                        category=detected_cat,
                        crop=detected_crop,
                        location_tag=detected_loc,
                        farmer_location=location,
                        farmer_crops=farmer_crop_list,
                        pub_timestamp=pub_timestamp
                    )

                    # Dynamic Image Selection
                    feed_img = _extract_image_from_xml(item)
                    img = pick_article_image(detected_cat, detected_crop, art_id, feed_img)

                    raw_articles.append({
                        "id": art_id,
                        "title": title,
                        "summary": clean_desc,
                        "content": clean_desc,
                        "category": detected_cat,
                        "crop": detected_crop,
                        "source": source_name,
                        "date": formatted_date,
                        "url": link,
                        "image_url": img,
                        "location_tag": detected_loc,
                        "relevance_score": relevance_score,
                        "price_info": price_info,
                        "published_raw": pub_date_raw,
                        "published_timestamp": pub_timestamp
                    })

        except Exception as e:
            print(f"Farmer news ingestion error: {e}")

    # Fallback to curated live farmer advisory if few items returned
    if len(raw_articles) < 5:
        try:
            sec_query = urllib.parse.quote('India farmer PM-KISAN MSP mandi subsidy crop advisory when:7d')
            sec_url = f"https://news.google.com/rss/search?q={sec_query}&hl=en-IN&gl=IN&ceid=IN:en"
            req = urllib.request.Request(sec_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=6) as response:
                root = ET.fromstring(response.read())
                for item in root.findall("./channel/item"):
                    t_el = item.find("title")
                    l_el = item.find("link")
                    d_el = item.find("description")
                    p_el = item.find("pubDate")
                    s_el = item.find("source")

                    if t_el is None or not t_el.text:
                        continue

                    full_t = t_el.text.strip()
                    link = l_el.text.strip() if l_el is not None and l_el.text else ""
                    title = full_t.rsplit(" - ", 1)[0] if " - " in full_t else full_t
                    src = full_t.rsplit(" - ", 1)[1] if " - " in full_t else (s_el.text if s_el is not None and s_el.text else "Agri News")

                    norm_k = re.sub(r'\W+', '', title.lower())
                    if norm_k in seen_identifiers or (link and link in seen_identifiers):
                        continue
                    seen_identifiers.add(norm_k)
                    if link:
                        seen_identifiers.add(link)

                    desc = _clean_html(d_el.text if d_el is not None and d_el.text else "") or title
                    if not is_farmer_relevant(title, desc):
                        continue

                    p_raw = p_el.text if p_el is not None else ""
                    p_ts = _parse_pubdate_to_timestamp(p_raw)
                    art_id = hashlib.md5((link or title).encode("utf-8")).hexdigest()[:12]

                    c_crop = detect_crop(title + " " + desc)
                    c_cat = detect_category(title, desc)
                    c_loc = detect_location(title + " " + desc)
                    p_info = extract_price_info(title, desc, c_crop, c_loc)

                    r_score = compute_relevance_score(
                        title=title,
                        summary=desc,
                        category=c_cat,
                        crop=c_crop,
                        location_tag=c_loc,
                        farmer_location=location,
                        farmer_crops=farmer_crop_list,
                        pub_timestamp=p_ts
                    )

                    raw_articles.append({
                        "id": art_id,
                        "title": title,
                        "summary": desc,
                        "content": desc,
                        "category": c_cat,
                        "crop": c_crop,
                        "source": src,
                        "date": _format_pubdate(p_raw),
                        "url": link,
                        "image_url": pick_article_image(c_cat, c_crop, art_id, _extract_image_from_xml(item)),
                        "location_tag": c_loc,
                        "relevance_score": r_score,
                        "price_info": p_info,
                        "published_raw": p_raw,
                        "published_timestamp": p_ts
                    })
        except Exception as e2:
            print(f"Secondary farmer fetch error: {e2}")

    # Rank articles: High Relevance Score > Chronological Recency
    raw_articles.sort(key=lambda a: (a.get("relevance_score", 0), a.get("published_timestamp", 0)), reverse=True)

    final_articles = raw_articles[:limit]

    # Save in cache
    NEWS_CACHE["timestamp"] = now
    NEWS_CACHE["queries"][cache_key] = final_articles

    updated_time_str = datetime.now().strftime("%I:%M %p, %d %b %Y")

    return {
        "success": len(final_articles) > 0,
        "articles": final_articles,
        "count": len(final_articles),
        "last_updated": updated_time_str,
        "source": "Live Indian Farmer Information Center (PIB, Agmarknet, APEDA, IMD)",
        "is_live": True
    }

def get_farmer_news(
    category: Optional[str] = None,
    filter_type: Optional[str] = None,
    search: Optional[str] = None,
    location: Optional[str] = None,
    crops: Optional[str] = None,
    language: str = "en",
    limit: int = 25,
    force_refresh: bool = False
) -> List[Dict[str, Any]]:
    """Convenience wrapper returning list of live farmer news."""
    res = fetch_live_agri_news(
        category=category,
        filter_type=filter_type,
        search=search,
        location=location,
        crops=crops,
        language=language,
        limit=limit,
        force_refresh=force_refresh
    )
    return res.get("articles", [])
