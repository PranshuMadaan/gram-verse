import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { ScoreGauge } from '../common/ScoreGauge';
import { MetricCard } from '../common/MetricCard';
import {
  X,
  Hammer,
  Play,
  Sparkles,
  GitCompare,
  Activity,
  Sliders,
  Coins,
  Trash2,
  CheckCircle,
  GraduationCap,
  Droplets,
  Waves,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function PlanningDrawer({ isOpen, onClose }) {
  const {
    activeVillage,
    catalog,
    selectedInterventions,
    toggleIntervention,
    clearPlan,
    activePlanName,
    setActivePlanName,
    budgetLakh,
    setBudgetLakh,
    planningObjective,
    setPlanningObjective,
    totalAllocated,
    remainingBudget,
    isOverBudget,
    latestSimulation,
    scenarios,
    optimizerResult,
    runSimulation,
    runOptimizer,
    isSimulating,
    isOptimizing,
    baselineMetrics,
  } = useVillage();

  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'simulation' | 'compare' | 'optimizer'

  if (!isOpen) return null;

  const handleSimulate = async () => {
    await runSimulation();
    setActiveTab('simulation');
  };

  const handleOptimize = async () => {
    await runOptimizer();
    setActiveTab('optimizer');
  };

  const simResult = latestSimulation?.result;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[600px] bg-[#0a0f19]/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0d1422]/90 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow">
            <Hammer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span>Panchayat Planning Mode</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                SIH1704
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {activeVillage.name} ({activeVillage.district})
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Planning Navigation Tabs */}
      <div className="p-2 border-b border-slate-800/80 bg-[#0c121e]/80 flex items-center space-x-1 text-xs">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'builder'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Plan & Budget</span>
        </button>

        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'simulation'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Simulation {simResult ? '✓' : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'compare'
              ? 'bg-indigo-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare ({scenarios.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('optimizer')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'optimizer'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Opt</span>
        </button>
      </div>

      {/* Drawer Body Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Plan Builder & Budget Engine */}
        {activeTab === 'builder' && (
          <div className="space-y-4">
            {/* Scenario Name & Objective */}
            <div className="p-3.5 rounded-2xl bg-[#0e1624] border border-slate-800 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Scenario Title
                </label>
                <input
                  type="text"
                  value={activePlanName}
                  onChange={(e) => setActivePlanName(e.target.value)}
                  className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  placeholder="e.g. FY 2026-27 Rural Connectivity Sprint"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Planning Objective Focus
                </label>
                <select
                  value={planningObjective}
                  onChange={(e) => setPlanningObjective(e.target.value)}
                  className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="holistic">Balanced Holistic Development</option>
                  <option value="school">Primary School Access & Mobility</option>
                  <option value="water">Potable Drinking Water Equity</option>
                  <option value="drainage">Monsoon Flood Defense & Drainage</option>
                </select>
              </div>
            </div>

            {/* Budget Engine */}
            <div className="p-4 rounded-2xl bg-[#0e1624] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-white">Total Budget Ceiling</span>
                </div>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  ₹{budgetLakh} Lakh
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={budgetLakh}
                onChange={(e) => setBudgetLakh(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono text-xs">
                <div className="p-2 rounded-xl bg-[#131d2e]">
                  <div className="text-[10px] text-slate-400">Allocated</div>
                  <div className={`font-bold mt-0.5 ${isOverBudget ? 'text-rose-400' : 'text-cyan-400'}`}>
                    ₹{totalAllocated}L
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#131d2e]">
                  <div className="text-[10px] text-slate-400">Remaining</div>
                  <div className={`font-bold mt-0.5 ${remainingBudget < 0 ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}`}>
                    ₹{remainingBudget}L
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#131d2e]">
                  <div className="text-[10px] text-slate-400">Utilization</div>
                  <div className="font-bold text-white mt-0.5">
                    {Math.round((totalAllocated / budgetLakh) * 100)}%
                  </div>
                </div>
              </div>

              {isOverBudget && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                  Plan exceeds budget ceiling by {Math.abs(remainingBudget)}L. Remove items to simulate.
                </div>
              )}
            </div>

            {/* Selected Interventions Queue */}
            <div className="p-3.5 rounded-2xl bg-[#0e1624] border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">
                  Included Interventions ({selectedInterventions.length})
                </span>
                {selectedInterventions.length > 0 && (
                  <button
                    onClick={clearPlan}
                    className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {selectedInterventions.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  Select interventions from catalog or community issues.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedInterventions.map((item) => (
                    <div
                      key={`${item.type}:${item.target}`}
                      className="p-2 rounded-xl bg-[#131d2e] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-white truncate text-[11px]">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-cyan-400 font-mono font-bold">
                          ₹{item.cost_lakh}L
                        </div>
                      </div>
                      <button
                        onClick={() => toggleIntervention(item)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Run Simulation CTA */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating || isOverBudget || selectedInterventions.length === 0}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-glow flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isSimulating ? 'Simulating Routing Graph...' : 'RUN SIMULATION'}</span>
              </button>
            </div>

            {/* Quick Catalog Picker */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Catalog Interventions
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {catalog.map((c) => {
                  const isSelected = selectedInterventions.some(
                    (s) => s.type === c.type && s.target === c.target
                  );
                  return (
                    <button
                      key={`${c.type}:${c.target}`}
                      onClick={() => toggleIntervention(c)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold'
                          : 'bg-[#131d2e] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate font-semibold">{c.label}</div>
                        <div className="text-[10px] text-slate-400">{c.description}</div>
                      </div>
                      <span className="font-mono text-cyan-400 font-bold text-[11px] flex-shrink-0">
                        ₹{c.cost_lakh}L
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Simulation Impact */}
        {activeTab === 'simulation' && (
          <div className="space-y-4">
            {simResult ? (
              <>
                <div className="p-4 rounded-2xl bg-[#0e1624] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Simulation: {latestSimulation.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      SUCCESS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <ScoreGauge
                      score={simResult.metrics.composite_score}
                      label="Post-Plan Score"
                      delta={simResult.deltas.composite_score}
                      size={110}
                    />

                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2 rounded-xl bg-[#131d2e]">
                        <span className="text-slate-400">Budget Spent: </span>
                        <span className="font-bold text-white">₹{simResult.total_cost_lakh}L</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#131d2e]">
                        <span className="text-slate-400">Unspent: </span>
                        <span className="font-bold text-emerald-400">₹{simResult.unspent_lakh}L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Indicators */}
                <div className="grid grid-cols-2 gap-2.5">
                  <MetricCard
                    label="School Access"
                    value={simResult.metrics.school_accessibility_pct}
                    unit="%"
                    delta={simResult.deltas.school_accessibility_pct}
                    icon={GraduationCap}
                    color="cyan"
                  />
                  <MetricCard
                    label="Water Access"
                    value={simResult.metrics.water_access_pct}
                    unit="%"
                    delta={simResult.deltas.water_access_pct}
                    icon={Droplets}
                    color="emerald"
                  />
                  <MetricCard
                    label="Drainage"
                    value={simResult.metrics.drainage_coverage_pct}
                    unit="%"
                    delta={simResult.deltas.drainage_coverage_pct}
                    icon={Waves}
                    color="amber"
                  />
                  <MetricCard
                    label="School Walk Time"
                    value={simResult.metrics.avg_time_to_school_min}
                    unit="m"
                    delta={simResult.deltas.avg_time_to_school_min}
                    icon={Clock}
                    inverseDelta={true}
                    color="purple"
                  />
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Activity className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">No Simulation Executed Yet</p>
                <p className="text-xs text-slate-500">
                  Select interventions and click "RUN SIMULATION" to evaluate the plan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Compare Scenarios */}
        {activeTab === 'compare' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-white">Saved Scenarios ({scenarios.length})</span>
            {scenarios.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No saved scenarios yet. Run simulations to generate comparison scenarios.
              </div>
            ) : (
              scenarios.map((sc) => (
                <div key={sc.id} className="p-3 rounded-xl bg-[#0e1624] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>{sc.name}</span>
                    <span className="font-mono text-cyan-400">Score: {sc.result?.metrics?.composite_score ?? '–'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Cost: ₹{sc.result?.total_cost_lakh ?? sc.budget_lakh}L</span>
                    <span>Interventions: {sc.interventions?.length || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: AI Optimizer */}
        {activeTab === 'optimizer' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#0e1624] border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">AI Greedy Knapsack Optimization</span>
                <span className="font-mono text-xs text-cyan-400">Budget: ₹{budgetLakh}L</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ranks all catalog interventions by marginal composite score gain per Lakh (ΔScore/Lakh) and selects the mathematically optimal subset.
              </p>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-glow transition-all flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isOptimizing ? 'Optimizing...' : `Recommend Optimal Allocation for ₹${budgetLakh}L`}</span>
              </button>
            </div>

            {optimizerResult && (
              <div className="p-3.5 rounded-2xl bg-[#0e1624] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>AI Recommended Plan</span>
                  <span className="font-mono">
                    ₹{optimizerResult.total_cost_lakh}L / ₹{optimizerResult.budget_lakh}L
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  {optimizerResult.chosen_interventions.map((iv, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#131d2e] flex justify-between font-mono">
                      <span>{iv.type}: {iv.target}</span>
                      <span className="text-cyan-400 font-bold">₹{iv.cost_lakh}L</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-300 italic">{optimizerResult.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
