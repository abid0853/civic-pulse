"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import { supabase } from '../../lib/supabase'; // Import our DB client

export default function BountyMap() {
  const { theme } = useTheme();
  const [bounties, setBounties] = useState([]);

  useEffect(() => {
    // 1. Fetch all existing active issues on load
    const fetchBounties = async () => {
      const { data, error } = await supabase
        .from('bounties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setBounties(data);
      }
    };

    fetchBounties();

    // 2. The Hackathon "Wow" Factor: Real-time WebSocket Subscription
    // This listens for new rows and injects them into the map instantly.
    const subscription = supabase
      .channel('bounties_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bounties' }, (payload) => {
        setBounties((current) => [payload.new, ...current]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Custom HTML Marker for that "Gamified" vibe
  const createCustomIcon = (points, severity) => {
    const colorClass = severity.toUpperCase() === 'HIGH' || severity.toUpperCase() === 'CRITICAL' 
      ? 'bg-red-500 shadow-red-500/50' 
      : 'bg-orange-500 shadow-orange-500/50';
      
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10">
          <div class="absolute inset-0 rounded-full animate-ping opacity-20 ${colorClass}"></div>
          <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white ${colorClass} text-white text-[10px] font-bold shadow-lg">
            ${points || 100}
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  // Prevent rendering if window is undefined (SSR safety)
  if (typeof window === 'undefined') return null;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg relative z-0">
      <MapContainer 
        center={[9.55, 76.78]} // Coordinates for Kerala region
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url={tileUrl}
        />
        {bounties.map(bounty => {
          // Fallback coordinates in case the AI didn't generate them or DB missed them
          const lat = bounty.lat || (9.55 + (Math.random() * 0.04 - 0.02));
          const lng = bounty.lng || (76.78 + (Math.random() * 0.04 - 0.02));

          return (
            <Marker 
              key={bounty.id} 
              position={[lat, lng]} 
              icon={createCustomIcon(bounty.reward_points, bounty.severity)}
            >
              <Popup className="custom-popup">
                <div className="p-2 w-48">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-600 uppercase">{bounty.category}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md text-white ${bounty.severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`}>{bounty.severity}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight">{bounty.title}</h3>
                  <p className="text-emerald-600 font-extrabold mt-2 text-lg">{bounty.reward_points} PTS</p>
                  <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">"{bounty.description}"</p>
                  <button className="mt-3 w-full bg-slate-900 text-white rounded-md py-2 text-sm font-bold hover:bg-slate-800 transition">
                    Claim Fix Bounty
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}