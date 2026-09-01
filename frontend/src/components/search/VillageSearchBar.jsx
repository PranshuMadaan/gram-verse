import React, { useState, useEffect, useRef } from 'react';
import { useVillage } from '../../context/VillageContext';
import { geocodingService } from '../../services/geocodingService';
import { SearchResultItem } from './SearchResultItem';
import { Search, Loader2, X, MapPin, Sparkles } from 'lucide-react';

export function VillageSearchBar({ onSelectLocation = null, placeholder = 'Search Indian village, district, or PIN (e.g. Rampur, Kalyan, Ralegan)...' }) {
  const { selectVillage, activeVillage } = useVillage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const hits = await geocodingService.searchIndianVillages(query);
        setResults(hits);
        setIsOpen(true);
      } catch (err) {
        console.error('Village search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery('');
    setIsOpen(false);
    selectVillage(item);
    if (onSelectLocation) {
      onSelectLocation(item);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-[#0e1624]/90 backdrop-blur-md border border-slate-800 focus:border-cyan-500/80 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shadow-command transition-all font-sans"
        />

        {isLoading ? (
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-3.5" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="text-slate-400 hover:text-white absolute right-3.5"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Disambiguation Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#0a0f19] border border-cyan-500/30 rounded-2xl p-2.5 shadow-2xl space-y-1.5 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono text-slate-400 border-b border-slate-800 pb-1.5">
            <span>Matching Indian Locations ({results.length})</span>
            <span className="text-cyan-400">OpenStreetMap Nominatim</span>
          </div>

          <div className="space-y-1 pt-1">
            {results.map((res) => (
              <SearchResultItem
                key={res.id}
                result={res}
                isSelected={activeVillage?.id === res.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-[#0a0f19] border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400 shadow-2xl">
          <MapPin className="w-6 h-6 text-slate-500 mx-auto mb-1.5" />
          <span>No matching Indian villages found for "{query}". Try searching by District or PIN.</span>
        </div>
      )}
    </div>
  );
}
