import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricCard({
  label,
  value,
  unit = '%',
  icon: Icon,
  baselineValue = null,
  delta = null,
  weight = null,
  description = null,
  color = 'cyan', // cyan, emerald, amber, rose
}) {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      bar: 'bg-cyan-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(0,229,255,0.15)]',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      bar: 'bg-emerald-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      bar: 'bg-amber-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      bar: 'bg-purple-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)]',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  return (
    <div
      className={`bg-[#0e1624]/90 backdrop-blur-md rounded-xl p-4 border transition-all duration-200 ${scheme.border} ${scheme.glow}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          {Icon && (
            <div className={`p-2 rounded-lg ${scheme.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {label}
            </div>
            {weight && (
              <div className="text-[10px] text-cyan-400/80 font-mono">
                Weight: {(weight * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </div>

        {/* Delta badge if available */}
        {delta !== null && delta !== undefined && (
          <div
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
              delta > 0
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : delta < 0
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : delta < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {delta > 0 ? `+${delta}` : delta}
              {unit}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono tracking-tight text-white">
          {value !== null && value !== undefined ? value : '–'}
          <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
        </div>

        {baselineValue !== null && baselineValue !== undefined && (
          <div className="text-xs text-slate-500 font-mono">
            Base: {baselineValue}
            {unit}
          </div>
        )}
      </div>

      {/* Progress meter bar */}
      {unit === '%' && (
        <div className="mt-3 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, numValue))}%` }}
          />
        </div>
      )}

      {description && (
        <p className="mt-2.5 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
          {description}
        </p>
      )}
    </div>
  );
}
