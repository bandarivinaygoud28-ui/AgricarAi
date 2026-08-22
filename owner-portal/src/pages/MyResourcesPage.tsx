import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { ResourceItem } from '../types';
import { StatusBadge } from '../components/Common/StatusBadge';

interface MyResourcesPageProps {
  onNavigateToAdd: () => void;
  onNavigateToEdit: (resourceId: number) => void;
  onNavigateToBookings: () => void;
}

export const MyResourcesPage: React.FC<MyResourcesPageProps> = ({
  onNavigateToAdd,
  onNavigateToEdit,
  onNavigateToBookings
}) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('All');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await api.getMyResources();
      setResources(data);
    } catch (e) {
      console.error('Error loading owner resources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleToggleAvailability = async (id: number, currentAvail: string) => {
    const nextAvail = currentAvail === 'Available' ? 'Unavailable' : 'Available';
    try {
      await api.toggleAvailability(id, nextAvail);
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, availability: nextAvail } : r))
      );
    } catch (e) {
      alert('Failed to update availability status.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete '${title}'?`)) return;
    try {
      await api.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert('Failed to delete resource.');
    }
  };

  const filteredResources = resources.filter((r) => {
    if (filterType === 'All') return true;
    return r.resource_type?.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-800/40 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tractor className="w-5 h-5 text-emerald-400" />
            <span className="text-xs uppercase font-black tracking-wider text-emerald-400">
              Machinery & Fleet Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            🚜 My Listed Equipment ({resources.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
            Manage your tractors, JCBs, sprayers, and drones. Changes reflect live on the Farmer Portal.
          </p>
        </div>

        <button
          onClick={onNavigateToAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Tractor', 'JCB', 'Harvester', 'Drone', 'Sprayer', 'Pump'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-semibold">
          Loading your agricultural equipment...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800 space-y-4">
          <Tractor className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No resources added yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add your first tractor, JCB, drone or farm machine.
          </p>
          <button
            onClick={onNavigateToAdd}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl"
          >
            + Add Equipment Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all shadow-xl"
            >
              {/* Image & Badges */}
              <div className="relative h-48 bg-slate-800 overflow-hidden">
                <img
                  src={
                    res.image_url ||
                    res.image ||
                    'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={res.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-[10px] font-black uppercase text-emerald-400 border border-slate-700">
                    {res.resource_type}
                  </span>
                  {res.is_demo && (
                    <span className="px-2 py-0.5 rounded-xl bg-amber-500/80 backdrop-blur-md text-[9px] font-black uppercase text-slate-950">
                      DEMO
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <StatusBadge status={res.availability} />
                </div>

                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-xs font-black text-amber-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{res.rating || 4.8}</span>
                  <span className="text-[10px] text-slate-400">({res.total_ratings || 12})</span>
                </div>
              </div>

              {/* Resource Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Reg: <strong>{res.vehicle_number || 'TS-03-AG-2026'}</strong></span>
                    <span>Model: <strong>{res.model || res.year || '2024'}</strong></span>
                  </div>

                  <h3 className="text-base font-black text-white leading-tight">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                    {res.description || 'Heavy duty agricultural machinery ready for immediate field operations.'}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{res.location}</span>
                  </div>
                </div>

                {/* Price Breakdown Pill */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Standard Rate</span>
                    <span className="text-base font-black text-emerald-400">
                      ₹{res.price_per_hour || res.price}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold"> /hour</span>
                  </div>

                  {res.price_per_acre ? (
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block font-semibold">Per Acre</span>
                      <span className="text-xs font-black text-slate-200">
                        ₹{res.price_per_acre}
                      </span>
                    </div>
                  ) : null}

                  {res.price_per_day ? (
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block font-semibold">Full Day</span>
                      <span className="text-xs font-black text-slate-200">
                        ₹{res.price_per_day}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleAvailability(res.id, res.availability)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      res.availability === 'Available'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/50'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-800 hover:bg-emerald-900/50'
                    }`}
                  >
                    {res.availability === 'Available' ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Set Busy</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Set Available</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onNavigateToBookings}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bookings</span>
                  </button>

                  <button
                    onClick={() => onNavigateToEdit(res.id)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Edit Info</span>
                  </button>

                  <button
                    onClick={() => handleDelete(res.id, res.title)}
                    className="px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
