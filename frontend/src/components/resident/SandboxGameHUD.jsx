import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import {
  Gamepad2,
  Sparkles,
  Coins,
  Award,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  X,
  Target,
  Trophy,
  HelpCircle,
} from 'lucide-react';

export function SandboxGameHUD({ onOpenReportModal, onOpenQuestDrawer, onFocusBounty }) {
  const {
    playerProfile,
    reportedProblems,
    activeVillage,
  } = useVillage();

  const [isTipDismissed, setIsTipDismissed] = useState(false);

  const xpPercent = Math.min(
    100,
    Math.round(((playerProfile?.xp || 0) / (playerProfile?.xpToNextLevel || 500)) * 100)
  );

  const activeReportsCount = reportedProblems.filter(p => p.status === 'open').length;

  return (
    <div className="absolute inset-0 pointer-events-none z-[410] flex flex-col justify-between p-4 select-none">
      {/* TOP BAR: Player HUD Stats & Quest Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Avatar, Level, and XP Bar */}
        <div className="pointer-events-auto flex items-center space-x-3 bg-[#0a0f19]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#080d18] rounded-[10px] flex items-center justify-center text-amber-400">
                <Gamepad2 className="w-6 h-6" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px] font-mono shadow">
              LVL {playerProfile?.level || 1}
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-white">
                {playerProfile?.name || 'Village Resident'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Guardian
              </span>
            </div>

            {/* Animated XP Progress */}
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800/90 overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-300">
                {playerProfile?.xp || 0}/{playerProfile?.xpToNextLevel || 500} XP
              </span>
            </div>
          </div>
        </div>

        {/* Right: Currency & Quest Button */}
        <div className="pointer-events-auto flex items-center space-x-2.5">
          {/* Karma / Coins Display */}
          <div className="flex items-center space-x-2 bg-[#0a0f19]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-500/30 text-amber-300 shadow-md">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 font-mono font-bold uppercase">Village Karma</div>
              <div className="text-xs font-black text-amber-300 font-mono">
                {playerProfile?.coins || 0} pts
              </div>
            </div>
          </div>

          {/* Badges Count */}
          <div className="hidden sm:flex items-center space-x-2 bg-[#0a0f19]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-purple-500/30 text-purple-300 shadow-md">
            <Award className="w-4 h-4 text-purple-400" />
            <div className="text-left">
              <div className="text-[9px] text-slate-400 font-mono font-bold uppercase">Badges</div>
              <div className="text-xs font-black text-purple-300 font-mono">
                {playerProfile?.badges?.length || 0}
              </div>
            </div>
          </div>

          {/* Quests & Bounties Drawer Trigger */}
          <button
            onClick={onOpenQuestDrawer}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3.5 py-2 rounded-2xl font-bold text-xs shadow-glow transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>Citizen Quests</span>
          </button>
        </div>
      </div>

      {/* FLOATING MIDDLE HINT: Sandbox Guidance */}
      {!isTipDismissed && (
        <div className="pointer-events-auto self-start max-w-sm mt-4 bg-[#0a0f19]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 shadow-command transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Sandbox Explorer</span>
            </div>
            <button
              onClick={() => setIsTipDismissed(true)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Rotate & zoom the 3D village twin! Click on buildings, roads, or water points to inspect them or report an issue to earn XP and Karma rewards.
          </p>
        </div>
      )}

      {/* BOTTOM ACTION BAR: Report Action & Active Quest Tracker */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Active Bounties Quick Tracker */}
        <div
          onClick={onOpenQuestDrawer}
          className="pointer-events-auto cursor-pointer flex items-center space-x-3 bg-[#0a0f19]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all shadow-md"
        >
          <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-mono font-bold tracking-wider flex items-center space-x-1.5">
              <span>Active Objective</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-xs font-bold text-white">
              Inspect East Road & Water Points
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Primary Bottom Action: Quick Report Issue */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <button
            onClick={() => onOpenReportModal(null)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Report Village Issue (+XP)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
