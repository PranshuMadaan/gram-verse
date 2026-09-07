import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVillage } from '../../context/VillageContext';
import { VillageSearchBar } from '../search/VillageSearchBar';
import { VillageSelectorModal } from '../village/VillageSelectorModal';
import {
  MapPin,
  Coins,
  Play,
  Wifi,
  WifiOff,
  User,
  ShieldCheck,
  Landmark,
  Sun,
} from 'lucide-react';

export function AppHeader() {
  const { user, isAuthenticated, setIsLoginModalOpen, setIsProfileDrawerOpen } = useAuth();
  const {
    activeVillage,
    selectVillage,
    isVillageSelectorOpen,
    setIsVillageSelectorOpen,
    budgetLakh,
    totalAllocated,
    remainingBudget,
    isOverBudget,
    backendOnline,
    appMode,
    setIsSolarModalOpen,
  } = useVillage();

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-[#0b111c]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 gap-3 select-none">
        {/* Left: Brand & Village Search */}
        <div className="flex items-center space-x-3 flex-1 max-w-xl">
          <div className="flex items-center space-x-2 mr-1 flex-shrink-0">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xs text-white tracking-wide">GramVerse</span>
              <span className="ml-1 text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                SIH1704
              </span>
            </div>
          </div>

          <div className="w-full">
            <VillageSearchBar />
          </div>

          <button
            onClick={() => setIsVillageSelectorOpen(true)}
            className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#131d2e] hover:bg-[#1a283e] border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all flex-shrink-0"
            title="Browse All Indian States & Districts"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Directory</span>
          </button>
        </div>

        {/* Center: Live Budget Counter (in Planning Mode) */}
        {appMode === 'planning' && (
          <div className="hidden md:flex items-center space-x-3 bg-[#0e1624] px-3.5 py-1.5 rounded-xl border border-slate-800 flex-shrink-0">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex items-center space-x-2.5 text-xs font-mono">
              <div>
                <span className="text-slate-400">Budget: </span>
                <span className="font-bold text-white">₹{budgetLakh}L</span>
              </div>
              <span className="text-slate-600">|</span>
              <div>
                <span className="text-slate-400">Allocated: </span>
                <span className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-cyan-400'}`}>
                  ₹{totalAllocated}L
                </span>
              </div>
              <span className="text-slate-600">|</span>
              <div>
                <span className="text-slate-400">Rem: </span>
                <span className={`font-bold ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ₹{remainingBudget}L
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right: Solar Case Study, User Authentication Profile & Backend Status */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          {/* SDG 7 Solar Microgrid Action Button */}
          <button
            onClick={() => setIsSolarModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-glow flex-shrink-0 animate-pulse"
            title="Open SDG 7 Solar Transition Case Study & Financial Model"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>☀️ Solar Case Study</span>
          </button>

          {/* User Profile / Login Button */}
          {isAuthenticated && user ? (
            <button
              onClick={() => setIsProfileDrawerOpen(true)}
              className="flex items-center space-x-2 p-1.5 pr-3 rounded-2xl bg-[#131d2e] hover:bg-[#1a283e] border border-cyan-500/30 text-left transition-all shadow-sm group"
              title="Open User Profile & Saved Records"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-xl object-cover border border-cyan-400/50"
              />
              <div className="hidden xl:block min-w-0">
                <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 truncate max-w-[130px]">
                  {user.name.split(' ')[0]}
                </div>
                <div className="text-[9px] font-mono text-cyan-400 truncate">
                  {user.role}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Backend Status Heartbeat */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
              backendOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
            title={backendOnline ? 'Connected to FastAPI Backend' : 'Backend Offline'}
          >
            {backendOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">FastAPI Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span className="font-semibold">Offline</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Village Directory Modal */}
      <VillageSelectorModal
        isOpen={isVillageSelectorOpen}
        onClose={() => setIsVillageSelectorOpen(false)}
        activeVillageId={activeVillage.id}
        onSelectVillage={selectVillage}
      />
    </>
  );
}
