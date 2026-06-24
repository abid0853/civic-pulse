"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';

// The listener that catches the user's click on the map
function MapClickHandler({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ location, setLocation }) {
  const { theme } = useTheme();

  // Custom sleek marker for the picker
  const pickerIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-md"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  // Default to Kerala (Trivandrum) if no location is set yet
  const center = location ? [location.lat, location.lng] : [8.5241, 76.9366]; 

  return (
    <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 z-0 relative">
      {/* Helper text overlay */}
      {!location && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
          Click map to drop pin
        </div>
      )}
      <MapContainer 
        center={center} 
        zoom={location ? 16 : 11} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer url={tileUrl} />
        <MapClickHandler setLocation={setLocation} />
        {location && <Marker position={[location.lat, location.lng]} icon={pickerIcon} />}
      </MapContainer>
    </div>
  );
}