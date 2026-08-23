import React from 'react';
import { FarmResource, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { MapPin, Phone, Star, Tractor } from 'lucide-react';

interface ResourceCardProps {
  resource: FarmResource;
  language: LanguageCode;
  onBook: (resource: FarmResource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, language, onBook }) => {
  const t = translations[language];

  const title = resource.title || resource.name || "Farm Resource";
  const owner = resource.provider_name || resource.ownerName || "Equipment Owner";
  const phone = resource.contact_phone || resource.ownerMobile || "";
  const location = resource.location || "Telangana, India";
  const hourlyRate = resource.price_per_hour ?? resource.pricePerHour ?? resource.price ?? 800;
  const perAcreRate = resource.price_per_acre ?? resource.pricePerAcre ?? 0;
  const fullDayRate = resource.price_per_day ?? (hourlyRate * 8);
  const status = resource.availability || resource.status || "Available";
  const isAvailable = status.toLowerCase() === "available";
  const rating = resource.rating ?? 4.8;
  const imageUrl = resource.image_url || resource.image || "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="glass-card overflow-hidden flex flex-col bg-white border border-slate-200 hover:border-emerald-400 transition-all rounded-2xl shadow-sm hover:shadow-md">
      {/* Resource Image */}
      <div className="h-44 w-full relative overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80";
          }}
        />
        <div className="absolute top-3 left-3 bg-emerald-900/90 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs">
          {resource.resource_type || resource.type || "Equipment"}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{rating}</span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
            isAvailable 
              ? 'bg-emerald-600 text-white' 
              : 'bg-amber-600 text-white'
          }`}>
            ● {status}
          </span>
        </div>
      </div>

      {/* Resource Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1" title={title}>
            {title}
          </h3>
          
          <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
            <span>Owner:</span> <strong className="text-slate-800 font-bold">{owner}</strong>
          </p>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {resource.description || "Reliable agricultural machinery available for farm booking and custom hiring."}
          </p>

          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700">{phone}</span>
              </div>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-1 text-center bg-slate-50 p-2 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Hourly</span>
              <span className="text-xs font-bold text-emerald-800">₹{hourlyRate}/hr</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Per Acre</span>
              <span className="text-xs font-bold text-slate-700">
                {perAcreRate > 0 ? `₹${perAcreRate}` : '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Full Day</span>
              <span className="text-xs font-bold text-slate-700">
                {fullDayRate > 0 ? `₹${fullDayRate}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-emerald-800">₹{hourlyRate}</span>
              <span className="text-xs text-slate-500 font-medium">/hour</span>
            </div>
          </div>

          <button
            onClick={() => onBook(resource)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Tractor className="w-3.5 h-3.5" />
            <span>{t.bookNow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

