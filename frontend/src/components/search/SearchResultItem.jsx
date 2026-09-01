import React from 'react';
import { MapPin, ShieldCheck, Satellite, AlertCircle, ChevronRight } from 'lucide-react';
import { DataSourceBadge } from '../village/DataSourceBadge';

export function SearchResultItem({ result, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(result)}
      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
        isSelected
          ? 'bg-[#131d2e] border-cyan-500/50 shadow-glow ring-1 ring-cyan-400/40'
          : 'bg-[#0e1624] border-slate-800 hover:border-slate-700 hover:bg-[#111c2a]'
      }`}
    >
      <div className="flex items-center space-x-3 min-w-0">
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-xs truncate">{result.name}</span>
            {result.isPilot && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE PILOT
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {result.district}, {result.state} {result.pincode && `· PIN ${result.pincode}`}
          </p>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">
            {result.lat.toFixed(4)}°N, {result.lon.toFixed(4)}°E · {result.source}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <DataSourceBadge tier={result.dataTier} size="xs" />
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </div>
    </div>
  );
}
