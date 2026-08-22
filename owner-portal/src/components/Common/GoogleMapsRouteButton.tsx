import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface GoogleMapsRouteButtonProps {
  farmerLocation: string;
  farmLatitude?: number;
  farmLongitude?: number;
  ownerLatitude?: number;
  ownerLongitude?: number;
  label?: string;
  className?: string;
}

export const GoogleMapsRouteButton: React.FC<GoogleMapsRouteButtonProps> = ({
  farmerLocation,
  farmLatitude,
  farmLongitude,
  ownerLatitude,
  ownerLongitude,
  label = '🗺️ Open Route',
  className = ''
}) => {
  const handleOpenRoute = (e: React.MouseEvent) => {
    e.stopPropagation();

    let url: string;

    if (farmLatitude && farmLongitude) {
      if (ownerLatitude && ownerLongitude) {
        url = `https://www.google.com/maps/dir/?api=1&origin=${ownerLatitude},${ownerLongitude}&destination=${farmLatitude},${farmLongitude}&travelmode=driving`;
      } else {
        url = `https://www.google.com/maps/dir/?api=1&destination=${farmLatitude},${farmLongitude}&travelmode=driving`;
      }
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        farmerLocation || 'Telangana, India'
      )}&travelmode=driving`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleOpenRoute}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all shadow-sm ${className}`}
      title="Open Google Maps Directions"
    >
      <Navigation className="w-3.5 h-3.5 text-blue-400" />
      <span>{label}</span>
    </button>
  );
};
