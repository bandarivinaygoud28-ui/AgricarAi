import React, { useState, useEffect, useMemo } from 'react';
import {
  NewsArticle,
  NewsResponse,
  NewsSections,
  LanguageCode
} from '../types';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { NewsCard } from '../components/NewsCard';
import {
  Newspaper,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  TrendingUp,
  Filter,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Wheat,
  Building,
  Navigation,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Layers3,
  Flame
} from 'lucide-react';

interface FarmerNewsPageProps {
  language: LanguageCode;
}

export const FarmerNewsPage: React.FC<FarmerNewsPageProps> = ({ language }) => {
  const t = translations[language];

  // 1. Farmer Location & Profile State from localStorage
  const [district, setDistrict] = useState<string>(() => {
    return localStorage.getItem('agricare_farmer_district') || 'Ranga Reddy';
  });

  const [state, setState] = useState<string>(() => {
    return localStorage.getItem('agricare_farmer_state') || 'Telangana';
  });

  const [farmLocationName, setFarmLocationName] = useState<string>(() => {
    return (
      localStorage.getItem('agricare_farm_location_name') ||
      'Kummariguda, Telangana'
    );
  });

  const [farmerCrops, setFarmerCrops] = useState<string[]>(() => {
    const saved = localStorage.getItem('agricare_farmer_crops');
    if (saved) {
      return saved.split(',').map(c => c.trim()).filter(Boolean);
    }
    return ['Tomato', 'Paddy', 'Cotton', 'Chilli'];
  });

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
    return { lat: 17.25, lon: 78.4 };
  });

  // 2. News Data State
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sections, setSections] = useState<NewsSections | null>(null);
  const [farmerContext, setFarmerContext] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch location-prioritized news
  const fetchNews = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const res: NewsResponse = await api.getNews({
        district: district,
        state: state,
        crops: farmerCrops.join(','),
        lat: coords?.lat,
        lon: coords?.lon,
        location: farmLocationName,
        search: activeSearch || undefined,
        language: language,
        limit: 45,
        force_refresh: forceRefresh
      });

      if (res && Array.isArray(res.articles)) {
        setArticles(res.articles);
        setSections(res.sections || null);
        setFarmerContext(res.farmer_context || null);
        setLastUpdated(
          res.last_updated ||
            new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
        );
      } else {
        throw new Error('Invalid news format');
      }
    } catch (e: any) {
      console.error('Market news error:', e);
      setErrorMessage(
        t.newsError || 'Unable to fetch the latest farmer news. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [district, state, activeSearch, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  // 3. Fallback Priority Filter Logic (Guarantees Never "0 articles" by using 5-Tier Fallback Cascade)
  const displayArticlesForTab = useMemo(() => {
    if (activeTab === 'all') return articles;

    if (activeTab === 'district') {
      // 5-Tier Fallback Hierarchy for District Filter:
      // Tier 1: Ranga Reddy District (Highest Priority)
      // Tier 2: Telangana State Farmer News
      // Tier 3: Farmer's Crop News (Tomato, Paddy, Cotton, Chilli)
      // Tier 4: Nearby Mandi & Prices
      // Tier 5: India National Schemes & Policies
      const tier1 = articles.filter(a => a.priority_tier === 1);
      const combined = [...tier1];
      const seen = new Set(combined.map(c => c.id));

      const tier2 = articles.filter(a => a.priority_tier === 2);
      const tier3 = articles.filter(a => a.priority_tier === 3);
      const tier4 = articles.filter(a => a.priority_tier === 4);
      const tier5 = articles.filter(a => a.priority_tier === 5);

      for (const pool of [tier2, tier3, tier4, tier5]) {
        for (const item of pool) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            combined.push(item);
          }
        }
      }
      return combined;
    }

    if (activeTab === 'crops') {
      const cropList = articles.filter(
        a =>
          a.priority_tier === 3 ||
          farmerCrops.some(
            fc =>
              a.crop?.toLowerCase().includes(fc.toLowerCase()) ||
              a.title.toLowerCase().includes(fc.toLowerCase())
          )
      );
      const combined = [...cropList];
      const seen = new Set(combined.map(c => c.id));
      for (const item of articles) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }
      return combined;
    }

    if (activeTab === 'mandi') {
      const mandiList = articles.filter(
        a =>
          a.priority_tier === 4 ||
          a.category?.toLowerCase().includes('mandi') ||
          a.title.toLowerCase().includes('mandi') ||
          a.title.toLowerCase().includes('price') ||
          a.title.toLowerCase().includes('arrival')
      );
      const combined = [...mandiList];
      const seen = new Set(combined.map(c => c.id));
      for (const item of articles) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }
      return combined;
    }

    if (activeTab === 'state') {
      const stateList = articles.filter(
        a =>
          a.priority_tier === 2 ||
          a.location_tag?.toLowerCase().includes(state.toLowerCase()) ||
          a.title.toLowerCase().includes(state.toLowerCase()) ||
          a.summary.toLowerCase().includes('rythu')
      );
      const combined = [...stateList];
      const seen = new Set(combined.map(c => c.id));
      for (const item of articles) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }
      return combined;
    }

    if (activeTab === 'national') {
      const nationalList = articles.filter(
        a =>
          a.priority_tier === 5 ||
          a.location_tag?.toLowerCase().includes('india') ||
          a.title.toLowerCase().includes('pm-kisan') ||
          a.title.toLowerCase().includes('fertilizer subsidy')
      );
      const combined = [...nationalList];
      const seen = new Set(combined.map(c => c.id));
      for (const item of articles) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }
      return combined;
    }

    if (activeTab === 'schemes') {
      const schemeList = articles.filter(
        a =>
          a.category?.toLowerCase().includes('scheme') ||
          a.category?.toLowerCase().includes('fertilizer') ||
          a.category?.toLowerCase().includes('insurance') ||
          a.title.toLowerCase().includes('subsidy') ||
          a.title.toLowerCase().includes('loan') ||
          a.title.toLowerCase().includes('rythu') ||
          a.title.toLowerCase().includes('kcc')
      );
      const combined = [...schemeList];
      const seen = new Set(combined.map(c => c.id));
      for (const item of articles) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }
      return combined;
    }

    return articles;
  }, [articles, activeTab, district, state, farmerCrops]);

  // Counts for breakdown summary banner
  const districtCount = sections?.district_news?.length || articles.filter(a => a.priority_tier === 1).length;
  const stateCount = sections?.state_news?.length || articles.filter(a => a.priority_tier === 2).length;
  const cropCount = sections?.crop_news?.length || articles.filter(a => a.priority_tier === 3).length;
  const mandiCount = sections?.nearby_mandi_news?.length || articles.filter(a => a.priority_tier === 4).length;
  const nationalCount = sections?.india_news?.length || articles.filter(a => a.priority_tier === 5).length;

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* 1. Location-Prioritized News Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-extrabold flex items-center gap-1.5 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                <span>Location-Prioritized Farmer Feed</span>
              </span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Verified Agricultural Visuals
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>🌾 {t.newsHeader || 'Farmer Market & Agricultural News'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl font-medium leading-relaxed">
              Real-time agricultural intelligence prioritized for your farm in{' '}
              <strong className="text-white font-bold">{district}, {state}</strong>, your cultivated crops ({farmerCrops.join(', ')}), and nearest mandis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNews(true)}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/40 text-white text-xs font-bold rounded-xl transition-all shadow-md backdrop-blur-xs disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshing || isLoading ? 'animate-spin' : ''
                }`}
              />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>
          </div>
        </div>

        {/* Farmer Context Strip */}
        <div className="mt-5 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-white bg-white/10 px-3 py-1 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {farmLocationName} ({district})
              </span>
            </span>

            <span className="flex items-center gap-1.5 font-bold text-emerald-100 bg-white/10 px-3 py-1 rounded-xl">
              <Wheat className="w-3.5 h-3.5 text-emerald-300" />
              <span>Crops: {farmerCrops.join(', ')}</span>
            </span>

            {farmerContext?.nearest_mandi && (
              <span className="flex items-center gap-1.5 font-bold text-emerald-100 bg-white/10 px-3 py-1 rounded-xl">
                <Building className="w-3.5 h-3.5 text-emerald-300" />
                <span>Mandi: {farmerContext.nearest_mandi}</span>
              </span>
            )}
          </div>

          <span className="text-[11px] text-emerald-300/80 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated}</span>
          </span>
        </div>
      </div>

      {/* 2. Priority Breakdown Metric Strip (Never "0 articles" Guarantee) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              5-Tier Priority Hierarchy & Live Feed Summary
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            Priority System (Never "0 Articles")
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveTab('district')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
              activeTab === 'district'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200/80 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
              📍 {district}
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-base sm:text-lg font-black">{districtCount} local articles</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-900/20">Tier 1</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('state')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
              activeTab === 'state'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-teal-50/60 hover:bg-teal-100/70 border-teal-200/80 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
              🏛️ {state}
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-base sm:text-lg font-black">{stateCount} relevant articles</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-teal-900/20">Tier 2</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('crops')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
              activeTab === 'crops'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-amber-50/60 hover:bg-amber-100/70 border-amber-200/80 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
              🌾 Your Crops
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-base sm:text-lg font-black">{cropCount} articles</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-900/20">Tier 3</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('national')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
              activeTab === 'national'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-indigo-50/60 hover:bg-indigo-100/70 border-indigo-200/80 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-90">
              🇮🇳 India Farmer News
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-base sm:text-lg font-black">{nationalCount} articles</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-900/20">Tier 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Priority Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${district} farm news, fertilizer buffer, Rythu Bharosa, tomato prices, PM-KISAN...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {activeSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 font-bold"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* Priority Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {[
            { id: 'all', label: '🌟 All Location-Prioritized News' },
            { id: 'district', label: `📍 ${district} News (Tier 1)` },
            { id: 'crops', label: '🌾 Your Crop News (Tier 3)' },
            { id: 'mandi', label: '📈 Mandi & Prices (Tier 4)' },
            { id: 'state', label: `🏛️ ${state} News (Tier 2)` },
            { id: 'national', label: '🇮🇳 India Schemes & Policies (Tier 5)' },
            { id: 'schemes', label: '💰 Subsidies & Loans' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  isActive
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. News Feed Content */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-card space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <h4 className="font-extrabold text-sm text-slate-800">
            Scanning verified agricultural news for {district}, {state}...
          </h4>
          <p className="text-xs text-slate-500">
            Matching authentic crop, fertilizer, mandi, and government advisory visual feeds.
          </p>
        </div>
      ) : errorMessage ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="font-extrabold text-sm text-amber-900">{errorMessage}</h4>
          <button
            onClick={() => fetchNews(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : activeTab !== 'all' ? (
        /* Single Tab View with Fallback Hierarchy */
        <div className="space-y-4">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Showing {displayArticlesForTab.length} prioritized articles for{' '}
                <strong>{activeTab === 'district' ? `${district} & ${state}` : activeTab}</strong>
              </span>
            </div>
            {activeTab === 'district' && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                {district} items prioritized first • Fallback to {state} & Crops
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayArticlesForTab.map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                language={language}
                isPriority={art.priority_tier === 1}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Organized Sectioned View (Priority Hierarchy) */
        <div className="space-y-8">
          {/* SECTION 1: DISTRICT-LEVEL FARMER NEWS (Highest Priority) */}
          {sections?.district_news && sections.district_news.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="font-black text-lg text-slate-900">
                      📍 {district} Farmer News (Top Priority)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Official district administration updates, fertilizer availability, and local farm advisories
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Tier 1 Priority ({sections.district_news.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.district_news.map((art) => (
                  <NewsCard
                    key={art.id}
                    article={art}
                    language={language}
                    isPriority={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: FARMER'S CULTIVATED CROPS NEWS */}
          {sections?.crop_news && sections.crop_news.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500 text-white rounded-lg">
                    <Wheat className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="font-black text-lg text-slate-900">
                      🌾 Your Crop News ({farmerCrops.join(', ')})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Price trends, harvest reports, and pest advisories for your cultivated crops
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Tier 3 Priority ({sections.crop_news.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.crop_news.map((art) => (
                  <NewsCard key={art.id} article={art} language={language} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: STATE-LEVEL FARMER NEWS (Rythu Bharosa / Welfare) */}
          {sections?.state_news && sections.state_news.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-teal-600 text-white rounded-lg">
                    <Building className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="font-black text-lg text-slate-900">
                      🏛️ {state} State Farmer News & Schemes
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rythu Bharosa, loan waiver progress, state subsidies, and irrigation policies
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">
                  Tier 2 Priority ({sections.state_news.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.state_news.map((art) => (
                  <NewsCard key={art.id} article={art} language={language} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: NEARBY MANDI & MARKET PRICE UPDATES */}
          {sections?.nearby_mandi_news && sections.nearby_mandi_news.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="font-black text-lg text-slate-900">
                      📈 Nearby Mandi & Price Updates
                    </h2>
                    <p className="text-xs text-slate-500">
                      Wholesale commodity arrivals and trading rates at regional APMC markets
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Tier 4 Priority ({sections.nearby_mandi_news.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.nearby_mandi_news.map((art) => (
                  <NewsCard key={art.id} article={art} language={language} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: NATIONAL FARMER WELFARE SCHEMES & CENTRAL POLICIES */}
          {sections?.india_news && sections.india_news.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="font-black text-lg text-slate-900">
                      🇮🇳 India National Farmer Schemes & MSP Policies
                    </h2>
                    <p className="text-xs text-slate-500">
                      PM-KISAN, Kisan Credit Card (KCC), PMFBY crop insurance, and Central fertilizer subsidies
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  Tier 5 Priority ({sections.india_news.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.india_news.map((art) => (
                  <NewsCard key={art.id} article={art} language={language} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
