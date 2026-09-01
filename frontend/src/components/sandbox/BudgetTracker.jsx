import React from 'react';
import { Coins, AlertOctagon, CheckCircle2, RotateCcw } from 'lucide-react';

export function BudgetTracker({
  budgetLakh,
  setBudgetLakh,
  totalAllocated,
  remainingBudget,
  isOverBudget,
  onClearPlan,
}) {
  const pct = budgetLakh > 0 ? Math.min(100, (totalAllocated / budgetLakh) * 100) : 0;
  const budgetPresets = [30, 45, 50, 65, 80];

  return (
    <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-4 shadow-command">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Budget Allocation Engine
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Hard financial constraint enforcement
            </p>
          </div>
        </div>

        <button
          onClick={onClearPlan}
          className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center space-x-1 transition-colors"
          title="Deselect all interventions"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Plan</span>
        </button>
      </div>

      {/* Budget Numbers Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Total Budget</div>
          <div className="text-base font-extrabold font-mono text-white mt-0.5">
            ₹{budgetLakh}L
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Allocated</div>
          <div
            className={`text-base font-extrabold font-mono mt-0.5 ${
              isOverBudget ? 'text-rose-400' : 'text-cyan-400'
            }`}
          >
            ₹{totalAllocated}L
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Remaining</div>
          <div
            className={`text-base font-extrabold font-mono mt-0.5 ${
              remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            ₹{remainingBudget}L
          </div>
        </div>
      </div>

      {/* Visual Budget Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Utilization: {pct.toFixed(0)}%</span>
          <span>{isOverBudget ? 'OVERBUDGET' : `${remainingBudget}L available`}</span>
        </div>

        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget
                ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      {/* Overbudget Warning Alert */}
      {isOverBudget && (
        <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-shake">
          <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Budget Exceeded by ₹{Math.abs(remainingBudget)} Lakhs</div>
            <p className="text-[11px] text-rose-300/80 mt-0.5">
              The GramVerse simulation engine rejects over-budget plans. Remove one or more interventions to proceed.
            </p>
          </div>
        </div>
      )}

      {/* Budget Adjuster Controls */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Set Scenario Budget Ceiling:</span>
          <span className="font-mono text-white font-bold">₹{budgetLakh} Lakhs</span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={budgetLakh}
          onChange={(e) => setBudgetLakh(Number(e.target.value))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        {/* Quick Presets */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {budgetPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => setBudgetLakh(preset)}
              className={`flex-1 py-1 rounded-md text-[10px] font-mono font-semibold transition-colors border ${
                budgetLakh === preset
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#131d2e] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              ₹{preset}L
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
