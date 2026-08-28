"""
Optimization / Recommendation Engine (brief module G).

Deliberately NOT a black-box ML model — the brief is explicit (section 9)
that a hybrid rule-based + optimization approach is more defensible than
"fake AI" in a hackathon setting. This is a transparent greedy knapsack:

  1. Simulate every candidate intervention alone, from baseline, to get its
     marginal composite-score gain.
  2. Rank candidates by score-gain per lakh spent (cost efficiency).
  3. Greedily add candidates to the plan while the budget allows.
  4. Run ONE final real simulation on the resulting combined plan (gains
     aren't always perfectly additive, so we verify instead of assuming).

Every step is inspectable — the API returns the ranked candidate list and
the reasoning, not just a final answer.
"""

from village_data import INTERVENTION_CATALOG
import simulation


def _marginal_gains():
    base = simulation.baseline_metrics()["composite_score"]
    ranked = []
    for cand in INTERVENTION_CATALOG:
        iv = [{"type": cand["type"], "target": cand["target"]}]
        result = simulation.run_simulation(iv, budget_lakh=cand["cost_lakh"])
        gain = result["metrics"]["composite_score"] - base if result["valid"] else 0
        efficiency = round(gain / cand["cost_lakh"], 3) if cand["cost_lakh"] else 0
        ranked.append({
            **cand,
            "solo_score_gain": round(gain, 1),
            "efficiency_per_lakh": efficiency,
        })
    ranked.sort(key=lambda c: c["efficiency_per_lakh"], reverse=True)
    return ranked


def optimize(budget_lakh):
    ranked = _marginal_gains()

    chosen = []
    spent = 0
    for cand in ranked:
        if spent + cand["cost_lakh"] <= budget_lakh:
            chosen.append(cand)
            spent += cand["cost_lakh"]

    final_interventions = [{"type": c["type"], "target": c["target"]} for c in chosen]
    result = simulation.run_simulation(final_interventions, budget_lakh)

    return {
        "budget_lakh": budget_lakh,
        "ranked_candidates": ranked,
        "chosen_interventions": chosen,
        "total_cost_lakh": spent,
        "unspent_lakh": round(budget_lakh - spent, 1),
        "simulation": result,
        "explanation": (
            f"Ranked all {len(ranked)} candidate interventions by composite-score "
            f"gain per lakh spent, then greedily funded the highest-efficiency "
            f"candidates until the {budget_lakh} lakh budget was used up "
            f"({spent} lakh spent, {round(budget_lakh - spent, 1)} lakh unspent)."
        ),
    }