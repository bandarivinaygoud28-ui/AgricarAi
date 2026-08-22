import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Phone,
  Navigation,
  Clock,
  MapPin,
  CheckCheck,
  Check,
  Award,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookingRequestItem } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';
import { GoogleMapsRouteButton } from '../components/Common/GoogleMapsRouteButton';

interface JobsPageProps {
  showCompletedOnly?: boolean;
}

export const JobsPage: React.FC<JobsPageProps> = ({ showCompletedOnly = false }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<BookingRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>(
    showCompletedOnly ? 'completed' : 'upcoming'
  );
  const [completedSuccessMsg, setCompletedSuccessMsg] = useState<string>('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings('all');
      setJobs(data);
    } catch (e) {
      console.error('Error loading jobs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleMarkCompleted = async (id: string | number) => {
    if (!window.confirm('Mark this job as completed? This will finalize billing and update earnings.')) return;
    try {
      const res = await api.completeJob(id);
      setCompletedSuccessMsg(res.message || `🎉 Job #${id} marked as completed!`);
      fetchJobs();
      setTimeout(() => setCompletedSuccessMsg(''), 5000);
    } catch (e) {
      alert('Failed to mark job completed.');
    }
  };

  const upcomingJobs = jobs.filter((j) => j.status === 'Confirmed');
  const completedJobs = jobs.filter((j) => j.status === 'Completed');
  const displayList = activeTab === 'upcoming' ? upcomingJobs : completedJobs;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 border border-blue-800/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-blue-400" />
            <span className="text-xs uppercase font-black tracking-wider text-blue-400">
              Operations & Field Work Dispatch
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            📅 {activeTab === 'upcoming' ? 'Upcoming Confirmed Jobs' : 'Completed Farm Jobs'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
            Track confirmed machinery dispatches, open driving routes, contact farmers, and mark jobs as completed.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Completed ({completedJobs.length})</span>
          </button>
        </div>
      </div>

      {completedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-lg animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{completedSuccessMsg}</span>
        </div>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">
          Loading farm jobs...
        </div>
      ) : displayList.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {activeTab === 'upcoming' ? 'No upcoming jobs' : 'No completed jobs'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            {activeTab === 'upcoming'
              ? 'When you accept pending booking requests, they will appear here as confirmed field jobs.'
              : 'Jobs you mark as completed will be archived here along with earnings settlement.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((job) => (
            <div
              key={job.id}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {job.image ? (
                      <img
                        src={job.image}
                        alt={job.resource_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🚜</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                        {job.resource_type}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        #{job.booking_id}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      {job.resource_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-semibold mt-1">
                      <span>Farmer: <strong className="text-white">{job.farmer_name}</strong></span>
                      <span>•</span>
                      <a
                        href={`tel:${job.farmer_phone}`}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{job.farmer_phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <StatusBadge status={job.status} />
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    ₹{job.total_amount?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Net Payout: ₹{job.owner_earnings?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Scheduled Date & Time</span>
                    <span className="font-bold text-slate-200">{job.booking_date} ({job.booking_time})</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">Farmer's Land / Survey Location</span>
                    <span className="font-bold text-slate-200 truncate block">{job.farm_location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {job.status === 'Completed' ? 'Completion Time' : 'Job Scope & Duration'}
                    </span>
                    <span className="font-bold text-slate-200">
                      {job.completed_at || job.duration || '4 hours'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <GoogleMapsRouteButton
                    farmerLocation={job.farm_location}
                    farmLatitude={job.farm_latitude}
                    farmLongitude={job.farm_longitude}
                    ownerLatitude={user?.latitude}
                    ownerLongitude={user?.longitude}
                  />

                  <a
                    href={`tel:${job.farmer_phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Farmer</span>
                  </a>
                </div>

                {job.status === 'Confirmed' && (
                  <button
                    onClick={() => handleMarkCompleted(job.booking_id || job.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-black shadow-lg shadow-emerald-950 transition-all"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Mark Job Completed</span>
                  </button>
                )}

                {job.status === 'Completed' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Job Completed & Settled</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
