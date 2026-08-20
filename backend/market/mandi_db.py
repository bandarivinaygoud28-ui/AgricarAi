import math
from typing import Dict, Any, List, Optional
from datetime import datetime

# ============================================================
# COMPREHENSIVE INDIAN APMC MANDIS & VEGETABLE MARKETS DATABASE
# ============================================================

ALL_MANDIS: List[Dict[str, Any]] = [
    # --- TELANGANA ---
    {
        "id": "tel_shamshabad",
        "name": "Shamshabad Market",
        "district": "Ranga Reddy",
        "state": "Telangana",
        "lat": 17.2600,
        "lon": 78.3970,
        "type": "Vegetable & Agricultural Market",
        "apmc_code": "TS-RR-01"
    },
    {
        "id": "tel_bowenpally",
        "name": "Bowenpally Market (APMC)",
        "district": "Hyderabad",
        "state": "Telangana",
        "lat": 17.4720,
        "lon": 78.4870,
        "type": "Major Vegetable Wholesale APMC",
        "apmc_code": "TS-HYD-01"
    },
    {
        "id": "tel_gudimalkapur",
        "name": "Gudimalkapur Market",
        "district": "Hyderabad",
        "state": "Telangana",
        "lat": 17.3820,
        "lon": 78.4350,
        "type": "Vegetable & Flower Market Yard",
        "apmc_code": "TS-HYD-02"
    },
    {
        "id": "tel_lbnagar",
        "name": "L.B. Nagar / Gaddiannaram APMC",
        "district": "Hyderabad",
        "state": "Telangana",
        "lat": 17.3590,
        "lon": 78.5430,
        "type": "Fruit & Grain APMC Yard",
        "apmc_code": "TS-HYD-03"
    },
    {
        "id": "tel_shadnagar",
        "name": "Shadnagar Market Yard",
        "district": "Ranga Reddy",
        "state": "Telangana",
        "lat": 17.0700,
        "lon": 78.2000,
        "type": "Grain & Vegetable APMC",
        "apmc_code": "TS-RR-02"
    },
    {
        "id": "tel_enumamula",
        "name": "Warangal (Enumamula) Market Yard",
        "district": "Warangal",
        "state": "Telangana",
        "lat": 17.9730,
        "lon": 79.6050,
        "type": "Asia's 2nd Largest Grain & Chilli Yard",
        "apmc_code": "TS-WGL-01"
    },
    {
        "id": "tel_jangaon",
        "name": "Jangaon Agricultural Market",
        "district": "Jangaon",
        "state": "Telangana",
        "lat": 17.7200,
        "lon": 79.1600,
        "type": "Grain & Cotton Market Yard",
        "apmc_code": "TS-JGN-01"
    },
    {
        "id": "tel_karimnagar",
        "name": "Karimnagar Market Yard",
        "district": "Karimnagar",
        "state": "Telangana",
        "lat": 18.4386,
        "lon": 79.1288,
        "type": "Paddy & Cotton APMC",
        "apmc_code": "TS-KMR-01"
    },
    {
        "id": "tel_nizamabad",
        "name": "Nizamabad Market Yard",
        "district": "Nizamabad",
        "state": "Telangana",
        "lat": 18.6725,
        "lon": 78.0941,
        "type": "Major Turmeric & Maize APMC",
        "apmc_code": "TS-NZB-01"
    },
    {
        "id": "tel_khammam",
        "name": "Khammam Chilli Yard",
        "district": "Khammam",
        "state": "Telangana",
        "lat": 17.2473,
        "lon": 80.1514,
        "type": "Leading Red Chilli & Cotton Market",
        "apmc_code": "TS-KHM-01"
    },
    {
        "id": "tel_miryalaguda",
        "name": "Miryalaguda Paddy Market",
        "district": "Nalgonda",
        "state": "Telangana",
        "lat": 16.8700,
        "lon": 79.5600,
        "type": "Major Rice & Paddy Trading Hub",
        "apmc_code": "TS-NLG-01"
    },
    {
        "id": "tel_suryapet",
        "name": "Suryapet APMC Yard",
        "district": "Suryapet",
        "state": "Telangana",
        "lat": 17.1400,
        "lon": 79.6200,
        "type": "Grain & Pulse Market Yard",
        "apmc_code": "TS-SRY-01"
    },
    {
        "id": "tel_adilabad",
        "name": "Adilabad Cotton Yard",
        "district": "Adilabad",
        "state": "Telangana",
        "lat": 19.6600,
        "lon": 78.5300,
        "type": "Raw Cotton APMC",
        "apmc_code": "TS-ADB-01"
    },
    {
        "id": "tel_siddipet",
        "name": "Siddipet Market Yard",
        "district": "Siddipet",
        "state": "Telangana",
        "lat": 18.1000,
        "lon": 78.8500,
        "type": "Vegetable & Grain Market",
        "apmc_code": "TS-SDP-01"
    },
    {
        "id": "tel_mahbubnagar",
        "name": "Mahbubnagar APMC",
        "district": "Mahbubnagar",
        "state": "Telangana",
        "lat": 16.7400,
        "lon": 78.0000,
        "type": "Groundnut & Maize Market",
        "apmc_code": "TS-MBN-01"
    },

    # --- ANDHRA PRADESH ---
    {
        "id": "ap_guntur",
        "name": "Guntur Mirchi Yard",
        "district": "Guntur",
        "state": "Andhra Pradesh",
        "lat": 16.3067,
        "lon": 80.4365,
        "type": "Asia's Largest Chilli Market",
        "apmc_code": "AP-GNT-01"
    },
    {
        "id": "ap_madanapalle",
        "name": "Madanapalle Tomato Market",
        "district": "Annamayya",
        "state": "Andhra Pradesh",
        "lat": 13.5500,
        "lon": 78.5000,
        "type": "India's Largest Tomato Wholesale Market",
        "apmc_code": "AP-CTR-01"
    },
    {
        "id": "ap_gollapudi",
        "name": "Vijayawada Gollapudi Market",
        "district": "NTR",
        "state": "Andhra Pradesh",
        "lat": 16.5400,
        "lon": 80.5800,
        "type": "Commercial Wholesale APMC",
        "apmc_code": "AP-NTR-01"
    },
    {
        "id": "ap_kakinada",
        "name": "Kakinada Market Yard",
        "district": "Kakinada",
        "state": "Andhra Pradesh",
        "lat": 16.9891,
        "lon": 82.2475,
        "type": "Paddy & Coconut Trading Center",
        "apmc_code": "AP-KKD-01"
    },
    {
        "id": "ap_kurnool",
        "name": "Kurnool APMC",
        "district": "Kurnool",
        "state": "Andhra Pradesh",
        "lat": 15.8281,
        "lon": 78.0373,
        "type": "Onion & Groundnut Market Yard",
        "apmc_code": "AP-KNL-01"
    },
    {
        "id": "ap_tirupati",
        "name": "Tirupati Market Yard",
        "district": "Tirupati",
        "state": "Andhra Pradesh",
        "lat": 13.6288,
        "lon": 79.4192,
        "type": "Vegetable & Fruit APMC",
        "apmc_code": "AP-TPT-01"
    },
    {
        "id": "ap_anantapur",
        "name": "Anantapur Groundnut Yard",
        "district": "Anantapur",
        "state": "Andhra Pradesh",
        "lat": 14.6819,
        "lon": 77.6006,
        "type": "Groundnut & Millet Center",
        "apmc_code": "AP-ATP-01"
    },

    # --- KARNATAKA ---
    {
        "id": "ka_kolar",
        "name": "Kolar APMC Market",
        "district": "Kolar",
        "state": "Karnataka",
        "lat": 13.1367,
        "lon": 78.1292,
        "type": "Major South India Tomato APMC",
        "apmc_code": "KA-KLR-01"
    },
    {
        "id": "ka_yeshwanthpur",
        "name": "Bangalore Yeshwanthpur APMC",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "lat": 13.0238,
        "lon": 77.5529,
        "type": "Mega Wholesale Agricultural Hub",
        "apmc_code": "KA-BLR-01"
    },
    {
        "id": "ka_byadagi",
        "name": "Byadagi Chilli Market",
        "district": "Haveri",
        "state": "Karnataka",
        "lat": 14.6800,
        "lon": 75.4800,
        "type": "Specialty Byadagi Chilli Yard",
        "apmc_code": "KA-HVR-01"
    },
    {
        "id": "ka_davanagere",
        "name": "Davanagere APMC",
        "district": "Davanagere",
        "state": "Karnataka",
        "lat": 14.4644,
        "lon": 75.9218,
        "type": "Maize & Grain Market",
        "apmc_code": "KA-DVG-01"
    },
    {
        "id": "ka_belagavi",
        "name": "Belagavi APMC Yard",
        "district": "Belagavi",
        "state": "Karnataka",
        "lat": 15.8497,
        "lon": 74.4977,
        "type": "Vegetable & Jaggery Hub",
        "apmc_code": "KA-BLG-01"
    },
    {
        "id": "ka_mysuru",
        "name": "Mysuru Bandipalya APMC",
        "district": "Mysuru",
        "state": "Karnataka",
        "lat": 12.2700,
        "lon": 76.6700,
        "type": "Paddy & Vegetable Market",
        "apmc_code": "KA-MYS-01"
    },
    {
        "id": "ka_raichur",
        "name": "Raichur Cotton Market",
        "district": "Raichur",
        "state": "Karnataka",
        "lat": 16.2076,
        "lon": 77.3463,
        "type": "Cotton & Paddy APMC",
        "apmc_code": "KA-RCH-01"
    },

    # --- MAHARASHTRA ---
    {
        "id": "mh_pimpalgaon",
        "name": "Pimpalgaon Baswant APMC",
        "district": "Nashik",
        "state": "Maharashtra",
        "lat": 20.1700,
        "lon": 73.9800,
        "type": "Leading Tomato & Grape Market",
        "apmc_code": "MH-NSK-01"
    },
    {
        "id": "mh_lasalgaon",
        "name": "Lasalgaon Onion APMC",
        "district": "Nashik",
        "state": "Maharashtra",
        "lat": 20.1500,
        "lon": 74.2300,
        "type": "Asia's Largest Onion Market",
        "apmc_code": "MH-NSK-02"
    },
    {
        "id": "mh_nashik",
        "name": "Nashik APMC Market",
        "district": "Nashik",
        "state": "Maharashtra",
        "lat": 19.9975,
        "lon": 73.7898,
        "type": "Vegetable & Fruit Yard",
        "apmc_code": "MH-NSK-03"
    },
    {
        "id": "mh_vashi",
        "name": "Navi Mumbai Vashi APMC",
        "district": "Thane",
        "state": "Maharashtra",
        "lat": 19.0770,
        "lon": 73.0030,
        "type": "Central Mumbai Terminal APMC",
        "apmc_code": "MH-MUM-01"
    },
    {
        "id": "mh_pune",
        "name": "Pune Gultekdi APMC",
        "district": "Pune",
        "state": "Maharashtra",
        "lat": 18.4900,
        "lon": 73.8650,
        "type": "Major Vegetable Wholesale Center",
        "apmc_code": "MH-PUN-01"
    },
    {
        "id": "mh_nagpur",
        "name": "Nagpur Cotton & Orange Yard",
        "district": "Nagpur",
        "state": "Maharashtra",
        "lat": 21.1458,
        "lon": 79.0882,
        "type": "Central India Mandi",
        "apmc_code": "MH-NGP-01"
    },
    {
        "id": "mh_yavatmal",
        "name": "Yavatmal Cotton APMC",
        "district": "Yavatmal",
        "state": "Maharashtra",
        "lat": 20.3888,
        "lon": 78.1204,
        "type": "Vidarbha Cotton Yard",
        "apmc_code": "MH-YTL-01"
    },

    # --- GUJARAT ---
    {
        "id": "gj_rajkot",
        "name": "Rajkot APMC Market",
        "district": "Rajkot",
        "state": "Gujarat",
        "lat": 22.3039,
        "lon": 70.8022,
        "type": "Groundnut & Cotton Market",
        "apmc_code": "GJ-RJK-01"
    },
    {
        "id": "gj_surat",
        "name": "Surat APMC",
        "district": "Surat",
        "state": "Gujarat",
        "lat": 21.1702,
        "lon": 72.8311,
        "type": "Vegetable & Banana Market",
        "apmc_code": "GJ-SRT-01"
    },
    {
        "id": "gj_gondal",
        "name": "Gondal APMC Yard",
        "district": "Rajkot",
        "state": "Gujarat",
        "lat": 21.9619,
        "lon": 70.7923,
        "type": "Chilli, Onion & Groundnut Hub",
        "apmc_code": "GJ-GDL-01"
    },
    {
        "id": "gj_unjha",
        "name": "Unjha Spice APMC",
        "district": "Mehsana",
        "state": "Gujarat",
        "lat": 23.8037,
        "lon": 72.3926,
        "type": "World's Largest Cumin & Spice Market",
        "apmc_code": "GJ-UNJ-01"
    },

    # --- PUNJAB & HARYANA ---
    {
        "id": "pb_khanna",
        "name": "Khanna Grain Market",
        "district": "Ludhiana",
        "state": "Punjab",
        "lat": 30.7000,
        "lon": 76.2200,
        "type": "Asia's Largest Grain Market",
        "apmc_code": "PB-LDH-01"
    },
    {
        "id": "pb_jalandhar",
        "name": "Jalandhar City APMC",
        "district": "Jalandhar",
        "state": "Punjab",
        "lat": 31.3260,
        "lon": 75.5762,
        "type": "Potato & Wheat Market",
        "apmc_code": "PB-JAL-01"
    },
    {
        "id": "hr_karnal",
        "name": "Karnal APMC Yard",
        "district": "Karnal",
        "state": "Haryana",
        "lat": 29.6857,
        "lon": 76.9905,
        "type": "Basmati Rice Trading Center",
        "apmc_code": "HR-KNL-01"
    },

    # --- UTTAR PRADESH & BIHAR ---
    {
        "id": "up_agra",
        "name": "Agra Potato APMC",
        "district": "Agra",
        "state": "Uttar Pradesh",
        "lat": 27.1767,
        "lon": 78.0081,
        "type": "Major Potato Trading Yard",
        "apmc_code": "UP-AGR-01"
    },
    {
        "id": "up_varanasi",
        "name": "Varanasi APMC Yard",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "lat": 25.3176,
        "lon": 82.9739,
        "type": "Eastern UP Vegetable & Grain Hub",
        "apmc_code": "UP-VNS-01"
    },
    {
        "id": "up_lucknow",
        "name": "Lucknow Naveen Mandi",
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "lat": 26.8467,
        "lon": 80.9462,
        "type": "Vegetable & Fruit Mandi",
        "apmc_code": "UP-LKO-01"
    },
    {
        "id": "br_gulabbagh",
        "name": "Purnea (Gulabbagh) APMC",
        "district": "Purnea",
        "state": "Bihar",
        "lat": 25.7771,
        "lon": 87.4753,
        "type": "India's Largest Maize Trading Hub",
        "apmc_code": "BR-PRN-01"
    },

    # --- RAJASTHAN, MP, WEST BENGAL, TAMIL NADU, KERALA, ODISHA ---
    {
        "id": "rj_jaipur",
        "name": "Jaipur Muhana Mandi",
        "district": "Jaipur",
        "state": "Rajasthan",
        "lat": 26.8000,
        "lon": 75.7500,
        "type": "Terminal Vegetable & Fruit Market",
        "apmc_code": "RJ-JPR-01"
    },
    {
        "id": "mp_indore",
        "name": "Indore Choithram APMC",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "lat": 22.7196,
        "lon": 75.8577,
        "type": "Soybean, Wheat & Potato Yard",
        "apmc_code": "MP-IND-01"
    },
    {
        "id": "wb_sheoraphuli",
        "name": "Sheoraphuli Market",
        "district": "Hooghly",
        "state": "West Bengal",
        "lat": 22.7564,
        "lon": 88.3370,
        "type": "Vegetable & Potato Market",
        "apmc_code": "WB-HGH-01"
    },
    {
        "id": "tn_koyambedu",
        "name": "Koyambedu Wholesale Market",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "lat": 13.0694,
        "lon": 80.1914,
        "type": "Mega Perishables Market Complex",
        "apmc_code": "TN-CHN-01"
    },
    {
        "id": "tn_oddanchatram",
        "name": "Oddanchatram Vegetable Market",
        "district": "Dindigul",
        "state": "Tamil Nadu",
        "lat": 10.4800,
        "lon": 77.7400,
        "type": "Major Vegetable Trading Hub",
        "apmc_code": "TN-DGL-01"
    },
    {
        "id": "kl_aluva",
        "name": "Aluva Vegetable Market",
        "district": "Ernakulam",
        "state": "Kerala",
        "lat": 10.1076,
        "lon": 76.3516,
        "type": "Wholesale Vegetable & Spice Yard",
        "apmc_code": "KL-EKM-01"
    },
    {
        "id": "or_chhatrabazar",
        "name": "Cuttack Chhatra Bazar",
        "district": "Cuttack",
        "state": "Odisha",
        "lat": 20.4625,
        "lon": 85.8828,
        "type": "Largest Vegetable Mandi in Odisha",
        "apmc_code": "OR-CTC-01"
    }
]


# ============================================================
# REALISTIC COMMODITY PRICING MATRIX BY REGION/MANDI
# (Updated with standard daily agricultural mandi rates)
# ============================================================

MANDI_PRICE_PROFILES: Dict[str, Dict[str, Dict[str, Any]]] = {
    # Default rates across commodities (in Rs / Quintal)
    "_default": {
        "Tomato": {"modal": 2100, "min": 1700, "max": 2500, "variety": "Hybrid Red"},
        "Paddy": {"modal": 2450, "min": 2250, "max": 2650, "variety": "Common (BPT-5204)"},
        "Cotton": {"modal": 7500, "min": 7000, "max": 8000, "variety": "Medium Staple (Bt)"},
        "Chilli": {"modal": 18200, "min": 15500, "max": 20500, "variety": "Teja Dry"},
        "Maize": {"modal": 2180, "min": 1950, "max": 2350, "variety": "Yellow Hybrid"},
        "Onion": {"modal": 1850, "min": 1400, "max": 2200, "variety": "Nasik Red"},
        "Potato": {"modal": 1550, "min": 1250, "max": 1800, "variety": "Jyoti / Desi"},
        "Wheat": {"modal": 2350, "min": 2150, "max": 2550, "variety": "Lokwan / Sharbati"},
        "Groundnut": {"modal": 6200, "min": 5600, "max": 6700, "variety": "Bold Pod"},
        "Sugarcane": {"modal": 340, "min": 315, "max": 365, "variety": "Co-86032 (Factory MSP)"},
        "Soybean": {"modal": 4550, "min": 4100, "max": 4900, "variety": "Yellow Standard"},
        "Turmeric": {"modal": 13800, "min": 11500, "max": 15500, "variety": "Finger Salem/Nizamabad"}
    },

    # Market-specific adjustments
    "tel_shamshabad": {
        "Tomato": {"modal": 2200, "min": 1800, "max": 2600, "variety": "Hybrid Local Fresh"},
        "Paddy": {"modal": 2480, "min": 2300, "max": 2680, "variety": "Telangana Sona (RNR-15048)"},
        "Chilli": {"modal": 17800, "min": 15000, "max": 19800, "variety": "Green & Dry Mix"},
        "Cotton": {"modal": 7450, "min": 7000, "max": 7900, "variety": "Medium Staple"},
        "Onion": {"modal": 1900, "min": 1500, "max": 2250, "variety": "Maharashtrian Red"},
        "Potato": {"modal": 1600, "min": 1300, "max": 1850, "variety": "Agra White"},
        "Maize": {"modal": 2150, "min": 1950, "max": 2300, "variety": "Feed Yellow"}
    },

    "tel_bowenpally": {
        "Tomato": {"modal": 2450, "min": 2000, "max": 2800, "variety": "Grade-A Hybrid Red"},
        "Onion": {"modal": 2050, "min": 1650, "max": 2400, "variety": "Nashik Large Red"},
        "Potato": {"modal": 1720, "min": 1400, "max": 1980, "variety": "Hassan / UP Jyoti"},
        "Chilli": {"modal": 18500, "min": 16000, "max": 21000, "variety": "Guntur Grade-1"},
        "Paddy": {"modal": 2520, "min": 2350, "max": 2700, "variety": "Sona Masuri"},
        "Maize": {"modal": 2220, "min": 2000, "max": 2400, "variety": "Sweet & Hybrid"}
    },

    "tel_gudimalkapur": {
        "Tomato": {"modal": 2300, "min": 1900, "max": 2650, "variety": "Local Desi & Hybrid"},
        "Chilli": {"modal": 18100, "min": 15500, "max": 20200, "variety": "Teja Dry"},
        "Onion": {"modal": 1950, "min": 1550, "max": 2300, "variety": "Red Medium"},
        "Potato": {"modal": 1650, "min": 1350, "max": 1900, "variety": "Desi White"}
    },

    "tel_enumamula": {
        "Chilli": {"modal": 19200, "min": 16500, "max": 21800, "variety": "Wonder Hot / Teja"},
        "Cotton": {"modal": 7800, "min": 7350, "max": 8250, "variety": "Long Staple (DCH-32)"},
        "Paddy": {"modal": 2550, "min": 2380, "max": 2720, "variety": "BPT-5204 Super Fine"},
        "Maize": {"modal": 2200, "min": 2000, "max": 2380, "variety": "Yellow Hybrid"},
        "Tomato": {"modal": 2100, "min": 1750, "max": 2450, "variety": "Hybrid Red"},
        "Turmeric": {"modal": 14200, "min": 12000, "max": 16000, "variety": "Ghattur & Nizamabad"}
    },

    "ap_madanapalle": {
        "Tomato": {"modal": 2600, "min": 2100, "max": 3000, "variety": "Himsona / Abhinav Premium"},
        "Chilli": {"modal": 17500, "min": 15000, "max": 19500, "variety": "Local Fresh"},
        "Onion": {"modal": 1800, "min": 1450, "max": 2150, "variety": "Bellary Red"},
        "Groundnut": {"modal": 6300, "min": 5800, "max": 6800, "variety": "Kadiri Pod"}
    },

    "ka_kolar": {
        "Tomato": {"modal": 2550, "min": 2050, "max": 2950, "variety": "Kolar Super Hybrid"},
        "Potato": {"modal": 1680, "min": 1350, "max": 1950, "variety": "Kufri Jyoti"},
        "Paddy": {"modal": 2400, "min": 2200, "max": 2580, "variety": "JGL-1798"},
        "Maize": {"modal": 2140, "min": 1920, "max": 2320, "variety": "DeKalb Yellow"}
    },

    "ap_guntur": {
        "Chilli": {"modal": 20500, "min": 17500, "max": 23500, "variety": "Guntur Sannam (S4) / Teja"},
        "Cotton": {"modal": 7650, "min": 7200, "max": 8100, "variety": "Medium Staple"},
        "Paddy": {"modal": 2480, "min": 2280, "max": 2650, "variety": "MTU-1010"},
        "Tomato": {"modal": 2050, "min": 1700, "max": 2400, "variety": "Local Hybrid"}
    },

    "mh_lasalgaon": {
        "Onion": {"modal": 2250, "min": 1750, "max": 2650, "variety": "Lasalgaon Extra Red"},
        "Tomato": {"modal": 2000, "min": 1650, "max": 2350, "variety": "Abhinav"},
        "Wheat": {"modal": 2400, "min": 2200, "max": 2600, "variety": "Lokwan"}
    },

    "mh_pimpalgaon": {
        "Tomato": {"modal": 2150, "min": 1750, "max": 2550, "variety": "Abhinav / Red Peak"},
        "Onion": {"modal": 2180, "min": 1700, "max": 2580, "variety": "Garva Red"}
    }
}


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes accurate geodesic distance between two GPS coordinates (in km)
    using the Haversine formula.
    """
    R = 6371.0 # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def find_nearest_mandi(
    lat: float,
    lon: float,
    state_filter: Optional[str] = None
) -> Dict[str, Any]:
    """
    Finds the nearest verified APMC/vegetable mandi to the farmer's GPS coordinates.
    """
    mandis_with_dist = []
    for m in ALL_MANDIS:
        dist = haversine_distance(lat, lon, m["lat"], m["lon"])
        m_copy = dict(m)
        m_copy["distance_km"] = dist
        mandis_with_dist.append(m_copy)

    mandis_with_dist.sort(key=lambda x: x["distance_km"])

    if not mandis_with_dist:
        # Fallback default
        return ALL_MANDIS[0]

    return mandis_with_dist[0]


def get_nearby_mandis(
    lat: float,
    lon: float,
    limit: int = 6
) -> List[Dict[str, Any]]:
    """
    Returns list of mandis sorted strictly by geographic distance from the farmer.
    """
    mandis_with_dist = []
    for m in ALL_MANDIS:
        dist = haversine_distance(lat, lon, m["lat"], m["lon"])
        m_copy = dict(m)
        m_copy["distance_km"] = dist
        mandis_with_dist.append(m_copy)

    mandis_with_dist.sort(key=lambda x: x["distance_km"])
    return mandis_with_dist[:limit]
