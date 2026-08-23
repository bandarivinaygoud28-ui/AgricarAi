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

  // Booking Modal State
  const [selectedResource, setSelectedResource] = useState<FarmResource | null>(null);
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("06:00 AM - 10:00 AM");
  const [farmLocation, setFarmLocation] = useState<string>("Warangal Rural, Telangana");
  const [notes, setNotes] = useState<string>("");
  const [availabilityInfo, setAvailabilityInfo] = useState<any>(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getResources({
        resource_type: selectedType === "All" ? undefined : selectedType
      });
      console.log("Farmer resources API:", data);
      console.log("Farmer resources:", data);
      setResources(data);
    } catch (e: any) {
      console.error("Error loading resources:", e);
      setError("Unable to load resources.");
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
  }, [selectedType]);

  useEffect(() => {
    if (activeTab === 'my-bookings') {
      fetchMyBookings();
    }
  }, [activeTab]);

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

        {/* Resource Category Filter Chips */}
        {activeTab === 'catalog' && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
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
          ) : resources.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-3">
              <Tractor className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No resources available.</p>
              <p className="text-xs text-slate-500">There are currently no machinery listings available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => (
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
              {myBookings.map((b) => (
                <div key={b.id} className="glass-card p-5 bg-white border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase">{b.resource_type}</span>
                      <h4 className="font-extrabold text-slate-900 text-base">{b.resource_title}</h4>
                      <p className="text-xs text-slate-500 font-semibold">Provider: {b.provider_name}</p>
                    </div>
                    <span className="badge badge-low">
                      ● {b.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-700 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Slot:</span>
                      <span className="font-bold text-slate-900">{b.booking_date} ({b.booking_time})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service Location:</span>
                      <span>{b.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rental Rate:</span>
                      <span className="font-bold text-emerald-800">₹{b.price} /{b.price_unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provider Contact:</span>
                      <span className="font-bold text-slate-900">{b.contact_phone}</span>
                    </div>
                  </div>
                </div>
              ))}
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
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h3 className="text-xl font-black text-slate-900">{t.bookingConfirmed}</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your reservation for <strong>{selectedResource.title}</strong> on <strong>{bookingDate} ({selectedTimeSlot})</strong> has been registered. The custom hiring center will call you on <strong>{farmerPhone}</strong>.
                </p>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
