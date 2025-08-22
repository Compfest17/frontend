'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, AtSign } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUser } from '../../lib/supabase-auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function MentionAutocomplete({ 
  forumId, 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Tulis komentar...",
  className = ""
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentMention, setCurrentMention] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState('above'); 
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const { user } = await getCurrentUser();
      if (!user?.access_token) {
        console.error('No access token found');
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      console.log('🔍 Fetching mention suggestions for query:', query);
      
      const response = await fetch(
        `${API_BASE_URL}/api/forums/${forumId}/mention-suggestions?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Mention suggestions response:', data);
        setSuggestions(data.data || []);
        setShowSuggestions(data.data && data.data.length > 0);
        setSelectedIndex(0);
      } else {
        console.error('❌ Mention suggestions failed:', response.status, response.statusText);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching mention suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, [forumId]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    
    const beforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@([a-zA-Z0-9_\u00C0-\u017F\s]*)$/);
    
    console.log('🔍 Input change - beforeCursor:', beforeCursor, 'mentionMatch:', mentionMatch);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      console.log('📝 Mention detected, query:', query);
      setCurrentMention(query);
      
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          const spaceAbove = rect.top;
          const spaceBelow = window.innerHeight - rect.bottom;
          
          console.log('📏 Space check - Above:', spaceAbove, 'Below:', spaceBelow);
          
          if (spaceBelow > spaceAbove && spaceBelow > 200) {
            setDropdownPosition('below');
            console.log('⬇️ Setting dropdown position: below');
          } else {
            setDropdownPosition('above');
            console.log('⬆️ Setting dropdown position: above');
          }
        }
      
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        console.log('⏰ Debounced fetch suggestions for:', query);
        fetchSuggestions(query);
      }, 300);
    } else {
      setShowSuggestions(false);
      setCurrentMention('');
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const beforeMention = value.substring(0, cursorPosition - currentMention.length - 1);
    const afterMention = value.substring(cursorPosition);
    const newValue = beforeMention + '@' + (suggestion.username || suggestion.full_name) + ' ' + afterMention;
    
    onChange(newValue);
    setShowSuggestions(false);
    setCurrentMention('');
    
    if (inputRef.current) {
      inputRef.current.focus();
      const newCursorPos = beforeMention.length + (suggestion.username || suggestion.full_name).length + 2;
      inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
    
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setCurrentMention('');
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setCurrentMention('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
                 <textarea
           ref={inputRef}
           value={value}
           onChange={handleInputChange}
           onKeyDown={handleKeyDown}
           placeholder={placeholder}
           className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
           rows={3}
         />
        <div className="absolute top-3 right-3 text-gray-400">
          <AtSign size={16} />
        </div>
      </div>

             {/* Mention Suggestions Dropdown */}
       {showSuggestions && (
         <div
           ref={suggestionsRef}
           className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
             dropdownPosition === 'above' 
               ? 'bottom-full mb-1' 
               : 'top-full mt-1'
           }`}
         >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Mencari...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Mention suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-orange-50 flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-gray-50 border-l-2 border-orange-500' : ''
                  }`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="flex-shrink-0">
                    {suggestion.avatar_url ? (
                      <Image
                        src={suggestion.avatar_url}
                        alt={suggestion.display_name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.username ? `@${suggestion.username}` : suggestion.full_name}
                    </div>
                    {suggestion.username && suggestion.full_name && (
                      <div className="text-xs text-gray-500">
                        {suggestion.full_name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Search size={16} className="mx-auto mb-2" />
              <p>Tidak ada user yang ditemukan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
