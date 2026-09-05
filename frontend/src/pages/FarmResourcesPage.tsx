import React, { useState, useEffect } from 'react';
import { FarmResource, BookingRecord, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { ResourceCard } from '../components/ResourceCard';
import {
  Tractor,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  Phone,
  ShieldCheck,
  History,
  AlertCircle
} from 'lucide-react';

interface FarmResourcesPageProps {
  language: LanguageCode;
  farmerName?: string;
  farmerPhone?: string;
}

const RESOURCE_FILTERS = [
  "All",
  "Tractor",
  "Drone Spraying",
  "Harvester",
  "JCB",
  "Agricultural Equipment"
];

export const FarmResourcesPage: React.FC<FarmResourcesPageProps> = ({
  language,
  farmerName = "Ramesh Patel",
  farmerPhone = "+91 98480 12345"
}) => {
  const t = translations[language];

  const [resources, setResources] = useState<FarmResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-bookings'>('catalog');
  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);

  // Farmer Location State
  const [farmerLocation, setFarmerLocation] = useState<string>(() => {
    return (
      localStorage.getItem('agricare_farm_location_name') ||
      localStorage.getItem('agricare_farmer_district') ||
      'Kummariguda, Ranga Reddy, Telangana'
    );
  });
  const [locationFilterInput, setLocationFilterInput] = useState<string>(() => {
    return (
      localStorage.getItem('agricare_farm_location_name') ||
      localStorage.getItem('agricare_farmer_district') ||
      'Kummariguda, Ranga Reddy'
    );
  });
  const [farmerCoords, setFarmerCoords] = useState<{ lat: number; lon: number } | null>(() => {
    try {
      const saved = localStorage.getItem('agricare_farm_coords');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Booking Modal State
  const [selectedResource, setSelectedResource] = useState<FarmResource | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("06:00 AM - 10:00 AM");
  const [farmLocation, setFarmLocation] = useState<string>(farmerLocation);
  const [notes, setNotes] = useState<string>("");
  const [availabilityInfo, setAvailabilityInfo] = useState<any>(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch exclusively from live backend API
      const data = await api.getResources();
      console.log("PRODUCTION LIVE RESOURCES FETCHED:", data);
      setResources(data);
    } catch (e: any) {
      console.error("Error loading resources from live backend:", e);
      setError("Unable to load resources from the backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const data = await api.getBookings(undefined, farmerPhone);
      setMyBookings(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-bookings') {
      fetchMyBookings();
    }
  }, [activeTab]);

  // Helper: Normalize location tokens (handles spelling variants like kummariguda <-> kummarguda)
  const normalizeLocStr = (str: string): string => {
    return (str || '')
      .toLowerCase()
      .replace(/kummariguda/g, 'kummarguda')
      .replace(/rangareddy/g, 'ranga reddy')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();
  };

  // Haversine distance calculator
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Filter and sort resources by category and location
  const filteredResources = resources.filter((res) => {
    // 1. Category Filter
    if (selectedType !== "All") {
      const target = selectedType.toLowerCase();
      const combined = `${res.resource_type || ''} ${res.title || ''} ${res.category || ''} ${res.type || ''}`.toLowerCase();

      if (target === 'tractor') {
        if (!combined.includes('tractor')) return false;
      } else if (target === 'drone spraying') {
        if (!combined.includes('drone')) return false;
      } else if (target === 'harvester') {
        if (!combined.includes('harvester') && !combined.includes('combine')) return false;
      } else if (target === 'jcb') {
        if (!combined.includes('jcb') && !combined.includes('earthmover') && !combined.includes('trencher')) return false;
      } else if (target === 'agricultural equipment') {
        const isEquip =
          combined.includes('agricultural equipment') ||
          combined.includes('farm machinery') ||
          combined.includes('equipment') ||
          combined.includes('machinery') ||
          combined.includes('rotavator') ||
          combined.includes('cultivator') ||
          combined.includes('drill') ||
          combined.includes('irrigation') ||
          combined.includes('pump') ||
          combined.includes('sprayer') ||
          combined.includes('sowing') ||
          combined.includes('transport');
        if (!isEquip) return false;
      } else {
        if (!combined.includes(target)) return false;
      }
    }

    // 2. Location Filter
    if (locationFilterInput.trim() && locationFilterInput.trim().toLowerCase() !== 'all') {
      const normResLoc = normalizeLocStr(`${res.location || ''} ${(res as any).village || ''} ${(res as any).mandal || ''} ${(res as any).district || ''}`);
      const normSearch = normalizeLocStr(locationFilterInput);

      // Extract significant search tokens
      const searchTokens = normSearch
        .split(/\s+/)
        .filter((t) => t.length > 2 && t !== 'telangana' && t !== 'india' && t !== 'near');

      if (searchTokens.length > 0) {
        const tokenMatch = searchTokens.some((tok) => normResLoc.includes(tok));
        if (tokenMatch) return true;

        // Coordinate-based distance match if available
        if (farmerCoords && res.latitude && res.longitude) {
          const dist = calculateDistance(
            farmerCoords.lat,
            farmerCoords.lon,
            res.latitude,
            res.longitude
          );
          if (dist <= 60) return true;
        }

        return false;
      }
    }

    return true;
  });

  const handleOpenBookingModal = async (res: FarmResource) => {
    setSelectedResource(res);
    setIsBookingSuccess(false);
    try {
      const avail = await api.checkAvailability(res.id, bookingDate);
      setAvailabilityInfo(avail);
      if (avail.available_slots?.length > 0) {
        setSelectedTimeSlot(avail.available_slots[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDateChange = async (dateStr: string) => {
    setBookingDate(dateStr);
    if (selectedResource) {
      try {
        const avail = await api.checkAvailability(selectedResource.id, dateStr);
        setAvailabilityInfo(avail);
        if (avail.available_slots?.length > 0) {
          setSelectedTimeSlot(avail.available_slots[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    setIsSubmitting(true);
    try {
      await api.bookResource({
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        resource_id: selectedResource.id,
        booking_date: bookingDate,
        booking_time: selectedTimeSlot,
        location: farmLocation,
        notes: notes
      });
      setIsBookingSuccess(true);
      fetchMyBookings();
    } catch (e) {
      alert("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tractor className="w-5 h-5 text-emerald-300" />
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                Custom Hiring & Precision Agro Services
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t.resourcesHeader}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl font-medium">
              {t.resourcesSubtitle}
            </p>
          </div>

          {/* Toggle: Catalog vs Bookings */}
          <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog' ? 'bg-white text-emerald-950 shadow-md' : 'text-white'
              }`}
            >
              Browse Equipment
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'my-bookings' ? 'bg-white text-emerald-950 shadow-md' : 'text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t.bookingHistory}</span>
            </button>
          </div>
        </div>

        {/* Location Filter & Category Selector */}
        {activeTab === 'catalog' && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            {/* Location Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-black/20 p-2.5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
                <input
                  type="text"
                  value={locationFilterInput}
                  onChange={(e) => setLocationFilterInput(e.target.value)}
                  placeholder="Filter by village, district, or town (e.g. Kummariguda, Ranga Reddy)..."
                  className="bg-transparent border-none text-xs text-white placeholder-emerald-200/60 font-semibold focus:outline-none w-full"
                />
                {locationFilterInput && (
                  <button
                    onClick={() => setLocationFilterInput('')}
                    className="text-emerald-200 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-white/10"
                    title="Clear location filter to show all areas"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLocationFilterInput('Kummariguda, Ranga Reddy')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 border border-emerald-400/30 transition-colors"
                >
                  📍 My Village (Kummariguda)
                </button>
                <button
                  onClick={() => setLocationFilterInput('')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                >
                  All Locations
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {RESOURCE_FILTERS.map((rf) => (
                <button
                  key={rf}
                  onClick={() => setSelectedType(rf)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedType === rf
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  {t.resourceTypes[rf] || rf}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Catalog View */}
      {activeTab === 'catalog' && (
        <>
          {isLoading ? (
            <div className="glass-card p-12 text-center text-slate-600 bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-semibold text-slate-700 text-sm">Loading available resources...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center text-slate-600 bg-white rounded-3xl border border-rose-200 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">{error}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Please check your network connection or verify that the backend server is reachable.</p>
              <button
                onClick={fetchResources}
                className="mt-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-4">
              <Tractor className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No resources available in your area.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No machinery was found matching &quot;{locationFilterInput || selectedType}&quot;. You can broaden your search or view all available equipment across Telangana.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setLocationFilterInput('');
                    setSelectedType('All');
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  View All Locations & Categories
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  language={language}
                  onBook={handleOpenBookingModal}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* My Bookings View */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 bg-white">
              <p className="font-semibold text-slate-700">You have no active resource bookings.</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-3 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Book Farm Equipment Now →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b) => {
                const statusStr = (b.status || 'Pending').toLowerCase();
                let badgeClass = "bg-amber-50 text-amber-800 border border-amber-300";
                let badgeLabel = "⏳ Pending Owner Approval";

                if (statusStr === 'confirmed') {
                  badgeClass = "bg-emerald-50 text-emerald-800 border border-emerald-300";
                  badgeLabel = "✓ Confirmed by Owner";
                } else if (statusStr === 'rejected') {
                  badgeClass = "bg-rose-50 text-rose-800 border border-rose-300";
                  badgeLabel = "✕ Booking Rejected";
                } else if (statusStr === 'completed') {
                  badgeClass = "bg-blue-50 text-blue-800 border border-blue-300";
                  badgeLabel = "✓ Job Completed";
                }

                return (
                  <div key={b.id} className="glass-card p-5 bg-white border border-slate-200 space-y-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 uppercase">{b.resource_type}</span>
                        <h4 className="font-extrabold text-slate-900 text-base">{b.resource_title || b.resource_name}</h4>
                        <p className="text-xs text-slate-500 font-semibold">Owner: {b.provider_name || b.owner_name}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-700 font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Date & Slot:</span>
                        <span className="font-bold text-slate-900">{b.booking_date} ({b.booking_time})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Service Location:</span>
                        <span className="font-bold text-slate-900 text-right">{b.farm_location || b.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Total Amount:</span>
                        <span className="font-extrabold text-emerald-800">₹{b.total_amount || b.amount || (b.price ? b.price * 4 : 3200)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Owner Contact:</span>
                        <a href={`tel:${b.contact_phone || b.owner_mobile}`} className="font-bold text-emerald-700 hover:underline">
                          {b.contact_phone || b.owner_mobile}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!isBookingSuccess ? (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedResource.resource_type}
                </span>

                <h3 className="text-xl font-black text-slate-900">
                  Book {selectedResource.title}
                </h3>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <p><strong>Provider:</strong> {selectedResource.provider_name}</p>
                  <p><strong>Rate:</strong> ₹{selectedResource.price} /{selectedResource.price_unit}</p>
                  <p><strong>Direct Hotline:</strong> {selectedResource.contact_phone}</p>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Service Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Time Slot Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Available Time Slot
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {availabilityInfo?.available_slots?.map((slot: string) => (
                      <option key={slot} value={slot}>{slot}</option>
                    )) || (
                      <option value="06:00 AM - 10:00 AM">06:00 AM - 10:00 AM</option>
                    )}
                  </select>
                </div>

                {/* Service Farm Location */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Farm Location / Survey Land
                  </label>
                  <input
                    type="text"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    required
                    placeholder="e.g. Survey No. 42, Enumamula Village"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 5 acres of cotton field needing immediate spraying..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedResource(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-sm"
                  >
                    {isSubmitting ? 'Submitting Request...' : 'Send Booking Request'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl font-bold">
                  ⏳
                </div>
                <h3 className="text-xl font-black text-slate-900">Booking Request Sent (Pending Approval)</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your reservation request for <strong>{selectedResource.title}</strong> on <strong>{bookingDate} ({selectedTimeSlot})</strong> has been sent to <strong>{selectedResource.provider_name}</strong>.
                  <br /><br />
                  The equipment owner will review and accept your request. You can check the status anytime in the <strong>My Bookings</strong> tab.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedResource(null);
                      setIsBookingSuccess(false);
                      setActiveTab('my-bookings');
                    }}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    View My Bookings →
                  </button>
                  <button
                    onClick={() => {
                      setSelectedResource(null);
                      setIsBookingSuccess(false);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
