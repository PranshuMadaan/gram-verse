import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export function BuildingImpactTable({ baselineBuildings = [], simulatedBuildings = [] }) {
  const baseMap = {};
  baselineBuildings.forEach((b) => {
    baseMap[b.id] = b;
  });

  return (
    <div className="bg-[#0e1624] rounded-xl border border-slate-800 overflow-hidden shadow-command">
      <div className="p-3.5 bg-[#131d2e] border-b border-slate-800 flex items-center justify-between">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Per-Household Micro Impact Audit
        </h4>
        <span className="text-[11px] text-cyan-400 font-mono">
          10 Cadastral Units Monitored
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="bg-[#0a0f19] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="p-3">House ID</th>
              <th className="p-3">Zone</th>
              <th className="p-3">School Travel Time (Before → After)</th>
              <th className="p-3">School Access</th>
              <th className="p-3">Water Access</th>
              <th className="p-3">Drainage Status</th>
              <th className="p-3">Impact Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {simulatedBuildings.map((simB) => {
              const baseB = baseMap[simB.id] || {};
              const timeImproved =
                baseB.time_to_school_min !== null &&
                simB.time_to_school_min !== null &&
                simB.time_to_school_min < baseB.time_to_school_min;

              const schoolUnlocked = !baseB.school_accessible && simB.school_accessible;
              const waterUnlocked = !baseB.water_accessible && simB.water_accessible;
              const drainageUnlocked = !baseB.drainage_improved && simB.drainage_improved;
              const isAnyUnlocked = schoolUnlocked || waterUnlocked || drainageUnlocked;

              return (
                <tr
                  key={simB.id}
                  className={`hover:bg-[#131e2e]/50 transition-colors ${
                    isAnyUnlocked ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <td className="p-3 font-bold text-cyan-400">{simB.id}</td>
                  <td className="p-3 text-slate-300 font-sans text-[11px]">{simB.zone}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">{baseB.time_to_school_min ?? '–'}m</span>
                      <span className="text-slate-600">→</span>
                      <span
                        className={`font-bold ${
                          timeImproved ? 'text-emerald-400' : 'text-white'
                        }`}
                      >
                        {simB.time_to_school_min ?? '–'}m
                      </span>
                      {timeImproved && (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                          -{(baseB.time_to_school_min - simB.time_to_school_min).toFixed(1)}m
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={simB.school_accessible} />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={simB.water_accessible} />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={simB.drainage_improved ? 'improved' : 'poor'} />
                  </td>
                  <td className="p-3 font-sans">
                    {schoolUnlocked && (
                      <span className="text-emerald-400 font-bold text-[11px] block">
                        ✦ Gained School Access!
                      </span>
                    )}
                    {waterUnlocked && (
                      <span className="text-blue-400 font-bold text-[11px] block">
                        ✦ Gained Clean Water!
                      </span>
                    )}
                    {drainageUnlocked && (
                      <span className="text-amber-400 font-bold text-[11px] block">
                        ✦ Drainage Improved!
                      </span>
                    )}
                    {!isAnyUnlocked && (
                      <span className="text-slate-500 text-[11px]">Unchanged</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
