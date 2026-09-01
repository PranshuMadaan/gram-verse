import React from 'react';
import { Check, X, TrendingUp, Sparkles } from 'lucide-react';

export function CandidateRankTable({ rankedCandidates = [], chosenInterventions = [] }) {
  const chosenKeys = new Set(
    chosenInterventions.map((c) => `${c.type}:${c.target}`)
  );

  return (
    <div className="bg-[#0e1624] rounded-2xl border border-slate-800 overflow-hidden shadow-command">
      <div className="p-4 bg-[#131d2e] border-b border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Candidate Interventions Efficiency Ranking
          </h4>
          <p className="text-[11px] text-slate-400">
            Ranked by marginal composite-score gain per lakh ₹ spent (greedy knapsack priority)
          </p>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          Deterministic & Explainable
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="bg-[#0a0f19] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <th className="p-3.5">Priority Rank</th>
              <th className="p-3.5">Intervention Target & Label</th>
              <th className="p-3.5">Cost (₹L)</th>
              <th className="p-3.5">Solo Score Gain</th>
              <th className="p-3.5">Cost Efficiency (Gain / ₹L)</th>
              <th className="p-3.5">Selection Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {rankedCandidates.map((cand, idx) => {
              const isChosen = chosenKeys.has(`${cand.type}:${cand.target}`);

              return (
                <tr
                  key={`${cand.type}:${cand.target}`}
                  className={`hover:bg-[#131e2e]/50 transition-colors ${
                    isChosen ? 'bg-emerald-500/10' : ''
                  }`}
                >
                  <td className="p-3.5 font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isChosen
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-sans font-bold text-white text-xs">
                      {cand.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Type: {cand.type} · Target: {cand.target}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-amber-400">₹{cand.cost_lakh}L</td>
                  <td className="p-3.5 font-bold text-cyan-400">
                    +{cand.solo_score_gain} pts
                  </td>
                  <td className="p-3.5 font-bold text-emerald-400">
                    {cand.efficiency_per_lakh} pts/₹L
                  </td>
                  <td className="p-3.5 font-sans">
                    {isChosen ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Funded in Plan</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                        <X className="w-3 h-3" />
                        <span>Skipped (Budget limit)</span>
                      </span>
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
