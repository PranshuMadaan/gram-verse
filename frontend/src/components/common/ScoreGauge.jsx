import React from 'react';
import { ShieldCheck, TrendingUp, HelpCircle } from 'lucide-react';

export function ScoreGauge({
  score,
  baselineScore = null,
  delta = null,
  size = 140,
  strokeWidth = 10,
  label = 'Composite Score',
}) {
  const currentScore = typeof score === 'number' ? score : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (currentScore / 100) * circumference;

  const getScoreColor = (val) => {
    if (val >= 75) return '#10b981'; // emerald
    if (val >= 50) return '#00e5ff'; // cyan
    if (val >= 30) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  const currentColor = getScoreColor(currentScore);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#0e1624]/90 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-command relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e2d42"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={currentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {score !== null && score !== undefined ? score : '–'}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-center space-x-1">
          <span>{label}</span>
          <span title="Formula: 40% School Access + 30% Water Access + 30% Drainage Coverage">
            <HelpCircle className="w-3 h-3 text-slate-500 hover:text-cyan-400 cursor-help" />
          </span>
        </div>

        {delta !== null && delta !== undefined && (
          <div className="mt-1 flex items-center justify-center space-x-1 text-xs font-mono font-medium">
            <span
              className={`flex items-center space-x-0.5 px-2 py-0.5 rounded-full ${
                delta > 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : delta < 0
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>
                {delta > 0 ? `+${delta}` : delta} pts vs baseline
              </span>
            </span>
          </div>
        )}

        {baselineScore !== null && delta === null && (
          <div className="mt-0.5 text-[11px] text-slate-500 font-mono">
            Baseline: {baselineScore} pts
          </div>
        )}
      </div>
    </div>
  );
}
