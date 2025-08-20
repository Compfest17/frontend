'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';

export default function ProvinceAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Cari provinsi...",
  required = false,
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const fallbackProvinces = [
    'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 
    'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung',
    'Kepulauan Riau', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 
    'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 'Nusa Tenggara Barat',
    'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah',
    'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
    'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 
    'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat', 'Maluku',
    'Maluku Utara', 'Papua Barat', 'Papua'
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchProvinces(searchTerm);
    } else if (searchTerm.length === 0) {
      setSuggestions(fallbackProvinces.map(name => ({ name })));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const searchProvinces = async (query) => {
    try {
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/employee/search-provinces?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSuggestions(result.data);
      } else {
        const filtered = fallbackProvinces
          .filter(name => name.toLowerCase().includes(query.toLowerCase()))
          .map(name => ({ name }));
        setSuggestions(filtered);
      }
    } catch (error) {
      console.error('Failed to search provinces:', error);
      const filtered = fallbackProvinces
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .map(name => ({ name }));
      setSuggestions(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    if (!suggestions.find(s => s.name === newValue)) {
      onChange('');
    }
  };

  const handleSelect = (province) => {
    setSearchTerm(province.name);
    onChange(province.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (suggestions.length === 0) {
      setSuggestions(fallbackProvinces.map(name => ({ name })));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DD761C] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-[#DD761C] rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Tidak ada provinsi ditemukan
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((province, index) => (
                  <button
                    key={`${province.name}-${index}`}
                    onClick={() => handleSelect(province)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-800">{province.name}</div>
                      {province.display_name && (
                        <div className="text-xs text-gray-500">{province.display_name}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
