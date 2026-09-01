import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { MetricCard } from '../common/MetricCard';
import { ScoreGauge } from '../common/ScoreGauge';
import { BuildingImpactTable } from './BuildingImpactTable';
import { VillageMap } from '../map/VillageMap';
import { DigitalTwin3D } from '../twin3d/DigitalTwin3D';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitCompare,
  Hammer,
  GraduationCap,
  Droplets,
  Waves,
  Clock,
  Layers,
  Coins,
  Map as MapIcon,
  Box,
} from 'lucide-react';

export function SimulationResultView() {
  const {
    latestSimulation,
    village,
    baselineMetrics,
    setActiveTab,
    loadScenarioIntoSandbox,
  } = useVillage();

  const [viewMode, setViewMode] = useState('2d'); // '2d' | '3d'

  if (!latestSimulation || !latestSimulation.result) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-16 h-16 mx-auto flex items-center justify-center">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">No Active Simulation Results</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          You haven't simulated a development scenario yet. Go to the Planning Sandbox to allocate a budget, select interventions, and run a simulation.
        </p>
        <button
          onClick={() => setActiveTab('sandbox')}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow inline-flex items-center space-x-2"
        >
          <Hammer className="w-4 h-4" />
          <span>Open Planning Sandbox</span>
        </button>
      </div>
    );
  }

  const { name, budget_lakh, interventions, result } = latestSimulation;
  const metrics = result.metrics;
  const base = result.baseline_metrics || baselineMetrics;
  const delta = result.delta || {};
  const budget = result.budget;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner: Simulation Completed */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e1d2c] to-[#12283f] p-6 rounded-2xl border border-emerald-500/30 shadow-command">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulation Execution Verified</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Scenario Outcome: {name}
          </h2>
          <p className="text-xs text-slate-300">
            Dijkstra network accessibility and buffer radius recomputed with {interventions.length} applied capital intervention(s).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => loadScenarioIntoSandbox(latestSimulation)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1a2a40] text-cyan-300 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Hammer className="w-4 h-4" />
            <span>Edit Plan in Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Scenarios</span>
          </button>
        </div>
      </div>

      {/* Financial & Metric Score Card Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Composite Score Outcome Gauge */}
        <div className="lg:col-span-1">
          <ScoreGauge
            score={metrics?.composite_score}
            baselineScore={base?.composite_score}
            delta={delta?.composite_score}
            label="Simulated Score"
            size={130}
          />
        </div>

        {/* 4 Impact Metric Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="School Accessibility"
            value={metrics?.school_accessibility_pct}
            baselineValue={base?.school_accessibility_pct}
            delta={delta?.school_accessibility_pct}
            unit="%"
            icon={GraduationCap}
            weight={0.4}
            color="cyan"
            description="Proportion of village households within 8 min walk of school."
          />

          <MetricCard
            label="Clean Water Access"
            value={metrics?.water_access_pct}
            baselineValue={base?.water_access_pct}
            delta={delta?.water_access_pct}
            unit="%"
            icon={Droplets}
            weight={0.3}
            color="emerald"
            description="Households within 150m walking radius of active water points."
          />

          <MetricCard
            label="Drainage Coverage"
            value={metrics?.drainage_coverage_pct}
            baselineValue={base?.drainage_coverage_pct}
            delta={delta?.drainage_coverage_pct}
            unit="%"
            icon={Waves}
            weight={0.3}
            color="amber"
            description="Upgraded storm drainage and flood resilience coverage."
          />

          <MetricCard
            label="Avg School Travel Time"
            value={metrics?.avg_time_to_school_min}
            baselineValue={base?.avg_time_to_school_min}
            unit=" min"
            icon={Clock}
            color="purple"
            description="Mean travel time across all 10 surveyed households."
          />
        </div>
      </div>

      {/* Financial Ledger & Plan Summary */}
      <div className="bg-[#0e1624] p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Capital Budget Ledger
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              ₹{budget?.total_cost_lakh}L spent out of ₹{budget?.budget_lakh}L ceiling (₹{budget?.remaining_lakh}L unallocated)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {interventions.map((iv, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-[#131d2e] border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold"
            >
              {iv.type}: <span className="text-white">{iv.target}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Simulated 2D / 3D Visual Twin */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Simulated Infrastructure State</span>
          </div>

          <div className="flex items-center space-x-1 bg-[#0e1624] p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                viewMode === '2d'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D GIS View</span>
            </button>

            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Digital Twin</span>
            </button>
          </div>
        </div>

        {viewMode === '2d' ? (
          <VillageMap
            village={village}
            selectedInterventions={interventions}
            activeMetrics={metrics}
            baselineMetrics={base}
            height="440px"
            interactive={false}
          />
        ) : (
          <DigitalTwin3D
            village={village}
            selectedInterventions={interventions}
            activeMetrics={metrics}
            baselineMetrics={base}
            height="440px"
          />
        )}
      </div>

      {/* Per-Building Micro Impact Table */}
      <BuildingImpactTable
        baselineBuildings={base?.buildings || []}
        simulatedBuildings={metrics?.buildings || []}
      />
    </div>
  );
}
