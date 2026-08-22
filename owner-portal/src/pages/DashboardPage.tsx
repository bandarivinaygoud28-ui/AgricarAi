import React, { useState, useEffect } from 'react';
import {
  Tractor,
  CheckCircle2,
  Clock,
  CalendarDays,
  CheckCheck,
  Wallet,
  ArrowRight,
  Sparkles,
  Plus,
  Phone,
  Navigation,
  Star,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { OwnerDashboardStats, BookingRequestItem, ResourceItem } from '../types';
import { StatCard } from '../components/Common/StatCard';
import { StatusBadge } from '../components/Common/StatusBadge';
import { GoogleMapsRouteButton } from '../components/Common/GoogleMapsRouteButton';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<BookingRequestItem[]>([]);
  const [myResources, setMyResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, b, r] = await Promise.all([
        api.getDashboardStats(),
        api.getBookings('all'),
        api.getMyResources()
      ]);
      setStats(s);
      setRecentBookings(b.slice(0, 4));
      setMyResources(r.slice(0, 3));
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (id: number | string) => {
    try {
      await api.acceptBooking(id);
      loadData();
    } catch (e) {
      alert('Failed to accept booking');
    }
  };

  const handleReject = async (id: number | string) => {
    const reason = prompt('Please enter reason for rejection (optional):');
    try {
      await api.rejectBooking(id, reason || undefined);
      loadData();
    } catch (e) {
      alert('Failed to reject booking');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Welcome back, {user?.name || 'Equipment Owner'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            🚜 AgriCare Resource Owner
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
            Earn more by providing your agricultural resources to nearby farmers. Manage bookings, tractor fleets, dispatch routes, and track daily earnings seamlessly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('add-resource')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-950 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>List New Equipment</span>
            </button>

            <button
              onClick={() => onNavigate('bookings')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all"
            >
              <span>View Booking Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Decorative background tractor silhouette icon */}
        <div className="absolute right-6 -bottom-8 opacity-10 pointer-events-none text-9xl">
          🚜
        </div>
      </div>

      {/* 6 Key Dashboard Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Fleet"
          value={stats?.total_resources ?? 4}
          subtitle="Listed Machinery"
          icon={Tractor}
          color="emerald"
          onClick={() => onNavigate('resources')}
        />

        <StatCard
          title="Available"
          value={stats?.available_resources ?? 0}
          subtitle="Ready for Booking"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => onNavigate('resources')}
        />

        <StatCard
          title="Pending"
          value={stats?.pending_bookings ?? 0}
          subtitle="Action Required"
          icon={Clock}
          color="amber"
          onClick={() => onNavigate('bookings')}
        />

        <StatCard
          title="Confirmed"
          value={stats?.confirmed_bookings ?? 0}
          subtitle="Upcoming Jobs"
          icon={CalendarDays}
          color="blue"
          onClick={() => onNavigate('jobs')}
        />

        <StatCard
          title="Completed"
          value={stats?.completed_jobs ?? 0}
          subtitle="Successfully Serviced"
          icon={CheckCheck}
          color="purple"
          onClick={() => onNavigate('completed-jobs')}
        />

        <StatCard
          title="Total Earnings"
          value={`₹${(stats?.total_earnings ?? 0).toLocaleString('en-IN')}`}
          subtitle="Net after 5% fee"
          icon={Wallet}
          color="amber"
          onClick={() => onNavigate('earnings')}
        />
      </div>

      {/* Grid: Live Incoming Bookings & My Machinery Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Booking Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Live Farmer Booking Requests
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Incoming reservations submitted from the AgriCare Farmer Portal
              </p>
            </div>

            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-3xl border border-slate-800 text-slate-400 text-xs font-semibold space-y-1">
                <p className="text-sm font-bold text-white">No booking requests yet</p>
                <p className="text-xs text-slate-400 font-medium">Bookings from farmers will appear here when they reserve your equipment.</p>
              </div>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {b.image ? (
                          <img
                            src={b.image}
                            alt={b.resource_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tractor className="w-6 h-6 text-emerald-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                            {b.resource_type}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            #{b.booking_id}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-white">
                          {b.resource_title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold mt-0.5">
                          <span>Farmer: <strong>{b.farmer_name}</strong></span>
                          <span>•</span>
                          <a
                            href={`tel:${b.farmer_phone}`}
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{b.farmer_phone}</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <StatusBadge status={b.status} />
                      <div className="text-base font-black text-amber-300 mt-1">
                        ₹{b.total_amount?.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Net: ₹{b.owner_earnings?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details Pill Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-medium block">Date & Time:</span>
                      <span className="font-bold text-slate-200">{b.booking_date} ({b.booking_time})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Farm Location:</span>
                      <span className="font-bold text-slate-200 truncate block">{b.farm_location}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Duration:</span>
                      <span className="font-bold text-slate-200">{b.duration || '4 hours'}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <GoogleMapsRouteButton
                        farmerLocation={b.farm_location}
                        farmLatitude={b.farm_latitude}
                        farmLongitude={b.farm_longitude}
                        ownerLatitude={user?.latitude}
                        ownerLongitude={user?.longitude}
                      />

                      <a
                        href={`tel:${b.farmer_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call Farmer</span>
                      </a>
                    </div>

                    {b.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(b.booking_id || b.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAccept(b.booking_id || b.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950 transition-all"
                        >
                          Accept Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: My Equipment Fleet & Earnings Summary */}
        <div className="space-y-6">
          {/* Earnings Quick Summary */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                Earnings Breakdown
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                5% Platform Fee
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-900/40 space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Today's Earnings:</span>
                <span className="font-black text-amber-300">₹{(stats?.today_earnings ?? 3040).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>This Week:</span>
                <span className="font-bold text-white">₹{(stats?.week_earnings ?? 8500).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>This Month:</span>
                <span className="font-bold text-white">₹{(stats?.month_earnings ?? 28500).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-amber-900/40 flex justify-between text-sm font-black text-white">
                <span>Total Accumulated:</span>
                <span className="text-emerald-400">₹{(stats?.total_earnings ?? 124500).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('earnings')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Full Financial Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Machinery Snapshot */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Tractor className="w-4 h-4 text-emerald-400" />
                My Equipment Fleet
              </h3>
              <button
                onClick={() => onNavigate('resources')}
                className="text-xs text-emerald-400 hover:underline font-bold"
              >
                Manage ({myResources.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {myResources.map((res) => (
                <div
                  key={res.id}
                  className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">
                      {res.title}
                    </h5>
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      ₹{res.price_per_hour}/hr • <span className="text-slate-400">{res.location}</span>
                    </p>
                  </div>
                  <StatusBadge status={res.availability} size="sm" />
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('add-resource')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List Another Machine</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
