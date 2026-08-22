import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  Percent,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { EarningsBreakdown } from '../types';
import { StatCard } from '../components/Common/StatCard';

export const EarningsPage: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const data = await api.getEarnings();
      setEarnings(data);
    } catch (e) {
      console.error('Error loading earnings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-800/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase font-black tracking-wider text-amber-400">
              Financial Accounting & Payouts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            💰 Owner Earnings & Commission Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
            Real-time tracking of rental revenue, automated 5% platform commission accounting, and net payouts.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Net Accrued</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            ₹{(earnings?.total_earnings ?? 124500).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* 4 Revenue Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Earnings"
          value={`₹${(earnings?.today_earnings ?? 0).toLocaleString('en-IN')}`}
          subtitle="Net after 5% platform fee"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="This Week"
          value={`₹${(earnings?.week_earnings ?? 0).toLocaleString('en-IN')}`}
          subtitle="Last 7 days"
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="This Month"
          value={`₹${(earnings?.month_earnings ?? 0).toLocaleString('en-IN')}`}
          subtitle="Current calendar month"
          icon={DollarSign}
          color="purple"
        />

        <StatCard
          title="Total Lifetime"
          value={`₹${(earnings?.total_earnings ?? 0).toLocaleString('en-IN')}`}
          subtitle="Cumulative owner payout"
          icon={Wallet}
          color="amber"
        />
      </div>

      {/* Platform Fee Transparent Accounting Rule Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-800/40 bg-gradient-to-br from-emerald-950/40 to-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                AgriCare 5% Platform Commission Transparency
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                For every booking, 95% goes directly to you as the equipment owner, and 5% supports the AgriCare platform.
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-xs font-black text-emerald-400">
            Transparent Settlement
          </div>
        </div>

        {/* Calculation Example Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-semibold">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase block">Farmer Booking Amount (100%)</span>
            <span className="text-base font-black text-white mt-1 block">₹3,200.00</span>
            <span className="text-[10px] text-slate-500">Gross rental fee charged to farmer</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase block">AgriCare Platform Fee (5%)</span>
            <span className="text-base font-black text-amber-400 mt-1 block">- ₹160.00</span>
            <span className="text-[10px] text-slate-500">Server maintenance & matching</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40">
            <span className="text-emerald-400 text-[10px] uppercase font-black block">Your Net Owner Earnings (95%)</span>
            <span className="text-base font-black text-emerald-300 mt-1 block">₹3,040.00</span>
            <span className="text-[10px] text-emerald-400/80">Direct bank payout settlement</span>
          </div>
        </div>
      </div>

      {/* Financial Transactions History Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Completed Bookings & Settlement Ledger
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Detailed itemized financial breakdown for every completed job
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4 pl-6">Booking ID</th>
                  <th className="p-4">Machinery / Resource</th>
                  <th className="p-4">Farmer Name</th>
                  <th className="p-4">Service Date</th>
                  <th className="p-4 text-right">Gross Amount</th>
                  <th className="p-4 text-right">5% Platform Fee</th>
                  <th className="p-4 text-right text-emerald-400">Net Owner Payout</th>
                  <th className="p-4 pr-6 text-center">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                {!earnings?.transactions || earnings.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400 text-xs">
                      No completed jobs yet. Earnings will appear after servicing farm bookings.
                    </td>
                  </tr>
                ) : (
                  earnings.transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 pl-6 font-bold text-white">
                        #{t.booking_id}
                      </td>
                      <td className="p-4 font-semibold text-slate-200">
                        {t.resource_title}
                      </td>
                      <td className="p-4">
                        {t.farmer_name}
                      </td>
                      <td className="p-4 text-slate-400">
                        {t.date}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-200">
                        ₹{t.gross_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right font-semibold text-amber-400">
                        - ₹{t.platform_fee.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right font-black text-emerald-400 text-sm">
                        ₹{t.net_earnings.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Settled</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
