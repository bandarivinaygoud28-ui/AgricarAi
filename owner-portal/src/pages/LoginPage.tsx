import React, { useState } from 'react';
import { Tractor, Phone, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToRegister,
  onSuccess
}) => {
  const { login } = useAuth();
  const [mobile, setMobile] = useState<string>('9876543210');
  const [password, setPassword] = useState<string>('owner123');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(mobile, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your mobile number and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (phone: string, pass: string) => {
    setMobile(phone);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-400 text-3xl shadow-xl shadow-emerald-950/60 mb-2">
            🚜
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Resource Owner Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            AgriCare Equipment Owner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto font-medium">
            Turn your tractors, JCBs, drones, and farm machinery into steady rental income.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Mobile Number</span>
                <span className="text-[10px] text-slate-500 font-medium">10 digits Indian mobile</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                  +91
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98765 43210"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => alert('Demo password is: owner123 (or use any password you registered with)')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Forgot Password?
                </button>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white font-semibold focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Logging in to Owner Dashboard...</span>
              ) : (
                <>
                  <span>Login to Owner Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 font-bold mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>One-Click Demo Owner Credentials:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('9876543210', 'owner123')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-left transition-all"
              >
                <p className="font-bold text-white">🚜 Ramesh Kumar</p>
                <p className="text-[10px] text-slate-400">9876543210 (Tractors)</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('9012345678', 'owner123')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-left transition-all"
              >
                <p className="font-bold text-white">🚜 Naresh Yadav</p>
                <p className="text-[10px] text-slate-400">9012345678 (JCBs)</p>
              </button>
            </div>
          </div>

          {/* Create Account Switch */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Don't have an Equipment Owner account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-emerald-400 hover:text-emerald-300 font-black underline ml-1"
              >
                Create Owner Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Integrated with AgriCare AI Farmer Marketplace & Backend</span>
        </div>
      </div>
    </div>
  );
};
