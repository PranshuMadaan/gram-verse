"""
Graph accessibility engine.

This is the piece the brief calls out (section 8) as the strongest
technical component: the road network is a weighted graph, interventions
change edge weights or add edges, and we recompute shortest-path
accessibility after every change. Every score below is explainable —
you can always point at the exact indicator that moved.
"""

import networkx as nx

from village_data import (
    NODES, BUILDINGS, ZONES, FACILITIES,
    SCHOOL_ACCESS_THRESHOLD_MIN, WATER_ACCESS_RADIUS_M, haversine_m,
)

# ---------------------------------------------------------------------------
# Objective-aware composite-score weights.
# When a mission focuses on a specific domain, that domain's weight is
# boosted to ~85% so irrelevant interventions can't inflate the score.
# ---------------------------------------------------------------------------
OBJECTIVE_WEIGHTS = {
    "holistic": {"school_access": 0.4,  "water_access": 0.3,  "drainage": 0.3},
    "school":   {"school_access": 0.85, "water_access": 0.05, "drainage": 0.10},
    "water":    {"school_access": 0.05, "water_access": 0.85, "drainage": 0.10},
    "drainage": {"school_access": 0.10, "water_access": 0.05, "drainage": 0.85},
}


def build_graph(edges):
    g = nx.Graph()
    for node_id, n in NODES.items():
        g.add_node(node_id, **n)
    for e in edges:
        g.add_edge(e["a"], e["b"], time_min=e["time_min"], dist_m=e["dist_m"], id=e["id"])
    return g


def _time_to_school(g, anchor_node):
    school_node = FACILITIES["SCHOOL"]["node"]
    try:
        return nx.shortest_path_length(g, source=school_node, target=anchor_node, weight="time_min")
    except nx.NetworkXNoPath:
        return float("inf")


def compute_metrics(edges, zones_status, water_points, objective="holistic"):
    """
    Returns a dict of explainable indicators plus a composite score.
    `zones_status` maps zone_id -> 'poor' | 'improved'.
    `water_points` is a list of node_ids currently serving as water sources.
    `objective` selects which composite-score weight profile to use.
    """
    g = build_graph(edges)
    total = len(BUILDINGS)

    per_building = []
    school_ok = 0
    water_ok = 0
    drainage_ok = 0
    travel_times = []

    for b in BUILDINGS:
        node_time = _time_to_school(g, b["anchor"])
        total_time = node_time + b["anchor_time_min"] if node_time != float("inf") else float("inf")
        travel_times.append(total_time)
        is_school_ok = total_time <= SCHOOL_ACCESS_THRESHOLD_MIN

        nearest_water_m = min(
            (haversine_m(b["lat"], b["lon"], NODES[w]["lat"], NODES[w]["lon"]) for w in water_points),
            default=float("inf"),
        )
        is_water_ok = nearest_water_m <= WATER_ACCESS_RADIUS_M

        is_drainage_ok = zones_status.get(b["zone"], "poor") == "improved"

        school_ok += int(is_school_ok)
        water_ok += int(is_water_ok)
        drainage_ok += int(is_drainage_ok)

        per_building.append({
            "id": b["id"],
            "zone": b["zone"],
            "time_to_school_min": None if total_time == float("inf") else round(total_time, 1),
            "school_accessible": is_school_ok,
            "water_accessible": is_water_ok,
            "drainage_improved": is_drainage_ok,
        })

    school_pct = 100 * school_ok / total
    water_pct = 100 * water_ok / total
    drainage_pct = 100 * drainage_ok / total
    finite_times = [t for t in travel_times if t != float("inf")]
    avg_school_time = round(sum(finite_times) / len(finite_times), 1) if finite_times else None

    # Composite score — weights vary by planning objective and are always
    # returned so the frontend can display them transparently.
    weights = OBJECTIVE_WEIGHTS.get(objective, OBJECTIVE_WEIGHTS["holistic"])
    composite = round(
        weights["school_access"] * school_pct
        + weights["water_access"] * water_pct
        + weights["drainage"] * drainage_pct,
        1,
    )

    return {
        "school_accessibility_pct": round(school_pct, 1),
        "water_access_pct": round(water_pct, 1),
        "drainage_coverage_pct": round(drainage_pct, 1),
        "avg_time_to_school_min": avg_school_time,
        "composite_score": composite,
        "score_weights": weights,
        "objective": objective,
        "buildings": per_building,
    }