import React from 'react';
import { Modal } from '../common/Toast';
import { ScoreGauge } from '../common/ScoreGauge';
import { ArrowRight, CheckCircle2, Coins, TrendingUp } from 'lucide-react';

export function PlanDiffModal({ isOpen, onClose, planA, planB, baselineMetrics }) {
  if (!planA || !planB) return null;

  const rA = planA.result;
  const rB = planB.result;

  const mA = rA.metrics || {};
  const mB = rB.metrics || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Plan Comparison: "${planA.name}" vs "${planB.name}"`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Top Comparison Header */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#131d2e] border border-cyan-500/30 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              Plan A
            </span>
            <h4 className="text-base font-bold text-white">{planA.name}</h4>
            <div className="text-xs font-mono text-slate-400">
              Budget Spent: <span className="text-amber-400 font-bold">₹{rA.budget?.total_cost_lakh}L</span> / ₹{planA.budget_lakh}L
            </div>
            <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-2">
              Score: {mA.composite_score ?? '–'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#131d2e] border border-emerald-500/30 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Plan B
            </span>
            <h4 className="text-base font-bold text-white">{planB.name}</h4>
            <div className="text-xs font-mono text-slate-400">
              Budget Spent: <span className="text-amber-400 font-bold">₹{rB.budget?.total_cost_lakh}L</span> / ₹{planB.budget_lakh}L
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">
              Score: {mB.composite_score ?? '–'}
            </div>
          </div>
        </div>

        {/* Metric Comparison Table */}
        <div className="bg-[#0e1624] rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#131d2e] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-3">Metric Key</th>
                <th className="p-3 text-cyan-400">{planA.name}</th>
                <th className="p-3 text-emerald-400">{planB.name}</th>
                <th className="p-3">Variance (B vs A)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="p-3 font-semibold text-slate-200">Composite Score</td>
                <td className="p-3 font-bold text-white">{mA.composite_score ?? '–'} pts</td>
                <td className="p-3 font-bold text-white">{mB.composite_score ?? '–'} pts</td>
                <td className="p-3 font-bold">
                  {mB.composite_score && mA.composite_score ? (
                    <span
                      className={
                        mB.composite_score >= mA.composite_score
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {mB.composite_score >= mA.composite_score ? '+' : ''}
                      {(mB.composite_score - mA.composite_score).toFixed(1)} pts
                    </span>
                  ) : (
                    '–'
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-slate-200">School Accessibility</td>
                <td className="p-3">{mA.school_accessibility_pct ?? '–'}%</td>
                <td className="p-3">{mB.school_accessibility_pct ?? '–'}%</td>
                <td className="p-3 font-bold">
                  {mB.school_accessibility_pct && mA.school_accessibility_pct ? (
                    <span
                      className={
                        mB.school_accessibility_pct >= mA.school_accessibility_pct
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {mB.school_accessibility_pct >= mA.school_accessibility_pct ? '+' : ''}
                      {(mB.school_accessibility_pct - mA.school_accessibility_pct).toFixed(1)}%
                    </span>
                  ) : (
                    '–'
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-slate-200">Water Access</td>
                <td className="p-3">{mA.water_access_pct ?? '–'}%</td>
                <td className="p-3">{mB.water_access_pct ?? '–'}%</td>
                <td className="p-3 font-bold">
                  {mB.water_access_pct && mA.water_access_pct ? (
                    <span
                      className={
                        mB.water_access_pct >= mA.water_access_pct
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {mB.water_access_pct >= mA.water_access_pct ? '+' : ''}
                      {(mB.water_access_pct - mA.water_access_pct).toFixed(1)}%
                    </span>
                  ) : (
                    '–'
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-slate-200">Drainage Coverage</td>
                <td className="p-3">{mA.drainage_coverage_pct ?? '–'}%</td>
                <td className="p-3">{mB.drainage_coverage_pct ?? '–'}%</td>
                <td className="p-3 font-bold">
                  {mB.drainage_coverage_pct && mA.drainage_coverage_pct ? (
                    <span
                      className={
                        mB.drainage_coverage_pct >= mA.drainage_coverage_pct
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {mB.drainage_coverage_pct >= mA.drainage_coverage_pct ? '+' : ''}
                      {(mB.drainage_coverage_pct - mA.drainage_coverage_pct).toFixed(1)}%
                    </span>
                  ) : (
                    '–'
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-3 font-semibold text-slate-200">Avg School Travel Time</td>
                <td className="p-3">{mA.avg_time_to_school_min ?? '–'} min</td>
                <td className="p-3">{mB.avg_time_to_school_min ?? '–'} min</td>
                <td className="p-3 font-bold">
                  {mB.avg_time_to_school_min && mA.avg_time_to_school_min ? (
                    <span
                      className={
                        mB.avg_time_to_school_min <= mA.avg_time_to_school_min
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {(mB.avg_time_to_school_min - mA.avg_time_to_school_min).toFixed(1)} min
                    </span>
                  ) : (
                    '–'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Selected Interventions Comparison */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#0a0f19] rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-slate-400 font-bold mb-1">
              Plan A Interventions ({planA.interventions.length}):
            </div>
            {planA.interventions.map((iv, i) => (
              <div key={i} className="text-cyan-300">
                • {iv.type} on {iv.target}
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0a0f19] rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-slate-400 font-bold mb-1">
              Plan B Interventions ({planB.interventions.length}):
            </div>
            {planB.interventions.map((iv, i) => (
              <div key={i} className="text-emerald-300">
                • {iv.type} on {iv.target}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
