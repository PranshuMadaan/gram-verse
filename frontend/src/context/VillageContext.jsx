import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { VILLAGE_REGISTRY, DATA_TIERS } from '../services/villageRegistry';
import { villageDataService } from '../services/villageDataService';
import { INITIAL_COMMUNITY_PROBLEMS } from '../services/problemService';
import { MISSIONS } from '../services/missions';

const VillageContext = createContext(null);

export function VillageProvider({ children }) {
  // App Experience Mode: 'simple' (Villager Mode) vs 'planning' (Planning Official Mode)
  const [appMode, setAppMode] = useState(() => localStorage.getItem('gramverse_role') || 'simple');
  const [hasChosenRole, setHasChosenRole] = useState(() => Boolean(localStorage.getItem('gramverse_role')));

  const chooseRole = (mode) => {
    setAppMode(mode);
    setHasChosenRole(true);
    localStorage.setItem('gramverse_role', mode);
  };

  // Keep localStorage in sync if the person switches modes later from
  // within the app (e.g. the "Switch Mode" links), not just on first choice.
  useEffect(() => {
    if (hasChosenRole) {
      localStorage.setItem('gramverse_role', appMode);
    }
  }, [appMode, hasChosenRole]);

  // View Dimension: '2d' (Satellite map) vs '3d' (Digital Twin)
  const [viewMode, setViewMode] = useState('2d');

  // Village & Geospatial registry state
  const [activeVillage, setActiveVillageState] = useState(VILLAGE_REGISTRY[0]);
  const [boundary, setBoundary] = useState(null);
  const [isBoundaryApproximate, setIsBoundaryApproximate] = useState(false);
  const [isVillageSelectorOpen, setIsVillageSelectorOpen] = useState(false);
  const [elevationProfile, setElevationProfile] = useState(null);

  // Core backend data state
  const [village, setVillage] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [baselineMetrics, setBaselineMetrics] = useState(null);
  const [scenarios, setScenarios] = useState([]);

  // Community Problems ('Things to Fix') State
  const [reportedProblems, setReportedProblems] = useState(INITIAL_COMMUNITY_PROBLEMS);
  const [communityFeatures, setCommunityFeatures] = useState([]);

  // Modals & Drawers Visibility
  const [isReportProblemOpen, setIsReportProblemOpen] = useState(false);
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const [isThingsToFixOpen, setIsThingsToFixOpen] = useState(false);
  const [isPlanningDrawerOpen, setIsPlanningDrawerOpen] = useState(false);
  const [isSolarModalOpen, setIsSolarModalOpen] = useState(false);

  // Map Coordinate Picker Mode
  const [pickLocationMode, setPickLocationMode] = useState(null); // 'problem' | 'feature' | null
  const [selectedMapPoint, setSelectedMapPoint] = useState(null);
  const [focusedLocation, setFocusedLocation] = useState(null);

  // Configurable planning parameters
  const [activePlanName, setActivePlanName] = useState('Plan A - Strategic Core');
  const [budgetLakh, setBudgetLakh] = useState(50);
  const [planningObjective, setPlanningObjective] = useState('holistic');
  const [targetSchoolPct, setTargetSchoolPct] = useState(70);
  const [targetWaterPct, setTargetWaterPct] = useState(60);
  const [targetDrainagePct, setTargetDrainagePct] = useState(50);
  const [prioritizeZoneB, setPrioritizeZoneB] = useState(true);

  // Selected queue
  const [selectedInterventions, setSelectedInterventions] = useState([]);

  // Gamified Missions state
  const [activeMission, setActiveMission] = useState(null);
  // Set by applyMission() to tell PlanningDrawer which tab to jump to next render
  const [requestedPlanningTab, setRequestedPlanningTab] = useState(null);

  // Panchayat Planning Tasks (budget-linked task list)
  const [tasks, setTasks] = useState([]);

  // Results and AI state
  const [latestSimulation, setLatestSimulation] = useState(null);
  const [optimizerResult, setOptimizerResult] = useState(null);

  // Backend status & toast
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Village Data & Boundary
  const loadVillageData = useCallback(async (vMeta) => {
    setLoading(true);
    setError(null);
    try {
      const boundaryFeature = villageDataService.getVillageBoundary(vMeta);
      setBoundary(boundaryFeature);
      setIsBoundaryApproximate(boundaryFeature?.properties?.isApproximate ?? false);

      if (vMeta.id === 'PB-PAT-001' || vMeta.isPilot) {
        const [layers, cData, bData, sData] = await Promise.all([
          villageDataService.getVillageLayers('PB-PAT-001'),
          api.getCatalog(),
          api.getBaselineMetrics(),
          api.listScenarios(),
        ]);

        setVillage(layers);
        setCatalog(cData);
        setBaselineMetrics(bData);
        setScenarios(sData);
        setElevationProfile(layers.elevation);
        setBackendOnline(true);
      } else {
        const layers = await villageDataService.getVillageLayers(vMeta.id);
        setVillage(layers);
        setElevationProfile(layers.elevation);
      }
    } catch (err) {
      console.error('Failed to load village data:', err);
      setError(err.message);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVillageData(activeVillage);
  }, [activeVillage, loadVillageData]);

  // Periodic heartbeat
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await api.checkHealth();
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Select Village Handler
  const selectVillage = (vMeta) => {
    setActiveVillageState(vMeta);
    setSelectedInterventions([]);
    if (vMeta.id === 'PB-PAT-001' || vMeta.isPilot) {
      showToast(`Active: ${vMeta.name} (Live Cadastral Simulation Pilot)`, 'success');
    } else {
      showToast(
        `Located: ${vMeta.name}, ${vMeta.district} · Satellite Imagery loaded. Drone cadastral simulation active on Patiala pilot.`,
        'info'
      );
    }
  };

  // Community Problem Actions
  const reportProblem = (newProblem) => {
    setReportedProblems((prev) => [newProblem, ...prev]);
    showToast(`Reported issue: "${newProblem.title}"`, 'success');
  };

  const resolveProblem = (problemId) => {
    setReportedProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, status: 'resolved' } : p))
    );
    showToast('Marked problem as resolved ✓', 'info');
  };

  const deleteProblem = (problemId) => {
    setReportedProblems((prev) => prev.filter((p) => p.id !== problemId));
    showToast('Problem removed', 'info');
  };

  const addCommunityFeature = (newFeature) => {
    setCommunityFeatures((prev) => [newFeature, ...prev]);
    showToast(`Added place: "${newFeature.name}" (Pending Verification)`, 'success');
  };

  const convertProblemToPlan = (problem) => {
    if (problem.linkedIntervention) {
      toggleIntervention(problem.linkedIntervention);
      setAppMode('planning');
      setIsPlanningDrawerOpen(true);
      showToast(`Added "${problem.title}" to active Panchayat plan`, 'success');
    } else {
      setAppMode('planning');
      setIsPlanningDrawerOpen(true);
      showToast('Opened Planning Mode to allocate budget for this task', 'info');
    }
  };

  // Budget calculations
  const totalAllocated = selectedInterventions.reduce((sum, item) => sum + (item.cost_lakh || 0), 0);
  const remainingBudget = Number((budgetLakh - totalAllocated).toFixed(2));
  const isOverBudget = totalAllocated > budgetLakh;

  // Intervention selection helpers
  const toggleIntervention = (item) => {
    const isSelected = selectedInterventions.some(
      (s) => s.type === item.type && s.target === item.target
    );
    if (isSelected) {
      setSelectedInterventions((prev) =>
        prev.filter((s) => !(s.type === item.type && s.target === item.target))
      );
    } else {
      setSelectedInterventions((prev) => [...prev, item]);
    }
  };

  const isInterventionSelected = (item) => {
    return selectedInterventions.some(
      (s) => s.type === item.type && s.target === item.target
    );
  };

  const clearPlan = () => {
    setSelectedInterventions([]);
  };

  // Accept a gamified mission preset: pre-fills the plan builder with the
  // mission's budget & objective, clears any in-progress plan, and jumps
  // the Planning Suite straight to the Builder tab.
  const applyMission = (mission) => {
    setActiveMission(mission);
    setActivePlanName(mission.name);
    setBudgetLakh(mission.budget);
    setPlanningObjective(mission.objective || 'holistic');
    setSelectedInterventions([]);
    setLatestSimulation(null);
    setOptimizerResult(null);
    setAppMode('planning');
    setIsPlanningDrawerOpen(true);
    setRequestedPlanningTab('builder');
    showToast(`Mission accepted: ${mission.title}`, 'success');
  };

  const clearMission = () => {
    setActiveMission(null);
  };

  // Panchayat Planning Tasks
  const addTask = (task) => {
    setTasks((prev) => [task, ...prev]);
    showToast(`Task created: "${task.title}"`, 'success');
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task removed', 'info');
  };

  // Run Simulation API call
  const runSimulation = async (customName = null) => {
    if (activeVillage.id !== 'PB-PAT-001' && !activeVillage.isPilot) {
      showToast(
        'The simulation Dijkstra engine is currently connected to the Patiala cadastral pilot village.',
        'warning'
      );
      return;
    }
    if (isOverBudget) {
      showToast(`Cannot simulate: Plan exceeds budget by ${Math.abs(remainingBudget)} lakh ₹`, 'error');
      return;
    }
    if (selectedInterventions.length === 0) {
      showToast('Select at least one task or intervention to run a simulation', 'warning');
      return;
    }

    setIsSimulating(true);
    try {
      const planName = customName || activePlanName || 'Custom Plan';
      const scenario = await api.createScenario(planName, budgetLakh, selectedInterventions);

      setLatestSimulation(scenario);
      const updatedScenarios = await api.listScenarios();
      setScenarios(updatedScenarios);

      showToast(`Simulation complete for "${planName}"!`, 'success');
      return scenario;
    } catch (err) {
      console.error('Simulation error:', err);
      showToast(err.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Run Optimizer API call
  const runOptimizer = async (customBudget = null) => {
    if (activeVillage.id !== 'PB-PAT-001' && !activeVillage.isPilot) {
      showToast(
        'The AI optimization engine is currently connected to the Patiala cadastral pilot village.',
        'warning'
      );
      return;
    }
    setIsOptimizing(true);
    const targetBudget = customBudget !== null ? customBudget : budgetLakh;
    try {
      const result = await api.optimize(targetBudget);
      setOptimizerResult(result);
      if (result.simulation) {
        setLatestSimulation({
          id: result.scenario_id,
          name: `AI Recommended (${targetBudget} lakh)`,
          budget_lakh: targetBudget,
          interventions: result.chosen_interventions,
          result: result.simulation,
        });
      }
      const updatedScenarios = await api.listScenarios();
      setScenarios(updatedScenarios);
      showToast(`AI Optimization completed for ${targetBudget}L budget`, 'success');
      return result;
    } catch (err) {
      console.error('Optimizer error:', err);
      showToast(err.message, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Reset scenarios
  const resetScenarios = async () => {
    try {
      await api.resetScenarios();
      setScenarios([]);
      setLatestSimulation(null);
      setOptimizerResult(null);
      showToast('All saved scenarios cleared', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const value = {
    appMode,
    setAppMode,
    hasChosenRole,
    chooseRole,
    viewMode,
    setViewMode,
    activeVillage,
    selectVillage,
    boundary,
    isBoundaryApproximate,
    isVillageSelectorOpen,
    setIsVillageSelectorOpen,
    elevationProfile,
    village,
    catalog,
    baselineMetrics,
    scenarios,
    reportedProblems,
    reportProblem,
    resolveProblem,
    deleteProblem,
    communityFeatures,
    addCommunityFeature,
    convertProblemToPlan,
    isReportProblemOpen,
    setIsReportProblemOpen,
    isAddFeatureOpen,
    setIsAddFeatureOpen,
    isThingsToFixOpen,
    setIsThingsToFixOpen,
    isPlanningDrawerOpen,
    setIsPlanningDrawerOpen,
    isSolarModalOpen,
    setIsSolarModalOpen,
    pickLocationMode,
    setPickLocationMode,
    selectedMapPoint,
    setSelectedMapPoint,
    focusedLocation,
    setFocusedLocation,
    activePlanName,
    setActivePlanName,
    budgetLakh,
    setBudgetLakh,
    planningObjective,
    setPlanningObjective,
    targetSchoolPct,
    setTargetSchoolPct,
    targetWaterPct,
    setTargetWaterPct,
    targetDrainagePct,
    setTargetDrainagePct,
    prioritizeZoneB,
    setPrioritizeZoneB,
    selectedInterventions,
    setSelectedInterventions,
    toggleIntervention,
    isInterventionSelected,
    clearPlan,
    missions: MISSIONS,
    activeMission,
    applyMission,
    clearMission,
    requestedPlanningTab,
    setRequestedPlanningTab,
    tasks,
    addTask,
    deleteTask,
    totalAllocated,
    remainingBudget,
    isOverBudget,
    latestSimulation,
    setLatestSimulation,
    optimizerResult,
    backendOnline,
    loading,
    isSimulating,
    isOptimizing,
    error,
    toast,
    showToast,
    loadVillageData,
    runSimulation,
    runOptimizer,
    resetScenarios,
  };

  return <VillageContext.Provider value={value}>{children}</VillageContext.Provider>;
}

export function useVillage() {
  const context = useContext(VillageContext);
  if (!context) {
    throw new Error('useVillage must be used within a VillageProvider');
  }
  return context;
}
