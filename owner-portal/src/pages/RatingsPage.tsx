import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, ShieldCheck, User, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { OwnerRatingsSummary } from '../types';

export const RatingsPage: React.FC = () => {
  const [ratings, setRatings] = useState<OwnerRatingsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const data = await api.getRatings();
      setRatings(data);
    } catch (e) {
      console.error('Error loading ratings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const totalReviews = ratings?.total_reviews ?? 0;
  const overall = ratings?.overall_rating ?? 0.0;

  const stars = [
    { label: '5 Star', count: ratings?.star_breakdown?.['5_star'] ?? 0, stars: 5 },
    { label: '4 Star', count: ratings?.star_breakdown?.['4_star'] ?? 0, stars: 4 },
    { label: '3 Star', count: ratings?.star_breakdown?.['3_star'] ?? 0, stars: 3 },
    { label: '2 Star', count: ratings?.star_breakdown?.['2_star'] ?? 0, stars: 2 },
    { label: '1 Star', count: ratings?.star_breakdown?.['1_star'] ?? 0, stars: 1 }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-800/40 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-xs uppercase font-black tracking-wider text-amber-400">
            Trust & Quality Score
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ⭐ Farmer Ratings & Machinery Reviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
          Feedback submitted by farmers following completed equipment rental operations. High ratings boost your machinery search ranking.
        </p>
      </div>

      {/* Overview Score Card & Star Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Box */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Overall Owner Rating
          </span>
          <div className="text-5xl sm:text-6xl font-black text-amber-400 tracking-tight">
            {overall.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i <= Math.round(overall) && overall > 0
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-400 font-semibold">
            Based on <strong>{totalReviews} verified farmer reviews</strong>
          </p>
        </div>

        {/* 5-Star Breakdown Bars */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-center">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
            Rating Distribution Breakdown
          </h3>

          {stars.map((s) => {
            const pct = totalReviews > 0 ? Math.round((s.count / totalReviews) * 100) : 0;
            return (
              <div key={s.label} className="flex items-center gap-3 text-xs">
                <span className="w-14 text-slate-300 font-bold">{s.label}</span>
                <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-slate-400 font-semibold">{s.count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          Recent Verified Farmer Feedback
        </h3>

        <div className="space-y-3">
          {!ratings?.reviews || ratings.reviews.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl border border-slate-800 space-y-2">
              <Star className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No ratings yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ratings will appear after farmers complete bookings with your machinery.
              </p>
            </div>
          ) : (
            ratings.reviews.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                      {rev.farmer_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{rev.farmer_name}</span>
                        <span className="text-[10px] text-emerald-400 font-normal px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-800">
                          Verified Farmer
                        </span>
                      </h4>
                      <span className="text-[10px] text-slate-500">{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  "{rev.review || 'Excellent equipment condition and highly reliable service operator.'}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
