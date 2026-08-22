import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md'
}) => {
  const s = status.toLowerCase();

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (s === 'available' || s === 'completed' || s === 'confirmed' || s === 'settled') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${sizeClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        {status}
      </span>
    );
  }

  if (s === 'pending' || s === 'busy' || s === 'in progress') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
        {status}
      </span>
    );
  }

  if (s === 'unavailable' || s === 'rejected' || s === 'cancelled') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 ${sizeClass}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-700/50 text-slate-300 border border-slate-600 ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      {status}
    </span>
  );
};
