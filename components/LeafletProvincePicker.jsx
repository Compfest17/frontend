'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

export default function LeafletProvincePicker({ onProvinceSelect, onCitySelect, onLocationSelect }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const mapId = useRef(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const mapInstanceRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const onProvinceSelectRef = useRef(onProvinceSelect);
  const onCitySelectRef = useRef(onCitySelect);
  const onLocationSelectRef = useRef(onLocationSelect);
  
  useEffect(() => {
    onProvinceSelectRef.current = onProvinceSelect;
    onCitySelectRef.current = onCitySelect;
    onLocationSelectRef.current = onLocationSelect;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mapRef.current) return;
      
      try {
        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.off(); } catch (_) {}
          try { mapInstanceRef.current.remove(); } catch (_) {}
          mapInstanceRef.current = null;
        }
        if (mapRef.current._leaflet_id) {
          try { delete mapRef.current._leaflet_id; } catch (_) {}
        }
        mapRef.current.innerHTML = '';
      } catch (_) {}

      const L = (await import('leaflet')).default;
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      try {
        const mapInstance = L.map(mapRef.current, { fadeAnimation: true, zoomControl: true, attributionControl: true }).setView([-2.5489, 118.0149], 5);
        mapInstanceRef.current = mapInstance;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        let currentMarker = null;

        mapInstance.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        try {
          setLoading(true);
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const province = data.address.state || data.address.province || '';
            const city = data.address.city || data.address.town || data.address.village || '';
            
            if (currentMarker) {
              mapInstance.removeLayer(currentMarker);
            }
            
            currentMarker = L.marker([lat, lng]).addTo(mapInstance);
            currentMarker.bindPopup(`
              <div>
                <strong>Provinsi:</strong> ${province}<br>
                <strong>Kota:</strong> ${city}<br>
                <button onclick="window.selectLocation('${province}', '${city}')" 
                        style="margin-top: 8px; padding: 4px 8px; background: #DD761C; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Pilih Lokasi
                </button>
              </div>
            `).openPopup();
            
            setSelectedLocation({ province, city, lat, lng });
            
            window.selectLocation = (prov, ct) => {
              onProvinceSelectRef.current(prov);
              onCitySelectRef.current(ct);
              if (onLocationSelectRef.current) {
                onLocationSelectRef.current({ province: prov, city: ct, lat, lng });
              }
              mapInstance.closePopup();
            };
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
        } finally {
          setLoading(false);
        }
      });

        setMap(mapInstance);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.off(); } catch (_) {}
        try { mapInstanceRef.current.remove(); } catch (_) {}
        mapInstanceRef.current = null;
      }
      setMap(null);
      if (mapRef.current) {
        try { delete mapRef.current._leaflet_id; } catch (_) {}
        mapRef.current.innerHTML = '';
      }
    };
  }, []);

  const searchLocation = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm + ', Indonesia')}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectSearchResult = (result) => {
    if (map) {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      map.setView([lat, lng], 10);
      
      map.fireEvent('click', { latlng: { lat, lng } });
    }
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari provinsi atau kota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD761C] focus:border-transparent"
          />
        </div>
        <button
          onClick={searchLocation}
          disabled={!searchTerm.trim() || loading}
          className="px-4 py-2 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => selectSearchResult(result)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-900">{result.display_name}</div>
              <div className="text-xs text-gray-500">
                {result.address?.state || result.address?.province} • {result.address?.city || result.address?.town}
              </div>
            </button>
          ))}
        </div>
      )}

      <div 
        ref={mapRef}
        id={mapId.current}
        className="h-64 w-full rounded-lg border border-gray-300"
        style={{ minHeight: '300px' }}
      />
      
      <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
        <MapPin className="w-4 h-4 inline mr-2 text-[#DD761C]" />
        Klik pada peta untuk memilih provinsi dan kota, atau gunakan search box di atas.
      </div>
    </div>
  );
}
