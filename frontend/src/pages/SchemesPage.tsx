import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Info,
  MapPin,
  Sprout,
  Layers,
  FileText,
  Building,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Droplets,
  Tractor,
  Coins
} from 'lucide-react';
import { GovernmentScheme, SchemesResponse, LanguageCode } from '../types';
import { api } from '../services/api';
import { translations } from '../utils/translations';

interface SchemesPageProps {
  language: LanguageCode;
  onAskAssistantWithScheme?: (scheme: GovernmentScheme) => void;
}

export const SchemesPage: React.FC<SchemesPageProps> = ({
  language,
  onAskAssistantWithScheme
}) => {
  const t = translations[language];

  // Farmer Profile & Context State
  const [farmerName, setFarmerName] = useState<string>(() => {
    return localStorage.getItem('agricare_farmer_name') || 'Kisan Bandhu';
  });
  const [farmerState, setFarmerState] = useState<string>(() => {
    return localStorage.getItem('agricare_farmer_state') || 'Telangana';
  });
  const [farmerDistrict, setFarmerDistrict] = useState<string>(() => {
    return localStorage.getItem('agricare_farmer_district') || 'Ranga Reddy';
  });
  const [farmerLocation, setFarmerLocation] = useState<string>(() => {
    return (
      localStorage.getItem('agricare_farm_location_name') ||
      localStorage.getItem('agricare_farmer_village') ||
      'Kummariguda'
    );
  });
  const [farmerCrops, setFarmerCrops] = useState<string[]>(() => {
    const raw = localStorage.getItem('agricare_farmer_crops') || 'Paddy, Tomato, Cotton, Chilli';
    return raw.split(',').map(c => c.trim()).filter(Boolean);
  });
  const [landArea, setLandArea] = useState<string>(() => {
    return localStorage.getItem('agricare_farmer_land_area') || '5';
  });
  const [isEditingLand, setIsEditingLand] = useState<boolean>(false);

  // Schemes Data & Filter State
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [recommendedCount, setRecommendedCount] = useState<number>(0);
  const [totalSchemes, setTotalSchemes] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [activeModalScheme, setActiveModalScheme] = useState<GovernmentScheme | null>(null);

  // Fetch schemes from API
  const fetchSchemes = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const parsedLand = landArea ? parseFloat(landArea) : undefined;
      const res: SchemesResponse = await api.getGovernmentSchemes({
        state: farmerState,
        district: farmerDistrict,
        crops: farmerCrops.join(','),
        land_area: parsedLand && !isNaN(parsedLand) ? parsedLand : undefined,
        category: selectedCategory,
        search: searchQuery.trim() || undefined
      });

      setSchemes(res.schemes || []);
      setRecommendedCount(res.recommended_count || 0);
      setTotalSchemes(res.total_schemes || 0);
    } catch (err) {
      console.error('Failed to load schemes:', err);
      setErrorMsg('Unable to load the latest scheme information. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [farmerState, farmerDistrict, selectedCategory]);

  // Handle Search on enter or typing with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchemes();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveLandArea = (val: string) => {
    setLandArea(val);
    localStorage.setItem('agricare_farmer_land_area', val);
    setIsEditingLand(false);
    fetchSchemes();
  };

  // Categories list
  const categories = [
    { id: 'All', label: 'All Schemes', icon: Landmark },
    { id: 'Income Support', label: 'Income Support', icon: Coins },
    { id: 'Loans', label: 'Loans & Credit', icon: CreditCard },
    { id: 'Insurance', label: 'Crop Insurance', icon: ShieldCheck },
    { id: 'Subsidies', label: 'All Subsidies', icon: Sparkles },
    { id: 'Equipment', label: 'Farm Equipment', icon: Tractor },
    { id: 'Irrigation', label: 'Irrigation & Solar', icon: Droplets },
    { id: 'Seeds & Fertilizers', label: 'Seeds & Fertilizer', icon: Sprout },
    { id: 'State Schemes', label: `${farmerState} Schemes`, icon: Building }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Income Support': return <Coins className="w-3.5 h-3.5" />;
      case 'Loans': return <CreditCard className="w-3.5 h-3.5" />;
      case 'Insurance': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Equipment': return <Tractor className="w-3.5 h-3.5" />;
      case 'Irrigation': return <Droplets className="w-3.5 h-3.5" />;
      case 'Seeds & Fertilizers': return <Sprout className="w-3.5 h-3.5" />;
      default: return <Landmark className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (code?: string, statusText?: string) => {
    switch (code) {
      case 'likely':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>🟢 Likely Relevant</span>
          </span>
        );
      case 'check':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>🟡 Check Eligibility</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>⚪ More Info Required</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-green-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Government Schemes & Subsidies
                </h1>
                <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Verified 2026
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Find government schemes, subsidies, agricultural loans, insurance, and farmer support programs relevant to you.
              </p>
            </div>
          </div>

          <button
            onClick={fetchSchemes}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all self-end md:self-auto"
            title="Refresh schemes database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {/* Farmer Profile Context Pills */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Location Pill */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">
                  Your Location
                </span>
                <span className="font-bold text-slate-900">
                  {farmerLocation}, {farmerDistrict}, {farmerState}
                </span>
              </div>
            </div>

            {/* Crops Pill */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">
                  Your Crops
                </span>
                <span className="font-bold text-slate-900">
                  {farmerCrops.join(' • ')}
                </span>
              </div>
            </div>

            {/* Land Area Pill */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">
                  Land Holding
                </span>
                {isEditingLand ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      placeholder="acres"
                      defaultValue={landArea}
                      onBlur={(e) => handleSaveLandArea(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveLandArea((e.target as HTMLInputElement).value);
                      }}
                      className="w-16 px-1.5 py-0.5 text-xs font-bold border border-emerald-500 rounded bg-emerald-50 focus:outline-none"
                      autoFocus
                    />
                    <span className="text-[11px] text-slate-500 font-medium">acres</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingLand(true)}
                    className="font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1"
                    title="Click to edit land size"
                  >
                    <span>{landArea ? `${landArea} acres` : 'Not specified'}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold underline ml-1">Edit</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium italic">
            Location Priority: District → State ({farmerState}) → Central Government
          </div>
        </div>
      </div>

      {/* 2. "Recommended For You" Top Section */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 text-white rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Recommended For You
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Based on your location ({farmerState}), profile crops ({farmerCrops.slice(0, 3).join(', ')}), and landholding.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-xl font-black text-amber-300 block leading-tight">
              {recommendedCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
              Schemes Relevant to You
            </span>
          </div>
        </div>

        {/* Horizontal Quick Recommendation Carousel/Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {schemes.slice(0, 3).map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveModalScheme(s)}
              className="bg-white/95 text-slate-900 p-3.5 rounded-2xl border border-white/40 shadow-sm hover:shadow-md hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                    {getCategoryIcon(s.category)}
                    <span>{s.category}</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {s.scope === 'State' ? `🏛️ ${s.state}` : '🇮🇳 Central'}
                  </span>
                </div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 line-clamp-1">
                  {s.short_name || s.title}
                </h3>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {s.benefits}
                </p>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:text-emerald-900">
                <span>View Eligibility & Benefits</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schemes, subsidies, loans, tractors, solar pumps, insurance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4. Schemes Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-12 bg-slate-100 rounded" />
              <div className="h-8 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800">No matching schemes found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords or select 'All Schemes' to view available state and national farmer support programs.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-800"
          >
            Show All Schemes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 group"
            >
              {/* Card Top: Category & Status */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {getCategoryIcon(scheme.category)}
                    <span>{scheme.category}</span>
                  </span>

                  {getStatusBadge(scheme.eligibility_code, scheme.eligibility_status)}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    {scheme.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                    <span>🏛️ {scheme.scope === 'State' ? `${scheme.state} State Govt` : 'Central Govt of India'}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{scheme.department}</span>
                  </div>
                </div>

                {/* Relevance Reason */}
                {scheme.relevance_reason && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-bold">Why this may be relevant: </strong>
                    {scheme.relevance_reason}
                  </div>
                )}

                {/* Key Benefits */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Key Benefit & Subsidy
                  </span>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed line-clamp-2">
                    {scheme.benefits}
                  </p>
                </div>

                {/* Required Documents Preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Essential Documents
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {scheme.required_documents.slice(0, 3).map((doc, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        {doc.split('(')[0].trim()}
                      </span>
                    ))}
                    {scheme.required_documents.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold self-center">
                        +{scheme.required_documents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: Buttons & Verified Date */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Last verified: {scheme.last_verified}</span>
                  <span className="text-emerald-700 font-semibold truncate max-w-[180px]">
                    ✓ {scheme.official_source.split('(')[0].trim()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveModalScheme(scheme)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <a
                    href={scheme.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 hover:border-emerald-300"
                  >
                    <span>Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Comprehensive Scheme Details Modal */}
      {activeModalScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5 p-5 sm:p-6 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {getCategoryIcon(activeModalScheme.category)}
                    <span>{activeModalScheme.category}</span>
                  </span>
                  <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {activeModalScheme.scope === 'State' ? `🏛️ ${activeModalScheme.state} State` : '🇮🇳 Government of India'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {activeModalScheme.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeModalScheme.department}
                </p>
              </div>

              <button
                onClick={() => setActiveModalScheme(null)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {/* Relevancy Notice */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Relevance Assessment for Your Farm:</p>
                  <p className="text-emerald-900">{activeModalScheme.relevance_reason}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Scheme Description
                </h4>
                <p className="text-slate-700">{activeModalScheme.description}</p>
              </div>

              {/* Benefits */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Financial Benefits & Subsidies</span>
                </h4>
                <p className="text-slate-800 font-semibold">{activeModalScheme.benefits}</p>
              </div>

              {/* Who Can Apply & Eligibility */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Who Can Apply (Eligibility Criteria)
                </h4>
                <p className="text-slate-700 bg-white border border-slate-200 p-3 rounded-xl">
                  {activeModalScheme.eligibility_summary}
                </p>
              </div>

              {/* Required Documents */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Officially Required Documents</span>
                </h4>
                <ul className="space-y-1.5 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  {activeModalScheme.required_documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step by step application process */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  How to Apply
                </h4>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  {activeModalScheme.application_process}
                </p>
              </div>

              {/* Verification & Source */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
                <span>Official Source: <strong>{activeModalScheme.official_source}</strong></span>
                <span>Verified: <strong>{activeModalScheme.last_verified}</strong></span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 italic">
                Final eligibility is determined by the respective government department.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveModalScheme(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Close
                </button>

                <a
                  href={activeModalScheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Apply on Official Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
