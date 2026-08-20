import React from 'react';
import {
  Sprout,
  LayoutDashboard,
  ScanLine,
  BookOpen,
  CloudSun,
  TrendingUp,
  MessageSquare,
  Landmark,
  Newspaper,
  Tractor,
  UserCircle,
  Menu,
  X,
  Mic,
  Cpu,
  ShieldAlert,
  BarChart3,
  Globe
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  farmerName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  onToggleMobileMenu,
  farmerName = "Ramesh Patel"
}) => {
  const t = translations[currentLanguage];

  const navLinks = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'detect', label: t.navDiseaseDetection || 'Disease Detection', icon: ScanLine, highlight: true },
    { id: 'advisory', label: t.navCropAdvisory || 'Crop Advisory', icon: BookOpen },
    { id: 'weather', label: t.navWeatherRisk || 'Weather & Risk', icon: CloudSun },
    { id: 'market-prices', label: t.navMarketPrices || 'Market Prices', icon: TrendingUp },
    { id: 'assistant', label: t.navAssistant || 'AI Assistant', icon: MessageSquare },
    { id: 'schemes', label: t.navGovtSchemes || 'Govt Schemes', icon: Landmark },
    { id: 'news', label: t.navMarketNews || 'Market News', icon: Newspaper },
    { id: 'resources', label: t.navFarmResources || 'Farm Resources', icon: Tractor },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-xs">
      {/* 1. TOP INFORMATION BAR (Dark Green) */}
      <div className="bg-[#0b3318] text-white px-4 py-1.5 text-[11px] font-medium border-b border-emerald-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Platform Name + Badge */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wide text-emerald-100">AgriCare AI Platform</span>
            <span className="text-emerald-500 hidden sm:inline">•</span>
            <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase hidden sm:inline">
              HACKATHON EDITION
            </span>
          </div>

          {/* Right: Engine Modules */}
          <div className="hidden md:flex items-center gap-4 text-emerald-200/90 text-[11px]">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Diagnostic Engine</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>Crop Risk Engine</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-default">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Market Intelligence</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION (Clean White) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-18">
          {/* Left: AgriCare AI Brand */}
          <div 
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-all">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">AgriCare</span>
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                Farmer Advisory Platform
              </p>
            </div>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                      : link.highlight
                      ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector, Voice, Profile & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Segmented Language Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  currentLanguage === 'en'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
              <button
                onClick={() => onLanguageChange('te')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  currentLanguage === 'te'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Telugu (తెలుగు)"
              >
                <span>🇮🇳</span>
                <span>TE</span>
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  currentLanguage === 'hi'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Hindi (हिन्दी)"
              >
                <span>🇮🇳</span>
                <span>HI</span>
              </button>
            </div>

            {/* Quick Voice Assistant Button */}
            <button
              onClick={() => onTabChange('assistant')}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title={t.voiceAI || 'Voice AI'}
            >
              <Mic className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{t.voiceAI || 'Voice AI'}</span>
            </button>

            {/* Farmer Profile Button */}
            <button
              onClick={() => onTabChange('profile')}
              className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all ${
                activeTab === 'profile'
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                👨‍🌾
              </div>
              <span className="text-xs font-bold text-slate-800 hidden md:inline">{farmerName.split(' ')[0]}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 xl:hidden border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
