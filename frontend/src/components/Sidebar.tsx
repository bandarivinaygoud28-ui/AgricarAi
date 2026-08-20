import React from 'react';
import {
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
  X,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface SidebarProps {
  currentLanguage: LanguageCode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentLanguage,
  activeTab,
  onTabChange,
  isOpen,
  onClose,
}) => {
  const t = translations[currentLanguage];

  const menuItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'detect', label: t.navDiseaseDetection || 'Disease Detection', icon: ScanLine, badge: '5-Step' },
    { id: 'advisory', label: t.navCropAdvisory || 'Crop Advisory', icon: BookOpen },
    { id: 'weather', label: t.navWeatherRisk || 'Weather & Risk', icon: CloudSun },
    { id: 'market-prices', label: t.navMarketPrices || 'Market Prices', icon: TrendingUp },
    { id: 'assistant', label: t.navAssistant || 'AI Assistant', icon: MessageSquare, badge: 'Voice' },
    { id: 'schemes', label: t.navGovtSchemes || 'Govt Schemes', icon: Landmark, badge: 'Subsidies' },
    { id: 'news', label: t.navMarketNews || 'Market News', icon: Newspaper },
    { id: 'resources', label: t.navFarmResources || 'Farm Resources', icon: Tractor },
    { id: 'profile', label: t.navMyProfile || 'My Profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Responsive Drawer / Sidebar */}
      <aside
        className={`fixed xl:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between xl:hidden border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                🌾
              </div>
              <span className="font-extrabold text-sm text-slate-900">AgriCare AI</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
              {t.modules || 'Modules'}
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer — Toll-Free Helpline Badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-2xl border">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t.kisanCallCenter || 'Kisan Call Center'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">{t.tollFree || 'Toll Free'}: 1800-180-1551</p>
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>AgriCare AI v2.4</span>
            <span className="text-emerald-600 font-bold">● {t.online || 'Online'}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
