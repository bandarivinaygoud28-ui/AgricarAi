import { LanguageCode } from '../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  
  // Navigation Modules
  navDashboard: string;
  navDetect: string;
  navAdvisory: string;
  navWeather: string;
  navMarketPrices: string;
  navAssistant: string;
  navHistory: string;
  navNews: string;
  navResources: string;
  navProfile: string;
  navLogin: string;
  navLogout: string;

  // 5-Step Disease Workflow
  step1Title: string;
  step1Subtitle: string;
  step2Title: string;
  step2Subtitle: string;
  step3Title: string;
  step3Subtitle: string;
  step4Title: string;
  step4Subtitle: string;
  step5Title: string;
  
  btnContinue: string;
  btnBack: string;
  btnAnalyze: string;
  btnRetake: string;
  btnRemove: string;
  btnSaveHistory: string;
  btnAskAssistant: string;
  btnSaved: string;

  // Crops
  cropTomato: string;
  cropPaddy: string;
  cropCotton: string;
  cropMaize: string;
  cropChilli: string;
  cropPotato: string;

  // Plant Parts / Affected Areas
  areaLeaf: string;
  areaStem: string;
  areaFruit: string;
  areaGrain: string;
  areaFlower: string;
  areaRoot: string;

  // Photo Guidance
  goodPhotoTitle: string;
  goodPhotoTips: string[];
  badPhotoTitle: string;
  badPhotoTips: string[];
  dragDropText: string;
  browseFiles: string;
  takeCameraPhoto: string;
  useGallery: string;
  photoLimit: string;

  // AI Scanning Statuses
  scanStage1: string;
  scanStage2: string;
  scanStage3: string;
  scanStage4: string;

  // Crop Health Report
  reportTitle: string;
  confidence: string;
  severity: string;
  symptoms: string;
  cause: string;
  immediateActions: string;
  treatmentGuidance: string;
  treatmentDisclaimer: string;
  preventionGuidance: string;
  weatherRiskTitle: string;
  marketPricesTitle: string;

  // Market Prices
  marketPricesHeader: string;
  marketPricesSubtitle: string;
  avgPrice: string;
  highestPrice: string;
  lowestPrice: string;
  lastUpdated: string;
  modalPrice: string;
  minPrice: string;
  maxPrice: string;
  filterCrop: string;
  filterState: string;
  filterDistrict: string;
  filterMarket: string;
  priceTrend7Day: string;
  priceTrend30Day: string;
  aiMarketInsightTitle: string;
  ogdAttribution: string;
  demoNotice: string;
  noMarketData: string;

  // Weather
  weatherHeader: string;
  weatherSubtitle: string;
  searchFarmLocation: string;
  searchLocationPlaceholder: string;
  useCurrentLocation: string;
  refreshWeather: string;
  feelsLike: string;
  humidity: string;
  windSpeed: string;
  rainfall: string;
  cloudCoverage: string;
  cropRiskModel: string;
  weatherUpdated: string;
  locatingGps: string;
  locationNotFound: string;
  weatherFetchError: string;
  sprayingAdvisory: string;
  diseaseRiskLevel: string;
  forecast5Day: string;

  // News
  newsHeader: string;
  newsSubtitle: string;
  searchNewsPlaceholder: string;
  refreshNews: string;
  readFullNews: string;
  newsUpdated: string;
  newsError: string;
  showingTailoredNews: string;
  allIndiaNews: string;
  newsCategories: Record<string, string>;
  newsFilters: Record<string, string>;
  readMore: string;

  // Farm Resources
  resourcesHeader: string;
  resourcesSubtitle: string;
  bookNow: string;
  checkingAvailability: string;
  availableSlots: string;
  bookingConfirmed: string;
  bookingHistory: string;
  resourceTypes: Record<string, string>;

  // AI Assistant
  assistantHeader: string;
  assistantSubtitle: string;
  assistantPlaceholder: string;
  diagnosisContextLoaded: string;
  voiceListening: string;
  voiceSpeak: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "AgriCare AI",
    tagline: "Smart AI Agricultural Assistant for Indian Farmers",

    navDashboard: "Dashboard",
    navDetect: "Detect Disease",
    navAdvisory: "Farmer Advisory",
    navWeather: "Weather",
    navMarketPrices: "Market Prices",
    navAssistant: "AI Assistant",
    navHistory: "Health History",
    navNews: "Farmer News",
    navResources: "Farm Resources",
    navProfile: "Farmer Profile",
    navLogin: "Login / Register",
    navLogout: "Logout",

    step1Title: "STEP 1: Select Your Crop",
    step1Subtitle: "Choose the crop you want to inspect for diseases or pests",
    step2Title: "STEP 2: Select Affected Area",
    step2Subtitle: "Where on the plant do you observe unusual symptoms?",
    step3Title: "STEP 3: Take / Upload Photo",
    step3Subtitle: "Capture a clear, well-lit photo of the affected plant part",
    step4Title: "STEP 4: AI Analysis in Progress",
    step4Subtitle: "Our multi-layer neural model is diagnosing pathogens and symptoms",
    step5Title: "STEP 5: Crop Health Report",

    btnContinue: "Continue →",
    btnBack: "← Back",
    btnAnalyze: "Analyze with AI →",
    btnRetake: "Retake Photo",
    btnRemove: "Remove",
    btnSaveHistory: "Save to Crop Health History",
    btnAskAssistant: "Ask AI Assistant About This Report",
    btnSaved: "Saved to History ✓",

    cropTomato: "Tomato",
    cropPaddy: "Paddy (Rice)",
    cropCotton: "Cotton",
    cropMaize: "Maize (Corn)",
    cropChilli: "Chilli",
    cropPotato: "Potato",

    areaLeaf: "Leaf",
    areaStem: "Stem",
    areaFruit: "Fruit / Boll",
    areaGrain: "Grain / Cob",
    areaFlower: "Flower",
    areaRoot: "Root",

    goodPhotoTitle: "Good Photo (High Accuracy)",
    goodPhotoTips: [
      "Clear, sharp focus on the diseased spot",
      "Well-lit with natural daylight",
      "Close-up with minimal background clutter"
    ],
    badPhotoTitle: "Bad Photo (May Cause Errors)",
    badPhotoTips: [
      "Blurry, shaky, or out-of-focus camera",
      "Too dark or heavy shadows",
      "Too far away with multiple confusing objects"
    ],
    dragDropText: "Drag and drop your crop photo here, or",
    browseFiles: "Browse Photo Gallery",
    takeCameraPhoto: "Open Camera",
    useGallery: "Choose from Files",
    photoLimit: "JPG, PNG or WEBP (Max 10 MB)",

    scanStage1: "1. Image checked & quality verified...",
    scanStage2: "2. Visual symptoms and lesion patterns detected...",
    scanStage3: "3. Pathogen species & severity identified...",
    scanStage4: "4. Advisory, treatment & market insights prepared...",

    reportTitle: "CROP HEALTH REPORT",
    confidence: "Diagnostic Confidence",
    severity: "Severity Level",
    symptoms: "Observed Symptoms",
    cause: "Underlying Cause",
    immediateActions: "Immediate Recommended Actions",
    treatmentGuidance: "Treatment Guidance",
    treatmentDisclaimer: "Treatment information is provided for educational guidance. Follow local agricultural department recommendations and product labels. Consult a qualified agricultural expert before applying pesticides or other chemical treatments.",
    preventionGuidance: "Long-Term Prevention & Management",
    weatherRiskTitle: "Weather-Based Disease Risk",
    marketPricesTitle: "Current Market Prices for This Crop",

    marketPricesHeader: "Market Prices",
    marketPricesSubtitle: "Official Agricultural Commodity Prices across Indian Mandis (OGD)",
    avgPrice: "Average Price",
    highestPrice: "Highest Price",
    lowestPrice: "Lowest Price",
    lastUpdated: "Last Updated",
    modalPrice: "Modal Price",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    filterCrop: "Select Commodity / Crop",
    filterState: "Select State",
    filterDistrict: "Select District",
    filterMarket: "Search Market Name",
    priceTrend7Day: "7-Day Price Trend",
    priceTrend30Day: "30-Day Price Trend",
    aiMarketInsightTitle: "AI Market Insight",
    ogdAttribution: "Source: Government of India Open Government Data Platform (data.gov.in)",
    demoNotice: "Demo Data – Connect Government OGD API for live/latest market data",
    noMarketData: "No market price data was found for the selected filters.",

    weatherHeader: "Agricultural Weather & Risk",
    weatherSubtitle: "Real-time agro-meteorological advisories, disease risks, and spraying windows",
    searchFarmLocation: "Search Farm Location",
    searchLocationPlaceholder: "Search village, town, city, district, state (e.g., Kolar, Karimnagar)...",
    useCurrentLocation: "Use My Current Location",
    refreshWeather: "Refresh Weather",
    feelsLike: "Feels like",
    humidity: "Relative Humidity",
    windSpeed: "Wind Speed",
    rainfall: "Rainfall / Precipitation",
    cloudCoverage: "Cloud Coverage",
    cropRiskModel: "Crop Risk Model",
    weatherUpdated: "Updated at",
    locatingGps: "Locating your farm via GPS...",
    locationNotFound: "Location not found. Please enter a valid village, town, city, or district.",
    weatherFetchError: "Unable to load live weather. Please check connection and refresh.",
    sprayingAdvisory: "Chemical Spraying Advisory",
    diseaseRiskLevel: "Weather-Induced Disease Risk",
    forecast5Day: "5-Day Agricultural Forecast",

    newsHeader: "Agricultural Market News",
    newsSubtitle: "Real-time mandi arrivals, MSP procurement, commodity prices, and policy updates for Indian farmers",
    searchNewsPlaceholder: "Search agricultural news (e.g. Paddy, Onion, Maize, MSP, Export, Tomato)...",
    refreshNews: "Refresh News",
    readFullNews: "Read Full News",
    newsUpdated: "Last updated",
    newsError: "Unable to fetch the latest market news. Please try again.",
    showingTailoredNews: "Prioritizing market news for",
    allIndiaNews: "All India Agricultural Markets",
    newsCategories: {
      "All": "All Topics",
      "🌾 Paddy / Rice": "🌾 Paddy / Rice",
      "🌽 Maize": "🌽 Maize",
      "🧅 Onion": "🧅 Onion",
      "🥔 Potato": "🥔 Potato",
      "🍅 Tomato": "🍅 Tomato",
      "🌶️ Chilli": "🌶️ Chilli",
      "🫘 Pulses": "🫘 Pulses",
      "🍬 Sugar": "🍬 Sugar",
      "🌻 Oilseeds": "🌻 Oilseeds",
      "📈 Mandi / Commodity Market": "📈 Mandi / Commodity Market",
      "🏛️ MSP": "🏛️ MSP",
      "🏛️ Government / Agriculture Policy": "🏛️ Government / Agriculture Policy",
      "🌾 General Agriculture": "🌾 General Agriculture"
    },
    newsFilters: {
      "All": "All News",
      "Mandi": "Mandi",
      "Crop Prices": "Crop Prices",
      "MSP": "MSP",
      "Government": "Government",
      "Export/Import": "Export/Import",
      "Weather & Agriculture": "Weather & Agriculture"
    },
    readMore: "Read Summary",

    resourcesHeader: "Farm Resources & Booking",
    resourcesSubtitle: "Rent certified tractors, harvesters, JCBs, and precision drone spraying services",
    bookNow: "Book Resource",
    checkingAvailability: "Check Date & Time Availability",
    availableSlots: "Available Time Slots",
    bookingConfirmed: "Booking Confirmed! Provider will call you.",
    bookingHistory: "My Resource Bookings",
    resourceTypes: {
      "Tractor": "Tractors",
      "JCB": "JCB / Earthmovers",
      "Drone Spraying": "Drone Spraying",
      "Harvester": "Harvesters",
      "Agricultural Equipment": "Farm Machinery"
    },

    assistantHeader: "AI Farmer Assistant",
    assistantSubtitle: "Ask anything about crops, active diagnoses, market prices, weather, or machinery",
    assistantPlaceholder: "Type your question or tap the microphone to speak...",
    diagnosisContextLoaded: "Active Diagnosis Context Loaded",
    voiceListening: "Listening... speak clearly",
    voiceSpeak: "Voice Readout"
  },

  te: {
    appName: "అగ్రికేర్ AI",
    tagline: "భారతీయ రైతులకు స్మార్ట్ AI వ్యవసాయ సహాయకుడు",

    navDashboard: "డాష్‌బోర్డ్",
    navDetect: "తెగులు గుర్తింపు",
    navAdvisory: "రైతు సలహాలు",
    navWeather: "వాతావరణం",
    navMarketPrices: "మార్కెట్ ధరలు",
    navAssistant: "AI సహాయకుడు",
    navHistory: "ఆరోగ్య చరిత్ర",
    navNews: "రైతు వార్తలు",
    navResources: "వ్యవసాయ యంత్రాలు",
    navProfile: "రైతు ప్రొఫైల్",
    navLogin: "లాగిన్ / రిజిస్టర్",
    navLogout: "లాగౌట్",

    step1Title: "దశ 1: మీ పంటను ఎంచుకోండి",
    step1Subtitle: "మీరు పరిశీలించాలనుకుంటున్న పంటను ఎంచుకోండి",
    step2Title: "దశ 2: దెబ్బతిన్న భాగాన్ని ఎంచుకోండి",
    step2Subtitle: "మొక్కపై తెగులు లక్షణాలు ఎక్కడ కనిపిస్తున్నాయి?",
    step3Title: "దశ 3: ఫోటో తీయండి / అప్‌లోడ్ చేయండి",
    step3Subtitle: "దెబ్బతిన్న భాగం స్పష్టంగా కనిపించేలా ఫోటో తీయండి",
    step4Title: "దశ 4: AI విశ్లేషణ జరుగుతోంది",
    step4Subtitle: "మా న్యూరల్ మోడల్ తెగులు మరియు లక్షణాలను విశ్లేషిస్తోంది",
    step5Title: "దశ 5: పంట ఆరోగ్య నివేదిక",

    btnContinue: "కొనసాగించండి →",
    btnBack: "← వెనుకకు",
    btnAnalyze: "AI తో విశ్లేషించండి →",
    btnRetake: "మళ్ళీ తీయండి",
    btnRemove: "తొలగించు",
    btnSaveHistory: "చరిత్రలో భద్రపరచు",
    btnAskAssistant: "ఈ నివేదికపై AI ని అడగండి",
    btnSaved: "చరిత్రలో భద్రపరచబడింది ✓",

    cropTomato: "టమాట",
    cropPaddy: "వరి",
    cropCotton: "పత్తి",
    cropMaize: "మొక్కజొన్న",
    cropChilli: "మిర్చి",
    cropPotato: "బంగాళాదుంప",

    areaLeaf: "ఆకు",
    areaStem: "కాండం",
    areaFruit: "కాయ / కాయ",
    areaGrain: "ధాన్యం / కంకి",
    areaFlower: "పువ్వు",
    areaRoot: "వేరు",

    goodPhotoTitle: "మంచి ఫోటో (ఖచ్చితమైన ఫలితాలు)",
    goodPhotoTips: [
      "తెగులు మచ్చపై స్పష్టమైన కెమెరా ఫోకస్",
      "సహజ వెలుతురులో తీసిన ఫోటో",
      "సమీపంలో తీసిన క్లోజప్ ఫోటో"
    ],
    badPhotoTitle: "తప్పు ఫోటో (ఫలితాలు సరిగ్గా రావు)",
    badPhotoTips: [
      "మసకగా లేదా కదిలిన ఫోటో",
      "చాలా చీకటిగా ఉన్న ఫోటో",
      "చాలా దూరం నుండి తీసిన ఫోటో"
    ],
    dragDropText: "పంట ఫోటోను ఇక్కడ వేయండి, లేదా",
    browseFiles: "గ్యాలరీ నుండి ఎంచుకోండి",
    takeCameraPhoto: "కెమెరా తెరవండి",
    useGallery: "ఫైల్స్ నుండి ఎంచుకోండి",
    photoLimit: "JPG, PNG లేదా WEBP (గరిష్టంగా 10 MB)",

    scanStage1: "1. చిత్రం నాణ్యత తనిఖీ పూర్తయింది...",
    scanStage2: "2. తెగులు మచ్చల లక్షణాలు గుర్తించబడ్డాయి...",
    scanStage3: "3. తెగులు రకం మరియు తీవ్రత విశ్లేషించబడింది...",
    scanStage4: "4. నివారణ మందులు మరియు మార్కెట్ వివరాలు సిద్ధమయ్యాయి...",

    reportTitle: "పంట ఆరోగ్య నివేదిక",
    confidence: "విశ్వసనీయత శాతం",
    severity: "తీవ్రత స్థాయి",
    symptoms: "గుర్తించిన లక్షణాలు",
    cause: "తెగులు రావడానికి కారణం",
    immediateActions: "తక్షణమే చేయవలసిన పనులు",
    treatmentGuidance: "నివారణ మందుల సలహా",
    treatmentDisclaimer: "నివారణ సమాచారం అవగాహన కొరకు మాత్రమే. రసాయన మందులు వాడే ముందు వ్యవసాయ శాఖ సిఫార్సులను మరియు నిపుణుల సలహాలను పాటించండి.",
    preventionGuidance: "దీర్ఘకాలిక నివారణ చర్యలు",
    weatherRiskTitle: "వాతావరణ ఆధారిత తెగులు ప్రమాదం",
    marketPricesTitle: "ఈ పంట ప్రస్తుత మార్కెట్ ధరలు",

    marketPricesHeader: "మార్కెట్ ధరలు",
    marketPricesSubtitle: "భారత ప్రభుత్వ మార్కెట్ యార్డుల (OGD) తాజా ధరల వివరాలు",
    avgPrice: "సగటు ధర",
    highestPrice: "గరిష్ట ధర",
    lowestPrice: "కనిష్ట ధర",
    lastUpdated: "తాజా తేదీ",
    modalPrice: "ప్రధాన ధర",
    minPrice: "కనిష్ట ధర",
    maxPrice: "గరిష్ట ధర",
    filterCrop: "పంటను ఎంచుకోండి",
    filterState: "రాష్ట్రం",
    filterDistrict: "జిల్లా",
    filterMarket: "మార్కెట్ పేరు శోధించండి",
    priceTrend7Day: "7 రోజుల ధరల సరళి",
    priceTrend30Day: "30 రోజుల ధరల సరళి",
    aiMarketInsightTitle: "AI మార్కెట్ విశ్లేషణ",
    ogdAttribution: "మూలం: భారత ప్రభుత్వ ఓపెన్ డేటా ప్లాట్‌ఫామ్ (data.gov.in)",
    demoNotice: "డెమో డేటా – ప్రత్యక్ష ధరల కోసం ప్రభుత్వ OGD API ని అనుసంధానించండి",
    noMarketData: "ఎంచుకున్న వివరాలకు మార్కెట్ ధరల సమాచారం లభించలేదు.",

    weatherHeader: "వ్యవసాయ వాతావరణం & సూచనలు",
    weatherSubtitle: "వర్షపాతం, తేమ మరియు మందులు పిచికారీ చేయడానికి అనుకూల సమయాలు",
    searchFarmLocation: "వ్యవసాయ స్థలాన్ని శోధించండి",
    searchLocationPlaceholder: "గ్రామం, పట్టణం, నగరం, జిల్లా లేదా రాష్ట్రం శోధించండి...",
    useCurrentLocation: "నా ప్రస్తుత లొకేషన్ ఉపయోగించండి",
    refreshWeather: "వాతావరణాన్ని రిఫ్రెష్ చేయండి",
    feelsLike: "అనిపించే ఉష్ణోగ్రత",
    humidity: "గాలిలో తేమ",
    windSpeed: "గాలి వేగం",
    rainfall: "వర్షపాతం",
    cloudCoverage: "మేఘాల కవరేజ్",
    cropRiskModel: "పంట తెగులు మోడల్",
    weatherUpdated: "నవీకరణ సమయం",
    locatingGps: "GPS ద్వారా లొకేషన్ గుర్తిస్తోంది...",
    locationNotFound: "స్థానం కనుగొనబడలేదు. దయచేసి సరైన గ్రామం లేదా జిల్లా పేరును శోధించండి.",
    weatherFetchError: "వాతావరణ సమాచారం పొందలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.",
    sprayingAdvisory: "మందుల పిచికారీ అనుకూలత",
    diseaseRiskLevel: "వాతావరణ తెగులు ప్రమాదం",
    forecast5Day: "5 రోజుల వాతావరణ అంచనా",

    newsHeader: "వ్యవసాయ మార్కెట్ వార్తలు",
    newsSubtitle: "దేశవ్యాప్త వ్యవసాయ మార్కెట్లు, మద్దతు ధరలు (MSP), ధరల హెచ్చుతగ్గులు మరియు ప్రభుత్వ విధానాలు",
    searchNewsPlaceholder: "వ్యవసాయ వార్తలను శోధించండి (వరి, ఉల్లి, మొక్కజొన్న, టమాటా, MSP)...",
    refreshNews: "వార్తలను రిఫ్రెష్ చేయండి",
    readFullNews: "పూర్తి వార్త చదవండి",
    newsUpdated: "చివరిగా నవీకరించబడింది",
    newsError: "తాజా మార్కెట్ వార్తలను పొందలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.",
    showingTailoredNews: "ప్రాంతీయ మార్కెట్ వార్తలు",
    allIndiaNews: "జాతీయ వ్యవసాయ మార్కెట్లు",
    newsCategories: {
      "All": "అన్ని విభాగాలు",
      "🌾 Paddy / Rice": "🌾 వరి / ధాన్యం",
      "🌽 Maize": "🌽 మొక్కజొన్న",
      "🧅 Onion": "🧅 ఉల్లిపాయ",
      "🥔 Potato": "🥔 బంగాళాదుంప",
      "🍅 Tomato": "🍅 టమాటా",
      "🌶️ Chilli": "🌶️ మిర్చి",
      "🫘 Pulses": "🫘 పప్పుధాన్యాలు",
      "🍬 Sugar": "🍬 చెరకు / చక్కెర",
      "🌻 Oilseeds": "🌻 నూనెగింజలు",
      "📈 Mandi / Commodity Market": "📈 మార్కెట్ యార్డులు / మండి",
      "🏛️ MSP": "🏛️ మద్దతు ధర (MSP)",
      "🏛️ Government / Agriculture Policy": "🏛️ వ్యవసాయ విధానాలు & పథకాలు",
      "🌾 General Agriculture": "🌾 సాధారణ వ్యవసాయం"
    },
    newsFilters: {
      "All": "అన్ని వార్తలు",
      "Mandi": "మండి ధరలు",
      "Crop Prices": "పంటల ధరలు",
      "MSP": "మద్దతు ధర (MSP)",
      "Government": "ప్రభుత్వ పథకాలు",
      "Export/Import": "ఎగుమతి/దిగుమతి",
      "Weather & Agriculture": "వాతావరణం & వ్యవసాయం"
    },
    readMore: "సారాంశం చూడండి",

    resourcesHeader: "వ్యవసాయ యంత్రాలు & బుకింగ్",
    resourcesSubtitle: "ట్రాక్టర్లు, హార్వెస్టర్లు, జేసీబీలు మరియు డ్రోన్ స్ప్రేయింగ్ అద్దెకు బుక్ చేసుకోండి",
    bookNow: "ఇప్పుడే బుక్ చేయండి",
    checkingAvailability: "తేదీ & సమయం లభ్యత తనిఖీ",
    availableSlots: "అందుబాటులో ఉన్న సమయాలు",
    bookingConfirmed: "బుకింగ్ విజయవంతమైంది! యజమాని మిమ్మల్ని సంప్రదిస్తారు.",
    bookingHistory: "నా బుకింగ్స్",
    resourceTypes: {
      "Tractor": "ట్రాక్టర్లు",
      "JCB": "జేసీబీ / ఎర్త్‌మూవర్స్",
      "Drone Spraying": "డ్రోన్ స్ప్రేయింగ్",
      "Harvester": "వరి కోత యంత్రాలు",
      "Agricultural Equipment": "వ్యవసాయ పరికరాలు"
    },

    assistantHeader: "AI రైతు సహాయకుడు",
    assistantSubtitle: "పంట తెగుళ్లు, మార్కెట్ ధరలు, వాతావరణం లేదా యంత్రాల గురించి ఏదైనా అడగండి",
    assistantPlaceholder: "మీ ప్రశ్నను టైప్ చేయండి లేదా మైక్ నొక్కి మాట్లాడండి...",
    diagnosisContextLoaded: "నివేదిక వివరాలు అనుసంధానించబడ్డాయి",
    voiceListening: "వింటున్నాము... స్పష్టంగా మాట్లాడండి",
    voiceSpeak: "వాయిస్ రీడవుట్"
  },

  hi: {
    appName: "एग्रीकेयर AI",
    tagline: "भारतीय किसानों के लिए स्मार्ट AI कृषि सहायक",

    navDashboard: "डैशबोर्ड",
    navDetect: "रोग पहचान",
    navAdvisory: "किसान सलाह",
    navWeather: "मौसम",
    navMarketPrices: "मंडी भाव (Market Prices)",
    navAssistant: "AI सहायक",
    navHistory: "स्वास्थ्य इतिहास",
    navNews: "किसान समाचार",
    navResources: "कृषि संसाधन",
    navProfile: "किसान प्रोफ़ाइल",
    navLogin: "लॉगिन / रजिस्टर",
    navLogout: "लॉगआउट",

    step1Title: "चरण 1: अपनी फसल चुनें",
    step1Subtitle: "उस फसल का चयन करें जिसकी आप जांच करना चाहते हैं",
    step2Title: "चरण 2: प्रभावित भाग चुनें",
    step2Subtitle: "पौधे के किस हिस्से पर असामान्य लक्षण दिख रहे हैं?",
    step3Title: "चरण 3: फोटो लें / अपलोड करें",
    step3Subtitle: "रोगग्रस्त हिस्से की स्पष्ट एवं साफ रोशनी वाली फोटो लें",
    step4Title: "चरण 4: AI विश्लेषण जारी है",
    step4Subtitle: "हमारा न्यूरल मॉडल रोग व लक्षणों का विश्लेषण कर रहा है",
    step5Title: "चरण 5: फसल स्वास्थ्य रिपोर्ट",

    btnContinue: "आगे बढ़ें →",
    btnBack: "← वापस",
    btnAnalyze: "AI से विश्लेषण करें →",
    btnRetake: "दोबारा फोटो लें",
    btnRemove: "हटाएं",
    btnSaveHistory: "इतिहास में सहेजें",
    btnAskAssistant: "इस रिपोर्ट पर AI से पूछें",
    btnSaved: "इतिहास में सहेजा गया ✓",

    cropTomato: "टमाटर",
    cropPaddy: "धान (चावल)",
    cropCotton: "कपास",
    cropMaize: "मक्का",
    cropChilli: "मिर्च",
    cropPotato: "आलू",

    areaLeaf: "पत्ता",
    areaStem: "तना",
    areaFruit: "फल / टिंडा",
    areaGrain: "दाना / भुट्टा",
    areaFlower: "फूल",
    areaRoot: "जड़",

    goodPhotoTitle: "अच्छी फोटो (सटीक परिणाम)",
    goodPhotoTips: [
      "रोगग्रस्त धब्बे पर स्पष्ट फोकस",
      "प्राकृतिक व अच्छी रोशनी में ली गई फोटो",
      "बिना अनावश्यक बैकग्राउंड की नजदीकी फोटो"
    ],
    badPhotoTitle: "खराब फोटो (गलत परिणाम संभव)",
    badPhotoTips: [
      "धुंधली या हिलती हुई फोटो",
      "बहुत अंधेरी या छाया वाली फोटो",
      "बहुत दूर से ली गई फोटो"
    ],
    dragDropText: "फसल की फोटो यहाँ खींचें, या",
    browseFiles: "गैलरी से चुनें",
    takeCameraPhoto: "कैमरा खोलें",
    useGallery: "फ़ाइलों से चुनें",
    photoLimit: "JPG, PNG या WEBP (अधिकतम 10 MB)",

    scanStage1: "1. फोटो गुणवत्ता की जांच पूरी हुई...",
    scanStage2: "2. रोग के लक्षण और पैटर्न पहचाने गए...",
    scanStage3: "3. रोगाणु प्रजाति और गंभीरता की पहचान की गई...",
    scanStage4: "4. उपचार, सलाह और मंडी भाव तैयार किए गए...",

    reportTitle: "फसल स्वास्थ्य रिपोर्ट",
    confidence: "सटीकता प्रतिशत",
    severity: "गंभीरता स्तर",
    symptoms: "देखे गए लक्षण",
    cause: "रोग का मूल कारण",
    immediateActions: "त्वरित आवश्यक कदम",
    treatmentGuidance: "उपचार सलाह",
    treatmentDisclaimer: "उपचार जानकारी केवल शैक्षिक मार्गदर्शन के लिए है। रासायनिक कीटनाशकों का प्रयोग करने से पहले कृषि विशेषज्ञ की सलाह लें और लेबल निर्देशों का पालन करें।",
    preventionGuidance: "दीर्घकालिक रोकथाम और प्रबंधन",
    weatherRiskTitle: "मौसम आधारित रोग जोखिम",
    marketPricesTitle: "इस फसल के वर्तमान मंडी भाव",

    marketPricesHeader: "मंडी भाव (Market Prices)",
    marketPricesSubtitle: "भारत सरकार के ओपन डेटा पोर्टल (OGD) से प्राप्त ताजा मंडी भाव",
    avgPrice: "औसत भाव",
    highestPrice: "उच्चतम भाव",
    lowestPrice: "न्यूनतम भाव",
    lastUpdated: "अंतिम अपडेट",
    modalPrice: "मॉडल भाव",
    minPrice: "न्यूनतम भाव",
    maxPrice: "अधिकतम भाव",
    filterCrop: "फसल चुनें",
    filterState: "राज्य चुनें",
    filterDistrict: "जिला चुनें",
    filterMarket: "मंडी का नाम खोजें",
    priceTrend7Day: "7-दिवसीय मूल्य रुझान",
    priceTrend30Day: "30-दिवसीय मूल्य रुझान",
    aiMarketInsightTitle: "AI मंडी विश्लेषण",
    ogdAttribution: "स्रोत: भारत सरकार ओपन गवर्नमेंट डेटा प्लेटफॉर्म (data.gov.in)",
    demoNotice: "डेमो डेटा – लाइव डेटा हेतु सरकारी OGD API कनेक्ट करें",
    noMarketData: "चुने गए फिल्टर के लिए कोई मंडी भाव नहीं मिला।",

    weatherHeader: "कृषि मौसम एवं रोग जोखिम",
    weatherSubtitle: "वास्तविक समय मौसम सलाह, रोग जोखिम और कीटनाशक छिड़काव समय",
    searchFarmLocation: "खेत का स्थान खोजें",
    searchLocationPlaceholder: "गाँव, कस्बा, शहर, जिला या राज्य खोजें...",
    useCurrentLocation: "मेरी वर्तमान लोकेशन का उपयोग करें",
    refreshWeather: "मौसम रिफ्रेश करें",
    feelsLike: "महसूस तापमान",
    humidity: "हवा में नमी",
    windSpeed: "हवा की गति",
    rainfall: "वर्षा / वर्षण",
    cloudCoverage: "बादलों का आवरण",
    cropRiskModel: "फसल जोखिम मॉडल",
    weatherUpdated: "अपडेट समय",
    locatingGps: "GPS द्वारा स्थान खोजा जा रहा है...",
    locationNotFound: "स्थान नहीं मिला। कृपया सही गाँव, शहर या जिले का नाम दर्ज करें।",
    weatherFetchError: "मौसम डेटा लोड नहीं हो सका। कृपया पुनः प्रयास करें।",
    sprayingAdvisory: "कीटनाशक छिड़काव सलाह",
    diseaseRiskLevel: "मौसम जनित रोग जोखिम",
    forecast5Day: "5-दिवसीय कृषि मौसम पूर्वानुमान",

    newsHeader: "कृषि मंडी एवं बाजार समाचार",
    newsSubtitle: "देश भर की मंडियों के भाव, MSP खरीद, आयात-निर्यात और सरकारी कृषि नीतियां",
    searchNewsPlaceholder: "कृषि समाचार खोजें (धान, प्याज, मक्का, टमाटर, MSP, निर्यात)...",
    refreshNews: "समाचार रिफ्रेश करें",
    readFullNews: "पूरी खबर पढ़ें",
    newsUpdated: "अंतिम अपडेट समय",
    newsError: "ताजा मंडी समाचार प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।",
    showingTailoredNews: "प्राथमिकता मंडी समाचार",
    allIndiaNews: "अखिल भारतीय कृषि बाजार",
    newsCategories: {
      "All": "सभी विषय",
      "🌾 Paddy / Rice": "🌾 धान / चावल",
      "🌽 Maize": "🌽 मक्का",
      "🧅 Onion": "🧅 प्याज",
      "🥔 Potato": "🥔 आलू",
      "🍅 Tomato": "🍅 टमाटर",
      "🌶️ Chilli": "🌶️ मिर्च",
      "🫘 Pulses": "🫘 दलहन / दालें",
      "🍬 Sugar": "🍬 गन्ना / चीनी",
      "🌻 Oilseeds": "🌻 तिलहन",
      "📈 Mandi / Commodity Market": "📈 मंडी एवं कमोडिटी बाजार",
      "🏛️ MSP": "🏛️ न्यूनतम समर्थन मूल्य (MSP)",
      "🏛️ Government / Agriculture Policy": "🏛️ कृषि नीतियां एवं योजनाएं",
      "🌾 General Agriculture": "🌾 सामान्य कृषि"
    },
    newsFilters: {
      "All": "सभी समाचार",
      "Mandi": "मंडी भाव",
      "Crop Prices": "फसल कीमतें",
      "MSP": "एमएसपी (MSP)",
      "Government": "सरकारी नीतियां",
      "Export/Import": "निर्यात/आयात",
      "Weather & Agriculture": "मौसम एवं कृषि"
    },
    readMore: "संक्षेप देखें",

    resourcesHeader: "कृषि संसाधन एवं बुकिंग",
    resourcesSubtitle: "ट्रैक्टर, हार्वेस्टर, जेसीबी और ड्रोन छिड़काव सेवा किराए पर लें",
    bookNow: "अभी बुक करें",
    checkingAvailability: "तारीख और समय की उपलब्धता जांचें",
    availableSlots: "उपलब्ध समय स्लॉट",
    bookingConfirmed: "बुकिंग पक्की हो गई! सेवा प्रदाता आपसे संपर्क करेगा।",
    bookingHistory: "मेरी बुकिंग्स",
    resourceTypes: {
      "Tractor": "ट्रैक्टर",
      "JCB": "जेसीबी / अर्थमूवर",
      "Drone Spraying": "ड्रोन छिड़काव",
      "Harvester": "हार्वेस्टर",
      "Agricultural Equipment": "कृषि उपकरण"
    },

    assistantHeader: "AI किसान सहायक",
    assistantSubtitle: "फसल रोग, मंडी भाव, मौसम या कृषि उपकरण के बारे में कुछ भी पूछें",
    assistantPlaceholder: "अपना प्रश्न लिखें या माइक पर बोलें...",
    diagnosisContextLoaded: "सक्रिय रिपोर्ट संदर्भ लोड किया गया",
    voiceListening: "सुन रहे हैं... स्पष्ट बोलें",
    voiceSpeak: "आवाज़ में सुनें"
  }
};
