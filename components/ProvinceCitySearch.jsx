'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Loader2 } from 'lucide-react';

export default function ProvinceCitySearch({ onProvinceSelect, onCitySelect, selectedProvince, selectedCity, hideCity = false }) {
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [provinceResults, setProvinceResults] = useState([]);
  const [cityResults, setCityResults] = useState([]);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const searchProvinces = async (query) => {
    if (!query.trim() || query.length < 2) {
      setProvinceResults([]);
      return;
    }

    try {
      setLoadingProvinces(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const { getCurrentUser } = await import('@/lib/supabase-auth');
      const { user: currentUser } = await getCurrentUser();
      const token = currentUser?.access_token;
      
      const response = await fetch(
        `${API_BASE_URL}/api/geocoding/provinces?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setProvinceResults(result.data || []);
      } else {
        console.error('Province search failed:', result.message);
        setProvinceResults([]);
      }
    } catch (error) {
      console.error('Province search error:', error);
      setProvinceResults([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const searchCities = async (query, province) => {
    if (!query.trim() || query.length < 2 || !province) {
      setCityResults([]);
      return;
    }

    try {
      setLoadingCities(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const { getCurrentUser } = await import('@/lib/supabase-auth');
      const { user: currentUser } = await getCurrentUser();
      const token = currentUser?.access_token;
      
      const response = await fetch(
        `${API_BASE_URL}/api/geocoding/cities?query=${encodeURIComponent(query)}&province=${encodeURIComponent(province)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setCityResults(result.data || []);
      } else {
        console.error('City search failed:', result.message);
        setCityResults([]);
      }
    } catch (error) {
      console.error('City search error:', error);
      setCityResults([]);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (provinceSearch) {
        searchProvinces(provinceSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [provinceSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (citySearch && selectedProvince) {
        searchCities(citySearch, selectedProvince);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [citySearch, selectedProvince]);

  const handleProvinceSelect = (provinceName) => {
    onProvinceSelect(provinceName);
    setProvinceSearch(provinceName);
    setShowProvinceDropdown(false);
    if (!hideCity && onCitySelect) {
      onCitySelect('');
      setCitySearch('');
      setCityResults([]);
    }
  };

  const handleCitySelect = (cityName) => {
    onCitySelect(cityName);
    setCitySearch(cityName);
    setShowCityDropdown(false);
  };

  useEffect(() => {
    if (selectedProvince) {
      setProvinceSearch(selectedProvince);
    }
    if (selectedCity) {
      setCitySearch(selectedCity);
    }
  }, [selectedProvince, selectedCity]);

  return (
    <div className="space-y-4">
      {/* Province Search */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2 text-[#DD761C]" />
          Provinsi
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari provinsi..."
            value={provinceSearch}
            onChange={(e) => {
              setProvinceSearch(e.target.value);
              setShowProvinceDropdown(true);
            }}
            onFocus={() => setShowProvinceDropdown(true)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD761C] focus:border-transparent"
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {showProvinceDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {loadingProvinces ? (
              <div className="px-4 py-3 flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Mencari provinsi...
              </div>
            ) : provinceResults.length > 0 ? (
              provinceResults.map((province, index) => (
                <button
                  key={index}
                  onClick={() => handleProvinceSelect(province.name)}
                  className="w-full text-left px-4 py-2 hover:bg-orange-50 hover:text-[#DD761C] border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{province.name}</div>
                  <div className="text-xs text-gray-500">{province.display_name}</div>
                </button>
              ))
            ) : provinceSearch.length >= 2 ? (
              <div className="px-4 py-2 text-gray-500 text-sm">Provinsi tidak ditemukan</div>
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">Ketik minimal 2 karakter untuk mencari</div>
            )}
          </div>
        )}
      </div>

      {!hideCity && selectedProvince && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2 text-[#DD761C]" />
            Kota/Kabupaten
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kota/kabupaten..."
              value={citySearch}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCityDropdown(true);
              }}
              onFocus={() => setShowCityDropdown(true)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD761C] focus:border-transparent"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {showCityDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {loadingCities ? (
                <div className="px-4 py-3 flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mencari kota...
                </div>
              ) : cityResults.length > 0 ? (
                cityResults.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleCitySelect(city.name)}
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 hover:text-[#DD761C] border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{city.name}</div>
                    <div className="text-xs text-gray-500">{city.display_name}</div>
                  </button>
                ))
              ) : citySearch.length >= 2 ? (
                <div className="px-4 py-2 text-gray-500 text-sm">Kota tidak ditemukan</div>
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">Ketik minimal 2 karakter untuk mencari</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Info */}
      {selectedProvince && selectedCity && (
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#DD761C]" />
            <div>
              <p className="font-medium text-orange-800">Lokasi Terpilih:</p>
              <p className="text-sm text-orange-700">{selectedProvince}, {selectedCity}</p>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showProvinceDropdown || showCityDropdown) && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => {
            setShowProvinceDropdown(false);
            setShowCityDropdown(false);
          }}
        />
      )}
    </div>
  );
}
