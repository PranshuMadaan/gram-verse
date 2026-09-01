import React from 'react';

export function MapLegend({ activeInterventions = [] }) {
  return (
    <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-xs shadow-lg space-y-2">
      <div className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
        <span>Map Legend</span>
        <span className="text-[10px] text-cyan-400 font-mono">Patiala Sector</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-300 text-[11px]">
        {/* Roads */}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-emerald-400 rounded-full" />
          <span>Road (Good Condition)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-amber-400 rounded-full" />
          <span>Road (Poor Condition)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 border-t-2 border-dashed border-cyan-400" />
          <span>Proposed Road (E6)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-cyan-400 rounded-full" />
          <span>Upgraded / Active</span>
        </div>

        {/* Infrastructure & Buildings */}
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-white" />
          <span>School (Facility)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-cyan-300" />
          <span>Water Point (150m buffer)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
          <span>Household (School OK)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-slate-900" />
          <span>Household (Needs Access)</span>
        </div>
      </div>
    </div>
  );
}
