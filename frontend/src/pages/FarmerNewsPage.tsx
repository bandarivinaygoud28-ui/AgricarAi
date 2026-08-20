import React, { useState, useEffect } from 'react';
import { NewsArticle, LanguageCode } from '../types';
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
  Wheat
} from 'lucide-react';

interface FarmerNewsPageProps {
  language: LanguageCode;
}

const CROP_CATEGORIES = [
  "All",
  "🌾 Paddy / Rice",
  "🌽 Maize",
  "🧅 Onion",
  "🥔 Potato",
  "🍅 Tomato",
  "🌶️ Chilli",
  "🫘 Pulses",
  "🍬 Sugar",
  "🌻 Oilseeds",
  "📈 Mandi / Commodity Market",
  "🏛️ MSP",
  "🏛️ Government / Agriculture Policy",
  "🌾 General Agriculture"
];


const FILTER_TABS = [
  "All",
  "Mandi",
  "Crop Prices",
  "MSP",
  "Government",
  "Export/Import",
  "Weather & Agriculture"
];

export const FarmerNewsPage: React.FC<FarmerNewsPageProps> = ({ language }) => {
  const t = translations[language];

  // Farmer's farm location from localStorage or default
  const [activeLocation, setActiveLocation] = useState<string>(() => {
    return localStorage.getItem('agricare_farm_location_name') || 'Karnataka, India';
  });

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [newsSource, setNewsSource] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real-time live news
  const fetchNews = async (forceRefresh: boolean = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const res = await api.getNews({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        filter: selectedFilter !== "All" ? selectedFilter : undefined,
        search: activeSearch || undefined,
        location: activeLocation,
        language: language,
        limit: 30,
        force_refresh: forceRefresh
      });

      if (res && Array.isArray(res.articles)) {
        setArticles(res.articles);
        setLastUpdated(res.last_updated || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        setNewsSource(res.source || 'Live Indian Agricultural & Mandi Feeds');
      } else {
        throw new Error('Invalid news format');
      }
    } catch (e: any) {
      console.error('Market news error:', e);
      setErrorMessage(t.newsError || "Unable to fetch the latest market news. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, selectedFilter, activeSearch, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-extrabold flex items-center gap-1.5 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                <span>Live Indian Agricultural Newsroom</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Real-Time Feeds
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>🌾 {t.newsHeader}</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl font-medium leading-relaxed">
              {t.newsSubtitle}
            </p>
          </div>

          {/* Refresh Action & Status */}
          <div className="flex flex-col sm:items-end gap-2">
            <button
              onClick={() => fetchNews(true)}
              disabled={isLoading || isRefreshing}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t.refreshNews}</span>
            </button>

            {lastUpdated && (
              <span className="text-[11px] text-emerald-200/80 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{t.newsUpdated}: {lastUpdated}</span>
              </span>
            )}
          </div>
        </div>

        {/* Location Relevance Banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-emerald-200 font-medium">{t.showingTailoredNews}:</span>
            <span className="font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
              {activeLocation}
            </span>
          </div>

          <span className="text-[11px] text-emerald-300/70">
            Source: {newsSource || 'APEDA / PIB / Agmarknet / Google News Agriculture'}
          </span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="glass-card p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-xs">
          <Search className="w-4 h-4 text-emerald-700 ml-2" />
          <input
            type="text"
            placeholder={t.searchNewsPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-2 py-1 text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-none font-medium placeholder:text-slate-400"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 font-bold"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Primary Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Filters:</span>
          </span>
          {FILTER_TABS.map((filt) => (
            <button
              key={filt}
              onClick={() => {
                setSelectedFilter(filt);
                setSelectedCategory("All");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilter === filt
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {t.newsFilters[filt] || filt}
            </button>
          ))}
        </div>

        {/* Crop & Commodity Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedFilter("All");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              {t.newsCategories[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900 shadow-xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-red-950">Market News Error</h4>
            <p className="text-xs text-red-800 mt-0.5 font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <button
            onClick={() => fetchNews(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-0 h-80 flex flex-col">
              <div className="h-44 bg-slate-200 w-full" />
              <div className="p-5 space-y-3 flex-1">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Articles Grid */}
      {!isLoading && !errorMessage && (
        <>
          {articles.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-base text-slate-800">No market news found for this selection.</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All News".</p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedFilter("All");
                  handleClearSearch();
                }}
                className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} language={language} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
