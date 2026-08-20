import React from 'react';
import { MarketPriceRecord, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface MarketPriceTableProps {
  records: MarketPriceRecord[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  language?: LanguageCode;
}

export const MarketPriceTable: React.FC<MarketPriceTableProps> = ({
  records,
  sortBy,
  sortOrder,
  onSort,
  language = 'en'
}) => {
  const t = translations[language];

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-emerald-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-600" />
    );
  };

  if (records.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-card">
        <p className="text-sm font-semibold">{t.noMarketData || 'No market price records found for this filter.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100" onClick={() => onSort('commodity')}>
                <div className="flex items-center gap-1.5">
                  <span>{t.commodity || 'Commodity'}</span>
                  {getSortIcon('commodity')}
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100" onClick={() => onSort('market')}>
                <div className="flex items-center gap-1.5">
                  <span>{t.marketApmc || 'Market (APMC)'}</span>
                  {getSortIcon('market')}
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100" onClick={() => onSort('district')}>
                <div className="flex items-center gap-1.5">
                  <span>{t.districtState || 'District & State'}</span>
                  {getSortIcon('district')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => onSort('min_price')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.minPrice || 'Min Price'}</span>
                  {getSortIcon('min_price')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => onSort('max_price')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.maxPrice || 'Max Price'}</span>
                  {getSortIcon('max_price')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100" onClick={() => onSort('modal_price')}>
                <div className="flex items-center justify-end gap-1.5">
                  <span>{t.modalPrice || 'Modal Price'} (₹/Qtl)</span>
                  {getSortIcon('modal_price')}
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">
                <span>{t.wholesaleApprox || 'Wholesale'} (₹/kg)</span>
              </th>
              <th className="py-3.5 px-4 text-center cursor-pointer hover:bg-slate-100" onClick={() => onSort('arrival_date')}>
                <div className="flex items-center justify-center gap-1.5">
                  <span>{t.arrivalDate || 'Arrival Date'}</span>
                  {getSortIcon('arrival_date')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r, idx) => {
              const priceKg = r.price_per_kg || (r.modal_price ? Math.round(r.modal_price / 100) : 0);
              return (
                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <span>{r.commodity}</span>
                      {r.variety && (
                        <span className="block text-[10px] text-slate-400 font-medium">
                          {r.variety}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    <div>
                      <span>{r.market}</span>
                      {r.distance_km !== undefined && r.distance_km !== null && (
                        <span className="block text-[10px] text-emerald-700 font-extrabold">
                          🚗 {r.formatted_distance || `${r.distance_km} km ${t.byRoad || 'by road'}`}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {r.district}, {r.state}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                    ₹{r.min_price?.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                    ₹{r.max_price?.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-800 text-sm">
                    ₹{r.modal_price?.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-950">
                    ₹{priceKg}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500 font-semibold">
                    {r.arrival_date}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
