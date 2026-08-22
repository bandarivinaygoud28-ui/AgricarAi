import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  onClick
}) => {
  const colorStyles = {
    emerald: {
      border: 'border-emerald-800/40',
      bg: 'from-emerald-950/40 to-slate-900',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      text: 'text-emerald-400'
    },
    amber: {
      border: 'border-amber-800/40',
      bg: 'from-amber-950/40 to-slate-900',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      text: 'text-amber-400'
    },
    blue: {
      border: 'border-blue-800/40',
      bg: 'from-blue-950/40 to-slate-900',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      text: 'text-blue-400'
    },
    purple: {
      border: 'border-purple-800/40',
      bg: 'from-purple-950/40 to-slate-900',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      text: 'text-purple-400'
    },
    slate: {
      border: 'border-slate-700/60',
      bg: 'from-slate-800/50 to-slate-900',
      iconBg: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
      text: 'text-slate-300'
    }
  };

  const style = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-3xl bg-gradient-to-br ${style.bg} border ${style.border} shadow-lg transition-all ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:border-emerald-500/50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-1 font-medium flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-2xl border ${style.iconBg} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
