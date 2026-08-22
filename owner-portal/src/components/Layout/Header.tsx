import React from 'react';
import { Menu, Plus, Bell, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigate
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Menu & Page Subtitle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white flex items-center gap-1.5">
              🚜 AgriCare Resource Owner
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Marketplace
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
            Earn more by providing your agricultural resources to nearby farmers.
          </p>
        </div>
      </div>

      {/* Right: Location, Quick Add, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Location Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>{user?.village || 'Kummarguda'}, {user?.district || 'Ranga Reddy'}</span>
        </div>

        {/* Quick Add Resource */}
        <button
          onClick={() => onNavigate('add-resource')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Resource</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => onNavigate('bookings')}
          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          title="Booking Requests"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400"></span>
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
        >
          <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[100px] truncate">
            {user?.name || 'Owner'}
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
        </button>
      </div>
    </header>
  );
};
