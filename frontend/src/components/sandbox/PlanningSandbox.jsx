import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { InterventionCard } from './InterventionCard';
import { BudgetTracker } from './BudgetTracker';
import { VillageMap } from '../map/VillageMap';
import {
  Hammer,
  Play,
  Trash2,
  Filter,
  CheckCircle,
  AlertTriangle,
  Sliders,
  ListTodo,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Toast';

export function PlanningSandbox() {
  const {
    village,
    catalog,
    boundary,
    baselineMetrics,
    selectedInterventions,
    toggleIntervention,
    isInterventionSelected,
    clearPlan,
    activePlanName,
    setActivePlanName,
    budgetLakh,
    setBudgetLakh,
    planningObjective,
    setPlanningObjective,
    totalAllocated,
    remainingBudget,
    isOverBudget,
    runSimulation,
    isSimulating,
    activeVillage,
    tasks,
    setActiveTab,
  } = useVillage();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeCatalogTab, setActiveCatalogTab] = useState('catalog'); // 'catalog' or 'tasks'
  const [showConfirmSim, setShowConfirmSim] = useState(false);

  const categories = [
    { id: 'all', label: 'All Interventions' },
    { id: 'road_upgrade', label: 'Road Upgrades' },
    { id: 'road_new', label: 'New Corridors' },
    { id: 'water_point', label: 'Water Points' },
    { id: 'drainage', label: 'Storm Drainage' },
  ];

  const filteredCatalog = catalog.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.type === activeCategory;
  });

  const handleStartSimulation = async () => {
    setShowConfirmSim(false);
    await runSimulation();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto">
      {/* Top Planning Header & Scenario Name */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1624]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-command">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                Panchayat Planning Mode
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-300">
                {activeVillage.name} ({activeVillage.district})
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <input
                type="text"
                value={activePlanName}
                onChange={(e) => setActivePlanName(e.target.value)}
                className="bg-transparent border-b border-dashed border-slate-700 hover:border-cyan-400 focus:border-cyan-400 focus:outline-none text-base font-bold text-white font-sans max-w-sm transition-colors"
                placeholder="Scenario Name (e.g. Monsoon Flood Defense)"
              />
            </div>
          </div>
        </div>

        {/* Quick Config & Task Links */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('config')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Config & Objectives</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
            <span>Planning Tasks ({tasks.length})</span>
          </button>
        </div>
      </div>

      {/* 3-Panel Main Planning Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Intervention Catalog & Tasks (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-4 shadow-command">
            {/* Catalog vs Tasks Switcher Tabs */}
            <div className="flex items-center space-x-1 bg-[#131d2e] p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveCatalogTab('catalog')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCatalogTab === 'catalog'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Catalog Items ({catalog.length})
              </button>
              <button
                onClick={() => setActiveCatalogTab('tasks')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCatalogTab === 'tasks'
                    ? 'bg-indigo-500 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Linked Tasks ({tasks.length})
              </button>
            </div>

            {activeCatalogTab === 'catalog' ? (
              <>
                {/* Category Filters */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                          : 'bg-[#131d2e] text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Catalog Cards Scroll Area */}
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredCatalog.map((item) => (
                    <InterventionCard
                      key={`${item.type}:${item.target}`}
                      item={item}
                      isSelected={isInterventionSelected(item)}
                      onToggle={() => toggleIntervention(item)}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Linked Tasks Quick Selector */
              <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                {tasks.map((task) => {
                  const isFunded =
                    task.linkedIntervention &&
                    isInterventionSelected(task.linkedIntervention);

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isFunded
                          ? 'bg-[#132238] border-cyan-500/40'
                          : 'bg-[#131d2e] border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-white">{task.title}</div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 flex-shrink-0">
                          ₹{task.budgetLakh}L
                        </span>
                      </div>

                      {task.linkedIntervention && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {task.linkedIntervention.label}
                          </span>
                          <button
                            onClick={() => toggleIntervention(task.linkedIntervention)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isFunded
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                            }`}
                          >
                            {isFunded ? 'Included in Plan' : '+ Fund Task'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Interactive Satellite GIS Map (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Spatial Placement & Cadastre Map</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              Click roads or junctions to toggle
            </span>
          </div>

          <VillageMap
            village={village}
            boundary={boundary}
            selectedInterventions={selectedInterventions}
            baselineMetrics={baselineMetrics}
            dataTier={activeVillage.dataTier}
            onToggleIntervention={toggleIntervention}
            height="560px"
            interactive={true}
          />
        </div>

        {/* Right Column: Real-time Budget Engine & Selected Queue (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <BudgetTracker
            budgetLakh={budgetLakh}
            onBudgetChange={setBudgetLakh}
            totalAllocated={totalAllocated}
            remainingBudget={remainingBudget}
            isOverBudget={isOverBudget}
            selectedCount={selectedInterventions.length}
          />

          {/* Selected Interventions Queue */}
          <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-3 shadow-command">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-white">Active Plan Queue</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                  {selectedInterventions.length}
                </span>
              </div>
              {selectedInterventions.length > 0 && (
                <button
                  onClick={clearPlan}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {selectedInterventions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <Layers className="w-7 h-7 mx-auto text-slate-600 opacity-60" />
                <p className="text-xs">No interventions selected yet.</p>
                <p className="text-[10px] text-slate-600">
                  Pick items from catalog or click on roads/nodes in the satellite map.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedInterventions.map((item) => (
                  <div
                    key={`${item.type}:${item.target}`}
                    className="p-2 rounded-xl bg-[#131d2e] border border-slate-800 flex items-center justify-between text-xs group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white truncate text-[11px]">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono font-bold">
                        ₹{item.cost_lakh}L
                      </div>
                    </div>
                    <button
                      onClick={() => toggleIntervention(item)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Run Simulation Primary CTA */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowConfirmSim(true)}
                disabled={
                  isSimulating ||
                  isOverBudget ||
                  selectedInterventions.length === 0 ||
                  (activeVillage.id !== 'PB-PAT-001' && !activeVillage.isPilot)
                }
                className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-glow flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isSimulating ? 'Simulating Graph Routing...' : 'RUN SIMULATION'}</span>
              </button>

              {activeVillage.id !== 'PB-PAT-001' && !activeVillage.isPilot && (
                <p className="text-[10px] text-amber-400/90 text-center mt-2 leading-tight">
                  Note: Live network graph simulation is active on the Patiala Pilot village.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Simulation Confirmation Modal */}
      <Modal
        isOpen={showConfirmSim}
        onClose={() => setShowConfirmSim(false)}
        title="Execute Rural Planning Simulation"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#131d2e] border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Scenario Name:</span>
              <span className="font-bold text-white">{activePlanName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Budget:</span>
              <span className="font-mono text-cyan-400 font-bold">₹{budgetLakh} Lakh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Plan Cost:</span>
              <span className="font-mono text-emerald-400 font-bold">₹{totalAllocated} Lakh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Interventions Included:</span>
              <span className="font-bold text-white">{selectedInterventions.length} items</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            GramVerse will execute real Dijkstra shortest-path network routing across the village graph to evaluate impact on school travel time, water buffer coverage, and drainage.
          </p>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setShowConfirmSim(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartSimulation}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 shadow-glow transition-all flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Confirm & Simulate</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
