import React, { useState } from 'react';
import { NewsArticle, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { Calendar, Building, X, ExternalLink, MapPin, Eye, Sparkles, Navigation, ShieldCheck } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  language: LanguageCode;
  isPriority?: boolean;
}

const CATEGORY_FALLBACK_MAP: Record<string, string> = {
  fertilizer: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&auto=format&fit=crop&q=80',
  insurance: 'https://images.unsplash.com/photo-1514632595-4944383f2737?w=700&auto=format&fit=crop&q=80',
  bank: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=700&auto=format&fit=crop&q=80',
  machinery: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=700&auto=format&fit=crop&q=80',
  weather: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=700&auto=format&fit=crop&q=80',
  mandi: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80',
  paddy: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=700&auto=format&fit=crop&q=80',
  rice: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=700&auto=format&fit=crop&q=80',
  tomato: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=700&auto=format&fit=crop&q=80',
  cotton: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=700&auto=format&fit=crop&q=80',
  chilli: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=700&auto=format&fit=crop&q=80',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=700&auto=format&fit=crop&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=700&auto=format&fit=crop&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=700&auto=format&fit=crop&q=80'
};

const getCategorySpecificFallback = (art: NewsArticle): string => {
  const combined = (art.title + ' ' + (art.category || '') + ' ' + (art.crop || '')).toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_FALLBACK_MAP)) {
    if (combined.includes(key)) {
      return url;
    }
  }
  return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&auto=format&fit=crop&q=80';
};

export const NewsCard: React.FC<NewsCardProps> = ({ article, language, isPriority = false }) => {
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTierColor = (tier?: number) => {
    if (tier === 1) return 'bg-emerald-600 text-white border-emerald-500';
    if (tier === 2) return 'bg-teal-600 text-white border-teal-500';
    if (tier === 3) return 'bg-amber-600 text-white border-amber-500';
    if (tier === 4) return 'bg-blue-600 text-white border-blue-500';
    if (tier === 5) return 'bg-indigo-600 text-white border-indigo-500';
    return 'bg-slate-800 text-slate-100 border-slate-700';
  };

  return (
    <>
      <div
        className={`overflow-hidden flex flex-col bg-white border rounded-2xl transition-all duration-300 group ${
          isPriority || article.priority_tier === 1
            ? 'border-emerald-300 ring-2 ring-emerald-500/20 shadow-md hover:shadow-xl'
            : 'border-slate-200 hover:border-emerald-400 shadow-card hover:shadow-card-hover'
        }`}
      >
        {/* News Thumbnail */}
        <div className="h-44 w-full relative overflow-hidden bg-slate-100">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getCategorySpecificFallback(article);
            }}
          />

          {/* Location / Scope Badge */}
          {article.location_tag && (
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm border border-slate-700/60 flex items-center gap-1">
              <span>{article.location_tag}</span>
            </div>
          )}

          {/* Relevance Badge */}
          {article.relevance_badge && (
            <div
              className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm border flex items-center gap-1 ${getTierColor(
                article.priority_tier
              )}`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{article.relevance_badge}</span>
            </div>
          )}

          {/* Category / Tier Tag */}
          <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30 truncate max-w-[80%]">
            <span>{article.tier_name || article.category}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Meta tags: Date & Source */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mb-2">
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {article.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 line-clamp-1 text-slate-600 font-semibold">
                <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{article.source}</span>
              </span>
            </div>

            {/* Headline */}
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
              {article.title}
            </h3>

            {/* Short Summary */}
            <p className="text-slate-600 text-xs mt-2 leading-relaxed line-clamp-3 font-normal">
              {article.summary}
            </p>

            {/* Relevance Reason Pill */}
            {article.relevance_reason && (
              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] text-slate-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{article.relevance_reason}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.readMore}</span>
            </button>

            {article.url ? (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <span>{t.readFullNews}</span>
                <ExternalLink className="w-3 h-3 text-emerald-700" />
              </a>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <span>{t.readFullNews}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Article / Summary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative animate-scale-up space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {article.location_tag && (
                <span className="text-xs font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg">
                  {article.location_tag}
                </span>
              )}
              {article.relevance_badge && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getTierColor(
                    article.priority_tier
                  )}`}
                >
                  {article.relevance_badge}
                </span>
              )}
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                {article.tier_name || article.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {article.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {article.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                {article.source}
              </span>
            </div>

            <div className="w-full h-56 rounded-2xl overflow-hidden">
              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-slate-800 font-medium">
                <h4 className="text-xs uppercase font-black text-emerald-950 tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Farmer Intelligence Brief</span>
                </h4>
                <p className="text-xs leading-relaxed">{article.summary}</p>
              </div>

              {article.relevance_reason && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800">Why this matters for your farm: </strong>
                  <span>{article.relevance_reason}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Official Publisher: {article.source}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>

                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Read Original Bulletin</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
