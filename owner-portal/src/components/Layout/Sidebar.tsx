import React from 'react';
import {
  LayoutDashboard,
  Tractor,
  PlusCircle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Wallet,
  Star,
  User,
  Settings,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { logout, user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resources', label: 'My Resources', icon: Tractor },
    { id: 'add-resource', label: 'Add Resource', icon: PlusCircle, highlight: true },
    { id: 'bookings', label: 'Booking Requests', icon: BellRing, badge: '2 New' },
    { id: 'jobs', label: 'Upcoming Jobs', icon: CalendarDays },
    { id: 'completed-jobs', label: 'Completed Jobs', icon: CheckCircle2 },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'ratings', label: 'Ratings & Reviews', icon: Star },
    { id: 'profile', label: 'Owner Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-xl shadow-lg shadow-emerald-950/50">
              🚜
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                  AgriCare AI
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  OWNER
                </span>
              </div>
              <h1 className="text-base font-black text-white tracking-tight">
                Resource Owner
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Owner Info Preview */}
        <div className="px-5 py-3 mx-4 my-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-800/80 border border-emerald-900/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800/80 border border-emerald-600/30 flex items-center justify-center font-black text-sm text-emerald-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">
              {user?.name || 'Equipment Owner'}
            </h4>
            <p className="text-[11px] text-emerald-300/80 flex items-center gap-1 truncate font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {user?.village || 'Kummarguda'}, {user?.district || 'Ranga Reddy'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : item.highlight
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tagline Card */}
        <div className="p-4 mx-4 mb-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Turn Machinery into Income</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            AgriCare platform commission is only 5%.
          </p>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all border border-rose-900/30"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout from Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
