import React from 'react';
import { useVillage } from '../../context/VillageContext';
import { VillageMap } from '../map/VillageMap';
import { DigitalTwin3D } from '../twin3d/DigitalTwin3D';
import { VillageSearchBar } from '../search/VillageSearchBar';
import { DataSourceBadge } from '../village/DataSourceBadge';
import {
  MapPin,
  Layers,
  Box,
  Map as MapIcon,
  Plus,
  AlertCircle,
  ListTodo,
  Hammer,
  Sliders,
  Users,
  ShieldCheck,
} from 'lucide-react';

export function MapViewport() {
  const {
    village,
    activeVillage,
    boundary,
    baselineMetrics,
    selectedInterventions,
    toggleIntervention,
    reportedProblems,
    resolveProblem,
    convertProblemToPlan,
    communityFeatures,
    viewMode,
    setViewMode,
    appMode,
    setAppMode,
    elevationProfile,
    isReportProblemOpen,
    setIsReportProblemOpen,
    isAddFeatureOpen,
    setIsAddFeatureOpen,
    isThingsToFixOpen,
    setIsThingsToFixOpen,
    isPlanningDrawerOpen,
    setIsPlanningDrawerOpen,
    pickLocationMode,
    setPickLocationMode,
    setSelectedMapPoint,
    focusedLocation,
    setIsVillageSelectorOpen,
  } = useVillage();

  const handlePickLocation = (coords) => {
    setSelectedMapPoint(coords);
    if (pickLocationMode === 'problem') {
      setPickLocationMode(null);
      setIsReportProblemOpen(true);
    } else if (pickLocationMode === 'feature') {
      setPickLocationMode(null);
      setIsAddFeatureOpen(true);
    }
  };

  const openProblemsCount = reportedProblems.filter((p) => p.status === 'open').length;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[#080c14] select-none">
      {/* 2D Satellite Hero Map or 3D Digital Twin */}
      {viewMode === '2d' ? (
        <VillageMap
          village={village}
          boundary={boundary}
          selectedInterventions={selectedInterventions}
          baselineMetrics={baselineMetrics}
          dataTier={activeVillage.dataTier}
          reportedProblems={reportedProblems}
          communityFeatures={communityFeatures}
          pickLocationMode={pickLocationMode}
          onPickLocation={handlePickLocation}
          focusedLocation={focusedLocation}
          onToggleIntervention={toggleIntervention}
          onResolveProblem={resolveProblem}
          onAddToPlan={convertProblemToPlan}
          height="100%"
          interactive={true}
        />
      ) : (
        <DigitalTwin3D
          village={village}
          baselineMetrics={baselineMetrics}
          selectedInterventions={selectedInterventions}
          elevationProfile={elevationProfile}
          height="100%"
        />
      )}

      {/* Top Floating Control Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[420] pointer-events-none flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Floating Search Bar */}
        <div className="pointer-events-auto w-full md:w-96">
          <VillageSearchBar placeholder="Search Indian village, district, or PIN..." />
        </div>

        {/* Center: Village Identity & Data Mode Pill */}
        <div className="pointer-events-auto hidden lg:flex items-center space-x-2.5 bg-[#0b111c]/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-800 shadow-command">
          <button
            onClick={() => setIsVillageSelectorOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-bold text-white hover:text-cyan-400 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeVillage.name}</span>
            <span className="text-slate-500 font-normal">
              ({activeVillage.district}, {activeVillage.state})
            </span>
          </button>
          <span className="text-slate-600">|</span>
          <DataSourceBadge tier={activeVillage.dataTier} size="xs" />
        </div>

        {/* Right: 2D/3D & Mode Switchers */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {/* 2D vs 3D Dimension Toggle */}
          <div className="flex items-center space-x-1 bg-[#0e1624]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '2d'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D Satellite</span>
            </button>

            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Twin</span>
            </button>
          </div>

          {/* Simple / Community vs Planning Mode Toggle */}
          <div className="flex items-center space-x-1 bg-[#0e1624]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => setAppMode('simple')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                appMode === 'simple'
                  ? 'bg-indigo-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>

            <button
              onClick={() => {
                setAppMode('planning');
                setIsPlanningDrawerOpen(true);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                appMode === 'planning'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Planning Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center Floating Action Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[420] pointer-events-auto flex items-center space-x-3 bg-[#0b111c]/95 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
        <button
          onClick={() => setIsAddFeatureOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1c2a3f] text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>+ Add / Correct Place</span>
        </button>

        <button
          onClick={() => setIsReportProblemOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm"
        >
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Report Problem</span>
        </button>

        <button
          onClick={() => setIsThingsToFixOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm"
        >
          <ListTodo className="w-4 h-4 text-amber-400" />
          <span>Things to Fix ({openProblemsCount})</span>
        </button>

        {appMode === 'planning' && (
          <button
            onClick={() => setIsPlanningDrawerOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-glow"
          >
            <Sliders className="w-4 h-4" />
            <span>Open Planning Suite</span>
          </button>
        )}
      </div>
    </div>
  );
}
