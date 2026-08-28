"""
GramVerse AI — sample village dataset.

Synthetic but geographically plausible data for ONE representative village
(placed near Patiala, Punjab, per SIH1704's "one village / representative
sample" MVP scope — see brief section 14).

This module is intentionally the ONLY place that knows about the specific
village. Swap this file for a real GeoJSON importer later without touching
graph_engine.py, simulation.py, or optimizer.py — that's the "data-source
agnostic GIS engine" the brief asks for in module A.
"""

import math

# ---------------------------------------------------------------------------
# Road network nodes (intersections / anchor points)
# ---------------------------------------------------------------------------
NODES = {
    "N1": {"lat": 30.3705, "lon": 76.3762, "label": "Main entrance"},
    "N2": {"lat": 30.3712, "lon": 76.3775, "label": "Market junction"},
    "N3": {"lat": 30.3695, "lon": 76.3780, "label": "School junction"},
    "N4": {"lat": 30.3688, "lon": 76.3795, "label": "East junction"},
    "N5": {"lat": 30.3670, "lon": 76.3770, "label": "Far hamlet (Zone B)"},
    "N6": {"lat": 30.3675, "lon": 76.3750, "label": "Water source point"},
}

# Baseline road edges. travel_time_min is what the graph engine optimizes
# over. condition affects which edges are realistic "upgrade" candidates.
BASE_EDGES = [
    {"id": "E1", "a": "N1", "b": "N2", "dist_m": 220, "time_min": 4, "condition": "good"},
    {"id": "E2", "a": "N2", "b": "N3", "dist_m": 180, "time_min": 3, "condition": "good"},
    {"id": "E3", "a": "N3", "b": "N4", "dist_m": 260, "time_min": 6, "condition": "poor"},
    {"id": "E4", "a": "N1", "b": "N6", "dist_m": 300, "time_min": 5, "condition": "good"},
    {"id": "E5", "a": "N6", "b": "N5", "dist_m": 400, "time_min": 9, "condition": "poor"},
]

# A road that does NOT exist yet — a candidate for the "road_new" intervention.
PROPOSED_EDGE = {"id": "E6", "a": "N4", "b": "N5", "dist_m": 350, "time_min": 7}

FACILITIES = {
    "SCHOOL": {"node": "N3", "type": "school", "label": "Government Primary School"},
}

# Existing water infrastructure (a single hand-pump / point source)
BASE_WATER_POINTS = ["N6"]

# Buildings: each anchored to the nearest road node with a fixed short
# household-access edge (anchor_time_min). Coordinates are offset slightly
# from the anchor node purely for map rendering + straight-line (water)
# distance checks.
BUILDINGS = [
    {"id": "B1",  "anchor": "N1", "anchor_time_min": 1, "zone": "zoneA", "lat": 30.3707, "lon": 76.3764},
    {"id": "B2",  "anchor": "N2", "anchor_time_min": 1, "zone": "zoneA", "lat": 30.3714, "lon": 76.3777},
    {"id": "B3",  "anchor": "N3", "anchor_time_min": 1, "zone": "zoneA", "lat": 30.3697, "lon": 76.3782},
    {"id": "B4",  "anchor": "N4", "anchor_time_min": 2, "zone": "zoneA", "lat": 30.3690, "lon": 76.3797},
    {"id": "B10", "anchor": "N2", "anchor_time_min": 2, "zone": "zoneA", "lat": 30.3710, "lon": 76.3773},
    {"id": "B5",  "anchor": "N5", "anchor_time_min": 1, "zone": "zoneB", "lat": 30.3672, "lon": 76.3772},
    {"id": "B6",  "anchor": "N5", "anchor_time_min": 2, "zone": "zoneB", "lat": 30.3668, "lon": 76.3768},
    {"id": "B7",  "anchor": "N6", "anchor_time_min": 1, "zone": "zoneB", "lat": 30.3677, "lon": 76.3752},
    {"id": "B8",  "anchor": "N6", "anchor_time_min": 2, "zone": "zoneB", "lat": 30.3673, "lon": 76.3748},
    {"id": "B9",  "anchor": "N4", "anchor_time_min": 3, "zone": "zoneB", "lat": 30.3686, "lon": 76.3793},
]

# Drainage zones (polygonal in a real GIS layer; here just a building grouping)
ZONES = {
    "zoneA": {"label": "Zone A (village core)", "drainage_status": "poor"},
    "zoneB": {"label": "Zone B (outer hamlet)", "drainage_status": "poor"},
}

# ---------------------------------------------------------------------------
# Intervention catalog — every legal intervention the Planning Sandbox and
# the Optimizer are allowed to propose. This is the single source of truth
# for "what can be built and what does it cost" (Budget & Constraint Engine).
# ---------------------------------------------------------------------------
INTERVENTION_CATALOG = [
    {"type": "road_upgrade", "target": "E3", "cost_lakh": 15,
     "label": "Upgrade School Junction–East road (E3)"},
    {"type": "road_upgrade", "target": "E5", "cost_lakh": 18,
     "label": "Upgrade Water Point–Far Hamlet road (E5)"},
    {"type": "road_new", "target": "E6", "cost_lakh": 20,
     "label": "Build new East–Far Hamlet road (E6)"},
    {"type": "drainage", "target": "zoneA", "cost_lakh": 15,
     "label": "Improve drainage in Zone A"},
    {"type": "drainage", "target": "zoneB", "cost_lakh": 15,
     "label": "Improve drainage in Zone B"},
    {"type": "water_point", "target": "N4", "cost_lakh": 10,
     "label": "New water point near East junction"},
    {"type": "water_point", "target": "N5", "cost_lakh": 10,
     "label": "New water point at Far Hamlet"},
    {"type": "water_point", "target": "N2", "cost_lakh": 10,
     "label": "New water point near Market junction"},
]

SCHOOL_ACCESS_THRESHOLD_MIN = 8   # walking/travel time considered "accessible"
WATER_ACCESS_RADIUS_M = 150       # straight-line radius considered "served"


def haversine_m(lat1, lon1, lat2, lon2):
    """Straight-line distance in meters between two lat/lon points."""
    r = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def village_geojson():
    """Everything the frontend map needs, in one payload."""
    return {
        "nodes": NODES,
        "edges": BASE_EDGES,
        "proposed_edge": PROPOSED_EDGE,
        "buildings": BUILDINGS,
        "zones": ZONES,
        "facilities": FACILITIES,
        "water_points": BASE_WATER_POINTS,
        "budget_example_lakh": 50,
    }