'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function MapComponent({ location, address, latitude, longitude }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const defaultLat = -7.9839;
        const defaultLng = 112.6214;
        
        const lat = parseFloat(latitude) || defaultLat;
        const lng = parseFloat(longitude) || defaultLng;

        const map = L.map(mapRef.current).setView([lat, lng], 15);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        const marker = L.marker([lat, lng]).addTo(map);
        
        if (address) {
          marker.bindPopup(`<b>Lokasi:</b><br>${address}`).openPopup();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, latitude, longitude, address]);

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
          <div className="w-full h-full rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading map...</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              {address || "Lokasi tidak tersedia"}
            </p>
          </div>
          {latitude && longitude && (
            <div className="text-xs text-gray-500">
              Koordinat: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Map */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
        <div 
          ref={mapRef} 
          className="w-full h-full rounded-lg"
          style={{ minHeight: '300px' }}
        />
      </div>

      {/* Location Info */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            {address || "Lokasi tidak tersedia"}
          </p>
        </div>
      </div>
    </div>
  );
}
