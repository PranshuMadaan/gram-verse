"""
Simulation Engine (brief module F).

Given a proposed set of interventions and a budget, this runs the full
pipeline: validate budget -> apply interventions -> recompute metrics ->
report deltas versus baseline. This is what "Run Simulation" (user journey
step 6) actually calls.
"""

from village_data import BASE_EDGES, ZONES, BASE_WATER_POINTS
import graph_engine
import interventions as iv_module


def baseline_metrics():
    zones_status = {z: info["drainage_status"] for z, info in ZONES.items()}
    return graph_engine.compute_metrics(BASE_EDGES, zones_status, BASE_WATER_POINTS)


def run_simulation(interventions, budget_lakh):
    budget_check = iv_module.validate_budget(interventions, budget_lakh)
    if not budget_check["ok"]:
        return {
            "valid": False,
            "budget": budget_check,
            "metrics": None,
            "baseline_metrics": None,
            "delta": None,
        }

    edges, zones_status, water_points = iv_module.apply_interventions(interventions)
    metrics = graph_engine.compute_metrics(edges, zones_status, water_points)
    base = baseline_metrics()

    delta = {
        k: round(metrics[k] - base[k], 1)
        for k in ("school_accessibility_pct", "water_access_pct", "drainage_coverage_pct", "composite_score")
        if isinstance(metrics.get(k), (int, float)) and isinstance(base.get(k), (int, float))
    }

    return {
        "valid": True,
        "budget": budget_check,
        "metrics": metrics,
        "baseline_metrics": base,
        "delta": delta,
    }