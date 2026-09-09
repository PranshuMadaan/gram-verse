import React from 'react';
import { useVillage } from '../../context/VillageContext';
import {
  Coins,
  MapPin,
  Users,
  HardHat,
  Gamepad2,
  Sparkles,
  Award,
  Layers,
  Box,
  Map as MapIcon,
  Wifi,
  WifiOff,
} from 'lucide-react';

export function AppHeader() {
  const {
    activeVillage,
    budgetLakh,
    totalAllocated,
    remainingBudget,
    isOverBudget,
    backendOnline,
    appMode,
    setAppMode,
    selectVillage,
    playerProfile,
    viewMode,
    setViewMode,
  } = useVillage();

  const [isVillageMenuOpen, setIsVillageMenuOpen] = React.useState(false);
  const isResidentMode = appMode === 'simple';

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0a0f19]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 gap-3 select-none">
      {/* Left: Brand & Village Info with Dropdown Switcher */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl border shadow-glow transition-all ${
            isResidentMode
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
          }`}>
            {isResidentMode ? <Gamepad2 className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm text-white tracking-wide">GramVerse</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                isResidentMode
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
              }`}>
                {isResidentMode ? 'Resident Quest' : 'GIS Planner'}
              </span>
            </div>

            {/* Interactive Village Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsVillageMenuOpen(!isVillageMenuOpen)}
                className="flex items-center space-x-1 text-[11px] text-slate-300 hover:text-cyan-300 font-mono transition-colors group cursor-pointer"
                title="Click to switch village"
              >
                <MapPin className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold underline decoration-dotted decoration-slate-600 underline-offset-2">{activeVillage.name}</span>
                <span className="text-slate-500">({activeVillage.district})</span>
                <span className="text-[9px] text-cyan-400 ml-0.5">▼</span>
              </button>

              {/* Village Selection Dropdown Popover */}
              {isVillageMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsVillageMenuOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-[#0c1322]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                      <span>Select Cadastral Village</span>
                      <span className="text-slate-500 font-normal">2 in database</span>
                    </div>

                    <button
                      onClick={() => {
                        const kalyan = {
                          id: 'PB-PAT-001',
                          name: 'Kalyan (Pilot Village)',
                          district: 'Patiala',
                          state: 'Punjab',
                          center: [30.3695, 76.3775],
                          zoom: 16,
                          isPilot: true,
                        };
                        selectVillage(kalyan);
                        setIsVillageMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col ${
                        activeVillage.id === 'PB-PAT-001'
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                          : 'bg-[#10192a]/80 border-slate-800 text-slate-300 hover:bg-[#152238] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">Kalyan (Pilot Village)</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Drone 3D Active
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Patiala Rural · 10 Homesteads · School (N3)
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        const gharuan = {
                          id: 'PB-SAS-002',
                          name: 'Gharuan (Smart Hub)',
                          district: 'SAS Nagar (Mohali)',
                          state: 'Punjab',
                          center: [30.7046, 76.5754],
                          zoom: 16,
                          isPilot: true,
                        };
                        selectVillage(gharuan);
                        setIsVillageMenuOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col ${
                        activeVillage.id === 'PB-SAS-002'
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                          : 'bg-[#10192a]/80 border-slate-800 text-slate-300 hover:bg-[#152238] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">Gharuan (Smart Hub)</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          Drone 3D Active
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        SAS Nagar / Mohali · 12 Haveli Households · Gurdwara
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Live Mode Specific Counters */}
      <div className="hidden md:flex items-center space-x-3">
        {isResidentMode ? (
          /* Resident Game HUD Mini Stats */
          <div className="flex items-center space-x-3 bg-[#111927] px-4 py-1.5 rounded-2xl border border-amber-500/20 shadow-sm">
            <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lvl {playerProfile?.level || 1}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5 text-xs font-mono">
              <span className="text-slate-400">XP:</span>
              <span className="font-bold text-cyan-400">{playerProfile?.xp || 0} / {playerProfile?.xpToNextLevel || 500}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1.5 text-xs font-mono text-amber-300 font-bold">
              <span>🪙 {playerProfile?.coins || 0} Karma</span>
            </div>
          </div>
        ) : (
          /* Planning Professional Budget Counter */
          <div className="flex items-center space-x-3 bg-[#111927] px-4 py-1.5 rounded-2xl border border-slate-800 shadow-sm">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex items-center space-x-3 text-xs font-mono">
              <div>
                <span className="text-slate-400">Budget: </span>
                <span className="font-bold text-white">₹{budgetLakh}L</span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                <span className="text-slate-400">Allocated: </span>
                <span className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-cyan-400'}`}>
                  ₹{totalAllocated}L
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <div>
                <span className="text-slate-400">Rem: </span>
                <span className={`font-bold ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{remainingBudget}L
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Mode Switcher & Backend Health */}
      <div className="flex items-center space-x-2.5">
        {/* Switch Between 2D and 3D in Planner Mode */}
        {!isResidentMode && (
          <div className="hidden sm:flex items-center bg-[#0e1624] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '2d'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>2D Drone</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>3D Twin</span>
            </button>
          </div>
        )}

        {/* Primary Role / Mode Switcher Pill */}
        <div className="flex items-center bg-[#0e1624] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setAppMode('simple')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isResidentMode
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Resident Mode</span>
          </button>

          <button
            onClick={() => setAppMode('planning')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isResidentMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Planner Mode</span>
          </button>
        </div>

        {/* Backend Heartbeat */}
        <div
          className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
            backendOnline
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
          title={backendOnline ? 'FastAPI Dijkstra Engine Connected' : 'Backend Offline'}
        >
          {backendOnline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">FastAPI Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
