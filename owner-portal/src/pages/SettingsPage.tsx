import React, { useState } from 'react';
import {
  Settings,
  Bell,
  CreditCard,
  Compass,
  Volume2,
  ShieldCheck,
  Save,
  CheckCircle2,
  Smartphone
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [autoAccept, setAutoAccept] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(true);

  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [accountNumber, setAccountNumber] = useState<string>('XXXX-XXXX-4591');
  const [ifsc, setIfsc] = useState<string>('SBIN0001234');
  const [upiId, setUpiId] = useState<string>('ramesh.owner@oksbi');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span className="text-xs uppercase font-black tracking-wider text-emerald-400">
            Preferences & Payout Settings
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ⚙️ Portal Configuration & Bank Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
          Configure service coverage radius, real-time audio dispatch alerts, and settlement bank credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>✓ Settings and settlement preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Service Radius & Dispatch Controls */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Compass className="w-4 h-4" />
            <span>Service Radius & Dispatch Range</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Operating Coverage Radius: <strong className="text-emerald-400">{radiusKm} km</strong>
              </label>
              <span className="text-[11px] text-slate-400">From base GPS location</span>
            </div>

            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>5 km (Local Village)</span>
              <span>25 km (Default)</span>
              <span>50 km</span>
              <span>100 km (Whole District)</span>
            </div>
          </div>
        </div>

        {/* Notifications & Audio Dispatch Chimes */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span>Booking Request Notifications</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Audible Chime for Incoming Bookings</span>
                  <span className="text-[10px] text-slate-400">Plays notification sound when a farmer books machinery</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="text-xs font-bold text-white block">SMS & WhatsApp Alerts</span>
                  <span className="text-[10px] text-slate-400">Receive instant SMS with farmer phone and field coordinates</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Bank Account Demo Payout Information */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Direct Bank Settlement & UPI Payout (Demo)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
              Demo Settlement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                UPI ID (VPA)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-emerald-950 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
