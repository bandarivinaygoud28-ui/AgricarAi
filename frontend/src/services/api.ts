import {
  DiseaseScanResult,
  MarketPricesResponse,
  MarketHistoryResponse,
  MandiInfo,
  BestMarketInsight,
  NearbyMarketOption,
  WeatherData,
  LocationSearchResult,
  FarmerProfile,
  NewsArticle,
  NewsResponse,
  FarmResource,
  BookingRecord,
  LanguageCode
} from '../types';

const API_BASE = 'https://hv2026-0051-vortex-backend.onrender.com/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('agricare_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth & Profile
  async login(phone: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('agricare_token', data.access_token);
      localStorage.setItem('agricare_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(farmerData: Partial<FarmerProfile> & { password: string }) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmerData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('agricare_token', data.access_token);
      localStorage.setItem('agricare_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getProfile(): Promise<FarmerProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(data: Partial<FarmerProfile>): Promise<any> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // AI Disease Detection
  async predictDisease(crop: string, affected_area: string = "Leaf", file?: File): Promise<DiseaseScanResult> {
    const formData = new FormData();
    formData.append('crop', crop);
    formData.append('affected_area', affected_area);
    if (file) {
      formData.append('image', file);
    }

    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    if (!res.ok) throw new Error('Disease prediction failed');
    return res.json();
  },

  async predictDiseaseJson(crop: string, affected_area: string = "Leaf", image_url?: string, image_base64?: string): Promise<DiseaseScanResult> {
    const res = await fetch(`${API_BASE}/predict/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ crop, affected_area, image_url, image_base64 })
    });
    if (!res.ok) throw new Error('Disease prediction failed');
    return res.json();
  },

  async saveScan(scanData: DiseaseScanResult): Promise<any> {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(scanData)
    });
    if (!res.ok) throw new Error('Failed to save scan to history');
    return res.json();
  },

  async getScanHistory(): Promise<DiseaseScanResult[]> {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch scan history');
    return res.json();
  },

  async getAdvisory(crop: string = "Tomato"): Promise<any> {
    const res = await fetch(`${API_BASE}/advisory?crop=${encodeURIComponent(crop)}`);
    if (!res.ok) throw new Error('Failed to fetch advisory');
    return res.json();
  },

  // Market Prices (Strictly "Market Prices")
  async getMarketPrices(params: {
    crop?: string;
    state?: string;
    district?: string;
    market?: string;
    lat?: number;
    lon?: number;
    date?: string;
  }): Promise<MarketPricesResponse> {
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.state) query.append('state', params.state);
    if (params.district) query.append('district', params.district);
    if (params.market) query.append('market', params.market);
    if (params.lat !== undefined && params.lat !== null) query.append('lat', String(params.lat));
    if (params.lon !== undefined && params.lon !== null) query.append('lon', String(params.lon));
    if (params.date) query.append('date', params.date);

    const res = await fetch(`${API_BASE}/market-prices?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch market prices');
    return res.json();
  },

  async getMarketPriceHistory(params: {
    crop?: string;
    state?: string;
    district?: string;
    market?: string;
    lat?: number;
    lon?: number;
    days?: number;
  }): Promise<MarketHistoryResponse> {
    const query = new URLSearchParams();
    if (params.crop) query.append('crop', params.crop);
    if (params.state) query.append('state', params.state);
    if (params.district) query.append('district', params.district);
    if (params.market) query.append('market', params.market);
    if (params.lat !== undefined && params.lat !== null) query.append('lat', String(params.lat));
    if (params.lon !== undefined && params.lon !== null) query.append('lon', String(params.lon));
    query.append('days', String(params.days || 7));

    const res = await fetch(`${API_BASE}/market-prices/history?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch market price history');
    return res.json();
  },

  async getBestMarketToSell(params: {
    lat: number;
    lon: number;
    crop: string;
  }): Promise<BestMarketInsight> {
    const query = new URLSearchParams();
    query.append('lat', String(params.lat));
    query.append('lon', String(params.lon));
    query.append('crop', params.crop || 'Tomato');

    const res = await fetch(`${API_BASE}/market-prices/best-market?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch best market recommendation');
    return res.json();
  },

  async searchMandis(params: {
    search?: string;
    state?: string;
    district?: string;
    lat?: number;
    lon?: number;
    limit?: number;
  }): Promise<MandiInfo[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.state) query.append('state', params.state);
    if (params.district) query.append('district', params.district);
    if (params.lat !== undefined && params.lat !== null) query.append('lat', String(params.lat));
    if (params.lon !== undefined && params.lon !== null) query.append('lon', String(params.lon));
    if (params.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/market-prices/mandis?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to search mandis');
    return res.json();
  },

  // Location & Geocoding
  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(`${API_BASE}/location/search?query=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Direct Geocoding fallback if backend is unreachable
    }

    try {
      const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
      const directRes = await fetch(directUrl);
      if (directRes.ok) {
        const d = await directRes.json();
        return (d.results || []).map((it: any) => ({
          name: it.name,
          district: it.admin2 || it.admin1 || it.name,
          state: it.admin1 || it.country || 'India',
          country: it.country || 'India',
          lat: it.latitude,
          lon: it.longitude,
          formatted_location: it.admin1 ? `${it.name}, ${it.admin1}` : it.name,
          display_name: [it.name, it.admin2, it.admin1, it.country].filter(Boolean).join(', '),
          source: 'Open-Meteo Geocoding'
        }));
      }
    } catch (err) {
      console.warn('Geocoding fallback error:', err);
    }
    return [];
  },

  async reverseGeocode(lat: number, lon: number): Promise<{
    formatted_location: string;
    village?: string;
    city: string;
    district: string;
    state: string;
    country: string;
    lat?: number;
    lon?: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/location/reverse?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Direct reverse geocoding fallback
    }

    try {
      const directUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const directRes = await fetch(directUrl, { headers: { 'User-Agent': 'AgriCareAI/2.0' } });
      if (directRes.ok) {
        const d = await directRes.json();
        const a = d.address || {};
        const village = a.village || a.hamlet || a.suburb || a.town || a.city || 'Farm Location';
        const city = a.city || a.town || village;
        const state = a.state || 'India';
        const district = a.state_district || a.county || a.district || city;
        return {
          formatted_location: `${village}, ${district}, ${state}`,
          village,
          city,
          district,
          state,
          country: a.country || 'India',
          lat,
          lon
        };
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err);
    }

    return {
      formatted_location: `Location (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
      village: 'Farm Location',
      city: 'Farm Location',
      district: 'Regional District',
      state: 'India',
      country: 'India',
      lat,
      lon
    };
  },

  // Weather
  async getWeather(params: {
    location?: string;
    lat?: number;
    lon?: number;
    crop?: string;
  }): Promise<WeatherData> {
    const query = new URLSearchParams();
    if (params.location) query.append('location', params.location);
    if (params.lat !== undefined) query.append('lat', String(params.lat));
    if (params.lon !== undefined) query.append('lon', String(params.lon));
    if (params.crop) query.append('crop', params.crop);

    try {
      const res = await fetch(`${API_BASE}/weather?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Direct live meteorological fallback if backend is unreachable
    }

    // Direct Live Open-Meteo fetch fallback
    const lat = params.lat ?? 17.9689;
    const lon = params.lon ?? 79.5941;
    const cropName = params.crop || 'Tomato';
    const directWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean&timezone=auto`;
    
    const dRes = await fetch(directWeatherUrl);
    if (!dRes.ok) throw new Error('Live weather service unreachable');
    const dJson = await dRes.json();
    const curr = dJson.current || {};
    const temp = Math.round((curr.temperature_2m ?? 30.0) * 10) / 10;
    const feelsLike = Math.round((curr.apparent_temperature ?? temp) * 10) / 10;
    const humidity = Math.round(curr.relative_humidity_2m ?? 65);
    const windSpeed = Math.round((curr.wind_speed_10m ?? 8.0) * 10) / 10;
    const precipitation = Math.round((curr.precipitation ?? 0.0) * 10) / 10;
    const cloudCover = Math.round(curr.cloud_cover ?? 20);

    const isRiskHigh = (humidity >= 75 || precipitation > 0) && (temp >= 20 && temp <= 32);
    const canSpray = windSpeed <= 14 && humidity <= 85 && precipitation <= 0.2;

    return {
      location: params.location || `Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      coordinates: { lat, lon },
      source: 'Open-Meteo Live Meteorological Station',
      is_live: true,
      current: {
        temp,
        feels_like: feelsLike,
        humidity,
        wind_speed: windSpeed,
        precipitation,
        cloud_cover: cloudCover,
        condition: precipitation > 0 ? 'Light Rain / Drizzle' : cloudCover > 50 ? 'Partly Cloudy' : 'Clear / Sunny',
        description: precipitation > 0 ? 'Passing showers with moist canopy' : 'Fair agricultural sky with sunlight',
        updated_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        foliar_wetness: {
          status: humidity >= 75 || precipitation > 0 ? 'High' : 'Moderate',
          description: `${humidity}% relative humidity with ${precipitation} mm precipitation.`
        },
        spraying_drift: {
          status: windSpeed > 15 ? 'Severe Drift Hazard' : windSpeed > 10 ? 'Moderate Drift' : 'Low Drift (Optimal)',
          description: `Wind speed is ${windSpeed} km/h.`
        }
      },
      agricultural_advisory: {
        disease_risk: isRiskHigh ? 'High' : 'Low',
        disease_risk_factors: [
          `Relative humidity (${humidity}%) and temperature (${temp}°C) influence pathogen progression in ${cropName}.`,
          `Wind velocity (${windSpeed} km/h) affects chemical spray droplet dispersion.`
        ],
        spraying_advisory: canSpray ? 'Optimal conditions for foliar nutrient and chemical spraying.' : `Caution: Wind speed (${windSpeed} km/h) or moisture creates drift/wash-off risk.`,
        suitable_for_spraying: canSpray,
        crop: cropName
      },
      forecast: (dJson.daily?.time || []).slice(0, 5).map((d: string, idx: number) => ({
        date: d,
        day: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }),
        temp_max: Math.round(dJson.daily.temperature_2m_max[idx] ?? temp + 2),
        temp_min: Math.round(dJson.daily.temperature_2m_min[idx] ?? temp - 6),
        condition: (dJson.daily.precipitation_probability_max[idx] || 0) > 40 ? 'Light Rain' : 'Partly Cloudy',
        description: 'Daily agro-meteorological prediction',
        humidity: Math.round(dJson.daily.relative_humidity_2m_mean[idx] ?? humidity),
        pop: Math.round(dJson.daily.precipitation_probability_max[idx] ?? 10)
      }))
    };
  },

  // AI Farmer Assistant
  async askAssistant(
    message: string,
    language: LanguageCode = 'en',
    diagnosis_context?: Partial<DiseaseScanResult>,
    location?: string
  ): Promise<{ response: string; topic: string; language: string }> {
    const res = await fetch(`${API_BASE}/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language, diagnosis_context, location })
    });
    if (!res.ok) throw new Error('Assistant communication failed');
    return res.json();
  },

  // Real-Time Agricultural Market News
  async getNews(params: {
    category?: string;
    filter?: string;
    search?: string;
    location?: string;
    district?: string;
    state?: string;
    crops?: string;
    lat?: number;
    lon?: number;
    language?: LanguageCode;
    limit?: number;
    force_refresh?: boolean;
  }): Promise<NewsResponse> {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.filter) query.append('filter', params.filter);
    if (params.search) query.append('search', params.search);
    if (params.location) query.append('location', params.location);
    if (params.district) query.append('district', params.district);
    if (params.state) query.append('state', params.state);
    if (params.crops) query.append('crops', params.crops);
    if (params.lat !== undefined && params.lat !== null) query.append('lat', String(params.lat));
    if (params.lon !== undefined && params.lon !== null) query.append('lon', String(params.lon));
    if (params.language) query.append('language', params.language);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.force_refresh) query.append('force_refresh', 'true');

    try {
      const res = await fetch(`${API_BASE}/news?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.articles)) {
          return data;
        } else if (Array.isArray(data)) {
          return {
            success: true,
            articles: data,
            count: data.length,
            last_updated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            source: 'Indian Agricultural Feeds',
            is_live: true
          };
        }
      }
    } catch {
      // Direct live RSS fallback if backend is unreachable
    }

    // ── CLIENT-SIDE RSS FALLBACK (used when backend is unreachable) ──────────────
    // Each article gets its OWN independently computed category, location tag and image.

    const CATEGORY_IMAGES: Record<string, string[]> = {
      '🌾 Paddy / Rice': [
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80'
      ],
      '🌽 Maize': [
        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80'
      ],
      '🧅 Onion': [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&auto=format&fit=crop&q=80'
      ],
      '🥔 Potato': [
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80'
      ],
      '🍅 Tomato': [
        'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80'
      ],
      '🌶️ Chilli': [
        'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526344966286-56f5d815d3ab?w=600&auto=format&fit=crop&q=80'
      ],
      '🫘 Pulses': [
        'https://images.unsplash.com/photo-1515942400420-2b98fed1f515?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584473457409-ae5c91d7d8b1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&auto=format&fit=crop&q=80'
      ],
      '🍬 Sugar': [
        'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=600&auto=format&fit=crop&q=80'
      ],
      '🌻 Oilseeds': [
        'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&auto=format&fit=crop&q=80'
      ],
      '📈 Mandi / Commodity Market': [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80'
      ],
      '🏛️ MSP': [
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80'
      ],
      '🏛️ Government / Agriculture Policy': [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=600&auto=format&fit=crop&q=80'
      ],
      '🌾 General Agriculture': [
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&auto=format&fit=crop&q=80'
      ]
    };

    const detectArticleCategory = (title: string, summary: string): string => {
      const text = (title + ' ' + summary).toLowerCase();
      if (/\b(paddy|rice|basmati|dhan)\b/.test(text)) return '🌾 Paddy / Rice';
      if (/\b(maize|corn|makka)\b/.test(text)) return '🌽 Maize';
      if (/\b(onion|onions|pyaz|lasalgaon)\b/.test(text)) return '🧅 Onion';
      if (/\b(potato|potatoes|aloo)\b/.test(text)) return '🥔 Potato';
      if (/\b(tomato|tomatoes|tamatar)\b/.test(text)) return '🍅 Tomato';
      if (/\b(chilli|chillies|chili|chilies|mirchi)\b/.test(text)) return '🌶️ Chilli';
      if (/\b(pulses|pulse crop|lentil|lentils|arhar|toor dal|tur dal|chana|urad|moong|bengal gram|black gram|green gram|chickpea|pigeon pea|rajma|dal price)\b/.test(text)) return '🫘 Pulses';
      if (/\b(sugar|sugarcane|ganna|sugar mill|frp)\b/.test(text)) return '🍬 Sugar';
      if (/\b(oilseed|oilseeds|mustard|sarson|soybean|groundnut|peanut|sunflower|edible oil)\b/.test(text)) return '🌻 Oilseeds';
      if (/\b(msp|minimum support price|procurement price|fci procurement)\b/.test(text)) return '🏛️ MSP';
      if (/\b(mandi|mandis|apmc|e-nam|enam|agmarknet|wholesale market|wholesale price|market arrivals|spot prices|commodity market|commodity prices)\b/.test(text)) return '📈 Mandi / Commodity Market';
      if (/\b(pm-kisan|pm kisan|agriculture ministry|ministry of agriculture|subsidy|subsidies|icar|agri policy|farm loan|krishi|drone subsidy|pmfby|fasal bima|nabard)\b/.test(text)) return '🏛️ Government / Agriculture Policy';
      return '🌾 General Agriculture';
    };

    const detectArticleLocation = (text: string): string => {
      const t = text.toLowerCase();
      const stateMap: Array<[RegExp, string]> = [
        [/\btelangana\b/, '📍 Telangana'],
        [/\bandhra\s*pradesh\b/, '📍 Andhra Pradesh'],
        [/\bkarnataka\b/, '📍 Karnataka'],
        [/\bmaharashtra\b/, '📍 Maharashtra'],
        [/\bpunjab\b/, '📍 Punjab'],
        [/\bharyana\b/, '📍 Haryana'],
        [/\buttar\s*pradesh\b/, '📍 Uttar Pradesh'],
        [/\bmadhya\s*pradesh\b/, '📍 Madhya Pradesh'],
        [/\bgujarat\b/, '📍 Gujarat'],
        [/\brajasthan\b/, '📍 Rajasthan'],
        [/\btamil\s*nadu\b/, '📍 Tamil Nadu'],
        [/\bkerala\b/, '📍 Kerala'],
        [/\bbihar\b/, '📍 Bihar'],
        [/\bwest\s*bengal\b/, '📍 West Bengal'],
        [/\bodisha\b/, '📍 Odisha'],
        [/\bassam\b/, '📍 Assam'],
      ];
      for (const [regex, tag] of stateMap) {
        if (regex.test(t)) return tag;
      }
      return '🇮🇳 India Agriculture';
    };

    const pickArticleImage = (category: string, title: string): string => {
      const pool = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES['🌾 General Agriculture'];
      const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return pool[hash % pool.length];
    };

    const formatRssDate = (pubDate: string): string => {
      try {
        if (!pubDate) return 'Recently';
        const d = new Date(pubDate);
        const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
        if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        if (diffMins < 2880) return 'Yesterday';
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch { return 'Recently'; }
    };

    const searchTerms = ['India', 'agriculture', 'when:7d'];
    if (params.location) searchTerms.push(params.location.split(',').pop()?.trim() || '');
    if (params.search) searchTerms.push(params.search);
    if (params.category && params.category !== 'All') searchTerms.push(params.category.replace(/[^\w\s/]/g, '').trim());
    if (params.filter && params.filter !== 'All') searchTerms.push(params.filter);

    const qStr = searchTerms.filter(Boolean).join(' ') || 'India agriculture mandi MSP commodity prices when:7d';
    const rssUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(qStr)}&hl=en-IN&gl=IN&ceid=IN:en`)}`;

    try {
      const directRes = await fetch(rssUrl);
      if (directRes.ok) {
        const xmlText = await directRes.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = Array.from(xmlDoc.querySelectorAll('item')).slice(0, params.limit || 25);
        const seenTitles = new Set<string>();
        const parsedArticles: NewsArticle[] = [];

        for (const item of items) {
          const fullTitle = item.querySelector('title')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const rawDesc = item.querySelector('description')?.textContent || '';
          const desc = rawDesc.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
          const title = fullTitle.includes(' - ') ? fullTitle.split(' - ').slice(0, -1).join(' - ') : fullTitle;
          const source = fullTitle.includes(' - ') ? (fullTitle.split(' - ').pop() || 'Agri News') : 'Agri News';

          const titleKey = title.toLowerCase().replace(/\W+/g, '');
          if (!titleKey || seenTitles.has(titleKey)) continue;
          seenTitles.add(titleKey);

          const summary = desc || title;
          const category = detectArticleCategory(title, summary);
          const location_tag = detectArticleLocation(title + ' ' + summary);
          const image_url = pickArticleImage(category, title);

          parsedArticles.push({
            id: `rss_${titleKey.substring(0, 8)}_${parsedArticles.length}`,
            title,
            summary,
            content: summary,
            category,
            source,
            date: formatRssDate(pubDate),
            url: link,
            image_url,
            location_tag
          });
        }

        if (parsedArticles.length > 0) {
          const now = new Date();
          return {
            success: true,
            articles: parsedArticles,
            count: parsedArticles.length,
            last_updated: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', ' + now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            source: 'Live Google News Indian Agriculture Feed',
            is_live: true
          };
        }
      }
    } catch (rssErr) {
      console.warn('RSS client fallback error:', rssErr);
    }

    throw new Error('Unable to fetch the latest market news. Please try again.');
  },

  // Farm Resources & Booking
  async getResources(params: {
    resource_type?: string;
    location?: string;
  }): Promise<FarmResource[]> {
    const query = new URLSearchParams();
    if (params.resource_type) query.append('resource_type', params.resource_type);
    if (params.location) query.append('location', params.location);

    const res = await fetch(`${API_BASE}/resources?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return res.json();
  },

  async checkAvailability(resource_id: number, date: string): Promise<any> {
    const res = await fetch(`${API_BASE}/resources/availability?resource_id=${resource_id}&date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Failed to check availability');
    return res.json();
  },

  async bookResource(bookingData: {
    farmer_name: string;
    farmer_phone: string;
    resource_id: number;
    booking_date: string;
    booking_time: string;
    location: string;
    notes?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/resources/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(bookingData)
    });
    if (!res.ok) throw new Error('Failed to book resource');
    return res.json();
  },

  async getBookings(farmer_id?: number, phone?: string): Promise<BookingRecord[]> {
    const query = new URLSearchParams();
    if (farmer_id) query.append('farmer_id', String(farmer_id));
    if (phone) query.append('phone', phone);

    const res = await fetch(`${API_BASE}/resources/bookings?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  }
};
