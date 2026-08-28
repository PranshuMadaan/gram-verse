"""
GramVerse AI — backend prototype (FastAPI).

Covers the full MVP loop from brief section 14:
  load village -> baseline metrics -> create scenario (budget-constrained)
  -> simulate -> compare scenarios -> optimizer recommendation.

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs  (FastAPI gives you this for free — use
      it to demo the API directly if the frontend breaks mid-presentation)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

import village_data
import simulation
import optimizer
import store
from interventions import InvalidIntervention

app = FastAPI(title="GramVerse AI — Backend Prototype", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for a local prototype; restrict in real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)


class InterventionIn(BaseModel):
    type: str
    target: str


class ScenarioIn(BaseModel):
    name: str
    budget_lakh: float
    interventions: List[InterventionIn]


class OptimizeIn(BaseModel):
    budget_lakh: float


@app.get("/api/village")
def get_village():
    """Step 1-2: village data the frontend needs to render the map + 3D twin."""
    return village_data.village_geojson()


@app.get("/api/interventions/catalog")
def get_catalog():
    """Everything the Planning Sandbox is allowed to place, with cost."""
    return village_data.INTERVENTION_CATALOG


@app.get("/api/metrics/baseline")
def get_baseline_metrics():
    """Step 3: existing-conditions analysis, before any plan is applied."""
    return simulation.baseline_metrics()


@app.post("/api/scenarios")
def create_scenario(scenario: ScenarioIn):
    """Steps 5-6: submit a plan, validate budget, simulate, store for comparison."""
    interventions = [iv.dict() for iv in scenario.interventions]
    try:
        result = simulation.run_simulation(interventions, scenario.budget_lakh)
    except InvalidIntervention as e:
        raise HTTPException(status_code=400, detail=str(e))

    saved = store.add(scenario.name, scenario.budget_lakh, interventions, result)
    return saved


@app.get("/api/scenarios")
def list_scenarios():
    """Step 7: scenario comparison dashboard data."""
    return store.all_scenarios()


@app.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: int):
    s = store.get(scenario_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return s


@app.post("/api/optimize")
def run_optimizer(payload: OptimizeIn):
    """Step 8: AI-assisted recommendation, explainable and rule-based."""
    result = optimizer.optimize(payload.budget_lakh)
    saved = store.add(
        f"AI Recommended ({payload.budget_lakh} lakh)",
        payload.budget_lakh,
        [{"type": c["type"], "target": c["target"]} for c in result["chosen_interventions"]],
        result["simulation"],
    )
    return {**result, "scenario_id": saved["id"]}


@app.post("/api/reset")
def reset_scenarios():
    store.reset()
    return {"ok": True}


@app.get("/")
def root():
    return {
        "service": "GramVerse AI backend prototype",
        "endpoints": [
            "GET  /api/village",
            "GET  /api/interventions/catalog",
            "GET  /api/metrics/baseline",
            "POST /api/scenarios",
            "GET  /api/scenarios",
            "GET  /api/scenarios/{id}",
            "POST /api/optimize",
            "POST /api/reset",
        ],
        "docs": "/docs",
    }