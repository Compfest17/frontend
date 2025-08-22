'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader } from 'lucide-react';
import dynamic from 'next/dynamic';
import GeocodingAPI from '@/services/geocodingAPI';

const LeafletMap = dynamic(() => import('./LeafletMap'), { 
  ssr: false,
  loading: () => <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function AddressInput({
  value = '',
  coordinates = { lat: null, lon: null },
  onChange,
  onCoordinatesChange,
  placeholder = "Masukkan alamat lengkap lokasi",
  className = "",
  authToken = null
}) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim().length >= 3) {
        searchAddresses(inputValue.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddresses = async (query) => {
    try {
      setIsLoading(true);
      const response = await GeocodingAPI.searchAddresses(query, 5, authToken);
      
      if (response.success) {
        setSuggestions(response.data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      try {
        const fallbackResponse = await GeocodingAPI.searchAddressesDirect(query, 5);
        if (fallbackResponse.success) {
          setSuggestions(fallbackResponse.data || []);
          setShowSuggestions(true);
        }
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    if (coordinates.lat || coordinates.lon) {
      onCoordinatesChange({ lat: null, lon: null });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.display_name);
    onChange(suggestion.display_name);
    onCoordinatesChange({ lat: suggestion.lat, lon: suggestion.lon });
    setShowSuggestions(false);
  };

  const handleMapClick = async (coords) => {
    try {
      setIsLoading(true); 
      
      const response = await GeocodingAPI.reverseGeocode(coords.lat, coords.lng, authToken);
      
      if (response.success && response.data?.display_name) {
        setInputValue(response.data.display_name);
        onChange(response.data.display_name);
        onCoordinatesChange({ lat: coords.lat, lon: coords.lng });
      } else {
        await handleDirectReverseGeocode(coords);
      }
    } catch (error) {
      await handleDirectReverseGeocode(coords);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectReverseGeocode = async (coords) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1&accept-language=id`,
        {
          headers: {
            'User-Agent': 'GatotKota-Frontend/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.display_name) {
          setInputValue(data.display_name);
          onChange(data.display_name);
          onCoordinatesChange({ lat: coords.lat, lon: coords.lng });
          return;
        }
      }
      
      const genericAddress = `Lokasi: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
      setInputValue(genericAddress);
      onChange(genericAddress);
      onCoordinatesChange({ lat: coords.lat, lon: coords.lng });
      
    } catch (error) {
      const genericAddress = `Koordinat: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
      setInputValue(genericAddress);
      onChange(genericAddress);
      onCoordinatesChange({ lat: coords.lat, lon: coords.lng });
    }
  };

  const isValidCoordinates = coordinates.lat && coordinates.lon;

  return (
    <div className={`relative ${className}`}>
      {/* Address Input */}
      <div className="mb-3">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 3 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{ top: '50px' }}
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full mr-2"></div>
              Mencari alamat...
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.display_name}
                    </div>
                    {suggestion.address && (
                      <div className="text-xs text-gray-500 mt-1">
                        {[
                          suggestion.address.road,
                          suggestion.address.city,
                          suggestion.address.state
                        ].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Map - Always Visible */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Klik pada peta untuk memilih lokasi</span>
          {isLoading && (
            <div className="flex items-center gap-1 text-orange-600">
              <Loader size={14} className="animate-spin" />
              <span className="text-xs">Mencari alamat...</span>
            </div>
          )}
        </div>
        <LeafletMap
          key={isValidCoordinates ? `${coordinates.lat}-${coordinates.lon}` : 'default'}
          center={isValidCoordinates ? [coordinates.lat, coordinates.lon] : [-6.208763, 106.845599]}
          zoom={isValidCoordinates ? 17 : 13}
          markers={isValidCoordinates ? [{
            lat: coordinates.lat,
            lng: coordinates.lon,
            popup: `<div><strong>Lokasi Terpilih</strong><br/>${inputValue || 'Koordinat: ' + coordinates.lat.toFixed(6) + ', ' + coordinates.lon.toFixed(6)}</div>`
          }] : []}
          onMapClick={handleMapClick}
          height="300px"
          className="w-full"
        />
      </div>

      {/* Status messages */}
      {!isValidCoordinates && inputValue && (
        <div className="mt-2 text-xs text-orange-600">
          Pilih alamat dari dropdown atau klik pada peta untuk mendapatkan koordinat
        </div>
      )}
    </div>
  );
}
