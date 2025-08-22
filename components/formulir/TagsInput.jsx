'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Hash } from 'lucide-react';

import TagsAPI from '@/services/tagsAPI';

export default function TagsInput({ 
  value = [], 
  onChange, 
  placeholder = "Ketik tag (misal: jalanrusak, berlubang)",
  maxTags = 10,
  className = ""
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim().length >= 2) {
        searchTags(inputValue.trim());
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

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

  const searchTags = async (query) => {
    try {
      setIsLoading(true);
      const response = await TagsAPI.searchTags(query, 5);
      
      if (response.success) {
        setSuggestions(response.data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching tags:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = (tagName) => {
    const normalizedTag = tagName.trim().toLowerCase();
    
    if (!normalizedTag) return;
    if (value.includes(normalizedTag)) return;
    if (value.length >= maxTags) return;

    const newTags = [...value, normalizedTag];
    onChange(newTags);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (indexToRemove) => {
    const newTags = value.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    if (newValue.includes(',')) {
      const parts = newValue.split(',');
      const newTags = parts.slice(0, -1).map(tag => tag.trim().toLowerCase()).filter(tag => tag && !value.includes(tag));
      
      if (newTags.length > 0) {
        const updatedTags = [...value, ...newTags].slice(0, maxTags);
        onChange(updatedTags);
      }
      
      const lastPart = parts[parts.length - 1];
      setInputValue(lastPart);
    } else {
      setInputValue(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (inputValue.trim()) {
        const tags = inputValue.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag && !value.includes(tag));
        
        if (tags.length > 0) {
          const updatedTags = [...value, ...tags].slice(0, maxTags);
          onChange(updatedTags);
          setInputValue('');
          setShowSuggestions(false);
        }
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion.name);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Tags Display + Input */}
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 min-h-[44px]">
        {/* Selected Tags */}
        {value.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-orange-100 text-orange-800 rounded-full"
          >
            <Hash size={12} />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-orange-600 hover:text-orange-800 focus:outline-none"
            >
              <X size={12} />
            </button>
          </span>
        ))}

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          disabled={value.length >= maxTags}
        />
      </div>

      {/* Tag Counter */}
      <div className="mt-1 text-xs text-gray-500">
        {value.length}/{maxTags} tags
        {value.length >= maxTags && (
          <span className="ml-2 text-orange-600">Maksimal {maxTags} tags</span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full mr-2"></div>
              Mencari tags...
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  disabled={value.includes(suggestion.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-gray-400" />
                      <span className="text-sm font-medium">{suggestion.name}</span>
                    </div>
                    {suggestion.usage_count > 0 && (
                      <span className="text-xs text-gray-500">
                        {suggestion.usage_count} kali digunakan
                      </span>
                    )}
                  </div>
                </button>
              ))}
              
              {/* Option to add new tag */}
              {inputValue.trim() && !suggestions.some(s => s.name === inputValue.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => addTag(inputValue)}
                  className="w-full px-3 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none border-t border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-orange-500" />
                    <span className="text-sm">
                      Tambah tag baru: <strong>"{inputValue.trim().toLowerCase()}"</strong>
                    </span>
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
