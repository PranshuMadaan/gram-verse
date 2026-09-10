# GramVerse AI — Backend Prototype

A working prototype for **SIH1704** (Gamification for Rural Planning using
Drone Land Survey Maps and GIS Data). Demonstrates the full planning loop:
load a village → see accessibility gaps → propose a budget-constrained
development plan → simulate the impact → compare plans → get an
explainable AI-recommended plan.

This is an MVP per the project brief's "Ruthless MVP Scope" — one sample
village, one end-to-end loop, no over-engineering. See `Extend First`
below for what to build next.

---

## Project Structure

```
gramverse/
├── backend/
│   ├── main.py              # FastAPI app — all REST endpoints
│   ├── village_data.py      # sample village: nodes, roads, buildings, zones, catalog
│   ├── graph_engine.py      # accessibility graph + composite scoring
│   ├── interventions.py     # planning sandbox + budget/constraint engine
│   ├── simulation.py        # ties budget + interventions + graph together
│   ├── optimizer.py         # explainable rule-based recommendation engine
│   ├── store.py             # in-memory scenario storage (for comparison)
│   └── requirements.txt
└── frontend/
    └── index.html           # single-file demo UI (Leaflet map + basic 3D + sandbox)
```

---

## Requirements

- Python 3.10–3.12 recommended. (Python 3.13/3.14 can fail installing some
  packages if prebuilt wheels aren't published yet for that version — if
  `pip install` tries to compile from source and errors out, install
  Python 3.12 alongside your current version and create the virtual
  environment with that instead.)
- A modern browser (for the frontend — no build tools needed).

---

## How to Run

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Confirm it's up: open `http://localhost:8000` — you should see a JSON list
of endpoints. Interactive API docs (useful for demoing the API directly)
are at `http://localhost:8000/docs`.

### 2. Frontend

Just open `frontend/index.html` directly in a browser, **or** serve it
(recommended, avoids some browser file:// restrictions):

```bash
cd frontend
npm run dev
```

Then visit `http://localhost:5500`. The page expects the backend at
`http://localhost:8000` — keep both running at the same time.

---

## What You Can Do in the Demo

- View the sample village: roads (green = good condition, orange = poor),
  a school, a water point, and 10 households across two zones.
- See baseline scores: school accessibility %, water access %, drainage
  coverage %, and a combined composite score.
- Pick interventions (road upgrades, a new road, drainage improvements,
  new water points), set a budget, and **Run Simulation** — the system
  recalculates every metric and shows the change (Δ) versus baseline.
- Try to overspend the budget — the plan is rejected outright, no partial
  credit.
- Click **AI Recommend** — the optimizer ranks every possible intervention
  by "score gained per lakh spent," greedily fills your budget with the
  best ones, and shows you exactly which ones it picked and why.
- Compare every plan you've tried side by side in the table.

---

## How the Backend Works (Quick Reference)

1. **`village_data.py`** — the only file that knows village-specific facts
   (coordinates, roads, buildings, costs). Swap this for a real GeoJSON
   importer later without touching anything else.
2. **`graph_engine.py`** — builds a weighted graph (`networkx`) from the
   road network and runs shortest-path (Dijkstra) accessibility checks.
   Combines school access, water access, and drainage coverage into one
   explainable composite score (weights are returned in the API response,
   never hidden).
3. **`interventions.py`** — applies proposed changes to a *copy* of the
   village state (never mutates the baseline) and enforces the budget as
   a hard constraint.
4. **`simulation.py`** — orchestrates the above: validate budget → apply
   → recompute metrics → diff against baseline.
5. **`optimizer.py`** — no black-box ML. Simulates every catalog
   intervention alone to measure its solo score gain, ranks by
   efficiency-per-lakh, greedily fills the budget, then re-simulates the
   final combined plan to verify the real result.
6. **`store.py`** — in-memory list of saved scenarios for comparison.
   Resets when the server restarts.
7. **`main.py`** — thin FastAPI wrapper exposing all of the above as REST
   endpoints. CORS is open for local development.

---

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/village` | Full village layers (nodes, roads, buildings, zones, facilities) |
| GET | `/api/interventions/catalog` | List of interventions available to place, with cost |
| GET | `/api/metrics/baseline` | Existing-conditions scores, before any plan |
| POST | `/api/scenarios` | Submit a plan `{name, budget_lakh, interventions[]}`, get simulated result |
| GET | `/api/scenarios` | List all saved scenarios (for comparison table) |
| GET | `/api/scenarios/{id}` | Get one scenario's full detail |
| POST | `/api/optimize` | Get an AI-recommended plan `{budget_lakh}` |
| POST | `/api/reset` | Clear all saved scenarios |

---

## Extend First (Priority Order)

1. **Persistent storage** — swap `store.py`'s in-memory list for SQLite
   (fastest upgrade, no server setup needed) or PostgreSQL + PostGIS if
   you're ready for real spatial queries.
2. **Real GeoJSON import** — replace `village_data.py`'s hardcoded sample
   with an importer that reads actual GeoJSON layers (even public/sample
   data looks far more convincing to judges than synthetic coordinates).
3. **Better optimizer** — the current greedy approach is fast and
   explainable but not always optimal; consider an exact 0/1 knapsack
   (DP) over the candidate list if time allows, or add multi-objective
   scoring (e.g. let users weight accessibility vs. sustainability).
4. **More metrics** — road-network centrality, population-weighted
   coverage, sustainability/environmental-impact indicators (brief
   section 10 gamification missions expect these).
5. **Frontend rebuild** — the current `index.html` is a functional demo
   shell, not the final UI. Rebuild in React/Next.js with a proper 3D
   library (Three.js scene graph, or CesiumJS/deck.gl for a real digital
   twin) once the team is ready — the REST API underneath doesn't need
   to change for this.
6. **Gamified challenge layer** — named missions (Flood Resilience,
   School Access, Budget Crisis) are just presets: a fixed starting
   budget + a target metric to optimize for. Can be built entirely on
   top of the existing `/api/optimize` and `/api/scenarios` endpoints.

**Do not add yet:** authentication, computer vision, or a separate Node.js
API layer — all explicitly flagged in the brief as post-MVP. Adding them
now risks breaking a working demo for marginal benefit before judging.
