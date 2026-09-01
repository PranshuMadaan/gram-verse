import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { PlanDiffModal } from './PlanDiffModal';
import {
  GitCompare,
  Trophy,
  Hammer,
  Eye,
  TrendingUp,
  Coins,
  Sparkles,
  Plus,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export function ScenarioComparisonView() {
  const {
    scenarios,
    baselineMetrics,
    setActiveTab,
    setLatestSimulation,
    loadScenarioIntoSandbox,
    runOptimizer,
    isOptimizing,
  } = useVillage();

  const [diffPlanA, setDiffPlanA] = useState(null);
  const [diffPlanB, setDiffPlanB] = useState(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-16 h-16 mx-auto flex items-center justify-center">
          <GitCompare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Saved Scenarios Yet</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Create and simulate multiple capital improvement plans in the Sandbox or generate an AI-recommended plan to compare strategies side-by-side.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => setActiveTab('sandbox')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow inline-flex items-center space-x-2"
          >
            <Hammer className="w-4 h-4" />
            <span>Create Plan in Sandbox</span>
          </button>

          <button
            onClick={() => runOptimizer(50)}
            disabled={isOptimizing}
            className="px-4 py-2.5 rounded-xl bg-[#131d2e] hover:bg-[#1b2b40] text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition-all inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate AI Plan</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate highest composite score to badge it
  const validScenarios = scenarios.filter((s) => s.result && s.result.valid);
  const maxScore = Math.max(
    ...validScenarios.map((s) => s.result?.metrics?.composite_score || 0),
    0
  );

  const handleInspect = (s) => {
    setLatestSimulation(s);
    setActiveTab('simulation');
  };

  const handleStartDiff = (s) => {
    if (!diffPlanA) {
      setDiffPlanA(s);
    } else if (!diffPlanB && diffPlanA.id !== s.id) {
      setDiffPlanB(s);
      setIsDiffOpen(true);
    } else {
      setDiffPlanA(s);
      setDiffPlanB(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1624] p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <GitCompare className="w-4 h-4" />
            <span>Multi-Criteria Decision Analysis</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Scenario Comparison & Strategy Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate alternative capital allocations side-by-side to identify the Pareto-optimal rural infrastructure strategy.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('sandbox')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>New Scenario</span>
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-[#0e1624] rounded-2xl border border-slate-800 overflow-hidden shadow-command">
        <div className="p-4 bg-[#131d2e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Saved Development Plans ({scenarios.length})
            </h4>
            <span className="text-[11px] text-slate-400">
              Baseline Composite Score: {baselineMetrics?.composite_score ?? '–'}
            </span>
          </div>

          {diffPlanA && (
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-cyan-400">Comparing: <b>{diffPlanA.name}</b> vs...</span>
              <button
                onClick={() => setDiffPlanA(null)}
                className="text-slate-500 hover:text-slate-300 text-[11px]"
              >
                (Cancel)
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0a0f19] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-3.5">Plan Name</th>
                <th className="p-3.5">Cost / Budget</th>
                <th className="p-3.5">Composite Score</th>
                <th className="p-3.5">School Access</th>
                <th className="p-3.5">Water Access</th>
                <th className="p-3.5">Drainage Coverage</th>
                <th className="p-3.5">Avg Travel Time</th>
                <th className="p-3.5">Score Gain (Δ)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scenarios.map((s) => {
                const r = s.result || {};
                const m = r.metrics || {};
                const d = r.delta || {};
                const isMax = m.composite_score && m.composite_score === maxScore;
                const isDiffSelected = diffPlanA?.id === s.id;

                if (!r.valid) {
                  return (
                    <tr key={s.id} className="bg-rose-500/5 hover:bg-rose-500/10 transition-colors">
                      <td className="p-3.5 font-bold text-slate-200">{s.name}</td>
                      <td className="p-3.5 text-rose-400" colSpan="7">
                        REJECTED: {r.budget?.message || 'Exceeded Budget'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => loadScenarioIntoSandbox(s)}
                          className="text-cyan-400 hover:underline text-[11px]"
                        >
                          Fix in Sandbox
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-[#131e2e]/50 transition-colors ${
                      isDiffSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold text-white font-sans flex items-center space-x-2">
                      <span>{s.name}</span>
                      {isMax && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] flex items-center space-x-1 font-mono">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          <span>BEST</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-amber-400 font-bold">
                      ₹{r.budget?.total_cost_lakh}L{' '}
                      <span className="text-slate-500 font-normal">/ ₹{s.budget_lakh}L</span>
                    </td>
                    <td className="p-3.5 font-extrabold text-base text-cyan-400">
                      {m.composite_score ?? '–'}
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {m.school_accessibility_pct ?? '–'}%
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {m.water_access_pct ?? '–'}%
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {m.drainage_coverage_pct ?? '–'}%
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {m.avg_time_to_school_min ?? '–'} min
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${
                          d.composite_score > 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400'
                        }`}
                      >
                        {d.composite_score > 0 ? `+${d.composite_score}` : d.composite_score ?? '0'} pts
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-sans space-x-2">
                      <button
                        onClick={() => handleInspect(s)}
                        className="px-2.5 py-1 rounded bg-[#131d2e] hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                        title="View Full Simulation Dashboard"
                      >
                        Inspect
                      </button>

                      <button
                        onClick={() => handleStartDiff(s)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          isDiffSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-[#131d2e] hover:bg-cyan-500/20 text-cyan-300'
                        }`}
                        title="Select for Diff"
                      >
                        {isDiffSelected ? 'Selected' : 'Diff'}
                      </button>

                      <button
                        onClick={() => loadScenarioIntoSandbox(s)}
                        className="px-2.5 py-1 rounded bg-[#131d2e] hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] transition-colors"
                        title="Load into Sandbox"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Diff Modal */}
      {diffPlanA && diffPlanB && (
        <PlanDiffModal
          isOpen={isDiffOpen}
          onClose={() => {
            setIsDiffOpen(false);
            setDiffPlanA(null);
            setDiffPlanB(null);
          }}
          planA={diffPlanA}
          planB={diffPlanB}
          baselineMetrics={baselineMetrics}
        />
      )}
    </div>
  );
}
