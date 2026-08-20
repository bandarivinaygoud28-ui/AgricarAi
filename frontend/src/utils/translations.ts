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
  navSchemes: string;
  navHistory?: string;
  navNews: string;
  navResources: string;
  navProfile: string;
  navLogin: string;
  navLogout: string;

  // Extended Navigation / Module labels
  navDiseaseDetection: string;
  navCropAdvisory: string;
  navWeatherRisk: string;
  navGovtSchemes: string;
  navMarketNews: string;
  navKnowledgeCenter: string;
  navFarmResources: string;
  navMyProfile: string;

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

  // Additional Market Actions & Badges
  refreshPrices: string;
  searchMandis: string;
  updateGps: string;
  changeMandi: string;
  nearestMandi: string;
  otherNearbyMarkets: string;
  bestMarketToSell: string;
  getDirections: string;
  sortedByRoadDistance: string;
  roadDistance: string;
  byRoad: string;
  yourFarm: string;
  yourCrops: string;
  selectCrop: string;
  selectMarket: string;
  selectLanguage: string;
  allMarketCommodities: string;
  priceTrendHistory: string;
  tradedRange: string;
  wholesaleApprox: string;
  estFreight: string;
  topRate: string;
  viewMarket: string;
  marketCatalog: string;
  searchMarketPlaceholder: string;
  cardsView: string;
  tableView: string;
  days7: string;
  days30: string;
  commodity: string;
  marketApmc: string;
  districtState: string;
  arrivalDate: string;

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

  // AI Assistant & Voice AI
  assistantHeader: string;
  assistantSubtitle: string;
  assistantPlaceholder: string;
  diagnosisContextLoaded: string;
  voiceListening: string;
  voiceSpeak: string;
  voiceAI: string;
  voiceSettings: string;
  voiceTest: string;
  voiceReadout: string;
  voiceGenerating: string;
  voiceSpeaking: string;
  voiceReady: string;
  voicePause: string;
  voiceResume: string;
  voiceStop: string;
  voiceInput: string;
  voiceLanguage: string;
  voiceSpeed: string;
  voiceActiveEngine: string;
  voiceConfig: string;
  voiceUnavailable: string;
  clearChat: string;

  // Global / Common UI
  search: string;
  submit: string;
  save: string;
  cancel: string;
  back: string;
  next: string;
  loading: string;
  error: string;
  success: string;
  noResults: string;
  loadingPrices: string;
  updated: string;
  distance: string;
  kisanCallCenter: string;
  tollFree: string;
  online: string;
  modules: string;
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
    navSchemes: "Government Schemes",
    navHistory: "Health History",
    navNews: "Farmer News",
    navResources: "Farm Resources",
    navProfile: "Farmer Profile",
    navLogin: "Login / Register",
    navLogout: "Logout",

    navDiseaseDetection: "Disease Detection",
    navCropAdvisory: "Crop Advisory",
    navWeatherRisk: "Weather & Risk",
    navGovtSchemes: "Government Schemes",
    navMarketNews: "Market News",
    navKnowledgeCenter: "Knowledge Center",
    navFarmResources: "Farm Resources",
    navMyProfile: "My Profile",

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

    goodPhotoTitle: "Good Photo (Accurate Results)",
    goodPhotoTips: [
      "Sharp focus directly on the disease spot or symptom",
      "Taken in clear, natural daytime lighting",
      "Close-up view without distracting background"
    ],
    badPhotoTitle: "Bad Photo (Inaccurate / Retake Needed)",
    badPhotoTips: [
      "Blurry or shaky camera movement",
      "Too dark or shaded foliage",
      "Taken from too far away"
    ],
    dragDropText: "Drag and drop crop photo here, or",
    browseFiles: "Browse Gallery",
    takeCameraPhoto: "Open Camera",
    useGallery: "Choose from Files",
    photoLimit: "JPG, PNG, or WEBP (Max 10 MB)",

    scanStage1: "1. Image quality verified...",
    scanStage2: "2. Lesion patterns and foliage symptoms identified...",
    scanStage3: "3. Pathogen species and disease severity classified...",
    scanStage4: "4. Prescribing curative treatments and market rates...",

    reportTitle: "Crop Health Diagnosis Report",
    confidence: "Diagnosis Confidence",
    severity: "Severity Level",
    symptoms: "Identified Symptoms",
    cause: "Underlying Cause / Pathogen",
    immediateActions: "Immediate Action Required",
    treatmentGuidance: "Treatment & Chemical Advisory",
    treatmentDisclaimer: "Treatment recommendations are for educational guidance. Follow official state agricultural university guidelines and read pesticide product labels before application.",
    preventionGuidance: "Long-term Prevention & Cultural Practices",
    weatherRiskTitle: "Weather-Driven Disease Risk",
    marketPricesTitle: "Current Market Rates for This Crop",

    marketPricesHeader: "Market Prices",
    marketPricesSubtitle: "Live & daily APMC mandi wholesale rates with automatic nearest market detection",
    avgPrice: "Average Modal Price",
    highestPrice: "Highest Traded Rate",
    lowestPrice: "Lowest Traded Rate",
    lastUpdated: "Last Updated",
    modalPrice: "Modal Price",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    filterCrop: "Select Crop",
    filterState: "State",
    filterDistrict: "District",
    filterMarket: "Search Market Name",
    priceTrend7Day: "7-Day Price Trend",
    priceTrend30Day: "30-Day Price Trend",
    aiMarketInsightTitle: "Market Intelligence Advisory",
    ogdAttribution: "Source: Government of India Open Government Data Platform (data.gov.in)",
    demoNotice: "Real APMC Mandi Rates with Automated Road Distance",
    noMarketData: "No market price records found for this filter.",

    refreshPrices: "Refresh Prices",
    searchMandis: "Search Mandis",
    updateGps: "Update GPS",
    changeMandi: "Change Mandi",
    nearestMandi: "Nearest APMC Market",
    otherNearbyMarkets: "Other Nearby Markets (Switch Mandi)",
    bestMarketToSell: "Best Nearby Market to Sell",
    getDirections: "Get Directions",
    sortedByRoadDistance: "Sorted by road distance",
    roadDistance: "Road Distance",
    byRoad: "by road",
    yourFarm: "Your Farm",
    yourCrops: "Your Cultivated Crops (Priority)",
    selectCrop: "Select Crop for Market Pricing",
    selectMarket: "Select Market",
    selectLanguage: "Select Language",
    allMarketCommodities: "All Market Commodities",
    priceTrendHistory: "Price Trend History",
    tradedRange: "Traded Range",
    wholesaleApprox: "Wholesale Approx.",
    estFreight: "Est. Freight",
    topRate: "TOP RATE",
    viewMarket: "View Market",
    marketCatalog: "Indian APMC Mandi Directory",
    searchMarketPlaceholder: "Search market (e.g. Shamshabad, Bowenpally, Warangal, Kolar, Madanapalle, Guntur)...",
    cardsView: "Cards",
    tableView: "Table",
    days7: "7 Days",
    days30: "30 Days",
    commodity: "Commodity",
    marketApmc: "Market (APMC)",
    districtState: "District & State",
    arrivalDate: "Arrival Date",

    weatherHeader: "Agricultural Weather & Crop Risk",
    weatherSubtitle: "Real-time micro-weather insights, fungal disease risk models, and spraying safety windows",
    searchFarmLocation: "Search Farm Location",
    searchLocationPlaceholder: "Search village, town, city, district or state...",
    useCurrentLocation: "Use My GPS Location",
    refreshWeather: "Refresh Weather",
    feelsLike: "Feels Like",
    humidity: "Relative Humidity",
    windSpeed: "Wind Speed",
    rainfall: "Precipitation / Rain",
    cloudCoverage: "Cloud Cover",
    cropRiskModel: "Disease Risk Level",
    weatherUpdated: "Updated At",
    locatingGps: "Detecting GPS location...",
    locationNotFound: "Location not found. Please enter a valid village, town, or district name.",
    weatherFetchError: "Unable to load live weather data. Please try again.",
    sprayingAdvisory: "Spraying Advisory",
    diseaseRiskLevel: "Weather-Driven Disease Risk",
    forecast5Day: "5-Day Agricultural Forecast",

    newsHeader: "Agricultural Market & Commodity News",
    newsSubtitle: "Nationwide mandi arrivals, MSP procurement updates, export-import policies, and rural trends",
    searchNewsPlaceholder: "Search agricultural news (paddy, onion, maize, tomato, MSP, exports)...",
    refreshNews: "Refresh News",
    readFullNews: "Read Full Article",
    newsUpdated: "Last Updated",
    newsError: "Unable to fetch the latest market news. Please try again.",
    showingTailoredNews: "Priority Mandi News",
    allIndiaNews: "All India Agricultural News",
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

    resourcesHeader: "Farm Resources & Machinery Booking",
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
    voiceSpeak: "Voice Readout",
    voiceAI: "Voice AI",
    voiceSettings: "Voice Settings",
    voiceTest: "Test Voice",
    voiceReadout: "Voice Readout",
    voiceGenerating: "Generating voice...",
    voiceSpeaking: "Speaking...",
    voiceReady: "Ready",
    voicePause: "Pause",
    voiceResume: "Resume",
    voiceStop: "Stop Voice",
    voiceInput: "Voice Input",
    voiceLanguage: "Language",
    voiceSpeed: "Speed",
    voiceActiveEngine: "Active Cloud Engine",
    voiceConfig: "Cloud Neural Voice Configuration",
    voiceUnavailable: "Voice service temporarily unavailable. Please try again.",
    clearChat: "Clear Chat",

    search: "Search",
    submit: "Submit",
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    noResults: "No results found",
    loadingPrices: "Loading prices...",
    updated: "Updated",
    distance: "Distance",
    kisanCallCenter: "Kisan Call Center",
    tollFree: "Toll Free",
    online: "Online",
    modules: "Modules"
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
    navSchemes: "ప్రభుత్వ పథకాలు",
    navHistory: "ఆరోగ్య చరిత్ర",
    navNews: "రైతు వార్తలు",
    navResources: "వ్యవసాయ యంత్రాలు",
    navProfile: "రైతు ప్రొఫైల్",
    navLogin: "లాగిన్ / రిజిస్టర్",
    navLogout: "లాగౌట్",

    navDiseaseDetection: "తెగులు గుర్తింపు",
    navCropAdvisory: "పంట సలహాలు",
    navWeatherRisk: "వాతావరణం & ప్రమాదం",
    navGovtSchemes: "ప్రభుత్వ పథకాలు",
    navMarketNews: "మార్కెట్ వార్తలు",
    navKnowledgeCenter: "విజ్ఞాన కేంద్రం",
    navFarmResources: "వ్యవసాయ వనరులు",
    navMyProfile: "నా ప్రొఫైల్",

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
    cropPaddy: "వరి (ధాన్యం)",
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
    marketPricesSubtitle: "భారత ప్రభుత్వ మార్కెట్ యార్డుల (OGD) తాజా ధరల వివరాలు మరియు రోడ్డు దూరం",
    avgPrice: "సగటు ప్రధాన ధర",
    highestPrice: "గరిష్ట వ్యాపార ధర",
    lowestPrice: "కనిష్ట వ్యాపార ధర",
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
    ogdAttribution: "మూలం: భారత ప్రభుత్వ ఓపెన్ గవర్నమెంట్ డేటా ప్లాట్‌ఫారమ్ (data.gov.in)",
    demoNotice: "నిజమైన APMC మార్కెట్ ధరలు మరియు రోడ్డు దూరం",
    noMarketData: "ఈ ఫిల్టర్ కోసం మార్కెట్ ధరల రికార్డులు అందుబాటులో లేవు.",

    refreshPrices: "ధరలను రిఫ్రెష్ చేయండి",
    searchMandis: "మార్కెట్లను శోధించండి",
    updateGps: "GPS అప్‌డేట్ చేయండి",
    changeMandi: "మార్కెట్ మార్చండి",
    nearestMandi: "సమీప APMC మార్కెట్",
    otherNearbyMarkets: "ఇతర సమీప మార్కెట్లు (మార్కెట్ మార్చండి)",
    bestMarketToSell: "అమ్మకానికి ఉత్తమ సమీప మార్కెట్",
    getDirections: "దిశలను పొందండి",
    sortedByRoadDistance: "రోడ్డు దూరం ప్రకారం",
    roadDistance: "రోడ్డు దూరం",
    byRoad: "రోడ్డు మార్గం",
    yourFarm: "మీ పొలం",
    yourCrops: "మీరు పండించే పంటలు (ప్రాధాన్యత)",
    selectCrop: "ధరల కోసం పంటను ఎంచుకోండి",
    selectMarket: "మార్కెట్ ఎంచుకోండి",
    selectLanguage: "భాషను ఎంచుకోండి",
    allMarketCommodities: "అన్ని మార్కెట్ వస్తువులు",
    priceTrendHistory: "ధరల సరళి చరిత్ర",
    tradedRange: "వ్యాపార పరిధి",
    wholesaleApprox: "హోల్‌సేల్ సుమారు",
    estFreight: "అంచనా రవాణా ఖర్చు",
    topRate: "అత్యుత్తమ ధర",
    viewMarket: "మార్కెట్ చూడండి",
    marketCatalog: "భారతీయ APMC మార్కెట్ డైరెక్టరీ",
    searchMarketPlaceholder: "మార్కెట్ పేరు శోధించండి (ఉదా. శంషాబాద్, బోయిన్‌పల్లి, వరంగల్, కోలార్, గుంటూరు)...",
    cardsView: "కార్డులు",
    tableView: "పట్టిక",
    days7: "7 రోజులు",
    days30: "30 రోజులు",
    commodity: "పంట / వస్తువు",
    marketApmc: "మార్కెట్ (APMC)",
    districtState: "జిల్లా & రాష్ట్రం",
    arrivalDate: "వచ్చిన తేదీ",

    weatherHeader: "వ్యవసాయ వాతావరణం & పంట ప్రమాదం",
    weatherSubtitle: "నిజ-సమయ వాతావరణం, శిలీంధ్ర తెగుళ్ల ప్రమాదం మరియు మందులు స్ప్రే చేసే సరైన సమయం",
    searchFarmLocation: "పొలం స్థానాన్ని శోధించండి",
    searchLocationPlaceholder: "గ్రామం, పట్టణం, నగరం, జిల్లా లేదా రాష్ట్రం శోధించండి...",
    useCurrentLocation: "నా GPS స్థానాన్ని ఉపయోగించండి",
    refreshWeather: "వాతావరణం రిఫ్రెష్ చేయండి",
    feelsLike: "అనిపించే ఉష్ణోగ్రత",
    humidity: "గాలిలో తేమ",
    windSpeed: "గాలి వేగం",
    rainfall: "వర్షపాతం",
    cloudCoverage: "మేఘాల కవరేజ్",
    cropRiskModel: "తెగులు ప్రమాద స్థాయి",
    weatherUpdated: "అప్‌డేట్ సమయం",
    locatingGps: "GPS స్థానాన్ని గుర్తిస్తున్నాము...",
    locationNotFound: "స్థానం కనుగొనబడలేదు. దయచేసి సరైన గ్రామం లేదా జిల్లా పేరు నమోదు చేయండి.",
    weatherFetchError: "వాతావరణ సమాచారం లోడ్ కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    sprayingAdvisory: "స్ప్రేయింగ్ సలహా",
    diseaseRiskLevel: "వాతావరణ తెగులు ప్రమాదం",
    forecast5Day: "5 రోజుల వ్యవసాయ వాతావరణ అంచనా",

    newsHeader: "వ్యవసాయ మార్కెట్ వార్తలు",
    newsSubtitle: "దేశవ్యాప్త మార్కెట్ ధరలు, MSP కొనుగోళ్లు, ఎగుమతి విధానాలు మరియు గ్రామీణ వార్తలు",
    searchNewsPlaceholder: "వ్యవసాయ వార్తలు శోధించండి (వరి, ఉల్లి, మొక్కజొన్న, టమాట, MSP, ఎగుమతులు)...",
    refreshNews: "వార్తలను రిఫ్రెష్ చేయండి",
    readFullNews: "పూర్తి వార్త చదవండి",
    newsUpdated: "చివరిగా నవీకరించబడిన సమయం",
    newsError: "తాజా వార్తలు లోడ్ కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    showingTailoredNews: "ప్రాధాన్య మార్కెట్ వార్తలు",
    allIndiaNews: "అఖిల భారత వ్యవసాయ మార్కెట్ వార్తలు",
    newsCategories: {
      "All": "అన్ని అంశాలు",
      "🌾 Paddy / Rice": "🌾 వరి / బియ్యం",
      "🌽 Maize": "🌽 మొక్కజొన్న",
      "🧅 Onion": "🧅 ఉల్లిపాయ",
      "🥔 Potato": "🥔 బంగాళాదుంప",
      "🍅 Tomato": "🍅 టమాట",
      "🌶️ Chilli": "🌶️ మిర్చి",
      "🫘 Pulses": "🫘 పప్పుధాన్యాలు",
      "🍬 Sugar": "🍬 చెరకు / చక్కెర",
      "🌻 Oilseeds": "🌻 నూనెగింజలు",
      "📈 Mandi / Commodity Market": "📈 మార్కెట్ యార్డుల ధరలు",
      "🏛️ MSP": "🏛️ మద్దతు ధర (MSP)",
      "🏛️ Government / Agriculture Policy": "🏛️ ప్రభుత్వ వ్యవసాయ విధానాలు",
      "🌾 General Agriculture": "🌾 సాధారణ వ్యవసాయం"
    },
    newsFilters: {
      "All": "అన్ని వార్తలు",
      "Mandi": "మార్కెట్ ధరలు",
      "Crop Prices": "పంట ధరలు",
      "MSP": "మద్దతు ధర (MSP)",
      "Government": "ప్రభుత్వ విధానాలు",
      "Export/Import": "ఎగుమతి/దిగుమతి",
      "Weather & Agriculture": "వాతావరణం & వ్యవసాయం"
    },
    readMore: "సారాంశం చదవండి",

    resourcesHeader: "వ్యవసాయ యంత్రాలు & బుకింగ్",
    resourcesSubtitle: "ట్రాక్టర్లు, హార్వెస్టర్లు, జేసీబీలు మరియు డ్రోన్ స్ప్రేయింగ్ సేవలను అద్దెకు తీసుకోండి",
    bookNow: "ఇప్పుడే బుక్ చేయండి",
    checkingAvailability: "తేదీ మరియు సమయం లభ్యతను తనిఖీ చేయండి",
    availableSlots: "అందుబాటులో ఉన్న సమయాలు",
    bookingConfirmed: "బుకింగ్ విజయవంతమైంది! సేవా ప్రదాత మీకు ఫోన్ చేస్తారు.",
    bookingHistory: "నా బుకింగ్స్ చరిత్ర",
    resourceTypes: {
      "Tractor": "ట్రాక్టర్లు",
      "JCB": "జేసీబీ / ఎర్త్‌మూవర్లు",
      "Drone Spraying": "డ్రోన్ స్ప్రేయింగ్",
      "Harvester": "హార్వెస్టర్లు",
      "Agricultural Equipment": "వ్యవసాయ పరికరాలు"
    },

    assistantHeader: "AI రైతు సహాయకుడు",
    assistantSubtitle: "పంట తెగుళ్లు, మార్కెట్ ధరలు, వాతావరణం లేదా యంత్రాల గురించి ఏదైనా అడగండి",
    assistantPlaceholder: "మీ ప్రశ్నను టైప్ చేయండి లేదా మాట్లాడటానికి మైక్ నొక్కండి...",
    diagnosisContextLoaded: "సక్రియ వ్యాధి నివేదిక లోడ్ చేయబడింది",
    voiceListening: "వింటున్నాము... స్పష్టంగా మాట్లాడండి",
    voiceSpeak: "వాయిస్ రీడవుట్",
    voiceAI: "వాయిస్ AI",
    voiceSettings: "వాయిస్ సెట్టింగ్‌లు",
    voiceTest: "వాయిస్ పరీక్షించండి",
    voiceReadout: "వాయిస్ చదవండి",
    voiceGenerating: "వాయిస్ తయారవుతోంది...",
    voiceSpeaking: "మాట్లాడుతోంది...",
    voiceReady: "సిద్ధంగా ఉంది",
    voicePause: "పాజ్ చేయండి",
    voiceResume: "కొనసాగించండి",
    voiceStop: "వాయిస్ ఆపండి",
    voiceInput: "వాయిస్ ఇన్‌పుట్",
    voiceLanguage: "భాష",
    voiceSpeed: "వేగం",
    voiceActiveEngine: "యాక్టివ్ క్లౌడ్ ఇంజిన్",
    voiceConfig: "క్లౌడ్ న్యూరల్ వాయిస్ కాన్ఫిగరేషన్",
    voiceUnavailable: "వాయిస్ సేవ తాత్కాలికంగా అందుబాటులో లేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
    clearChat: "చాట్ క్లియర్ చేయండి",

    search: "శోధించండి",
    submit: "సమర్పించండి",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు చేయండి",
    back: "వెనుకకు",
    next: "తరువాత",
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    success: "విజయం",
    noResults: "ఫలితాలు కనుగొనబడలేదు",
    loadingPrices: "ధరలు లోడ్ అవుతున్నాయి...",
    updated: "నవీకరించబడింది",
    distance: "దూరం",
    kisanCallCenter: "కిసాన్ కాల్ సెంటర్",
    tollFree: "టోల్ ఫ్రీ",
    online: "ఆన్‌లైన్",
    modules: "విభాగాలు"
  },

  hi: {
    appName: "एग्रीकेयर AI",
    tagline: "भारतीय किसानों के लिए स्मार्ट AI कृषि सहायक",

    navDashboard: "डैशबोर्ड",
    navDetect: "रोग पहचान",
    navAdvisory: "किसान सलाह",
    navWeather: "मौसम",
    navMarketPrices: "मंडी भाव",
    navAssistant: "AI सहायक",
    navSchemes: "सरकारी योजनाएं",
    navHistory: "स्वास्थ्य इतिहास",
    navNews: "किसान समाचार",
    navResources: "कृषि संसाधन",
    navProfile: "किसान प्रोफ़ाइल",
    navLogin: "लॉगिन / रजिस्टर",
    navLogout: "लॉगआउट",

    navDiseaseDetection: "रोग पहचान",
    navCropAdvisory: "फसल सलाह",
    navWeatherRisk: "मौसम एवं जोखिम",
    navGovtSchemes: "सरकारी योजनाएं",
    navMarketNews: "मंडी समाचार",
    navKnowledgeCenter: "ज्ञान केंद्र",
    navFarmResources: "कृषि संसाधन",
    navMyProfile: "मेरी प्रोफ़ाइल",

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

    marketPricesHeader: "मंडी भाव",
    marketPricesSubtitle: "भारत सरकार के ओपन डेटा पोर्टल (OGD) से प्राप्त ताजा मंडी भाव एवं सड़क दूरी",
    avgPrice: "औसत मॉडल भाव",
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
    demoNotice: "सड़क दूरी के साथ वास्तविक APMC मंडी भाव",
    noMarketData: "चुने गए फिल्टर के लिए कोई मंडी भाव नहीं मिला।",

    refreshPrices: "भाव रिफ्रेश करें",
    searchMandis: "मंडी खोजें",
    updateGps: "GPS अपडेट करें",
    changeMandi: "मंडी बदलें",
    nearestMandi: "निकटतम APMC मंडी",
    otherNearbyMarkets: "अन्य निकटवर्ती मंडियां (मंडी बदलें)",
    bestMarketToSell: "बेचने के लिए सर्वोत्तम मंडी",
    getDirections: "दिशा-निर्देश प्राप्त करें",
    sortedByRoadDistance: "सड़क दूरी के अनुसार क्रमबद्ध",
    roadDistance: "सड़क दूरी",
    byRoad: "सड़क द्वारा",
    yourFarm: "आपका खेत",
    yourCrops: "आपकी फसलें (प्राथमिकता)",
    selectCrop: "मंडी भाव हेतु फसल चुनें",
    selectMarket: "मंडी चुनें",
    selectLanguage: "भाषा चुनें",
    allMarketCommodities: "सभी मंडी वस्तुएं",
    priceTrendHistory: "मूल्य रुझान इतिहास",
    tradedRange: "कारोबार रेंज",
    wholesaleApprox: "थोक लगभग",
    estFreight: "अनुमानित किराया",
    topRate: "सर्वोत्तम भाव",
    viewMarket: "मंडी देखें",
    marketCatalog: "भारतीय APMC मंडी निर्देशिका",
    searchMarketPlaceholder: "मंडी खोजें (उदा. शमशाबाद, बोवेनपल्ली, वारंगल, कोलार, मदनपल्ले, गुंटूर)...",
    cardsView: "कार्ड्स",
    tableView: "तालिका",
    days7: "7 दिन",
    days30: "30 दिन",
    commodity: "फसल / वस्तु",
    marketApmc: "मंडी (APMC)",
    districtState: "जिला एवं राज्य",
    arrivalDate: "आवक तिथि",

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
    voiceSpeak: "आवाज़ में सुनें",
    voiceAI: "वॉयस AI",
    voiceSettings: "वॉयस सेटिंग्स",
    voiceTest: "वॉयस टेस्ट करें",
    voiceReadout: "वॉयस पढ़ें",
    voiceGenerating: "वॉयस तैयार हो रही है...",
    voiceSpeaking: "बोल रहा है...",
    voiceReady: "तैयार",
    voicePause: "रोकें",
    voiceResume: "फिर से शुरू करें",
    voiceStop: "वॉयस रोकें",
    voiceInput: "वॉयस इनपुट",
    voiceLanguage: "भाषा",
    voiceSpeed: "गति",
    voiceActiveEngine: "सक्रिय क्लाउड इंजन",
    voiceConfig: "क्लाउड न्यूरल वॉयस कॉन्फ़िगरेशन",
    voiceUnavailable: "वॉयस सेवा अस्थायी रूप से अनुपलब्ध है। कृपया पुन: प्रयास करें।",
    clearChat: "चैट साफ़ करें",

    search: "खोजें",
    submit: "जमा करें",
    save: "सहेजें",
    cancel: "रद्द करें",
    back: "वापस",
    next: "आगे",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
    noResults: "कोई परिणाम नहीं मिला",
    loadingPrices: "भाव लोड हो रहे हैं...",
    updated: "अपडेट किया गया",
    distance: "दूरी",
    kisanCallCenter: "किसान कॉल सेंटर",
    tollFree: "टोल फ्री",
    online: "ऑनलाइन",
    modules: "मॉड्यूल"
  }
};
