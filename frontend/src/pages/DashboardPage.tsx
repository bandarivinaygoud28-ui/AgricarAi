import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ScanLine,
  TrendingUp,
  CloudSun,
  MessageSquare,
  Newspaper,
  Tractor,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Landmark,
  Sparkles
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { api } from '../services/api';

interface DashboardPageProps {
  language: LanguageCode;
  onNavigate: (tab: string, extra?: any) => void;
  farmerName: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  language,
  onNavigate,
  farmerName
}) => {
  const t = translations[language];

  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Farmer's synchronized location and crop preferences
  const farmerState = localStorage.getItem('agricare_farmer_state') || 'Telangana';
  const farmerDistrict = localStorage.getItem('agricare_farmer_district') || 'Warangal';
  const farmLocation = localStorage.getItem('agricare_farm_location_name') || `${farmerDistrict}, ${farmerState}`;
  const farmerCrop = (localStorage.getItem('agricare_farmer_crops')?.split(',')[0]?.trim()) || 'Tomato';

  const farmCoords = (() => {
    const saved = localStorage.getItem('agricare_farm_coords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  })();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [marketRes, weatherRes, historyRes] = await Promise.allSettled([
          api.getMarketPrices({
            crop: farmerCrop,
            state: farmerState && farmerState !== 'All States' ? farmerState : undefined,
            district: farmerDistrict || undefined
          }),
          api.getWeather({
            location: farmLocation,
            lat: farmCoords?.lat,
            lon: farmCoords?.lon,
            crop: farmerCrop
          }),
          api.getScanHistory()
        ]);

        if (marketRes.status === 'fulfilled') setMarketSummary(marketRes.value);
        if (weatherRes.status === 'fulfilled') setWeatherData(weatherRes.value);
        if (historyRes.status === 'fulfilled') setRecentScans(historyRes.value || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [farmLocation, farmerCrop, farmerDistrict, farmerState]);

  return (
    <div className="space-y-8 pb-12">
      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-forest-900 to-[#072412] text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-emerald-800/40">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-green-400/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-800/70 border border-emerald-600/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-200 tracking-wide backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>✦ Next-Gen Agricultural Intelligence for Indian Farmers</span>
            </div>

            {/* Large Bold Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              AI-Powered Crop Health & <span className="text-emerald-400">Farmer Advisory</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
              Identify crop diseases with high accuracy, understand real-time weather risks, receive customized chemical & organic treatment guidance, and access verified market information in one platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('detect')}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 transform active:scale-95"
              >
                <span>Start Disease Detection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('market-prices')}
                className="px-6 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 font-bold text-sm transition-all backdrop-blur-sm"
              >
                Explore Market Prices
              </button>
            </div>

            {/* Feature Badges Below */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-emerald-800/60 text-xs font-semibold text-emerald-200/90">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>6 Major Crops Supported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>English • తెలుగు • हिन्दी</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AI-Powered Farmer Guidance</span>
              </div>
            </div>
          </div>

          {/* 4. HERO AI DIAGNOSTIC TERMINAL CARD (Desktop Right Side) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-emerald-700/50 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-400">
                    AI Diagnostic Terminal
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">v2.4 Ready</span>
              </div>

              {/* Sample Scan Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">Tomato Leaf Scan</h4>
                  <p className="text-[11px] text-slate-400">Sample Live Detection</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-600/60 text-emerald-300 text-xs font-black">
                  94.2% Confidence
                </div>
              </div>

              {/* Disease Diagnosis Box */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Disease Detected
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
                    Severity: Moderate
                  </span>
                </div>
                <p className="text-base font-extrabold text-amber-300">
                  Tomato Early Blight (ఆకు మచ్చ తెగులు)
                </p>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Weather Risk</span>
                  <span className="text-xs font-black text-red-400">HIGH (82% Humidity)</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Market Modal Price</span>
                  <span className="text-xs font-black text-emerald-300">₹2,100 / Qtl</span>
                </div>
              </div>

              {/* Terminal Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onNavigate('detect')}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Test Sample Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('assistant')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "HOW AGRICARE AI WORKS" PLATFORM SECTION */}
      <section className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            How AgriCare AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            4 simple steps designed specifically for practical farm decision making
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all space-y-2 group">
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-block">
              01 Detect
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Upload & Scan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload or snap a photo of the affected plant leaf, stem, or fruit to identify crop diseases instantly.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all space-y-2 group">
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-block">
              02 Understand
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Analyze Symptoms
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Understand the biological pathogen, infection causes, and severity risk level on your farm.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all space-y-2 group">
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-block">
              03 Act
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Treatment Advisory
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive dosage guidance for chemical fungicides, bio-pesticides, and immediate containment steps.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all space-y-2 group">
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 inline-block">
              04 Monitor
            </span>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Market & Weather
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track live mandi commodity rates, spraying windows, and regional agro-meteorological alerts.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FARMER DASHBOARD & STATS GRID */}
      <section className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Good morning, {farmerName.split(' ')[0]} 👨‍🌾
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active Farm
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Here is your farm intelligence overview for {farmerDistrict} District, {farmerState}.
            </p>
          </div>

          <button
            onClick={() => onNavigate('detect')}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <ScanLine className="w-4 h-4" />
            <span>New Crop Scan</span>
          </button>
        </div>

        {/* 5 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Crop Health</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">92%</p>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block">
              Good Condition
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Recent Scan</span>
              <ScanLine className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-sm font-black text-slate-900 truncate">
              {recentScans[0]?.disease ? recentScans[0].disease.split('(')[0] : `${farmerCrop} Health Scan`}
            </p>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block">
              {recentScans[0]?.severity ? `${recentScans[0].severity} Risk` : 'Optimal State'}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Weather Risk</span>
              <CloudSun className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {weatherData?.current?.temp ? `${weatherData.current.temp}°C` : '31°C'}
            </p>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block">
              {weatherData?.agricultural_advisory?.spraying_advisory ? weatherData.agricultural_advisory.spraying_advisory.slice(0, 24) + '...' : 'Safe Spraying Today'}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Market Price</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">
              {marketSummary?.summary?.average_price ? `₹${marketSummary.summary.average_price}` : '₹2,100'}
            </p>
            <span className="text-[11px] font-semibold text-slate-600 truncate block">
              {farmerCrop} / Qtl ({farmerDistrict})
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider">Govt Schemes</span>
              <Landmark className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-sm font-black text-slate-900 leading-tight">
              Schemes & Subsidies
            </p>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              Income, loans & solar pumps
            </p>
            <button
              onClick={() => onNavigate('schemes')}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 pt-0.5"
            >
              <span>Check My Eligibility →</span>
            </button>
          </div>
        </div>

        {/* 6 Quick Action Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => onNavigate('detect')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ScanLine className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Detect Disease</p>
              <p className="text-[10px] text-slate-500">5-step guided AI</p>
            </button>

            <button
              onClick={() => onNavigate('market-prices')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Market Prices</p>
              <p className="text-[10px] text-slate-500">Government OGD</p>
            </button>

            <button
              onClick={() => onNavigate('weather')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <CloudSun className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Weather & Risk</p>
              <p className="text-[10px] text-slate-500">Spraying window</p>
            </button>

            <button
              onClick={() => onNavigate('assistant')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">AI Assistant</p>
              <p className="text-[10px] text-slate-500">Voice & multilingual</p>
            </button>

            <button
              onClick={() => onNavigate('news')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Newspaper className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Farmer News</p>
              <p className="text-[10px] text-slate-500">Govt schemes & tech</p>
            </button>

            <button
              onClick={() => onNavigate('resources')}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all shadow-xs group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Tractor className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">Farm Resources</p>
              <p className="text-[10px] text-slate-500">Rent machinery</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
