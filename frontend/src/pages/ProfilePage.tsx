import React, { useState, useEffect, useRef } from 'react';
import { FarmerProfile, LanguageCode, LocationSearchResult } from '../types';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import {
  User,
  Phone,
  MapPin,
  Sprout,
  Globe,
  Check,
  Save,
  Navigation,
  Compass,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Edit3,
  Sparkles,
  Loader2,
  X,
  Map,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ProfilePageProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onProfileUpdated?: (name: string) => void;
}

const COMMON_CROPS = [
  'Tomato',
  'Paddy',
  'Cotton',
  'Chilli',
  'Maize',
  'Potato',
  'Wheat',
  'Onion',
  'Groundnut',
  'Sugarcane',
  'Soybean',
  'Turmeric'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  language,
  onLanguageChange,
  onProfileUpdated
}) => {
  const t = translations[language];

  // Initialize farmer profile with stored values or default
  const [profile, setProfile] = useState<FarmerProfile>(() => {
    const savedCoordsStr = localStorage.getItem('agricare_farm_coords');
    let savedCoords = { lat: 17.9689, lon: 79.5941 };
    if (savedCoordsStr) {
      try {
        savedCoords = JSON.parse(savedCoordsStr);
      } catch {
        // use default
      }
    }

    return {
      name: localStorage.getItem('agricare_farmer_name') || 'Ramesh Patel',
      phone: localStorage.getItem('agricare_farmer_phone') || '+91 98480 12345',
      email: 'ramesh.farmer@agricare.ai',
      state: localStorage.getItem('agricare_farmer_state') || 'Telangana',
      district: localStorage.getItem('agricare_farmer_district') || 'Warangal',
      village: localStorage.getItem('agricare_farmer_village') || 'Enumamula',
      location: localStorage.getItem('agricare_farm_location_name') || 'Enumamula, Warangal, Telangana',
      latitude: savedCoords.lat,
      longitude: savedCoords.lon,
      main_crops: localStorage.getItem('agricare_farmer_crops') || 'Tomato, Paddy, Cotton, Chilli',
      preferred_language: (localStorage.getItem('agricare_language') as LanguageCode) || language
    };
  });

  // GPS / Geolocation State
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [detectionSuccess, setDetectionSuccess] = useState<boolean>(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'search' | 'default'>('gps');

  // Manual Search Autocomplete State
  const [showManualSearch, setShowManualSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Form Saving State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Fetch backend profile on mount if available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const p = await api.getProfile();
        if (p && p.name) {
          setProfile((prev) => ({
            ...prev,
            ...p,
            village: p.village || prev.village || 'Enumamula',
            latitude: p.latitude ?? prev.latitude ?? 17.9689,
            longitude: p.longitude ?? prev.longitude ?? 79.5941,
            location: p.location || prev.location || `${p.village || 'Enumamula'}, ${p.district || 'Warangal'}, ${p.state || 'Telangana'}`
          }));
        }
      } catch (e) {
        console.warn('Backend profile fetch note:', e);
      }
    };
    loadProfile();
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for manual location modal/input
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingLocation(false);
      return;
    }

    setIsSearchingLocation(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.searchLocations(searchQuery.trim());
        setSearchResults(res || []);
      } catch (err) {
        console.error('Location search failed:', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Automatic Location Detection via Browser GPS + Reverse Geocoding
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectionError('Geolocation is not supported by your browser/device. Please search your location manually.');
      setShowManualSearch(true);
      return;
    }

    setIsDetectingLocation(true);
    setDetectionError(null);
    setDetectionSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = roundCoord(pos.coords.latitude);
        const lon = roundCoord(pos.coords.longitude);

        try {
          // Reverse geocode GPS coordinates to Indian administrative entities
          const geo = await api.reverseGeocode(lat, lon);

          const detectedVillage = geo.village || geo.city || 'Farm Location';
          const detectedDistrict = geo.district || 'Regional District';
          const detectedState = geo.state || 'India';
          const detectedLocation = geo.formatted_location || `${detectedVillage}, ${detectedDistrict}, ${detectedState}`;

          setProfile((prev) => ({
            ...prev,
            state: detectedState,
            district: detectedDistrict,
            village: detectedVillage,
            location: detectedLocation,
            latitude: lat,
            longitude: lon
          }));

          setLocationSource('gps');
          setDetectionSuccess(true);
          setDetectionError(null);
          setShowManualSearch(false);
        } catch (err) {
          console.error('Reverse geocode error:', err);
          // Fallback with raw coordinates
          setProfile((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            location: `Farm at (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`
          }));
          setLocationSource('gps');
          setDetectionSuccess(true);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        let msg = 'Location access is required to automatically detect your farm location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser or search your village/district manually below.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location detection timed out. Please retry or search manually.';
        }
        setDetectionError(msg);
        setShowManualSearch(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  const roundCoord = (val: number): number => {
    return Math.round(val * 10000) / 10000;
  };

  // Handle Selection from Manual Search
  const handleSelectLocation = (loc: LocationSearchResult) => {
    const village = loc.name || loc.district || 'Farm Location';
    const district = loc.district || loc.name;
    const state = loc.state || 'India';
    const formatted = loc.formatted_location || loc.display_name || `${village}, ${state}`;

    setProfile((prev) => ({
      ...prev,
      village: village,
      district: district,
      state: state,
      location: formatted,
      latitude: roundCoord(loc.lat),
      longitude: roundCoord(loc.lon)
    }));

    setLocationSource('search');
    setDetectionSuccess(true);
    setDetectionError(null);
    setShowManualSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Crop Tag Toggle
  const toggleCrop = (cropName: string) => {
    const currentList = profile.main_crops
      ? profile.main_crops.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    let updatedList: string[];
    if (currentList.some((c) => c.toLowerCase() === cropName.toLowerCase())) {
      updatedList = currentList.filter((c) => c.toLowerCase() !== cropName.toLowerCase());
    } else {
      updatedList = [...currentList, cropName];
    }

    setProfile({
      ...profile,
      main_crops: updatedList.join(', ')
    });
  };

  const isCropSelected = (cropName: string) => {
    if (!profile.main_crops) return false;
    const currentList = profile.main_crops.split(',').map((c) => c.trim().toLowerCase());
    return currentList.includes(cropName.toLowerCase());
  };

  // Save Profile Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Update backend
      await api.updateProfile(profile);

      // 2. Persist in localStorage for instant app-wide synchronization
      if (profile.latitude !== undefined && profile.longitude !== undefined) {
        localStorage.setItem(
          'agricare_farm_coords',
          JSON.stringify({ lat: profile.latitude, lon: profile.longitude })
        );
      }
      if (profile.location) {
        localStorage.setItem('agricare_farm_location_name', profile.location);
      }
      if (profile.state) {
        localStorage.setItem('agricare_farmer_state', profile.state);
      }
      if (profile.district) {
        localStorage.setItem('agricare_farmer_district', profile.district);
      }
      if (profile.village) {
        localStorage.setItem('agricare_farmer_village', profile.village);
      }
      if (profile.main_crops) {
        localStorage.setItem('agricare_farmer_crops', profile.main_crops);
      }
      if (profile.name) {
        localStorage.setItem('agricare_farmer_name', profile.name);
      }
      if (profile.phone) {
        localStorage.setItem('agricare_farmer_phone', profile.phone);
      }
      if (profile.preferred_language) {
        localStorage.setItem('agricare_language', profile.preferred_language);
      }

      setSavedSuccess(true);
      if (onProfileUpdated) onProfileUpdated(profile.name);
      if (profile.preferred_language && profile.preferred_language !== language) {
        onLanguageChange(profile.preferred_language);
      }

      // Hide success notification after 5 seconds
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (e) {
      console.error(e);
      alert('Failed to save profile. Please check your connection and retry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* 1. HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-green-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/20">
              👨‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Verified Farmer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {profile.village ? `${profile.village}, ` : ''}{profile.district}, {profile.state}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
              GPS Coordinates
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {profile.latitude?.toFixed(4)}° N, {profile.longitude?.toFixed(4)}° E
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION A: MANUAL INPUTS ONLY */}
        <div className="glass-card p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Farmer Information
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Please enter your personal details and primary crops cultivated.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              Manual Input
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Farmer Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Farmer Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  placeholder="e.g. Ramesh Patel"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 rounded-xl text-xs font-semibold text-slate-800 transition-all"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  required
                  placeholder="e.g. +91 98480 12345"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 rounded-xl text-xs font-semibold text-slate-800 transition-all"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Main Crops Cultivated */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Main Crops Cultivated <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Click tags to toggle crops
                </span>
              </div>

              {/* Crop Quick-Select Tags */}
              <div className="flex flex-wrap gap-2">
                {COMMON_CROPS.map((crop) => {
                  const selected = isCropSelected(crop);
                  return (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300 scale-102'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Sprout className={`w-3.5 h-3.5 ${selected ? 'text-emerald-200' : 'text-slate-400'}`} />
                      <span>{crop}</span>
                      {selected && <Check className="w-3 h-3 text-white ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Crop Input */}
              <div className="relative pt-1">
                <input
                  type="text"
                  value={profile.main_crops}
                  onChange={(e) => setProfile({ ...profile, main_crops: e.target.value })}
                  required
                  placeholder="Or type custom crops separated by commas (e.g. Tomato, Paddy, Cotton, Chilli)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 rounded-xl text-xs font-semibold text-slate-800 transition-all"
                />
                <Sprout className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Preferred Language */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Preferred App & Voice Language <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'en' as LanguageCode, label: 'English', flag: '🇬🇧' },
                  { code: 'te' as LanguageCode, label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
                  { code: 'hi' as LanguageCode, label: 'हिन्दी (Hindi)', flag: '🇮🇳' }
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setProfile({ ...profile, preferred_language: l.code })}
                    className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 text-center ${
                      profile.preferred_language === l.code
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-300 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: AUTOMATIC FARM LOCATION DETECTION */}
        <div className="glass-card p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Farm Location & GPS Geocoding
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Automatic Only
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Your exact farm location is automatically detected via device GPS or verified search so that weather forecasts, agro-advisories, and mandi rates match your fields.
              </p>
            </div>
          </div>

          {/* Detect Location Button */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 p-5 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xs font-extrabold text-emerald-950 flex items-center justify-center sm:justify-start gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600" />
                Automatic Real-Time GPS Detection
              </h4>
              <p className="text-[11px] text-slate-600 font-medium max-w-md">
                Click below to pinpoint your exact farm coordinates, village, and district across India in seconds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Detecting GPS Location...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-emerald-200" />
                    <span>📍 Detect My Farm Location</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowManualSearch(!showManualSearch);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }}
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>{showManualSearch ? 'Hide Search' : '🔍 Search Location'}</span>
              </button>
            </div>
          </div>

          {/* Geolocation Error Alert */}
          {detectionError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs font-medium space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">{detectionError}</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Location access is required to automatically detect your farm location. You can search your village, district, or town manually below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manual Search Autocomplete Dropdown / Section */}
          {showManualSearch && (
            <div ref={searchContainerRef} className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                Search Farm Village / Mandi / District Across India
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type any village, town, district, or city (e.g. Warangal, Kolar, Guntur, Nashik)..."
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                {isSearchingLocation && (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 absolute right-3.5 top-3" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100 mt-1">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {item.name} {item.district && item.district !== item.name ? `(${item.district})` : ''}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {item.state}, {item.country || 'India'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {item.lat?.toFixed(2)}°, {item.lon?.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* READ-ONLY AUTOMATIC LOCATION DISPLAY CARD */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">
                  {locationSource === 'gps'
                    ? '📍 Live GPS Detected Location (Read-Only)'
                    : '📍 Verified Farm Location (Read-Only)'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Auto-Populated</span>
              </div>
            </div>

            {/* Read-Only Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* State */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  State
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-900">{profile.state || 'Not Set'}</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Auto
                  </span>
                </div>
              </div>

              {/* District */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  District
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-900">{profile.district || 'Not Set'}</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Auto
                  </span>
                </div>
              </div>

              {/* Village / Farm Location */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Village / Farm Location
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {profile.village || profile.location || 'Not Set'}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                    Auto
                  </span>
                </div>
              </div>

              {/* Latitude */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Latitude
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {profile.latitude !== undefined ? `${profile.latitude.toFixed(4)}° N` : '—'}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    GPS
                  </span>
                </div>
              </div>

              {/* Longitude */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Longitude
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {profile.longitude !== undefined ? `${profile.longitude.toFixed(4)}° E` : '—'}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    GPS
                  </span>
                </div>
              </div>

              {/* Full Formatted Location */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Full Location String
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-medium text-slate-700 truncate" title={profile.location}>
                    {profile.location || `${profile.district}, ${profile.state}`}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                    Synced
                  </span>
                </div>
              </div>
            </div>

            {/* Change Location Action */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Need to change your farm location? Click re-detect or search another region.
              </span>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-detect Location</span>
              </button>
            </div>
          </div>
        </div>

        {/* SUCCESS BANNER */}
        {savedSuccess && (
          <div className="bg-emerald-50 text-emerald-900 p-4 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span>Profile & farm location synchronized successfully!</span>
              <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                Live weather forecasts, market prices, and agro-news are now tuned to your farm.
              </p>
            </div>
          </div>
        )}

        {/* FORM SUBMISSION BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-2xl text-xs font-black transition-all shadow-lg shadow-emerald-700/25 flex items-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile & Sync Farm Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
