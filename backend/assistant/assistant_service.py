from typing import Dict, Any, List, Optional
try:
    from market.market_service import get_market_prices
    from weather.weather_service import get_weather_data
except ImportError:
    from ..market.market_service import get_market_prices
    from ..weather.weather_service import get_weather_data

def process_assistant_query(
    message: str,
    language: str = "en", # en, te, hi
    diagnosis_context: Optional[Dict[str, Any]] = None,
    location: str = "Warangal, Telangana"
) -> Dict[str, Any]:
    """
    Intelligent agricultural assistant combining active diagnosis context,
    symptom diagnosis, real-time market queries, and localized weather insights.
    """
    msg_clean = message.lower().strip()
    lang = language.lower() if language in ("en", "te", "hi") else "en"

    # Crop recognition keywords
    detected_crop = None
    crop_keywords = {
        "Tomato": ["tomato", "టమాట", "టమాటా", "టమాటో", "टमाटर"],
        "Paddy": ["paddy", "rice", "వరి", "ధాన్యం", "धान", "चावल"],
        "Cotton": ["cotton", "పత్తి", "कपास"],
        "Maize": ["maize", "corn", "మొక్కజొన్న", "मक्का"],
        "Chilli": ["chilli", "chili", "mirchi", "మిర్చి", "మిరప", "मिर्च"],
        "Potato": ["potato", "బంగాళాదుంప", "ఆలూ", "आलू"]
    }

    for crop_name, keywords in crop_keywords.items():
        if any(kw in msg_clean for kw in keywords):
            detected_crop = crop_name
            break

    # 1. Active Diagnosis Context or Direct Disease / Symptom Questions
    disease_keywords = [
        "disease", "cure", "treatment", "medicine", "symptom", "spray", "prevent",
        "report", "leaf", "leaves", "yellow", "blast", "spots", "wilt", "pest", "fungus", "curl",
        "మందు", "రోగం", "నివారణ", "ఆకులు", "పసుపు", "తెగులు", "మచ్చలు", "పురుగులు", "ముడత", "అగ్గితెగులు",
        "దవా", "दवा", "रोग", "इलाज", "पत्ते", "पीले", "पीला", "धब्बे", "कीट", "फफूंद", "ब्लास्ट", "मुरझाना"
    ]

    is_disease_query = (
        bool(diagnosis_context and any(kw in msg_clean for kw in ["disease", "cure", "treatment", "medicine", "symptom", "spray", "prevent", "report", "leaf", "plant", "మందు", "రోగం", "నివారణ", "दवा", "रोग", "इलाज"])) or
        any(kw in msg_clean for kw in disease_keywords)
    )

    if is_disease_query:
        target_crop = (
            detected_crop or
            (diagnosis_context.get("crop") if diagnosis_context else "Tomato")
        )

        # Check for specific symptoms: Yellow leaves / Chlorosis / Early Blight / Nutrient Deficiency
        is_yellow_leaves = any(kw in msg_clean for kw in ["yellow", "పసుపు", "పీలే", "पीले", "पीला", "chlorosis"])
        is_blast = any(kw in msg_clean for kw in ["blast", "అగ్గితెగులు", "ब्लास्ट"])
        is_leaf_curl = any(kw in msg_clean for kw in ["curl", "ముడత", "మొజాయిక్", "मरोडिया", "curl virus"])

        if is_yellow_leaves and target_crop == "Tomato":
            if lang == "te":
                reply = (
                    "🍅 టమాటా పంటలో ఆకులు పసుపు రంగులోకి మారడానికి ప్రధాన కారణాలు మరియు నివారణ చర్యలు:\n\n"
                    "1. నత్రజని లేదా మెగ్నీషియం లోపం:\n"
                    "• 19-19-19 ఎరువును లీటరు నీటికి 5 గ్రాములు కలిపి పిచికారీ చేయండి.\n"
                    "• లేదా మెగ్నీషియం సల్ఫేట్ లీటరు నీటికి 5 గ్రాములు పిచికారీ చేయండి.\n\n"
                    "2. ఆకుమాడు లేదా ఫంగస్ తెగులు (Early Blight):\n"
                    "• మాంకోజెబ్ (Mancozeb 75% WP) లీటరు నీటికి 2.5 గ్రాములు లేదా కాపర్ ఆక్సిక్లోరైడ్ 3 గ్రాములు పిచికారీ చేయండి.\n\n"
                    "3. తెల్లదోమ లేదా రసం పీల్చే పురుగులు (Leaf Curl Virus):\n"
                    "• ఎసిఫేట్ 1.5 గ్రాములు లేదా ఇమిడాక్లోప్రిడ్ 0.5 మి.లీ లీటరు నీటికి కలిపి పిచికారీ చేయండి.\n\n"
                    "🌾 సలహా: నీటి పారుదల క్రమబద్ధీకరించండి మరియు పొలంలో నీరు నిల్వ ఉండకుండా చూసుకోండి."
                )
            elif lang == "hi":
                reply = (
                    "🍅 टमाटर की फसल में पत्ते पीले होने के मुख्य कारण और उपचार के उपाय:\n\n"
                    "1. पोषक तत्वों की कमी (नाइट्रोजन या मैग्नीशियम):\n"
                    "• एनपीके 19:19:19 का 5 ग्राम प्रति लीटर पानी में घोल बनाकर छिड़काव करें।\n"
                    "• या मैग्नीशियम सल्फेट 5 ग्राम प्रति लीटर पानी में मिलाकर स्प्रे करें।\n\n"
                    "2. अगेती झुलसा (Early Blight / फफूंद रोग):\n"
                    "• मैंकोजेब (Mancozeb 75% WP) 2.5 ग्राम या कॉपर ऑक्सीक्लोराइड 3 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।\n\n"
                    "3. सफेद मक्खी व रस चूसक कीट:\n"
                    "• इमिडाक्लोप्रिड 0.5 मिली या एसिफेट 1.5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।\n\n"
                    "🌾 सलाह: खेत में जलभराव न होने दें और संतुलित सिंचाई करें।"
                )
            else:
                reply = (
                    "🍅 Management for Yellow Leaves in Tomato Crop:\n\n"
                    "1. Nutrient Deficiency (Nitrogen / Magnesium):\n"
                    "• Foliar spray of NPK 19:19:19 @ 5g/liter or Magnesium Sulfate @ 5g/liter.\n\n"
                    "2. Early Blight / Fungal Infection:\n"
                    "• Spray Mancozeb 75% WP @ 2.5g/liter or Copper Oxychloride @ 3g/liter.\n\n"
                    "3. Whitefly / Sucking Pest Vector Control:\n"
                    "• Spray Imidacloprid 17.8% SL @ 0.5ml/liter or Acetamiprid @ 0.5g/liter.\n\n"
                    "🌾 Tip: Avoid water stagnation and inspect the underside of leaves regularly."
                )
            return {"response": reply, "topic": "diagnosis", "language": lang}

        if is_blast and target_crop == "Paddy":
            if lang == "te":
                reply = (
                    "🌾 వరి అగ్గితెగులు (Paddy Blast) నివారణ చర్యలు:\n\n"
                    "• ట్రైసైక్లాజోల్ 75% WP (Tricyclazole) లీటరు నీటికి 0.6 గ్రాములు పిచికారీ చేయండి.\n"
                    "• లేదా ఐసోప్రోథియోలేన్ (Isoprothiolane 40% EC) 1.5 మి.లీ లీటరు నీటికి పిచికారీ చేయండి.\n"
                    "• నత్రజని ఎరువుల అధిక వినియోగాన్ని తాత్కాలికంగా తగ్గించండి."
                )
            elif lang == "hi":
                reply = (
                    "🌾 धान के ब्लास्ट रोग (झोंका रोग) का नियंत्रण:\n\n"
                    "• ट्राइसाइक्लाजोल 75% WP 0.6 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।\n"
                    "• या आइसोप्रोथियोलेन 40% EC 1.5 मिली प्रति लीटर पानी में स्प्रे करें।\n"
                    "• यूरिया का अत्यधिक उपयोग तुरंत रोकें।"
                )
            else:
                reply = (
                    "🌾 Recommended Management for Paddy Blast Disease:\n\n"
                    "• Spray Tricyclazole 75% WP @ 0.6g/liter of water.\n"
                    "• Alternatively, spray Isoprothiolane 40% EC @ 1.5ml/liter.\n"
                    "• Reduce excess nitrogen top-dressing during disease incidence."
                )
            return {"response": reply, "topic": "diagnosis", "language": lang}

        # Active diagnosis context if present
        if diagnosis_context:
            crop = diagnosis_context.get("crop", target_crop)
            area = diagnosis_context.get("affected_area", "Foliage")
            disease = diagnosis_context.get("disease", "Identified Condition")
            severity = diagnosis_context.get("severity", "Moderate")
            treatments = diagnosis_context.get("treatment", [])
            actions = diagnosis_context.get("immediate_actions", [])

            treat_text = " • " + "\n • ".join(treatments[:2]) if treatments else "Follow recommended agricultural dosage."
            action_text = " • " + "\n • ".join(actions[:2]) if actions else "Isolate infected foliage."

            if lang == "te":
                reply = (
                    f"మీ {crop} ({area}) లో '{disease}' (తీవ్రత: {severity}) గుర్తించబడింది.\n\n"
                    f"🚨 తక్షణ చర్యలు:\n{action_text}\n\n"
                    f"💊 సిఫార్సు చేసిన నివారణ చర్యలు:\n{treat_text}\n\n"
                    f"గమనిక: క్రిమిసంహారకాలు వాడే ముందు స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి."
                )
            elif lang == "hi":
                reply = (
                    f"आपकी {crop} ({area}) में '{disease}' (गंभीरता: {severity}) पाई गई है।\n\n"
                    f"🚨 त्वरित कदम:\n{action_text}\n\n"
                    f"💊 उपचार व रोकथाम:\n{treat_text}\n\n"
                    f"नोट: रासायनिक कीटनाशकों का प्रयोग करने से पहले कृषि विशेषज्ञ की सलाह लें।"
                )
            else:
                reply = (
                    f"Regarding the diagnosis for your {crop} ({area}) with '{disease}' (Severity: {severity}):\n\n"
                    f"🚨 Immediate Actions:\n{action_text}\n\n"
                    f"💊 Recommended Management:\n{treat_text}\n\n"
                    f"Tip: Ensure adequate leaf dryness and adhere strictly to product label directions."
                )

            return {"response": reply, "topic": "diagnosis", "language": lang}

        # Generic Disease response for recognized crop
        if lang == "te":
            reply = (
                f"🌾 మీ {target_crop} పంట సంరక్షణ మరియు తెగుళ్ల నివారణ చర్యలు:\n\n"
                f"• ఆకులపై మచ్చలు లేదా తెగులు లక్షణాలు కనిపిస్తే నివారణ మందులు (ఫంగిసైడ్/ఇన్సెక్టిసైడ్) వెంటనే పిచికారీ చేయండి.\n"
                f"• తెగులు సోకిన కొమ్మలను తొలగించి నాశనం చేయండి.\n"
                f"• వివరణాత్మక సలహా కోసం తెగులు పేరు లేదా ఫోటోను 'Detect Disease' లో స్కాన్ చేయండి."
            )
        elif lang == "hi":
            reply = (
                f"🌾 आपकी {target_crop} फसल सुरक्षा एवं रोग नियंत्रण सलाह:\n\n"
                f"• यदि पत्तियों पर धब्बे या कीट का प्रकोप दिखे तो तुरंत अनुशंसित कीटनाशक/फफूंदनाशक का छिड़काव करें।\n"
                f"• रोगग्रस्त पत्तियों या टहनियों को काटकर नष्ट करें।\n"
                f"• सटीक पहचान के लिए 'Detect Disease' में जाकर पौधे की फोटो स्कैन करें।"
            )
        else:
            reply = (
                f"🌾 Crop Health Advisory for {target_crop}:\n\n"
                f"• Isolate diseased plant parts and apply recommended protective fungicide/insecticide.\n"
                f"• Ensure balanced nutrition and avoid over-irrigation.\n"
                f"• For detailed disease identification, scan an affected leaf photo in 'Detect Disease'."
            )
        return {"response": reply, "topic": "diagnosis", "language": lang}

    # 2. Check if user is asking about Market Prices
    market_keywords = ["price", "market", "rate", "cost", "quintal", "ధర", "మార్కెట్", "రేటు", "ఖరీదు", "भाव", "दाम", "मंडी", "बाजार"]
    if any(kw in msg_clean for kw in market_keywords):
        target_crop = detected_crop or "Tomato"
        market_info = get_market_prices(crop=target_crop)
        summary = market_info.get("summary", {})
        avg_p = summary.get("average_price", 0)
        high_p = summary.get("highest_price", 0)
        low_p = summary.get("lowest_price", 0)
        updated = market_info.get("last_updated", "Recent")
        source = market_info.get("source", "Government OGD / Demo Data")

        if lang == "te":
            reply = (
                f"💰 {target_crop} మార్కెట్ ధరల తాజా వివరాలు ({updated}):\n\n"
                f"• సగటు ధర: ₹{avg_p} / క్వింటాల్\n"
                f"• గరిష్ట ధర: ₹{high_p} / క్వింటాల్\n"
                f"• కనిష్ట ధర: ₹{low_p} / క్వింటాల్\n"
                f"మూలం: {source}\n\n"
                f"సూచన: రవాణా ఖర్చులు మరియు పంట నాణ్యతను బట్టి అమ్మకం నిర్ణయం తీసుకోండి."
            )
        elif lang == "hi":
            reply = (
                f"💰 {target_crop} मंडी भाव विवरण ({updated}):\n\n"
                f"• औसत भाव: ₹{avg_p} / क्विंटल\n"
                f"• उच्चतम भाव: ₹{high_p} / क्विंटल\n"
                f"• न्यूनतम भाव: ₹{low_p} / क्विंटल\n"
                f"स्रोत: {source}\n\n"
                f"सलाह: फसल की गुणवत्ता, परिवहन लागत और स्थानीय मांग को ध्यान में रखकर ही बिक्री का निर्णय लें।"
            )
        else:
            reply = (
                f"💰 Latest Market Prices for {target_crop} (As of {updated}):\n\n"
                f"• Average Modal Price: ₹{avg_p} per quintal\n"
                f"• Highest Price: ₹{high_p} per quintal\n"
                f"• Lowest Price: ₹{low_p} per quintal\n"
                f"Source: {source}\n\n"
                f"Advisory: Consider crop grade, transport logistics, and local market demand before choosing your selling time."
            )

        return {"response": reply, "topic": "market_prices", "language": lang}

    # 3. Check if user is asking about Weather
    weather_keywords = ["weather", "rain", "temperature", "humidity", "spray weather", "వాతావరణం", "వర్షం", "ఎండ", "मौसम", "बारिश", "तापमान", "छिड़काव"]
    if any(kw in msg_clean for kw in weather_keywords):
        weather = get_weather_data(location=location)
        curr = weather.get("current", {})
        ag_adv = weather.get("agricultural_advisory", {})
        t = curr.get("temp", 30)
        h = curr.get("humidity", 70)
        cond = curr.get("description", "Clear")
        spray_tip = ag_adv.get("spraying_advisory", "Conditions are generally normal.")

        if lang == "te":
            reply = (
                f"🌦️ {location} ప్రస్తుత వాతావరణం:\n\n"
                f"• ఉష్ణోగ్రత: {t}°C\n"
                f"• తేమ: {h}%\n"
                f"• పరిస్థితి: {cond}\n\n"
                f"🚜 వ్యవసాయ సూచన: {spray_tip}"
            )
        elif lang == "hi":
            reply = (
                f"🌦️ {location} वर्तमान मौसम स्थिति:\n\n"
                f"• तापमान: {t}°C\n"
                f"• आर्द्रता: {h}%\n"
                f"• स्थिति: {cond}\n\n"
                f"🚜 कृषि सलाह: {spray_tip}"
            )
        else:
            reply = (
                f"🌦️ Current Weather for {location}:\n\n"
                f"• Temperature: {t}°C (Feels like {curr.get('feels_like', t)}°C)\n"
                f"• Humidity: {h}%\n"
                f"• Conditions: {cond}\n\n"
                f"🚜 Agricultural Advisory: {spray_tip}"
            )

        return {"response": reply, "topic": "weather", "language": lang}

    # 4. Fallback: If only a crop name was mentioned without specifics, show its market price summary
    if detected_crop:
        market_info = get_market_prices(crop=detected_crop)
        summary = market_info.get("summary", {})
        avg_p = summary.get("average_price", 0)
        high_p = summary.get("highest_price", 0)
        low_p = summary.get("lowest_price", 0)
        updated = market_info.get("last_updated", "Recent")

        if lang == "te":
            reply = (
                f"💰 {detected_crop} మార్కెట్ ధరలు ({updated}):\n"
                f"సగటు ధర: ₹{avg_p}/క్వింటాల్ (గరిష్ట: ₹{high_p}, కనిష్ట: ₹{low_p}).\n\n"
                f"పంట తెగుళ్లు లేదా వాతావరణం గురించి సమాచారం కావాలంటే నిర్దిష్ట ప్రశ్న అడగండి."
            )
        elif lang == "hi":
            reply = (
                f"💰 {detected_crop} मंडी भाव ({updated}):\n"
                f"औसत भाव: ₹{avg_p}/क्विंटल (उच्चतम: ₹{high_p}, न्यूनतम: ₹{low_p}).\n\n"
                f"फसल रोग या मौसम की जानकारी के लिए कृपया स्पष्ट प्रश्न पूछें।"
            )
        else:
            reply = (
                f"💰 {detected_crop} Market Prices ({updated}):\n"
                f"Average: ₹{avg_p}/quintal (Max: ₹{high_p}, Min: ₹{low_p}).\n\n"
                f"Ask specific questions about disease management, spray suitability, or farm bookings!"
            )
        return {"response": reply, "topic": "market_prices", "language": lang}

    # 5. General Agricultural Guidance
    if lang == "te":
        reply = (
            f"నమస్కారం! నేను మీ అగ్రికేర్ AI వ్యవసాయ సహాయకుడిని. నేను మీకు ఈ క్రింది విషయాలలో సహాయపడగలను:\n\n"
            f"1. 🤖 పంట తెగుళ్ల గుర్తింపు మరియు నివారణ మందుల సలహాలు\n"
            f"2. 💰 లైవ్ మార్కెట్ ధరలు (టమాట, వరి, పత్తి, మొక్కజొన్న, మిర్చి, బంగాళాదుంప)\n"
            f"3. 🌦️ వాతావరణ సూచనలు మరియు స్ప్రేయింగ్ అనుకూలత\n"
            f"4. 🚜 వ్యవసాయ యంత్రాలు & డ్రోన్ బుకింగ్\n\n"
            f"దయచేసి మీ ప్రశ్నకు సంబంధించిన వివరాలను అడగండి."
        )
    elif lang == "hi":
        reply = (
            f"नमस्ते! मैं आपका एग्रीकेयर AI किसान सहायक हूँ। मैं आपकी निम्न विषयों में मदद कर सकता हूँ:\n\n"
            f"1. 🤖 फसल रोग पहचान और सटीक उपचार सलाह\n"
            f"2. 💰 सरकारी मंडी भाव (टमाटर, धान, कपास, मक्का, मिर्च, आलू)\n"
            f"3. 🌦️ मौसम पूर्वानुमान और छिड़काव सलाह\n"
            f"4. 🚜 कृषि उपकरण और ड्रोन सेवा बुकिंग\n\n"
            f"कृपया अपना प्रश्न पूछें।"
        )
    else:
        reply = (
            f"Hello! I am your AgriCare AI Farmer Assistant. How can I help you today?\n\n"
            f"• 🤖 Ask about crop disease diagnosis, immediate actions, and treatment\n"
            f"• 💰 Inquire about current Government Market Prices for commodities\n"
            f"• 🌦️ Check local weather risks and optimal spraying windows\n"
            f"• 🚜 Book tractors, harvesters, or agricultural drone spraying services\n\n"
            f"Feel free to type your question or use voice input!"
        )

    return {"response": reply, "topic": "general", "language": lang}
