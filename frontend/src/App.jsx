import React from 'react';
import { VillageProvider, useVillage } from './context/VillageContext';
import { AppHeader } from './components/layout/AppHeader';
import { MapViewport } from './components/exploration/MapViewport';
import { AddFeatureModal } from './components/community/AddFeatureModal';
import { ReportProblemModal } from './components/community/ReportProblemModal';
import { ThingsToFixDrawer } from './components/community/ThingsToFixDrawer';
import { PlanningDrawer } from './components/planning/PlanningDrawer';
import { Toast } from './components/common/Toast';
import { RoleSelector } from './components/onboarding/RoleSelector';
import { RewardCelebrationModal } from './components/resident/RewardCelebrationModal';
import { WifiOff, RefreshCw } from 'lucide-react';

function AppContent() {
  const {
    loading,
    error,
    backendOnline,
    loadVillageData,
    activeVillage,
    toast,
    appMode,
    hasChosenRole,
    isAddFeatureOpen,
    setIsAddFeatureOpen,
    isReportProblemOpen,
    setIsReportProblemOpen,
    isThingsToFixOpen,
    setIsThingsToFixOpen,
    isPlanningDrawerOpen,
    setIsPlanningDrawerOpen,
    activeRewardModal,
    setActiveRewardModal,
  } = useVillage();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#080c14] text-slate-300 space-y-4 font-sans">
        <div className="w-12 h-12 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-glow" />
        <div className="text-center">
          <h3 className="font-bold text-base text-white font-mono">
            Locating {activeVillage.name}...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Loading satellite imagery and geospatial cadastral vectors
          </p>
        </div>
      </div>
    );
  }

  if (error && !backendOnline) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center p-8 bg-[#080c14] text-center max-w-md mx-auto space-y-4 font-sans">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <WifiOff className="w-10 h-10 mx-auto" />
        </div>
        <h3 className="text-base font-bold text-white">Backend Connection Offline</h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">{error}</p>
        <button
          onClick={() => loadVillageData(activeVillage)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-glow transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // First-ever visit: select starting mode
  if (!hasChosenRole) {
    return <RoleSelector />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#080c14] text-slate-100 font-sans">
      <AppHeader />

      {/* Universal 3D Sandbox World & GIS Viewport for Both Modes */}
      <main className="flex-1 relative overflow-hidden">
        <MapViewport />
      </main>

      {/* Community Interaction Modals */}
      <AddFeatureModal
        isOpen={isAddFeatureOpen}
        onClose={() => setIsAddFeatureOpen(false)}
      />

      <ReportProblemModal
        isOpen={isReportProblemOpen}
        onClose={() => setIsReportProblemOpen(false)}
      />

      {/* Citizen Requests Drawer (Things to Fix) */}
      <ThingsToFixDrawer
        isOpen={isThingsToFixOpen}
        onClose={() => setIsThingsToFixOpen(false)}
      />

      {/* Planning Suite & AI Simulation Drawer */}
      <PlanningDrawer
        isOpen={isPlanningDrawerOpen}
        onClose={() => setIsPlanningDrawerOpen(false)}
      />

      {/* Gamification Reward Celebration Modal */}
      <RewardCelebrationModal
        reward={activeRewardModal}
        onClose={() => setActiveRewardModal(null)}
      />

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={() => {}} />
    </div>
  );
}

export default function App() {
  return (
    <VillageProvider>
      <AppContent />
    </VillageProvider>
  );
}
