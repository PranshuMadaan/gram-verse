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
    """Returns (total_cost_lakh, priced_list) — raises InvalidIntervention on bad input."""
    total = 0
    priced = []
    for iv in interventions:
        entry = catalog_lookup(iv["type"], iv["target"])
        total += entry["cost_lakh"]
        priced.append(entry)
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
        itype, target = iv["type"], iv["target"]
        catalog_lookup(itype, target)  # raises if invalid

        if itype == "road_upgrade":
            e = edges_by_id.get(target)
            if e is None:
                raise InvalidIntervention(f"No such road to upgrade: {target}")
            e["time_min"] = max(1, round(e["time_min"] * 0.45))
            e["condition"] = "good"

        elif itype == "road_new":
            if target == PROPOSED_EDGE["id"] and target not in edges_by_id:
                new_edge = dict(PROPOSED_EDGE)
                edges.append(new_edge)
                edges_by_id[new_edge["id"]] = new_edge
            # if already built (idempotent), no-op

        elif itype == "drainage":
            if target not in zones_status:
                raise InvalidIntervention(f"No such zone: {target}")
            zones_status[target] = "improved"

        elif itype == "water_point":
            if target not in water_points:
                water_points.append(target)

        else:
            raise InvalidIntervention(f"Unhandled intervention type: {itype}")

    return edges, zones_status, water_points