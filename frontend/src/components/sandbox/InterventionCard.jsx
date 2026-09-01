import React from 'react';
import { Route, PlusCircle, Droplets, Waves, Check, Plus } from 'lucide-react';

export function InterventionCard({
  item,
  isSelected,
  onToggle,
  disabled = false,
}) {
  const typeConfig = {
    road_upgrade: {
      label: 'Road Upgrade',
      icon: Route,
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      activeBorder: 'border-emerald-400 bg-emerald-950/30',
      tag: 'Connectivity',
    },
    road_new: {
      label: 'New Road Corridor',
      icon: PlusCircle,
      color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      activeBorder: 'border-cyan-400 bg-cyan-950/30',
      tag: 'Strategic Access',
    },
    drainage: {
      label: 'Drainage Network',
      icon: Waves,
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      activeBorder: 'border-amber-400 bg-amber-950/30',
      tag: 'Flood Resilience',
    },
    water_point: {
      label: 'Water Infrastructure',
      icon: Droplets,
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      activeBorder: 'border-blue-400 bg-blue-950/30',
      tag: 'Clean Water',
    },
  };

  const config = typeConfig[item.type] || typeConfig.road_upgrade;
  const Icon = config.icon;

  return (
    <div
      onClick={() => !disabled && onToggle(item)}
      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative select-none ${
        isSelected
          ? `${config.activeBorder} shadow-command ring-1 ring-cyan-400/50`
          : 'border-slate-800 bg-[#0e1624]/90 hover:border-slate-700 hover:bg-[#131d2e]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left icon and details */}
        <div className="flex items-start space-x-3 min-w-0">
          <div className={`p-2 rounded-lg ${config.color} flex-shrink-0 mt-0.5`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {config.tag}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Target: {item.target}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">
              {item.label}
            </h4>
          </div>
        </div>

        {/* Right cost & checkbox */}
        <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
          <span className="text-xs font-extrabold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            ₹{item.cost_lakh}L
          </span>

          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
              isSelected
                ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold'
                : 'border-slate-700 bg-slate-800/80 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      </div>
    </div>
  );
}
