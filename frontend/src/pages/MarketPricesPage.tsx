import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  RefreshCw,
  Info,
  Calendar,
  Building,
  MapPin,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  LanguageCode,
  MarketPriceRecord,
  MarketSummary,
  MandiInfo,
  NearbyMarketOption,
  BestMarketInsight
} from '../types';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { MarketPriceTable } from '../components/MarketPriceTable';
import { MarketPriceCard } from '../components/MarketPriceCard';

interface MarketPricesPageProps {
  language: LanguageCode;
  initialCrop?: string;
}

const COMMON_CROPS = [
  'Tomato',
  'Paddy',
  'Cotton',
  'Chilli',
  'Maize',
  'Onion',
  'Potato',
  'Wheat',
  'Groundnut',
  'Turmeric',
  'Soybean',
  'Sugarcane'
];

export const MarketPricesPage: React.FC<MarketPricesPageProps> = ({
  language,
  initialCrop = 'Tomato'
}) => {
  const t = translations[language];

  // 1. Farmer Geolocation & Profile state
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(() => {
    try {
      const saved = localStorage.getItem('agricare_farm_coords');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lon) return { lat: Number(parsed.lat), lon: Number(parsed.lon) };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [farmLocationName, setFarmLocationName] = useState<string>(() => {
    return localStorage.getItem('agricare_farm_location_name') || '';
  });

  const [farmerCrops] = useState<string[]>(() => {
    const saved = localStorage.getItem('agricare_farmer_crops');
    if (saved) {
      return saved.split(',').map(c => c.trim()).filter(Boolean);
    }
    return ['Tomato', 'Paddy', 'Cotton'];
  });

  // 2. Selected Market & Commodity State
  const [selectedCrop, setSelectedCrop] = useState<string>(() => {
    if (initialCrop && initialCrop !== 'Tomato') return initialCrop;
    const saved = localStorage.getItem('agricare_farmer_crops');
    if (saved) {
      const first = saved.split(',')[0]?.trim();
      if (first) return first;
    }
    return initialCrop || 'Tomato';
  });

  const [activeMandi, setActiveMandi] = useState<MandiInfo | null>(null);
  const [nearbyMarkets, setNearbyMarkets] = useState<NearbyMarketOption[]>([]);
  const [bestMarketInsight, setBestMarketInsight] = useState<BestMarketInsight | null>(null);

  // 3. Price Records & Trend Data
  const [records, setRecords] = useState<MarketPriceRecord[]>([]);
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLiveSource, setIsLiveSource] = useState<boolean>(false);
  const [dataSourceNotice, setDataSourceNotice] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [historyTrend, setHistoryTrend] = useState<any[]>([]);
  const [trendDays, setTrendDays] = useState<number>(7);

  // 4. UI / Search / Modal States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showMandiModal, setShowMandiModal] = useState<boolean>(false);
  const [mandiSearchQuery, setMandiSearchQuery] = useState<string>('');
  const [allMandisList, setAllMandisList] = useState<MandiInfo[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<string>('modal_price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load All Available Mandis for the search modal
  useEffect(() => {
    const loadMandis = async () => {
      try {
        const mandis = await api.searchMandis({
          lat: coords?.lat,
          lon: coords?.lon,
          limit: 60
        });
        setAllMandisList(mandis);
      } catch (err) {
        console.error('Failed to load mandi catalog', err);
      }
    };
    loadMandis();
  }, [coords]);

  // Primary Data Fetcher
  const fetchMarketPrices = async (customMandiName?: string) => {
    setIsLoading(true);
    setLocationError(null);
    try {
      const res = await api.getMarketPrices({
        crop: selectedCrop,
        market: customMandiName || activeMandi?.name,
        lat: coords?.lat,
        lon: coords?.lon
      });

      if (res.nearest_mandi && !customMandiName) {
        setActiveMandi(res.nearest_mandi);
      }
      if (res.nearby_markets) {
        setNearbyMarkets(res.nearby_markets);
      }
      if (res.best_market_to_sell) {
        setBestMarketInsight(res.best_market_to_sell);
      }

      setRecords(res.records || []);
      setSummary(res.summary || null);
      setAiInsight(res.ai_insight || '');
      setIsLiveSource(res.is_live);
      setDataSourceNotice(res.notice || '');
      setLastUpdated(res.last_updated || new Date().toLocaleDateString('en-IN'));

      // Fetch Trend History for selected crop
      const histRes = await api.getMarketPriceHistory({
        crop: selectedCrop,
        market: customMandiName || activeMandi?.name,
        lat: coords?.lat,
        lon: coords?.lon,
        days: trendDays
      });
      setHistoryTrend(histRes.history || []);
    } catch (err) {
      console.error(err);
      setLocationError(t.noMarketData || 'Unable to load latest market price data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when crop, coords, or trend days change
  useEffect(() => {
    fetchMarketPrices();
  }, [selectedCrop, coords, trendDays]);

  // Browser Geolocation Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const newCoords = { lat, lon };
        setCoords(newCoords);
        localStorage.setItem('agricare_farm_coords', JSON.stringify(newCoords));

        try {
          const rev = await api.reverseGeocode(lat, lon);
          if (rev && rev.formatted_location) {
            setFarmLocationName(rev.formatted_location);
            localStorage.setItem('agricare_farm_location_name', rev.formatted_location);
            if (rev.district) localStorage.setItem('agricare_farmer_district', rev.district);
            if (rev.state) localStorage.setItem('agricare_farmer_state', rev.state);
          }
        } catch {
          // fallback location name
          setFarmLocationName(`${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. You can search your nearest mandi manually.');
        } else {
          setLocationError('Unable to detect precise GPS location. Please choose a market manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Switch to an alternative nearby market
  const handleSelectMarket = (mandi: MandiInfo | NearbyMarketOption) => {
    setActiveMandi({
      id: mandi.id,
      name: mandi.name,
      district: mandi.district,
      state: mandi.state,
      lat: (mandi as MandiInfo).lat || 0,
      lon: (mandi as MandiInfo).lon || 0,
      distance_km: mandi.distance_km
    });
    setShowMandiModal(false);
    fetchMarketPrices(mandi.name);
  };

  // Sorting Handler
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let aVal = (a as any)[sortBy] ?? 0;
      let bVal = (b as any)[sortBy] ?? 0;
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [records, sortBy, sortOrder]);

  // Separate records into: Farmer Crops vs Other Mandi Commodities
  const farmerCropRecords = useMemo(() => {
    return sortedRecords.filter(r =>
      farmerCrops.some(fc => fc.toLowerCase() === r.commodity.toLowerCase())
    );
  }, [sortedRecords, farmerCrops]);

  const otherRecords = useMemo(() => {
    return sortedRecords.filter(r =>
      !farmerCrops.some(fc => fc.toLowerCase() === r.commodity.toLowerCase())
    );
  }, [sortedRecords, farmerCrops]);

  // Filtered Mandis for search modal
  const filteredMandisModal = useMemo(() => {
    if (!mandiSearchQuery.trim()) return allMandisList;
    const q = mandiSearchQuery.toLowerCase();
    return allMandisList.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q)
    );
  }, [allMandisList, mandiSearchQuery]);

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t.navMarketPrices || 'Market Prices'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {t.marketPricesSubtitle || 'Live & daily APMC mandi wholesale rates with automatic nearest market detection'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchMarketPrices()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t.refreshPrices || 'Refresh Prices'}</span>
          </button>

          <button
            onClick={() => setShowMandiModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t.searchMandis || 'Search Mandis'}</span>
          </button>
        </div>
      </div>

      {/* 2. Location Notice / Missing Location Prompt Banner */}
      {!coords && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-5 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/15 rounded-xl shrink-0 mt-0.5">
              <Navigation className="w-5 h-5 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {t.searchFarmLocation || 'Detect your farm\'s nearest mandi automatically'}
              </h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                Allow browser location to instantly calculate driving road distance, travel time, and fetch real wholesale rates from your closest agricultural market.
              </p>
            </div>
          </div>

          <button
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-emerald-900 font-black text-xs rounded-xl hover:bg-emerald-50 transition-all shadow-md shrink-0 disabled:opacity-75"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{isDetectingLocation ? (t.locatingGps || 'Detecting Location...') : `📍 ${t.useCurrentLocation || 'Detect My Location'}`}</span>
          </button>
        </div>
      )}

      {locationError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{locationError}</span>
          </div>
          <button
            onClick={() => setShowMandiModal(true)}
            className="font-bold underline hover:text-amber-900 ml-3"
          >
            Select Manually
          </button>
        </div>
      )}

      {/* 3. Automatic Nearest Mandi Smart Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Nearest Mandi Identification */}
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  📍 {t.nearestMandi || 'Nearest APMC Market'}
                </span>
                {activeMandi?.distance_km !== undefined && activeMandi?.distance_km !== null && (
                  activeMandi?.is_road_distance === false ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                      <span>⚠️ Road distance unavailable</span>
                      <span className="text-slate-500">• Approx. straight-line: {activeMandi.distance_km} km</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-2 shadow-2xs">
                      <span className="flex items-center gap-1">
                        <span>🚗</span>
                        <span>{activeMandi.distance_km} km {t.byRoad || 'by road'}</span>
                      </span>
                      {activeMandi.duration_minutes !== undefined && activeMandi.duration_minutes !== null && (
                        <>
                          <span className="text-emerald-300">•</span>
                          <span className="flex items-center gap-1 text-emerald-700">
                            <span>⏱️</span>
                            <span>{activeMandi.duration_minutes} min</span>
                          </span>
                        </>
                      )}
                    </span>
                  )
                )}
                {isLiveSource && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                    Govt OGD Live
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 mt-1">
                {activeMandi?.name || 'Shamshabad Market'}
              </h2>

              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {activeMandi?.district || 'Ranga Reddy'}, {activeMandi?.state || 'Telangana'}
                </span>
                {farmLocationName && (
                  <span className="text-slate-400">
                    • {t.yourFarm || 'Your Farm'}: <strong className="text-slate-600">{farmLocationName}</strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Actions & Timestamps */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Calculating road distance...' : (t.updateGps || 'Update GPS')}</span>
            </button>

            <button
              onClick={() => setShowMandiModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.changeMandi || 'Change Mandi'}</span>
            </button>
          </div>
        </div>

        {/* Nearby Alternative Markets Strip */}
        {nearbyMarkets.length > 0 && (
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.otherNearbyMarkets || 'Other Nearby Markets (Switch Mandi)'}</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span>🚗</span>
                <span>{t.sortedByRoadDistance || 'Sorted by road distance'}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {nearbyMarkets.map((nm) => {
                const isActive = activeMandi?.name === nm.name;
                return (
                  <button
                    key={nm.id || nm.name}
                    onClick={() => handleSelectMarket(nm)}
                    className={`shrink-0 text-left px-3.5 py-2 rounded-xl text-xs transition-all border ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[140px]">{nm.name}</span>
                      {nm.is_road_distance === false ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {nm.distance_km} km straight-line
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-emerald-700 text-emerald-100'
                              : 'bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          <span>🚗 {nm.distance_km} km</span>
                          {nm.duration_minutes !== undefined && nm.duration_minutes !== null && (
                            <span>⏱️ {nm.duration_minutes}m</span>
                          )}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 font-medium italic pt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Road distance is calculated from your farm location to the market using available routing data.</span>
            </p>
          </div>
        )}
      </div>

      {/* 4. "Best Nearby Market to Sell" Advisory Box */}
      {bestMarketInsight && bestMarketInsight.has_recommendation && (
        <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-amber-200/90 rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span>💰 {t.bestMarketToSell || 'Best Nearby Market to Sell'} ({selectedCrop})</span>
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {bestMarketInsight.recommendation_text}
                </p>
              </div>
            </div>

            {bestMarketInsight.is_different_market && bestMarketInsight.best_price_market && (
              <button
                onClick={() =>
                  handleSelectMarket({
                    id: bestMarketInsight.best_price_market!.mandi_id,
                    name: bestMarketInsight.best_price_market!.mandi_name,
                    district: bestMarketInsight.best_price_market!.district,
                    state: bestMarketInsight.best_price_market!.state,
                    distance_km: bestMarketInsight.best_price_market!.distance_km
                  })
                }
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl transition-all shadow-xs shrink-0"
              >
                <span>{t.viewMarket || 'View Market'} ({bestMarketInsight.best_price_market.mandi_name})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Comparison Cards Matrix */}
          {bestMarketInsight.comparisons && bestMarketInsight.comparisons.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {bestMarketInsight.comparisons.map((c) => {
                const isBest = c.mandi_id === bestMarketInsight.best_price_market?.mandi_id;
                const isCurrent = c.mandi_name === activeMandi?.name;
                return (
                  <div
                    key={c.mandi_id}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                      isBest
                        ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-500/20'
                        : isCurrent
                        ? 'bg-white border-slate-300 shadow-xs'
                        : 'bg-white/70 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-800 truncate">{c.mandi_name}</span>
                        {isBest && (
                          <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                            {t.topRate || 'TOP RATE'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-600 font-semibold space-y-0.5 mt-0.5">
                        <span className="block flex items-center gap-1 flex-wrap">
                          <span>🚗 {c.distance_km} km {t.byRoad || 'by road'}</span>
                          {c.duration_minutes !== undefined && c.duration_minutes !== null && (
                            <span className="text-slate-500">• ⏱️ {c.duration_minutes} min</span>
                          )}
                        </span>
                        {c.estimated_transport_cost_per_qtl !== undefined && (
                          <span className="text-[9px] text-slate-500 block">
                            {t.estFreight || 'Est. Freight'}: ~₹{c.estimated_transport_cost_per_qtl}/Qtl
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-base font-black text-emerald-800">
                        ₹{c.modal_price.toLocaleString()}
                        <span className="text-[10px] font-medium text-slate-500">/Qtl</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        ₹{c.price_per_kg}/kg
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Practical Disclaimer */}
          <div className="bg-amber-100/50 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-amber-900 font-medium leading-relaxed">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <span>{bestMarketInsight.disclaimer}</span>
          </div>
        </div>
      )}

      {/* 5. Commodity Selector & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <span>{t.selectCrop || 'Select Crop for Market Pricing'}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {dataSourceNotice || `Latest available market data: ${lastUpdated}`}
          </span>
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {COMMON_CROPS.map((c) => {
            const isSelected = selectedCrop.toLowerCase() === c.toLowerCase();
            const isFarmerGrown = farmerCrops.some(fc => fc.toLowerCase() === c.toLowerCase());
            return (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-500/20'
                    : isFarmerGrown
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{c}</span>
                {isFarmerGrown && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-emerald-500'
                    }`}
                  ></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Summary Overview Metrics */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {t.avgPrice || 'Average Modal Price'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-slate-900">
                ₹{summary.average_price?.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">/ Qtl</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
              ≈ ₹{Math.round(summary.average_price / 100)} / kg {t.wholesaleApprox || 'wholesale'}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {t.highestPrice || 'Highest Traded Rate'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-emerald-700">
                ₹{summary.highest_price?.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">/ Qtl</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
              Grade-A quality
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {t.lowestPrice || 'Lowest Traded Rate'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-700">
                ₹{summary.lowest_price?.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">/ Qtl</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
              General / mixed grade
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {t.lastUpdated || 'Arrival Date & Source'}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-base font-extrabold text-slate-900">
                {summary.last_updated}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block mt-0.5 truncate">
              {activeMandi?.name || 'Local APMC'}
            </span>
          </div>
        </div>
      )}

      {/* 7. AI Market Insight Banner */}
      {aiInsight && (
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 text-xs text-emerald-900 leading-relaxed shadow-xs flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-emerald-950 mb-0.5">
              {t.aiMarketInsightTitle || 'Market Intelligence Advisory'}:
            </span>
            <span>{aiInsight}</span>
          </div>
        </div>
      )}

      {/* 8. Price Cards / Table Header with View Switcher */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <h3 className="font-black text-base text-slate-900">
          {t.allMarketCommodities || 'Available Commodities'} ({records.length})
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.cardsView || 'Cards'}
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.tableView || 'Table'}
            </button>
          </div>
        </div>
      </div>

      {/* 9. Loading State or Price Cards Rendering */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-card space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-800">
            {t.loadingPrices || 'Calculating nearest mandi & fetching real market rates...'}
          </h4>
          <p className="text-xs text-slate-500">
            Evaluating geographic distances and verified APMC commodity trading prices.
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-card space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-800">
            {t.noMarketData || 'Market found, but latest price data is currently unavailable for this filter.'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching to another nearby mandi (e.g. Bowenpally, Enumamula, Gudimalkapur) or selecting a different crop.
          </p>
          <button
            onClick={() => setShowMandiModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t.searchMandis || 'Search Mandis'}</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-6">
          {/* A. Farmer's Cultivated Crops Section */}
          {farmerCropRecords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.yourCrops || 'Your Cultivated Crops (Priority)'}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  From your farmer profile
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {farmerCropRecords.map((r, idx) => (
                  <MarketPriceCard key={`farmer-${idx}`} record={r} isFarmerCrop={true} language={language} />
                ))}
              </div>
            </div>
          )}

          {/* B. All Other Market Commodities */}
          {otherRecords.length > 0 && (
            <div className="space-y-3">
              {farmerCropRecords.length > 0 && (
                <div className="border-t border-slate-200/80 pt-4 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    {t.allMarketCommodities || 'All Market Commodities'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherRecords.map((r, idx) => (
                  <MarketPriceCard key={`other-${idx}`} record={r} isFarmerCrop={false} language={language} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <MarketPriceTable
          records={sortedRecords}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          language={language}
        />
      )}

      {/* 10. Historical Price Trend Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                {t.priceTrendHistory || 'Price Trend History'}: {selectedCrop}
              </h4>
              <p className="text-xs text-slate-500">
                Modal price movement across previous trading cycles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTrendDays(7)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                trendDays === 7
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.days7 || '7 Days'}
            </button>
            <button
              onClick={() => setTrendDays(30)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                trendDays === 30
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.days30 || '30 Days'}
            </button>
          </div>
        </div>

        {/* Trend Bar Chart Visualization */}
        {historyTrend.length > 0 ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 gap-2 items-end h-44 pt-6 px-2 border-b border-slate-200">
              {historyTrend.slice(-7).map((pt, idx) => {
                const maxInTrend = Math.max(...historyTrend.map(h => h.price));
                const minInTrend = Math.min(...historyTrend.map(h => h.price));
                const heightPercent =
                  maxInTrend === minInTrend
                    ? 60
                    : Math.max(25, Math.min(100, Math.round(((pt.price - minInTrend) / (maxInTrend - minInTrend)) * 75 + 25)));

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-black text-slate-700 opacity-80 group-hover:opacity-100">
                      ₹{Math.round(pt.price)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all group-hover:from-emerald-500 group-hover:to-teal-300 shadow-xs"
                    ></div>
                    <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                      {pt.date}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-2">
              <span>* Modal trading rates recorded per Quintal</span>
              <span>Units: INR (₹) / Quintal</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            Trend history loading...
          </p>
        )}
      </div>

      {/* 11. Search Mandis Modal */}
      {showMandiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {t.marketCatalog || 'Indian APMC Mandi Directory'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Search across verified agricultural markets by name, district, or state
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMandiModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchMarketPlaceholder || "Search market (e.g. Shamshabad, Bowenpally, Warangal, Kolar, Madanapalle, Guntur)..."}
                value={mandiSearchQuery}
                onChange={(e) => setMandiSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            {/* Mandi List */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {filteredMandisModal.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {t.noResults || 'No matching APMC markets found.'}
                </div>
              ) : (
                filteredMandisModal.map((m) => {
                  const isSelected = activeMandi?.name === m.name;
                  return (
                    <button
                      key={m.id || m.name}
                      onClick={() => handleSelectMarket(m)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-900">{m.name}</h4>
                          {m.type && (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded-full">
                              {m.type}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {m.district}, {m.state}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {m.distance_km !== undefined && m.distance_km !== null ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                            <span>🚗</span>
                            <span>{m.formatted_distance || `${m.distance_km} km ${t.byRoad || 'by road'}`}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">
                            {t.selectMarket || 'Select Mandi'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
