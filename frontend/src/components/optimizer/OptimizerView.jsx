import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { CandidateRankTable } from './CandidateRankTable';
import { ScoreGauge } from '../common/ScoreGauge';
import { MetricCard } from '../common/MetricCard';
import {
  Sparkles,
  Cpu,
  Coins,
  ArrowRight,
  Hammer,
  HelpCircle,
  TrendingUp,
  Activity,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react';

export function OptimizerView() {
  const {
    optimizerResult,
    runOptimizer,
    isOptimizing,
    budgetLakh,
    setBudgetLakh,
    loadScenarioIntoSandbox,
    setActiveTab,
    baselineMetrics,
  } = useVillage();

  const [targetBudget, setTargetBudget] = useState(budgetLakh || 50);

  const handleRun = async () => {
    await runOptimizer(targetBudget);
  };

  const simResult = optimizerResult?.simulation;
  const metrics = simResult?.metrics;
  const delta = simResult?.delta;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#121c2d] to-[#16273e] p-6 rounded-2xl border border-cyan-500/30 shadow-command">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Algorithmic Optimization · Greedy Knapsack</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            AI-Assisted Capital Allocation Engine
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Deterministically evaluates marginal composite-score gains ($\Delta\text{Score}/\text{Lakh}$) for each candidate intervention to produce an explainable, maximum-efficiency rural development plan.
          </p>
        </div>

        {/* Budget Setting & Run Optimizer */}
        <div className="flex items-center space-x-3 bg-[#0e1624] p-2 rounded-xl border border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2 px-2 font-mono text-xs text-slate-300">
            <span>Budget:</span>
            <input
              type="number"
              min="10"
              max="100"
              step="5"
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-16 bg-[#131d2e] border border-slate-700 rounded px-2 py-1 text-center font-bold text-cyan-400 focus:outline-none"
            />
            <span>Lakh ₹</span>
          </div>

          <button
            onClick={handleRun}
            disabled={isOptimizing}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-glow flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{isOptimizing ? 'Optimizing...' : 'Run Optimizer'}</span>
          </button>
        </div>
      </div>

      {/* When Optimizer Result is Available */}
      {optimizerResult ? (
        <div className="space-y-6">
          {/* Summary KPIs Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <ScoreGauge
                score={metrics?.composite_score}
                baselineScore={baselineMetrics?.composite_score}
                delta={delta?.composite_score}
                label="Optimized Score"
                size={130}
              />
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0e1624] p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">
                  Allocated Capital
                </div>
                <div className="text-2xl font-extrabold font-mono text-amber-400">
                  ₹{optimizerResult.total_cost_lakh} Lakhs
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Unspent: ₹{optimizerResult.unspent_lakh} Lakhs
                </div>
              </div>

              <div className="bg-[#0e1624] p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">
                  Funded Interventions
                </div>
                <div className="text-2xl font-extrabold font-mono text-cyan-400">
                  {optimizerResult.chosen_interventions.length} Items
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Out of {optimizerResult.ranked_candidates.length} catalog options
                </div>
              </div>

              <div className="bg-[#0e1624] p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">
                  Net Score Improvement
                </div>
                <div className="text-2xl font-extrabold font-mono text-emerald-400">
                  +{delta?.composite_score ?? 0} pts
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  From baseline {baselineMetrics?.composite_score} to {metrics?.composite_score}
                </div>
              </div>
            </div>
          </div>

          {/* Explainability Reasoning Card */}
          <div className="bg-[#0e1624] p-5 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase font-mono">
              <Cpu className="w-4 h-4" />
              <span>Why Was This Development Plan Chosen?</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans bg-[#131d2e] p-3.5 rounded-xl border border-slate-800">
              {optimizerResult.explanation}
            </p>
            <div className="flex items-center justify-between pt-1">
              <div className="text-[11px] text-slate-400 font-mono">
                Strategy: Maximum marginal accessibility gain per rupee invested without black-box bias.
              </div>
              <button
                onClick={() =>
                  loadScenarioIntoSandbox({
                    name: `AI Plan (${optimizerResult.budget_lakh}L)`,
                    budget_lakh: optimizerResult.budget_lakh,
                    interventions: optimizerResult.chosen_interventions,
                  })
                }
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow"
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Load into Planning Sandbox</span>
              </button>
            </div>
          </div>

          {/* Candidate Efficiency Table */}
          <CandidateRankTable
            rankedCandidates={optimizerResult.ranked_candidates}
            chosenInterventions={optimizerResult.chosen_interventions}
          />
        </div>
      ) : (
        <div className="p-12 text-center max-w-md mx-auto space-y-3 bg-[#0e1624] rounded-2xl border border-slate-800">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Ready to Optimize</h3>
          <p className="text-xs text-slate-400">
            Set your budget above and click <b>Run Optimizer</b> to calculate the highest-scoring combination of infrastructure projects.
          </p>
          <button
            onClick={handleRun}
            disabled={isOptimizing}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{isOptimizing ? 'Optimizing...' : 'Run Optimization Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
