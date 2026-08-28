"""
Scenario Comparison store (brief module H).

In-memory only, on purpose — this is a prototype. Swap for
PostgreSQL/PostGIS when you move past the demo (see README "Extend first").
"""

_scenarios = []
_next_id = 1


def reset():
    global _scenarios, _next_id
    _scenarios = []
    _next_id = 1


def add(name, budget_lakh, interventions, result):
    global _next_id
    scenario = {
        "id": _next_id,
        "name": name,
        "budget_lakh": budget_lakh,
        "interventions": interventions,
        "result": result,
    }
    _scenarios.append(scenario)
    _next_id += 1
    return scenario


def all_scenarios():
    return _scenarios


def get(scenario_id):
    for s in _scenarios:
        if s["id"] == scenario_id:
            return s
    return None