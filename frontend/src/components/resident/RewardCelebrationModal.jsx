import React from 'react';
import { Trophy, Award, Sparkles, Coins, Star, ArrowRight, ShieldCheck } from 'lucide-react';

export function RewardCelebrationModal({ reward, onClose }) {
  if (!reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#151c2c] via-[#0d1424] to-[#090d18] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(251,191,36,0.3)] animate-in zoom-in-95 duration-300">
        {/* Glow effect behind icon */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500/30 rounded-full blur-xl pointer-events-none" />

        {/* Top Trophy Icon */}
        <div className="relative w-20 h-20 mx-auto -mt-14 mb-4 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-[#0e1626] rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Celebration Title */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            {reward.questTitle ? 'Bounty Completed!' : 'Report Verified!'}
          </span>
          <h2 className="text-2xl font-black text-white tracking-wide mt-2">
            Village Reward Claimed!
          </h2>
          <p className="text-xs text-slate-300">
            {reward.message || 'Thank you for reporting! The planning team has received your geo-tagged issue.'}
          </p>
        </div>

        {/* Rewards Box */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-3.5 rounded-2xl bg-[#131c2e] border border-cyan-500/30 flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Experience</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              +{reward.xp || 100} <span className="text-xs font-normal">XP</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#131c2e] border border-amber-500/30 flex flex-col items-center justify-center space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400">
              <Coins className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Village Karma</span>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              +{reward.coins || 50} <span className="text-xs font-normal">pts</span>
            </div>
          </div>
        </div>

        {/* Level up or Badge Unlocked */}
        {reward.badge && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 border border-purple-500/40 mb-6 flex items-center space-x-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center flex-shrink-0 text-2xl">
              {reward.badge.icon || '🏅'}
            </div>
            <div>
              <div className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                New Badge Unlocked!
              </div>
              <div className="text-sm font-bold text-white">{reward.badge.name}</div>
              <div className="text-xs text-slate-400">{reward.badge.desc}</div>
            </div>
          </div>
        )}

        {reward.leveledUp && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 mb-6 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-2">
            <Star className="w-4 h-4 text-emerald-400" />
            <span>🎉 LEVEL UP! You reached Level {reward.newLevel}!</span>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center justify-center space-x-2"
        >
          <span>Continue Gamified Questing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
