"""
Planning Sandbox + Budget & Constraint Engine.

apply_interventions() takes the baseline state and a list of proposed
interventions and returns the resulting state (never mutates the baseline).
validate_budget() enforces the hard constraint: a plan that exceeds the
budget is rejected outright, per brief module E.
"""

import copy

from village_data import (
    BASE_EDGES, ZONES, BASE_WATER_POINTS, PROPOSED_EDGE, INTERVENTION_CATALOG,
)

CATALOG_BY_KEY = {(c["type"], c["target"]): c for c in INTERVENTION_CATALOG}


class InvalidIntervention(Exception):
    pass


def catalog_lookup(itype, target):
    key = (itype, target)
    if key not in CATALOG_BY_KEY:
        raise InvalidIntervention(f"Unknown intervention: {itype} on {target}")
    return CATALOG_BY_KEY[key]


def price_interventions(interventions):
    """Returns (total_cost_lakh, priced_list) — handles catalog items and custom interventions."""
    total = 0
    priced = []
    for iv in interventions:
        key = (iv.get("type"), iv.get("target"))
        if key in CATALOG_BY_KEY:
            entry = CATALOG_BY_KEY[key]
            cost = entry["cost_lakh"]
            priced.append(entry)
        else:
            cost = float(iv.get("cost_lakh", 10.0))
            priced.append({
                "type": iv.get("type", "custom"),
                "target": iv.get("target", "custom"),
                "cost_lakh": cost,
                "label": iv.get("label", f"Custom: {iv.get('type')} on {iv.get('target')}"),
                "is_custom": True,
            })
        total += cost
    return total, priced


def validate_budget(interventions, budget_lakh):
    total, priced = price_interventions(interventions)
    ok = total <= budget_lakh
    return {
        "ok": ok,
        "total_cost_lakh": total,
        "budget_lakh": budget_lakh,
        "remaining_lakh": round(budget_lakh - total, 2),
        "message": "Within budget" if ok else
                   f"Plan costs {total} lakh but budget is only {budget_lakh} lakh",
        "items": priced,
    }


def apply_interventions(interventions):
    """
    Applies a validated list of interventions to a fresh copy of the
    baseline village state. Returns (edges, zones_status, water_points).
    """
    edges = copy.deepcopy(BASE_EDGES)
    zones_status = {z: info["drainage_status"] for z, info in ZONES.items()}
    water_points = list(BASE_WATER_POINTS)

    edges_by_id = {e["id"]: e for e in edges}

    for iv in interventions:
        itype, target = iv.get("type"), iv.get("target")

        if itype == "road_upgrade":
            e = edges_by_id.get(target)
            if e is not None:
                e["time_min"] = max(1, round(e["time_min"] * 0.45))
                e["condition"] = "good"

        elif itype == "road_new":
            if target == PROPOSED_EDGE["id"] and target not in edges_by_id:
                new_edge = dict(PROPOSED_EDGE)
                edges.append(new_edge)
                edges_by_id[new_edge["id"]] = new_edge

        elif itype == "drainage":
            if target in zones_status:
                zones_status[target] = "improved"

        elif itype == "water_point":
            if target not in water_points:
                water_points.append(target)

        # Non-core custom types (solar, sanitation, solid waste) are safely recorded in the plan and budget

    return edges, zones_status, water_points