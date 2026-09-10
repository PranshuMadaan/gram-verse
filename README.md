# GramVerse AI — SIH1704 Prototype

A working prototype for **SIH1704** (*Gamification for Rural Planning using Drone Land
Survey Maps and GIS Data*). GramVerse is one app with two very different front doors:

- **Village Resident Mode** — a lightweight, game-like experience. Residents drop straight
  into a live, orbitable 3D digital twin of their village, tap on anything (a house, the
  school, a water point) to inspect it, and can report a problem right from that spot — the
  location pins itself automatically. No maps, no jargon, no login required.
- **Planning Official Mode** — the full command console: 2D satellite view ↔ 3D digital
  twin, real accessibility metrics computed from the road network (Dijkstra shortest-path),
  a budget-constrained planning sandbox, an explainable AI-recommended plan, and
  side-by-side scenario comparison.

This is an MVP per the project brief's "Ruthless MVP Scope" — one fully-simulated pilot
village, one end-to-end planning loop, no over-engineering. See **Extend First** below for
what to build next.

---

## Project Structure

```
gramverse/
├── backend/                        # FastAPI — the planning engine
│   ├── main.py                     # All REST endpoints
│   ├── village_data.py             # Pilot village: nodes, roads, buildings, zones, catalog
│   ├── graph_engine.py             # Accessibility graph + composite scoring (NetworkX / Dijkstra)
│   ├── interventions.py            # Planning sandbox + budget/constraint engine
│   ├── simulation.py               # Ties budget + interventions + graph together
│   ├── optimizer.py                # Explainable rule-based recommendation engine
│   ├── store.py                    # In-memory scenario storage (for comparison)
│   └── requirements.txt
│
└── frontend/                       # React 18 + Vite + Tailwind + Three.js
    └── src/
        ├── App.jsx                 # Role gate: Resident vs Planning Official
        ├── context/                # VillageContext (shared state), AuthContext (demo auth)
        ├── api/client.js           # Talks to the FastAPI backend
        ├── components/
        │   ├── onboarding/         # RoleSelector — the "Welcome to GramVerse" screen
        │   ├── community/          # VillagerHome (3D game view), problem/suggestion modals
        │   ├── twin3d/             # DigitalTwin3D.jsx + villageKit.js — the 3D digital twin
        │   ├── exploration/        # MapViewport — 2D/3D toggle shell for Planning Official mode
        │   ├── map/                # Leaflet 2D satellite view
        │   ├── planning/, sandbox/ # Planning Drawer, budget tracker, intervention picker
        │   ├── optimizer/          # AI Recommend UI
        │   ├── comparison/         # Scenario comparison table
        │   ├── solar/              # SDG 7 Solar Microgrid case study modal
        │   ├── auth/               # Login modal, profile drawer (demo auth)
        │   └── village/, search/, common/, layout/, config/, tasks/, missions/
        └── services/                # Problem categorization, geocoding, imagery, village registry
```

---

## Requirements

- **Python 3.10–3.12** recommended for the backend. (Python 3.13/3.14 can fail installing
  some packages if prebuilt wheels aren't published yet for that version — if `pip install`
  tries to compile from source and errors out, install Python 3.12 alongside your current
  version and create the virtual environment with that instead.)
- **Node.js 18+** for the frontend (Vite 6 + React 18).
- A modern browser with WebGL (for the 3D digital twin).

---

## How to Run

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Confirm it's up: open `http://localhost:8000` — you should see a JSON list of endpoints.
Interactive API docs (useful for demoing the API directly) are at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5500`. The page expects the backend at `http://localhost:8000`
by default — keep both running at the same time.

Optional `.env` in `frontend/` (all optional — the app runs fully in demo mode without any
of these):

```bash
VITE_API_URL=http://localhost:8000        # point at a different backend
VITE_AUTH_PROVIDER=auto                   # 'auto' | 'supabase' | 'google'
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_CLIENT_ID=...
```

Without any of these set, sign-in falls back to a one-click **Demo Judge Evaluator** login —
handy for hackathon judging when there's no time to wire up real OAuth.

---

## What You Can Do in the Demo

### As a Village Resident
- Pick "I'm a Village Resident" on the welcome screen — no login required.
- Land straight in a live, auto-rotating 3D digital twin of the village. Drag to orbit,
  scroll to zoom — it's a real interactive scene, not a rendered image.
- Tap any household, the school, the Panchayat Bhawan, or a water point to open an
  inspector card with details and live accessibility stats.
- Hit **"Report a Problem Here"** on that card — the location pins itself automatically,
  no manual pin-dropping.
- Describe the problem in plain words; a rule-based assistant suggests the category and
  urgency for you to confirm. Submit, and it appears instantly in the community feed below.
- Everyone's reports and suggestions show up in a shared feed with status (Waiting for
  Review / Fixed).

### As a Planning Official
- Toggle between 2D Satellite (Leaflet) and the 3D Digital Twin at any time.
- See baseline scores: school accessibility %, water access %, drainage coverage %, and a
  combined composite score — computed from a real weighted road-network graph, not guesses.
- Cycle through Dawn / Day / Dusk / Night lighting, use camera presets (isometric, top-down,
  street view), and click any structure to inspect it or fly the camera to it.
- Pick interventions (road upgrades, a new road, drainage improvements, new water points)
  in the Planning Sandbox, set a budget, and **Run Simulation** — every metric recalculates
  and shows its change (Δ) versus baseline.
- Try to overspend the budget — the plan is rejected outright, no partial credit.
- Click **AI Recommend** — the optimizer ranks every possible intervention by "score gained
  per lakh spent," greedily fills your budget, and shows exactly which ones it picked and
  why.
- Compare every plan you've tried side by side in the comparison table.
- Open the **SDG 7 Solar Microgrid case study** for a fully worked cost/CO₂e analysis of
  switching the village off diesel.

---

## How the Backend Works (Quick Reference)

1. **`village_data.py`** — the only file that knows village-specific facts (coordinates,
   roads, buildings, costs) for the fully-simulated pilot village. Swap this for a real
   GeoJSON importer later without touching anything else.
2. **`graph_engine.py`** — builds a weighted graph (`networkx`) from the road network and
   runs shortest-path (Dijkstra) accessibility checks. Combines school access, water access,
   and drainage coverage into one explainable composite score (weights are returned in the
   API response, never hidden).
3. **`interventions.py`** — applies proposed changes to a *copy* of the village state (never
   mutates the baseline) and enforces the budget as a hard constraint.
4. **`simulation.py`** — orchestrates the above: validate budget → apply → recompute
   metrics → diff against baseline.
5. **`optimizer.py`** — no black-box ML. Simulates every catalog intervention alone to
   measure its solo score gain, ranks by efficiency-per-lakh, greedily fills the budget,
   then re-simulates the final combined plan to verify the real result.
6. **`store.py`** — in-memory list of saved scenarios for comparison. Resets when the
   server restarts.
7. **`main.py`** — thin FastAPI wrapper exposing all of the above as REST endpoints. CORS
   is open for local development.

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

## Current Scope Notes (read before a real deployment)

- **Community reports are frontend-only.** Problems and suggestions submitted from Village
  Resident Mode (`reportProblem` in `VillageContext`) live only in browser state — they
  reset on refresh and never touch the backend. Fine for a demo; needs a real
  `/api/problems` endpoint + `store.py`-style persistence before this reaches real
  villagers.
- **Auth is a demo/UX layer, not real authentication.** `authService.js` supports wiring up
  real Google OAuth or Supabase if you set the env vars above, but by default it signs
  everyone in as a mock Panchayat Officer for frictionless judging. There's no backend-side
  auth check on any endpoint — don't treat this as access control.
- **Only the pilot village is fully simulated.** `villageRegistry.js` lists several Indian
  villages with different data tiers (Drone+GIS / Satellite+DEM / Census-only) for
  browsing, but the live accessibility/simulation engine only exists for the Tier-1 pilot
  village (`village_data.py`) — selecting another village won't run real simulations yet.

---

## Extend First (Priority Order)

1. **Persist community reports** — give `reportProblem`/`communityFeatures` a real backend
   home (mirror `store.py`'s pattern) so reports survive a refresh and a Planning Official
   can see what residents actually asked for, not just what's in the local browser.
2. **Real GeoJSON import** — replace `village_data.py`'s hardcoded sample with an importer
   that reads actual GeoJSON layers (even public/sample data looks far more convincing to
   judges than synthetic coordinates), and extend the simulation engine to the other
   villages already listed in `villageRegistry.js`.
3. **Better optimizer** — the current greedy approach is fast and explainable but not
   always optimal; consider an exact 0/1 knapsack (DP) over the candidate list if time
   allows, or add multi-objective scoring (e.g. let users weight accessibility vs.
   sustainability).
4. **More metrics** — road-network centrality, population-weighted coverage,
   sustainability/environmental-impact indicators (brief section 10 gamification missions
   expect these).
5. **Gamified challenge layer** — named missions (Flood Resilience, School Access, Budget
   Crisis) are just presets: a fixed starting budget + a target metric to optimize for. Can
   be built entirely on top of the existing `/api/optimize` and `/api/scenarios` endpoints.
6. **Real authentication** — wire up the Google OAuth / Supabase config `authService.js`
   already supports, and add a backend auth check before Planning Official actions
   (submitting a scenario, resetting the store) are treated as trusted.

**Already done, don't redo:** the frontend rebuild (React + Vite + Tailwind + Three.js
digital twin) and a first pass at auth UX are both in place — see Scope Notes above for
what's still mock vs. real.

**Do not add yet:** computer vision, or a separate Node.js API layer — both explicitly
flagged in the brief as post-MVP. Adding them now risks breaking a working demo for
marginal benefit before judging.
