/**
 * GramVerse AI - Centralized Backend API Client
 * Connects directly to existing FastAPI backend endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
      const errorMsg = errorBody.detail || `HTTP Error ${res.status}: ${res.statusText}`;
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(`Cannot reach GramVerse backend at ${API_BASE}. Ensure Uvicorn server is running.`);
    }
    throw err;
  }
}

export const api = {
  getBaseUrl: () => API_BASE,

  // Health check
  checkHealth: () => request('/'),

  // Village GIS Layers
  getVillage: () => request('/api/village'),

  // Intervention Catalog
  getCatalog: () => request('/api/interventions/catalog'),

  // Baseline Conditions Analysis
  getBaselineMetrics: () => request('/api/metrics/baseline'),

  // Submit and Simulate Scenario
  createScenario: (name, budgetLakh, interventions) =>
    request('/api/scenarios', {
      method: 'POST',
      body: JSON.stringify({
        name: name || 'Untitled Plan',
        budget_lakh: Number(budgetLakh),
        interventions: interventions.map(iv => ({ type: iv.type, target: iv.target })),
      }),
    }),

  // Scenario History & Comparison
  listScenarios: () => request('/api/scenarios'),

  // Single Scenario Detail
  getScenario: (id) => request(`/api/scenarios/${id}`),

  // Optimization / AI Recommendation Engine
  optimize: (budgetLakh) =>
    request('/api/optimize', {
      method: 'POST',
      body: JSON.stringify({
        budget_lakh: Number(budgetLakh),
      }),
    }),

  // Reset Saved Scenarios
  resetScenarios: () =>
    request('/api/reset', {
      method: 'POST',
    }),
};
