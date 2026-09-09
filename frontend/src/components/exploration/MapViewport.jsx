import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { VillageMap } from '../map/VillageMap';
import { DigitalTwin3D } from '../twin3d/DigitalTwin3D';
import { SandboxGameHUD } from '../resident/SandboxGameHUD';
import { CitizenQuestDrawer } from '../resident/CitizenQuestDrawer';
import { SimpleRequestModal } from '../community/SimpleRequestModal';
import {
  MapPin,
  Box,
  Map as MapIcon,
  ListTodo,
  Sliders,
  Play,
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
    elevationProfile,
    isReportProblemOpen,
    setIsReportProblemOpen,
    isThingsToFixOpen,
    setIsThingsToFixOpen,
    isPlanningDrawerOpen,
    setIsPlanningDrawerOpen,
    pickLocationMode,
    setPickLocationMode,
    setSelectedMapPoint,
    focusedLocation,
    setFocusedLocation,
    runSimulation,
    isSimulating,
  } = useVillage();

  const isResidentMode = appMode === 'simple';
  const [isQuestDrawerOpen, setIsQuestDrawerOpen] = useState(false);
  const [activeBountyContext, setActiveBountyContext] = useState(null);
  const [isResidentReportModalOpen, setIsResidentReportModalOpen] = useState(false);

  const handlePickLocation = (coords) => {
    setSelectedMapPoint(coords);
    if (pickLocationMode === 'problem') {
      setPickLocationMode(null);
      setIsReportProblemOpen(true);
    }
  };

  const handle3DObjectClick = (entity) => {
    if (isResidentMode && entity?.name) {
      let category = 'other';
      const n = (entity.name || '').toLowerCase();
      const t = (entity.type || '').toLowerCase();
      if (n.includes('water') || n.includes('well') || t.includes('water')) {
        category = 'water';
      } else if (n.includes('road') || t.includes('road')) {
        category = 'road';
      } else if (n.includes('drain') || t.includes('drain')) {
        category = 'drainage';
      }

      setActiveBountyContext({
        id: `bounty-${Date.now()}`,
        title: `Audit ${entity.name}`,
        category,
        description: `Surveying physical condition and accessibility of ${entity.name} (${entity.type || 'Structure'}).`,
        location: entity.name,
      });
      setIsResidentReportModalOpen(true);
    }
  };

  const openProblemsCount = reportedProblems.filter((p) => p.status === 'open').length;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[#080c14] select-none">
      {/* 2D Satellite Hero Map or 3D Digital Twin Sandbox */}
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
          onObjectClick={handle3DObjectClick}
        />
      )}

      {/* OVERLAY 1: VILLAGE RESIDENT MODE (3D Sandbox Game HUD) */}
      {isResidentMode ? (
        <>
          <SandboxGameHUD
            onOpenReportModal={(bounty) => {
              setActiveBountyContext(bounty);
              setIsResidentReportModalOpen(true);
            }}
            onOpenQuestDrawer={() => setIsQuestDrawerOpen(true)}
            onFocusBounty={(bounty) => {
              if (bounty?.coords) {
                setFocusedLocation(bounty.coords);
              }
            }}
          />

          <CitizenQuestDrawer
            isOpen={isQuestDrawerOpen}
            onClose={() => setIsQuestDrawerOpen(false)}
            onStartBounty={(bounty) => {
              setActiveBountyContext(bounty);
              if (bounty.coords) {
                setSelectedMapPoint({ lat: bounty.coords[0], lon: bounty.coords[1] });
                setFocusedLocation(bounty.coords);
              }
              setIsResidentReportModalOpen(true);
            }}
          />

          <SimpleRequestModal
            isOpen={isResidentReportModalOpen}
            onClose={() => {
              setIsResidentReportModalOpen(false);
              setActiveBountyContext(null);
            }}
            mode="problem"
            bountyContext={activeBountyContext}
          />
        </>
      ) : (
        /* OVERLAY 2: PLANNING PROFESSIONAL MODE (GIS & AI Simulation) */
        <>
          {/* Top Floating GIS Information Bar */}
          <div className="absolute top-4 left-4 right-4 z-[420] pointer-events-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Left: Village GIS & Cadastral Status */}
            <div className="pointer-events-auto flex items-center space-x-2 bg-[#0b111c]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-command">
              <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>{activeVillage.name} Cadastral Survey</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    Drone GIS Tier 1
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  10 Homesteads · 2 Zones · School (N3) · Water Points
                </div>
              </div>
            </div>

            {/* Right: 2D vs 3D Dimension Switcher */}
            <div className="pointer-events-auto flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-[#0e1624]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === '2d'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>2D Drone</span>
                </button>

                <button
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === '3d'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Twin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Center Floating Action Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[420] pointer-events-auto flex items-center space-x-2.5 bg-[#0b111c]/95 backdrop-blur-xl p-2 rounded-2xl border border-slate-800 shadow-2xl">
            {/* Citizen Requests Queue Button */}
            <button
              onClick={() => setIsThingsToFixOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              title="Review all citizen-reported issues from resident mode"
            >
              <ListTodo className="w-4 h-4 text-amber-400" />
              <span>Citizen Requests ({openProblemsCount})</span>
            </button>

            {/* Planning Suite Drawer Button */}
            <button
              onClick={() => setIsPlanningDrawerOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-glow"
            >
              <Sliders className="w-4 h-4" />
              <span>Open Planning Suite</span>
            </button>

            {/* Quick Simulation Trigger */}
            {selectedInterventions.length > 0 && (
              <button
                onClick={() => runSimulation()}
                disabled={isSimulating}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-glow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
