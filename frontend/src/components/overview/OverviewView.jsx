import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { MetricCard } from '../common/MetricCard';
import { ScoreGauge } from '../common/ScoreGauge';
import { DataSourceBanner } from '../village/DataSourceBanner';
import { VillageMetaCard } from '../village/VillageMetaCard';
import { VillageMap } from '../map/VillageMap';
import { DigitalTwin3D } from '../twin3d/DigitalTwin3D';
import {
  GraduationCap,
  Droplets,
  Waves,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Box,
  Map as MapIcon,
  ListTodo,
} from 'lucide-react';

export function OverviewView() {
  const {
    village,
    activeVillage,
    boundary,
    isBoundaryApproximate,
    baselineMetrics,
    elevationProfile,
    setActiveTab,
  } = useVillage();
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'

  if (!village) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="font-mono text-sm">Loading village geospatial layers...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Data Source Transparency Banner */}
      <DataSourceBanner
        villageMeta={activeVillage}
        isBoundaryApproximate={isBoundaryApproximate}
      />

      {/* Village Metadata & Survey Card */}
      <VillageMetaCard villageMeta={activeVillage} elevationProfile={elevationProfile} />

      {/* Baseline KPI & Score Row (if baseline metrics available) */}
      {baselineMetrics && baselineMetrics.composite_score !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Composite Score Gauge */}
          <div className="lg:col-span-1">
            <ScoreGauge
              score={baselineMetrics.composite_score ?? 0}
              label="Baseline Score"
              size={130}
            />
          </div>

          {/* 4 Primary Indicators */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              label="School Accessibility"
              value={baselineMetrics.school_accessibility_pct ?? 0}
              unit="%"
              icon={GraduationCap}
              weight={baselineMetrics.score_weights?.school_access || 0.4}
              description="Households with walking time ≤ 8 min to Govt Primary School (Node N3)."
              color="cyan"
            />

            <MetricCard
              label="Clean Water Access"
              value={baselineMetrics.water_access_pct ?? 0}
              unit="%"
              icon={Droplets}
              weight={baselineMetrics.score_weights?.water_access || 0.3}
              description="Households located within 150m buffer of an active potable water point."
              color="emerald"
            />

            <MetricCard
              label="Drainage Coverage"
              value={baselineMetrics.drainage_coverage_pct ?? 0}
              unit="%"
              icon={Waves}
              weight={baselineMetrics.score_weights?.drainage || 0.3}
              description="Drainage infrastructure in Zone A and Zone B (both currently poor)."
              color="amber"
            />

            <MetricCard
              label="Avg School Travel Time"
              value={baselineMetrics.avg_time_to_school_min ?? 0}
              unit=" min"
              icon={Clock}
              description="Mean network travel time across all 10 surveyed village households."
              color="purple"
            />
          </div>
        </div>
      )}


      {/* Main Digital Twin & Map Area with Deficit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map / 3D Twin Viewport */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Village Digital Twin Viewport (ArcGIS Satellite Basemap)</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center space-x-1 bg-[#0e1624] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('2d')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === '2d'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>2D Satellite Map</span>
              </button>

              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  viewMode === '3d'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Digital Twin</span>
              </button>
            </div>
          </div>

          {/* Render Active Viewport */}
          {viewMode === '2d' ? (
            <VillageMap
              village={village}
              boundary={boundary}
              baselineMetrics={baselineMetrics}
              dataTier={activeVillage.dataTier}
              height="500px"
              interactive={false}
            />
          ) : (
            <DigitalTwin3D
              village={village}
              baselineMetrics={baselineMetrics}
              elevationProfile={elevationProfile}
              height="500px"
            />
          )}
        </div>

        {/* Right Col: Identified Planning Gaps & Quick Workflow Launcher */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Identified Infrastructure Deficits</span>
          </div>

          <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-3 shadow-command">
            {/* Deficit 1 */}
            <div className="p-3 rounded-xl bg-[#131d2e] border border-amber-500/20">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1">
                <span>Far Hamlet Access Crisis (Zone B)</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">
                  50% Unserved
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Households B5, B6, B7, B8, and B9 have walking times up to 23 minutes to the school due to road E5 degradation and missing corridor E6.
              </p>
            </div>

            {/* Deficit 2 */}
            <div className="p-3 rounded-xl bg-[#131d2e] border border-rose-500/20">
              <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-1">
                <span>Severe Water Deficit</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20">
                  80% Deficit
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Only one water point exists at Node N6. 8 of 10 households are outside the 150m walking radius.
              </p>
            </div>

            {/* Deficit 3 */}
            <div className="p-3 rounded-xl bg-[#131d2e] border border-cyan-500/20">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                <span>Zero Drainage Infrastructure</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20">
                  0% Coverage
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Both Zone A and Zone B lack stormwater drainage, creating heavy monsoon waterlogging risks.
              </p>
            </div>

            {/* Workflow Quick Links */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => setActiveTab('sandbox')}
                className="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-glow flex items-center justify-center space-x-2"
              >
                <span>Launch Planning Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('tasks')}
                className="w-full py-2 px-3 rounded-xl bg-[#131d2e] hover:bg-[#1a293e] text-cyan-300 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Manage Planning Tasks</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
