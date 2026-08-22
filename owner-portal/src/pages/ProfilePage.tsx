import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LocationPicker } from '../components/Common/LocationPicker';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState<string>(user?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState<string>(user?.phone || '9876543210');
  const [email, setEmail] = useState<string>(user?.email || 'ramesh.owner@agricare.ai');

  const [village, setVillage] = useState<string>(user?.village || 'Kummarguda');
  const [mandal, setMandal] = useState<string>(user?.mandal || 'Shamshabad');
  const [district, setDistrict] = useState<string>(user?.district || 'Ranga Reddy');
  const [state, setState] = useState<string>(user?.state || 'Telangana');
  const [latitude, setLatitude] = useState<number>(user?.latitude || 17.2285);
  const [longitude, setLongitude] = useState<number>(user?.longitude || 78.4312);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email || '');
      setVillage(user.village || 'Kummarguda');
      setMandal(user.mandal || 'Shamshabad');
      setDistrict(user.district || 'Ranga Reddy');
      setState(user.state || 'Telangana');
      setLatitude(user.latitude || 17.2285);
      setLongitude(user.longitude || 78.4312);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        name,
        phone,
        email,
        village,
        mandal,
        district,
        state,
        latitude: Number(latitude),
        longitude: Number(longitude),
        location: `${village}, ${district}, ${state}`
      };

      const result = await api.updateProfile(payload);
      updateUser(result.user || payload);
      setSuccessMsg('✓ Owner profile and base service location updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile. Please ensure the backend server is running.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-800/40 shadow-xl flex flex-wrap items-center gap-5">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center font-black text-2xl text-slate-950 shadow-xl shadow-emerald-950">
          {name ? name.charAt(0).toUpperCase() : 'O'}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
              Verified Equipment Owner
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {name || 'Owner Profile'}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Service Hub: {village}, {district}, {state}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Owner Account Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Mobile Number (Hotline for Farmers) *
              </label>
              <div className="relative">
                <span className="text-slate-500 font-bold text-xs absolute left-3.5 top-3">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location & GPS Base Hub */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Base Service Station & GPS Geolocation</span>
          </h3>

          <LocationPicker
            village={village}
            mandal={mandal}
            district={district}
            state={state}
            latitude={latitude}
            longitude={longitude}
            onChange={(fields) => {
              setVillage(fields.village);
              setMandal(fields.mandal);
              setDistrict(fields.district);
              setState(fields.state);
              setLatitude(fields.latitude);
              setLongitude(fields.longitude);
            }}
          />
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-emerald-950 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
