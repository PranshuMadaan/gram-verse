import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VillageProvider, useVillage } from './context/VillageContext';
import { AppHeader } from './components/layout/AppHeader';
import { MapViewport } from './components/exploration/MapViewport';
import { AddFeatureModal } from './components/community/AddFeatureModal';
import { ReportProblemModal } from './components/community/ReportProblemModal';
import { ThingsToFixDrawer } from './components/community/ThingsToFixDrawer';
import { PlanningDrawer } from './components/planning/PlanningDrawer';
import { SolarSDGModal } from './components/solar/SolarSDGModal';
import { LoginModal } from './components/auth/LoginModal';
import { UserProfileDrawer } from './components/auth/UserProfileDrawer';
import { Toast } from './components/common/Toast';
import { RoleSelector } from './components/onboarding/RoleSelector';
import { VillagerHome } from './components/community/VillagerHome';
import { WifiOff, RefreshCw } from 'lucide-react';

function AppContent() {
  const { isLoginModalOpen, setIsLoginModalOpen, isProfileDrawerOpen, setIsProfileDrawerOpen } = useAuth();
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
    isSolarModalOpen,
    setIsSolarModalOpen,
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

  // First-ever visit: ask whether this is a villager or a planning official
  // before showing either experience.
  if (!hasChosenRole) {
    return <RoleSelector />;
  }

  // Villager Mode: a deliberately separate, much simpler screen — no map
  // chrome, no technical jargon, no budget/simulation tools.
  if (appMode === 'simple') {
    return <VillagerHome />;
  }

  // Planning Official Mode: the full digital twin + planning suite.
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#080c14] text-slate-100 font-sans">
      <AppHeader />

      {/* Main Full-Viewport Google-Maps-Style Exploration */}
      <main className="flex-1 relative overflow-hidden">
        <MapViewport />
      </main>

      {/* Authentication Modals & Drawers */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
      />

      {/* Community Interaction Modals */}
      <AddFeatureModal
        isOpen={isAddFeatureOpen}
        onClose={() => setIsAddFeatureOpen(false)}
      />

      <ReportProblemModal
        isOpen={isReportProblemOpen}
        onClose={() => setIsReportProblemOpen(false)}
      />

      {/* Slide-out Drawers */}
      <ThingsToFixDrawer
        isOpen={isThingsToFixOpen}
        onClose={() => setIsThingsToFixOpen(false)}
      />

      <PlanningDrawer
        isOpen={isPlanningDrawerOpen}
        onClose={() => setIsPlanningDrawerOpen(false)}
      />

      <SolarSDGModal
        isOpen={isSolarModalOpen}
        onClose={() => setIsSolarModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={() => {}} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VillageProvider>
        <AppContent />
      </VillageProvider>
    </AuthProvider>
  );
}
