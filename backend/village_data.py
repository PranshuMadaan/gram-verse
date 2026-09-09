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


# ---------------------------------------------------------------------------
# VILLAGE 2: Gharuan (PB-SAS-002) - Smart Rural Hub, SAS Nagar / Mohali
# ---------------------------------------------------------------------------
GHARUAN_NODES = {
    "GN1": {"lat": 30.7065, "lon": 76.5740, "label": "Highway North Gate"},
    "GN2": {"lat": 30.7052, "lon": 76.5754, "label": "Panchayat & Chowk Hub"},
    "GN3": {"lat": 30.7040, "lon": 76.5768, "label": "Govt Smart High School"},
    "GN4": {"lat": 30.7032, "lon": 76.5742, "label": "Heritage Gurdwara & Health Center"},
    "GN5": {"lat": 30.7022, "lon": 76.5775, "label": "Kisan Hamlet (Zone B)"},
    "GN6": {"lat": 30.7018, "lon": 76.5732, "label": "Community Water Tank & Tube Well"},
    "GN7": {"lat": 30.7060, "lon": 76.5770, "label": "Agro Cooperative & Cold Storage"},
}

GHARUAN_BASE_EDGES = [
    {"id": "GE1", "a": "GN1", "b": "GN2", "dist_m": 210, "time_min": 3, "condition": "good"},
    {"id": "GE2", "a": "GN2", "b": "GN3", "dist_m": 190, "time_min": 3, "condition": "good"},
    {"id": "GE3", "a": "GN2", "b": "GN4", "dist_m": 170, "time_min": 2, "condition": "good"},
    {"id": "GE4", "a": "GN3", "b": "GN5", "dist_m": 290, "time_min": 6, "condition": "poor"},
    {"id": "GE5", "a": "GN4", "b": "GN6", "dist_m": 310, "time_min": 7, "condition": "poor"},
    {"id": "GE6", "a": "GN1", "b": "GN7", "dist_m": 240, "time_min": 4, "condition": "good"},
]

GHARUAN_PROPOSED_EDGE = {"id": "GE7", "a": "GN5", "b": "GN6", "dist_m": 320, "time_min": 6}

GHARUAN_FACILITIES = {
    "SCHOOL": {"node": "GN3", "type": "school", "label": "Govt Smart Senior Secondary School"},
    "HEALTH": {"node": "GN4", "type": "health", "label": "Primary Health Center & Ayush Dispensary"},
}

GHARUAN_BASE_WATER_POINTS = ["GN6"]

GHARUAN_BUILDINGS = [
    {"id": "GB1",  "anchor": "GN1", "anchor_time_min": 1, "zone": "zoneA", "lat": 30.7067, "lon": 76.5742, "name": "Balwinder Singh's Haveli"},
    {"id": "GB2",  "anchor": "GN2", "anchor_time_min": 1, "zone": "zoneA", "lat": 30.7054, "lon": 76.5756, "name": "Sarpanch Sukhdev Singh's Residence"},
    {"id": "GB3",  "anchor": "GN3", "anchor_time_min": 1, "zone": "zoneA", "lat": 30.7042, "lon": 76.5770, "name": "Master Gurpreet's Homestead"},
    {"id": "GB4",  "anchor": "GN4", "anchor_time_min": 2, "zone": "zoneA", "lat": 30.7034, "lon": 76.5744, "name": "Granthi Ji Niwas"},
    {"id": "GB5",  "anchor": "GN7", "anchor_time_min": 1, "zone": "zoneA", "lat": 30.7062, "lon": 76.5772, "name": "Dairy Farmer Amrik's Yard"},
    {"id": "GB6",  "anchor": "GN2", "anchor_time_min": 2, "zone": "zoneA", "lat": 30.7050, "lon": 76.5750, "name": "Kiran Kaur's Pottery Workshop"},
    {"id": "GB7",  "anchor": "GN5", "anchor_time_min": 1, "zone": "zoneB", "lat": 30.7024, "lon": 76.5777, "name": "Jagtar Singh's Farmhouse"},
    {"id": "GB8",  "anchor": "GN5", "anchor_time_min": 2, "zone": "zoneB", "lat": 30.7020, "lon": 76.5773, "name": "Kuldeep's Orchard House"},
    {"id": "GB9",  "anchor": "GN6", "anchor_time_min": 1, "zone": "zoneB", "lat": 30.7019, "lon": 76.5734, "name": "Gurcharan Singh's Dera"},
    {"id": "GB10", "anchor": "GN6", "anchor_time_min": 2, "zone": "zoneB", "lat": 30.7016, "lon": 76.5730, "name": "Manjit Kaur's Cottage"},
    {"id": "GB11", "anchor": "GN3", "anchor_time_min": 2, "zone": "zoneB", "lat": 30.7036, "lon": 76.5774, "name": "Tarsem's Agro Shed"},
    {"id": "GB12", "anchor": "GN5", "anchor_time_min": 3, "zone": "zoneB", "lat": 30.7028, "lon": 76.5782, "name": "Harbans' Wheat Field Hut"},
]

GHARUAN_ZONES = {
    "zoneA": {"label": "Zone A (Village Hub & GT Link)", "drainage_status": "poor"},
    "zoneB": {"label": "Zone B (Kisan Hamlet & Orchards)", "drainage_status": "poor"},
}

GHARUAN_INTERVENTION_CATALOG = [
    {"type": "road_upgrade", "target": "GE4", "cost_lakh": 16,
     "label": "Upgrade Smart School–Kisan Hamlet road (GE4)"},
    {"type": "road_upgrade", "target": "GE5", "cost_lakh": 18,
     "label": "Upgrade Gurdwara–Water Tank track (GE5)"},
    {"type": "road_new", "target": "GE7", "cost_lakh": 22,
     "label": "Build new Kisan Hamlet–Tube Well link (GE7)"},
    {"type": "drainage", "target": "zoneA", "cost_lakh": 15,
     "label": "Modern covered stormwater drainage in Zone A"},
    {"type": "drainage", "target": "zoneB", "cost_lakh": 15,
     "label": "Agricultural runoff recharge canal in Zone B"},
    {"type": "water_point", "target": "GN3", "cost_lakh": 10,
     "label": "Solar RO Drinking Water Kiosk at Smart School"},
    {"type": "water_point", "target": "GN5", "cost_lakh": 12,
     "label": "Solar Deep Borewell Station at Kisan Hamlet"},
    {"type": "water_point", "target": "GN2", "cost_lakh": 10,
     "label": "Community Water Dispenser at Panchayat Chowk"},
]

# Database index of all registered villages
VILLAGES_DB = {
    "PB-PAT-001": {
        "id": "PB-PAT-001",
        "name": "Kalyan",
        "district": "Patiala",
        "state": "Punjab",
        "center": [30.3695, 76.3775],
        "nodes": NODES,
        "edges": BASE_EDGES,
        "proposed_edge": PROPOSED_EDGE,
        "buildings": BUILDINGS,
        "zones": ZONES,
        "facilities": FACILITIES,
        "water_points": BASE_WATER_POINTS,
        "catalog": INTERVENTION_CATALOG,
        "budget_example_lakh": 50,
    },
    "PB-SAS-002": {
        "id": "PB-SAS-002",
        "name": "Gharuan",
        "district": "SAS Nagar (Mohali)",
        "state": "Punjab",
        "center": [30.7046, 76.5754],
        "nodes": GHARUAN_NODES,
        "edges": GHARUAN_BASE_EDGES,
        "proposed_edge": GHARUAN_PROPOSED_EDGE,
        "buildings": GHARUAN_BUILDINGS,
        "zones": GHARUAN_ZONES,
        "facilities": GHARUAN_FACILITIES,
        "water_points": GHARUAN_BASE_WATER_POINTS,
        "catalog": GHARUAN_INTERVENTION_CATALOG,
        "budget_example_lakh": 60,
    },
}

def get_village_data(village_id: str = "PB-PAT-001"):
    """Fetch complete cadastral dataset for a specified village ID."""
    return VILLAGES_DB.get(village_id, VILLAGES_DB["PB-PAT-001"])

def get_catalog(village_id: str = "PB-PAT-001"):
    """Fetch intervention catalog for a village."""
    v = get_village_data(village_id)
    return v["catalog"]

def village_geojson(village_id: str = "PB-PAT-001"):
    """Everything the frontend map + 3D twin needs in one payload."""
    v = get_village_data(village_id)
    return {
        "id": v["id"],
        "name": v["name"],
        "center": v["center"],
        "nodes": v["nodes"],
        "edges": v["edges"],
        "proposed_edge": v["proposed_edge"],
        "buildings": v["buildings"],
        "zones": v["zones"],
        "facilities": v["facilities"],
        "water_points": v["water_points"],
        "budget_example_lakh": v["budget_example_lakh"],
    }