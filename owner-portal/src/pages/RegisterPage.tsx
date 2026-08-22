import React, { useState } from 'react';
import { Tractor, User, Phone, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LocationPicker } from '../components/Common/LocationPicker';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  onSuccess
}) => {
  const { register } = useAuth();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [village, setVillage] = useState<string>('Kummarguda');
  const [mandal, setMandal] = useState<string>('Shamshabad');
  const [district, setDistrict] = useState<string>('Ranga Reddy');
  const [state, setState] = useState<string>('Telangana');
  const [latitude, setLatitude] = useState<number>(17.2285);
  const [longitude, setLongitude] = useState<number>(78.4312);

  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLocationChange = (fields: {
    village: string;
    mandal: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
  }) => {
    setVillage(fields.village);
    setMandal(fields.mandal);
    setDistrict(fields.district);
    setState(fields.state);
    setLatitude(fields.latitude);
    setLongitude(fields.longitude);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await api.register({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        password,
        role: 'resource_owner',
        village,
        mandal,
        district,
        state,
        latitude,
        longitude
      });
      setSuccessMsg('Owner account created successfully. Redirecting to login...');
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="max-w-2xl w-full space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-400 text-2xl shadow-xl shadow-emerald-950/60 mb-1">
            🚜
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Resource Owner Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Register as Equipment Owner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-medium">
            List your tractors, JCBs, harvesters, and drones on AgriCare to receive direct booking requests from nearby farmers.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider text-emerald-400">
                1. Owner Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mobile Number (Login ID) *
                  </label>
                  <div className="relative">
                    <span className="text-slate-500 font-bold text-xs absolute left-3.5 top-3">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      required
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh.owner@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-black text-white uppercase tracking-wider text-emerald-400">
                2. Security & Password
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location & GPS */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-black text-white uppercase tracking-wider text-emerald-400">
                3. Base Location & Service Hub
              </h4>

              <LocationPicker
                village={village}
                mandal={mandal}
                district={district}
                state={state}
                latitude={latitude}
                longitude={longitude}
                onChange={handleLocationChange}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <span>Creating Owner Account...</span>
              ) : (
                <>
                  <span>Complete Owner Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-2 text-center border-t border-slate-800">
            <p className="text-xs text-slate-400 font-medium">
              Already have an Owner account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-400 hover:text-emerald-300 font-black underline ml-1"
              >
                Login to Portal
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role: resource_owner • Encrypted credentials • Verified with FastAPI backend</span>
        </div>
      </div>
    </div>
  );
};
