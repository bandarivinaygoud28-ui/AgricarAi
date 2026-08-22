import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Check,
  X,
  Phone,
  Navigation,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookingRequestItem } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { GoogleMapsRouteButton } from '../components/Common/GoogleMapsRouteButton';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings(statusFilter);
      setBookings(data);
    } catch (e) {
      console.error('Error loading bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleAccept = async (id: string | number) => {
    try {
      await api.acceptBooking(id);
      setActionSuccessMsg(`✓ Booking #${id} accepted! Status is now Confirmed.`);
      fetchBookings();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (e) {
      alert('Failed to accept booking');
    }
  };

  const handleReject = async (id: string | number) => {
    const reason = prompt('Please enter a reason for rejecting (optional):');
    try {
      await api.rejectBooking(id, reason || undefined);
      setActionSuccessMsg(`✕ Booking #${id} was rejected.`);
      fetchBookings();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (e) {
      alert('Failed to reject booking');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/80 border border-emerald-800/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-xs uppercase font-black tracking-wider text-amber-400">
              Live Dispatch & Inbound Requests
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            🔔 Farmer Booking Requests ({bookings.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
            Reservations submitted by farmers on the AgriCare Farmer Portal. Review details, accept/reject, or open navigation route.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Requests</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'Pending', label: 'Pending Action' },
          { id: 'Confirmed', label: 'Confirmed' },
          { id: 'Completed', label: 'Completed' },
          { id: 'Rejected', label: 'Rejected' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === f.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Booking Requests List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">
          Loading booking requests from backend database...
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <BellRing className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No booking requests yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            Bookings from farmers will appear here when they reserve your equipment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
            >
              {/* Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.resource_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🚜</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                        {b.resource_type}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Booking ID: <strong className="text-white">{b.booking_id}</strong>
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {b.resource_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-semibold mt-1">
                      <span>Farmer: <strong className="text-white">{b.farmer_name}</strong></span>
                      <span>•</span>
                      <a
                        href={`tel:${b.farmer_phone}`}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{b.farmer_phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="text-right">
                  <StatusBadge status={b.status} />
                  <div className="text-xl font-black text-amber-400 mt-1">
                    ₹{b.total_amount?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Owner Net: ₹{b.owner_earnings?.toLocaleString('en-IN')} (95%)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Platform fee: ₹{b.platform_fee?.toLocaleString('en-IN')} (5%)
                  </div>
                </div>
              </div>

              {/* Service & Operational Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Service Date & Slot</span>
                    <span className="font-bold text-slate-200">{b.booking_date} ({b.booking_time})</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Farm Location</span>
                    <span className="font-bold text-slate-200 truncate block">{b.farm_location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Requested Duration</span>
                    <span className="font-bold text-slate-200">{b.duration || '4 hours'}</span>
                  </div>
                </div>
              </div>

              {b.notes && (
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 font-medium">
                  <span className="text-slate-500 font-bold mr-1">Farmer Notes:</span>
                  {b.notes}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Farmer</span>
                  </a>
                </div>

                {b.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(b.booking_id || b.id)}
                      className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleAccept(b.booking_id || b.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Booking</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
