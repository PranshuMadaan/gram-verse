import React, { useState, useEffect } from 'react';
import { useVillage } from '../../context/VillageContext';
import { ScoreGauge } from '../common/ScoreGauge';
import { MetricCard } from '../common/MetricCard';
import { MissionPresets } from '../missions/MissionPresets';
import { TaskPlanner } from '../tasks/TaskPlanner';
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
  Target,
  Trophy,
  ListTodo,
  Plus,
  Check,
  Filter,
  Lightbulb,
  Info,
  AlertTriangle,
} from 'lucide-react';

export function PlanningDrawer({ isOpen, onClose }) {
  const {
    activeVillage,
    catalog,
    selectedInterventions,
    setSelectedInterventions,
    toggleIntervention,
    clearPlan,
    activePlanName,
    setActivePlanName,
    budgetLakh,
    setBudgetLakh,
    planningObjective,
    setPlanningObjective,
    reportedProblems,
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
    activeMission,
    requestedPlanningTab,
    setRequestedPlanningTab,
  } = useVillage();

  const [activeTab, setActiveTab] = useState('missions'); // 'missions' | 'builder' | 'simulation' | 'compare' | 'optimizer'

  // A mission (or anything else) can request a tab jump via context —
  // consume it once, then clear so it doesn't fire again on re-render.
  useEffect(() => {
    if (requestedPlanningTab) {
      setActiveTab(requestedPlanningTab);
      setRequestedPlanningTab(null);
    }
  }, [requestedPlanningTab, setRequestedPlanningTab]);

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
  const simMetrics = simResult?.metrics || {};
  const simDeltas = simResult?.deltas || simResult?.delta || {};
  const simTotalCost = simResult?.total_cost_lakh ?? simResult?.budget?.total_cost_lakh ?? 0;
  const simUnspent = simResult?.unspent_lakh ?? simResult?.budget?.unspent_lakh ?? 0;

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
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'requests'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Requests ({reportedProblems?.filter((p) => p.status === 'open').length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'builder'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'simulation'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Simulate {simResult ? '✓' : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('optimizer')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'optimizer'
              ? 'bg-purple-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Opt</span>
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'compare'
              ? 'bg-indigo-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Compare ({scenarios.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'missions'
              ? 'bg-slate-700 text-slate-300 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Missions</span>
        </button>
      </div>

      {/* Drawer Body Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab: Citizen Requests Pulled from Resident Mode */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-200">
                  Citizen Requests Pulled from Village
                </div>
                <div className="text-[11px] text-slate-400">
                  Live reports from {activeVillage.name} resident game mode. Allocate budget to resolve.
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                {reportedProblems?.filter((p) => p.status === 'open').length || 0} Open
              </span>
            </div>

            <div className="space-y-2.5">
              {reportedProblems?.map((prob) => {
                const isAllocated = prob.linkedIntervention && selectedInterventions.some(
                  (s) => s.type === prob.linkedIntervention.type && s.target === prob.linkedIntervention.target
                );

                return (
                  <div
                    key={prob.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isAllocated
                        ? 'bg-[#0f1d30] border-cyan-500/40 shadow-sm'
                        : 'bg-[#0e1624] border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-white">{prob.title}</h4>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {prob.reportedBy} · {prob.createdAt}
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        prob.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {prob.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {prob.description}
                    </p>

                    {prob.linkedIntervention && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          Intervention: {prob.linkedIntervention.label} (₹{prob.linkedIntervention.cost_lakh}L)
                        </span>

                        <button
                          onClick={() => toggleIntervention(prob.linkedIntervention)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                            isAllocated
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow'
                          }`}
                        >
                          <Hammer className="w-3 h-3" />
                          <span>{isAllocated ? '✓ In Active Plan' : '⚡ Allocate to Plan'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveTab('builder')}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Review Total Budget & Run AI Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 0: Gamified Mission Presets */}
        {activeTab === 'missions' && (
          <div className="-m-4">
            <MissionPresets />
          </div>
        )}

        {/* Tab 1: Plan Builder & Budget Engine */}
        {activeTab === 'builder' && (
          <div className="space-y-4">
            {activeMission && (
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center space-x-2.5">
                <Target className="w-4 h-4 text-purple-300 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-purple-200">{activeMission.title}</span>
                  <span className="text-purple-300/80"> — target: {activeMission.targetMetric}</span>
                </div>
              </div>
            )}

            <TaskPlanner />

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
                  Select interventions from catalog or add custom ones below.
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
                          {item.isCustom && (
                            <span className="ml-1.5 text-amber-400/80 text-[9px]">CUSTOM</span>
                          )}
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

            {/* ── AI-Suggested Interventions ────────────────────────── */}
            <AISuggestedPicks
              catalog={catalog}
              planningObjective={planningObjective}
              selectedInterventions={selectedInterventions}
              toggleIntervention={toggleIntervention}
            />

            {/* ── Filtered Catalog Picker ───────────────────────────── */}
            <FilteredCatalog
              catalog={catalog}
              planningObjective={planningObjective}
              selectedInterventions={selectedInterventions}
              toggleIntervention={toggleIntervention}
            />

            {/* ── Custom Intervention Form ──────────────────────────── */}
            <CustomInterventionForm
              activeVillage={activeVillage}
              selectedInterventions={selectedInterventions}
              setSelectedInterventions={setSelectedInterventions}
            />
          </div>
        )}

        {/* Tab 2: Simulation Impact */}
        {activeTab === 'simulation' && (
          <div className="space-y-4">
            {simResult && simResult.valid !== false && simMetrics && simMetrics.composite_score !== undefined ? (
              <>
                {activeMission && (
                  activeMission.checkSuccess(simMetrics) ? (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center space-x-3">
                      <Trophy className="w-6 h-6 text-amber-400 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-amber-200 text-sm">Mission Complete!</div>
                        <div className="text-amber-300/80">
                          {activeMission.title} — target "{activeMission.targetMetric}" achieved.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center space-x-3">
                      <Target className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <div className="text-xs">
                        <div className="font-bold text-slate-200">Target not yet met</div>
                        <div className="text-slate-400">
                          {activeMission.title} needs "{activeMission.targetMetric}" — adjust the plan and re-run.
                        </div>
                      </div>
                    </div>
                  )
                )}

                <div className="p-4 rounded-2xl bg-[#0e1624] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Simulation: {latestSimulation?.name || 'Current Plan'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                      SUCCESS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <ScoreGauge
                      score={simMetrics.composite_score ?? 0}
                      label="Post-Plan Score"
                      delta={simDeltas.composite_score ?? 0}
                      size={110}
                    />

                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-2 rounded-xl bg-[#131d2e]">
                        <span className="text-slate-400">Budget Spent: </span>
                        <span className="font-bold text-white">₹{simTotalCost}L</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#131d2e]">
                        <span className="text-slate-400">Unspent: </span>
                        <span className="font-bold text-emerald-400">₹{simUnspent}L</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Indicators */}
                <div className="grid grid-cols-2 gap-2.5">
                  <MetricCard
                    label="School Access"
                    value={simMetrics.school_accessibility_pct ?? 0}
                    unit="%"
                    delta={simDeltas.school_accessibility_pct ?? 0}
                    icon={GraduationCap}
                    color="cyan"
                  />
                  <MetricCard
                    label="Water Access"
                    value={simMetrics.water_access_pct ?? 0}
                    unit="%"
                    delta={simDeltas.water_access_pct ?? 0}
                    icon={Droplets}
                    color="emerald"
                  />
                  <MetricCard
                    label="Drainage"
                    value={simMetrics.drainage_coverage_pct ?? 0}
                    unit="%"
                    delta={simDeltas.drainage_coverage_pct ?? 0}
                    icon={Waves}
                    color="amber"
                  />
                  <MetricCard
                    label="School Walk Time"
                    value={simMetrics.avg_time_to_school_min ?? 0}
                    unit="m"
                    delta={simDeltas.avg_time_to_school_min ?? 0}
                    icon={Clock}
                    inverseDelta={true}
                    color="purple"
                  />
                </div>
              </>
            ) : simResult && simResult.valid === false ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2.5">
                <div className="flex items-center space-x-2 font-bold text-sm text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Simulation Rejected: Budget Limit Exceeded</span>
                </div>
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  {simResult.budget?.message ||
                    'The proposed plan exceeds the allocated budget ceiling. Please remove items or increase your budget in the Plan Builder.'}
                </p>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all"
                >
                  Return to Plan Builder
                </button>
              </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent 1: AI Suggested Top Interventions (Objective-Aware)
// ─────────────────────────────────────────────────────────────────────────────
function AISuggestedPicks({
  catalog = [],
  planningObjective = 'holistic',
  selectedInterventions = [],
  toggleIntervention,
}) {
  const relevantTypes = {
    school: ['road_upgrade', 'road_new'],
    water: ['water_point'],
    drainage: ['drainage'],
    holistic: ['road_upgrade', 'road_new', 'water_point', 'drainage'],
  };

  const allowed = relevantTypes[planningObjective] || relevantTypes.holistic;
  const matchingItems = (catalog || []).filter((item) => allowed.includes(item.type));

  const rationales = {
    road_upgrade: {
      school: 'Cuts student walk times below 15-min threshold, directly boosting school accessibility by up to 25%.',
      holistic: 'Critical road upgrade linking remote hamlets to core village health and education services.',
    },
    road_new: {
      school: 'Constructs an all-weather bypass, connecting previously stranded clusters directly to the school corridor.',
      holistic: 'Eliminates dead-end detours and expands all-weather connectivity.',
    },
    water_point: {
      water: 'Solar-powered RO clean water within 250m safe walking distance for 40+ unserved households.',
      holistic: 'Increases potable drinking water equity and reduces groundwater contamination risks.',
    },
    drainage: {
      drainage: 'Covered concrete drainage network preventing seasonal flooding and school-route waterlogging.',
      holistic: 'Protects village pathways from monsoon stagnation and mosquito breeding.',
    },
  };

  const objectiveTitles = {
    school: 'School Access Sprint (Roads Focus)',
    water: 'Drinking Water Equity',
    drainage: 'Monsoon Flood Defense',
    holistic: 'Balanced Holistic Development',
  };

  if (matchingItems.length === 0) return null;

  const topPicks = matchingItems.slice(0, 3);

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#101b2d] to-[#0a1220] border border-cyan-500/30 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">AI Suggested Interventions</span>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-semibold border border-cyan-500/30">
                High Priority
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Filtered for <span className="text-cyan-300 font-medium">{objectiveTitles[planningObjective]}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {topPicks.map((item) => {
          const isSelected = selectedInterventions.some(
            (s) => s.type === item.type && s.target === item.target
          );
          const rationale =
            rationales[item.type]?.[planningObjective] ||
            rationales[item.type]?.holistic ||
            'High-efficiency intervention aligned with active panchayat goals.';

          return (
            <div
              key={`ai-${item.type}-${item.target}`}
              className={`p-2.5 rounded-xl transition-all border ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400/50 shadow-glow'
                  : 'bg-[#0f1828] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Target: {item.target}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-1">{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed italic">
                    💡 {rationale}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end space-y-1.5">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    ₹{item.cost_lakh}L
                  </span>
                  <button
                    onClick={() => toggleIntervention(item)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-[#18253b] hover:bg-[#20324f] text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Included</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent 2: Filtered Catalog Picker
// ─────────────────────────────────────────────────────────────────────────────
function FilteredCatalog({
  catalog = [],
  planningObjective = 'holistic',
  selectedInterventions = [],
  toggleIntervention,
}) {
  const [filterCategory, setFilterCategory] = useState('relevant');

  const relevantTypes = {
    school: ['road_upgrade', 'road_new'],
    water: ['water_point'],
    drainage: ['drainage'],
    holistic: ['road_upgrade', 'road_new', 'water_point', 'drainage'],
  };

  const displayedItems = (catalog || []).filter((item) => {
    if (filterCategory === 'relevant') {
      const allowed = relevantTypes[planningObjective] || relevantTypes.holistic;
      return allowed.includes(item.type);
    }
    if (filterCategory === 'road') return item.type.startsWith('road');
    if (filterCategory === 'water') return item.type === 'water_point';
    if (filterCategory === 'drainage') return item.type === 'drainage';
    return true; // 'all'
  });

  return (
    <div className="p-3.5 rounded-2xl bg-[#0e1624] border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-white">Full Intervention Catalog</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {displayedItems.length} available
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <button
          onClick={() => setFilterCategory('relevant')}
          className={`px-2 py-1 rounded-lg font-medium transition-all ${
            filterCategory === 'relevant'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-[#131d2e] text-slate-400 hover:text-white'
          }`}
        >
          Objective Focus ({planningObjective})
        </button>
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-2 py-1 rounded-lg font-medium transition-all ${
            filterCategory === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-[#131d2e] text-slate-400 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterCategory('road')}
          className={`px-2 py-1 rounded-lg font-medium transition-all ${
            filterCategory === 'road'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-[#131d2e] text-slate-400 hover:text-white'
          }`}
        >
          Roads
        </button>
        <button
          onClick={() => setFilterCategory('water')}
          className={`px-2 py-1 rounded-lg font-medium transition-all ${
            filterCategory === 'water'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-[#131d2e] text-slate-400 hover:text-white'
          }`}
        >
          Water
        </button>
        <button
          onClick={() => setFilterCategory('drainage')}
          className={`px-2 py-1 rounded-lg font-medium transition-all ${
            filterCategory === 'drainage'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-[#131d2e] text-slate-400 hover:text-white'
          }`}
        >
          Drainage
        </button>
      </div>

      {planningObjective === 'school' && filterCategory !== 'relevant' && (
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 flex items-start space-x-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>
            School Access Sprint Notice: Non-road interventions (water, drainage) do not increase School Access scores under this objective.
          </span>
        </div>
      )}

      {/* Item list */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {displayedItems.map((item) => {
          const isSelected = selectedInterventions.some(
            (s) => s.type === item.type && s.target === item.target
          );
          return (
            <div
              key={`${item.type}:${item.target}`}
              onClick={() => toggleIntervention(item)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-glow'
                  : 'bg-[#131d2e] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                    isSelected
                      ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                      : 'border-slate-600 bg-slate-800/60'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-[11px] truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span className="font-mono">{item.target}</span>
                    <span>•</span>
                    <span className="capitalize text-slate-300">{item.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono font-bold text-cyan-400 text-xs">
                  ₹{item.cost_lakh}L
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponent 3: Open-Ended Custom Intervention Form (Type + Suggestions)
// ─────────────────────────────────────────────────────────────────────────────
function CustomInterventionForm({
  activeVillage,
  selectedInterventions = [],
  setSelectedInterventions,
}) {
  const [type, setType] = useState('road_upgrade');
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState('');
  const [costLakh, setCostLakh] = useState(12);
  const [justAdded, setJustAdded] = useState(false);

  // Intervention type definitions with default costs and dynamic suggestion sets
  const INTERVENTION_TYPES = [
    { id: 'road_upgrade', name: 'Road Upgrade / Blacktopping', defaultCost: 16, category: 'Roads' },
    { id: 'road_new', name: 'New All-Weather Road Link', defaultCost: 20, category: 'Roads' },
    { id: 'water_point', name: 'Solar Water Point / RO Kiosk', defaultCost: 10, category: 'Water' },
    { id: 'drainage', name: 'Covered Stormwater Drainage', defaultCost: 15, category: 'Sanitation' },
    { id: 'solar_lighting', name: 'Solar Street Lighting Grid', defaultCost: 6, category: 'Energy' },
    { id: 'solid_waste', name: 'Solid Waste Segregation Shed', defaultCost: 5, category: 'Cleanliness' },
    { id: 'sanitation', name: 'Community Bio-Toilet Complex', defaultCost: 8, category: 'Sanitation' },
    { id: 'education_infra', name: 'Smart Classroom / STEM Hub', defaultCost: 10, category: 'Education' },
    { id: 'custom_infra', name: 'Other Panchayat Asset', defaultCost: 12, category: 'Community' },
  ];

  // Dynamic suggestion bank tailored to village infrastructure nodes and sectors
  const getSuggestionsForType = (selectedType) => {
    switch (selectedType) {
      case 'road_upgrade':
        return [
          { target: 'E4', label: 'E4: Upgrade School Access Road Corridor' },
          { target: 'E5', label: 'E5: Upgrade Kisan Hamlet Connection' },
          { target: 'E1', label: 'E1: North Highway Gate Connecting Road' },
          { target: 'E2', label: 'E2: Panchayat Chowk Arterial Lane' },
        ];
      case 'road_new':
        return [
          { target: 'E7', label: 'E7: Construct South Bypass Corridor' },
          { target: 'E8_WEST', label: 'West Farmland All-Weather Spur' },
          { target: 'E9_EAST', label: 'East Canal Link Pathway' },
        ];
      case 'water_point':
        return [
          { target: 'N3', label: 'N3: Solar RO Kiosk at Govt High School' },
          { target: 'N5', label: 'N5: Solar Deep Tube Well at Kisan Hamlet' },
          { target: 'N2', label: 'N2: Community Water ATM at Panchayat Chowk' },
          { target: 'N4', label: 'N4: Borewell Station at Primary Health Center' },
        ];
      case 'drainage':
        return [
          { target: 'zoneA', label: 'zoneA: Village Hub Stormwater Channel' },
          { target: 'zoneB', label: 'zoneB: Lowland Infiltration Canal' },
          { target: 'zoneC_NORTH', label: 'North Runoff Diversion Ditch' },
        ];
      case 'solar_lighting':
        return [
          { target: 'SCHOOL_ROUTE', label: 'Govt School Pathway Solar Light Grid' },
          { target: 'CHOWK_CENTRAL', label: 'Panchayat Chowk High-Mast Solar Pole' },
          { target: 'HIGHWAY_GATE', label: 'North Highway Entry Solar Illumination' },
        ];
      case 'solid_waste':
        return [
          { target: 'EAST_BOUNDARY', label: 'East Boundary Segregation & Compost Shed' },
          { target: 'HAAT_GROUNDS', label: 'Weekly Haat Organic Waste Collection Pit' },
        ];
      case 'sanitation':
        return [
          { target: 'BUS_STAND', label: 'Panchayat Bus Stop Public Bio-Toilet Unit' },
          { target: 'COMMUNITY_HALL', label: 'Community Hall Sanitation Complex' },
        ];
      case 'education_infra':
        return [
          { target: 'SMART_ROOM', label: 'Govt High School Digital Learning Lab' },
          { target: 'ANGANWADI_KIT', label: 'Model Anganwadi Early Learning Kit' },
        ];
      default:
        return [
          { target: 'POND_RESTORE', label: 'Village Community Pond Restoration' },
          { target: 'COLD_STORAGE', label: 'Kisan Cooperative Solar Cold Storage' },
        ];
    }
  };

  const currentSuggestions = getSuggestionsForType(type);

  // Handle Type Change
  const handleTypeChange = (newType) => {
    setType(newType);
    const def = INTERVENTION_TYPES.find((t) => t.id === newType);
    if (def) {
      setCostLakh(def.defaultCost);
    }
    // Pre-fill target and label from the first suggestion
    const firstSugg = getSuggestionsForType(newType)[0];
    if (firstSugg) {
      setTarget(firstSugg.target);
      setLabel(firstSugg.label);
    }
  };

  // Handle Suggestion Click
  const handleApplySuggestion = (sug) => {
    setTarget(sug.target);
    setLabel(sug.label);
  };

  // Handle Add to Plan
  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!target.trim()) return;

    const finalLabel = label.trim() || `${type.replace('_', ' ')}: ${target.trim()}`;
    const newIntervention = {
      type,
      target: target.trim(),
      cost_lakh: Number(costLakh),
      label: finalLabel,
      isCustom: true,
    };

    // Check if already in plan
    const exists = selectedInterventions.some(
      (s) => s.type === newIntervention.type && s.target === newIntervention.target
    );

    if (exists) {
      // Toggle or replace
      setSelectedInterventions((prev) =>
        prev.map((s) =>
          s.type === newIntervention.type && s.target === newIntervention.target
            ? newIntervention
            : s
        )
      );
    } else {
      setSelectedInterventions((prev) => [...prev, newIntervention]);
    }

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-[#0e1624] border border-cyan-500/20 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white">Add Custom Intervention</span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">
          Type + Suggestion
        </span>
      </div>

      <form onSubmit={handleAddCustom} className="space-y-2.5">
        {/* Type Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Intervention Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            {INTERVENTION_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.category})
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Type Suggestions Chips */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Quick Suggestions for {type.replace('_', ' ')}</span>
            <span className="text-[9px] text-cyan-400 font-normal">Click to auto-fill</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {currentSuggestions.map((sug) => (
              <button
                type="button"
                key={sug.target}
                onClick={() => handleApplySuggestion(sug)}
                className={`text-[10px] px-2 py-1 rounded-lg border text-left transition-all ${
                  target === sug.target
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold'
                    : 'bg-[#131d2e] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Input & Cost Input */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Target Node / Zone / ID
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. E4, N3, or Custom Name"
              className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Cost (₹ Lakh)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={costLakh}
              onChange={(e) => setCostLakh(e.target.value)}
              className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
              required
            />
          </div>
        </div>

        {/* Descriptive Label / Notes */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Intervention Description / Title
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Upgrade unpaved school route corridor"
            className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          />
        </div>

        {/* Add button */}
        <button
          type="submit"
          disabled={!target.trim() || !costLakh}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
            justAdded
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-glow'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Plan!</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Intervention to Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

