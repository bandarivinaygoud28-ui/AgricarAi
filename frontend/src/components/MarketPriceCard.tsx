import React from 'react';
import { MarketPriceRecord, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { MapPin, Building, Calendar, Sparkles } from 'lucide-react';

interface MarketPriceCardProps {
  record: MarketPriceRecord;
  isFarmerCrop?: boolean;
  language?: LanguageCode;
}

export const MarketPriceCard: React.FC<MarketPriceCardProps> = ({
  record,
  isFarmerCrop,
  language = 'en'
}) => {
  const t = translations[language];
  const priceKg = record.price_per_kg || (record.modal_price ? Math.round(record.modal_price / 100) : 0);

  return (
    <div
      className={`relative bg-white border rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between ${
        isFarmerCrop
          ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/20 to-white'
          : 'border-slate-200'
      }`}
    >
      {isFarmerCrop && (
        <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          <span>{language === 'te' ? 'మీ పంట' : language === 'hi' ? 'आपकी फसल' : 'YOUR CROP'}</span>
        </div>
      )}

      {/* Header: Commodity & Date */}
      <div>
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                {record.commodity}
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 pl-4 block mt-0.5">
              {record.variety || 'Standard / Hybrid'}
            </span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3 text-slate-400" />
              {record.arrival_date}
            </span>
          </div>
        </div>

        {/* Location & Mandi Info */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
              <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{record.market}</span>
            </div>
            {record.distance_km !== undefined && record.distance_km !== null && (
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <span>🚗</span>
                <span>{record.formatted_distance || `${record.distance_km} km ${t.byRoad || 'by road'}`}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-medium pl-5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{record.district}, {record.state}</span>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown Box */}
      <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              {t.modalPrice || 'Mandi Modal Price'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-700">
                ₹{record.modal_price?.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">/ Qtl</span>
            </div>
          </div>

          <div className="text-right bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
            <span className="text-[9px] font-bold text-emerald-800 block uppercase">
              {t.wholesaleApprox || 'Wholesale Approx.'}
            </span>
            <span className="text-sm font-black text-emerald-900">
              ₹{priceKg} <span className="text-[10px] font-bold text-emerald-700">/ kg</span>
            </span>
          </div>
        </div>

        {/* Traded Range */}
        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span>{t.tradedRange || 'Traded Range'}:</span>
          <span className="font-bold text-slate-800">
            ₹{record.min_price?.toLocaleString()} – ₹{record.max_price?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
