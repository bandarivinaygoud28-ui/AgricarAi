export type LanguageCode = 'en' | 'te' | 'hi';

export type CropType = 'Tomato' | 'Paddy' | 'Cotton' | 'Maize' | 'Chilli' | 'Potato';

export type AffectedAreaType = 'Leaf' | 'Stem' | 'Fruit / Boll' | 'Grain / Cob' | 'Flower' | 'Root';

export interface DiseaseScanResult {
  id?: number;
  crop: string;
  affected_area: string;
  disease: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'None' | string;
  symptoms: string[];
  cause: string;
  immediate_actions: string[];
  treatment: string[];
  prevention: string[];
  disclaimer?: string;
  weather_risk?: {
    disease_risk: string;
    disease_risk_factors: string[];
    spraying_advisory: string;
    suitable_for_spraying: boolean;
  };
  market_summary?: {
    average_price: number;
    highest_price: number;
    lowest_price: number;
    last_updated: string;
  };
  image_url?: string;
  date?: string;
}

export interface MandiInfo {
  id?: string;
  name: string;
  district: string;
  state: string;
  type?: string;
  lat: number;
  lon: number;
  distance_km?: number;
  formatted_distance?: string;
  distance_label?: string;
  is_road_distance?: boolean;
  duration_minutes?: number;
  apmc_code?: string;
}

export interface NearbyMarketOption {
  id: string;
  name: string;
  district: string;
  state: string;
  distance_km: number;
  formatted_distance?: string;
  distance_label?: string;
  is_road_distance?: boolean;
  duration_minutes?: number;
}

export interface BestMarketComparisonItem {
  mandi_id: string;
  mandi_name: string;
  district: string;
  state: string;
  distance_km: number;
  formatted_distance?: string;
  distance_label?: string;
  is_road_distance?: boolean;
  duration_minutes?: number;
  modal_price: number;
  price_per_kg: number;
  min_price: number;
  max_price: number;
  variety: string;
  estimated_transport_cost_per_qtl?: number;
  net_realized_price?: number;
}

export interface BestMarketInsight {
  has_recommendation: boolean;
  crop?: string;
  nearest_market?: BestMarketComparisonItem;
  best_price_market?: BestMarketComparisonItem;
  is_different_market?: boolean;
  price_difference_per_quintal?: number;
  price_difference_per_kg?: number;
  extra_distance_km?: number;
  extra_transport_cost_per_qtl?: number;
  net_gain_per_qtl?: number;
  recommendation_text?: string;
  disclaimer?: string;
  routing_explanation?: string;
  comparisons?: BestMarketComparisonItem[];
}

export interface MarketPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  price_per_kg?: number;
  price_type?: string;
  unit: string;
  distance_km?: number;
  formatted_distance?: string;
  distance_label?: string;
  is_road_distance?: boolean;
  duration_minutes?: number;
  arrival_date: string;
}

export interface MarketSummary {
  average_price: number;
  highest_price: number;
  lowest_price: number;
  last_updated: string;
}

export interface MarketPricesResponse {
  source: string;
  is_live: boolean;
  notice: string;
  commodity: string;
  last_updated: string;
  nearest_mandi?: MandiInfo;
  nearby_markets?: NearbyMarketOption[];
  best_market_to_sell?: BestMarketInsight | null;
  summary: MarketSummary;
  ai_insight: string;
  records: MarketPriceRecord[];
}

export interface MarketHistoryPoint {
  date: string;
  price: number;
  min_price: number;
  max_price: number;
}

export interface MarketHistoryResponse {
  commodity: string;
  days: number;
  source: string;
  is_live: boolean;
  current_modal_price: number;
  price_change: number;
  percentage_change: number;
  trend: 'Increasing' | 'Decreasing' | 'Stable';
  history: MarketHistoryPoint[];
}

export interface LocationSearchResult {
  name: string;
  district?: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
  formatted_location: string;
  display_name: string;
  source?: string;
}

export interface WeatherData {
  location: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
  source?: string;
  is_live?: boolean;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    precipitation?: number;
    cloud_cover?: number;
    condition: string;
    description: string;
    updated_at?: string;
    updated_at_iso?: string;
    foliar_wetness?: {
      status: string;
      description: string;
    };
    spraying_drift?: {
      status: string;
      description: string;
    };
  };
  agricultural_advisory: {
    disease_risk: string;
    disease_risk_factors: string[];
    spraying_advisory: string;
    suitable_for_spraying: boolean;
    crop?: string;
  };
  forecast: Array<{
    date: string;
    day: string;
    temp_max: number;
    temp_min: number;
    condition: string;
    description: string;
    humidity: number;
    pop: number;
  }>;
}

export interface FarmerProfile {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  state: string;
  district: string;
  village?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  main_crops: string;
  preferred_language: LanguageCode;
}

export interface NewsArticlePriceInfo {
  crop: string;
  market: string;
  price: string;
  price_type?: string;
  distance_km?: number;
  price_date?: string;
}

export interface NewsArticle {
  id: string | number;
  category: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  date: string;
  url?: string;
  image_url: string;
  location_tag?: string;
  crop?: string;
  priority_tier?: number;
  tier_name?: string;
  relevance_score?: number;
  relevance_badge?: string;
  relevance_reason?: string;
  price_info?: NewsArticlePriceInfo | null;
  published_raw?: string;
  published_timestamp?: number;
}

export interface NewsSections {
  district_news: NewsArticle[];
  crop_news: NewsArticle[];
  nearby_mandi_news: NewsArticle[];
  state_news: NewsArticle[];
  india_news: NewsArticle[];
  schemes_and_loans: NewsArticle[];
  weather_and_alerts: NewsArticle[];
}

export interface NewsResponse {
  success: boolean;
  articles: NewsArticle[];
  sections?: NewsSections;
  farmer_context?: {
    district?: string;
    state?: string;
    crops?: string[];
    nearest_mandi?: string;
    location_name?: string;
  };
  count: number;
  last_updated: string;
  source: string;
  is_live: boolean;
}

export interface FarmResource {
  id: number;
  resource_type: string;
  type?: string;
  category?: string;
  title: string;
  name?: string;
  provider_name: string;
  ownerName?: string;
  location: string;
  price: number;
  price_unit: string;
  price_per_hour?: number;
  pricePerHour?: number;
  price_per_acre?: number;
  pricePerAcre?: number;
  price_per_day?: number;
  availability: string;
  status?: string;
  contact_phone: string;
  ownerMobile?: string;
  rating: number;
  description: string;
  image_url?: string;
  image?: string;
  specs?: string;
  terms?: string;
  distance_km?: number;
  formatted_distance?: string;
  google_maps_route_url?: string;
}

export interface BookingRecord {
  id: number;
  resource_id: number;
  resource_title: string;
  resource_type: string;
  provider_name: string;
  contact_phone: string;
  price: number;
  price_unit: string;
  booking_date: string;
  booking_time: string;
  location: string;
  status: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  topic?: string;
  timestamp: string;
  diagnosis_context?: Partial<DiseaseScanResult>;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  short_name: string;
  category: string;
  scope: 'Central' | 'State' | string;
  state: string;
  target_crops: string[];
  max_land_limit?: number | null;
  description: string;
  benefits: string;
  eligibility_summary: string;
  required_documents: string[];
  department: string;
  application_process: string;
  official_url: string;
  official_source: string;
  last_verified: string;
  is_verified: boolean;
  tags: string[];
  eligibility_status?: string;
  eligibility_code?: 'likely' | 'check' | 'info' | string;
  eligibility_badge_color?: 'green' | 'yellow' | 'gray' | string;
  relevance_reason?: string;
  priority_score?: number;
}

export interface SchemesResponse {
  farmer_context: {
    state: string;
    district: string;
    crops: string[];
    land_area?: number | null;
  };
  total_schemes: number;
  recommended_count: number;
  schemes: GovernmentScheme[];
  last_verified_all: string;
}

