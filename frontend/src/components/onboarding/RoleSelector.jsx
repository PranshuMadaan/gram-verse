import React from 'react';
import { useVillage } from '../../context/VillageContext';
import { Landmark, Users, HardHat, ArrowRight } from 'lucide-react';

export function RoleSelector() {
  const { activeVillage, chooseRole } = useVillage();

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Landmark className="w-7 h-7 text-cyan-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome to GramVerse</h1>
          <p className="text-sm text-slate-400">{activeVillage.name} · How would you like to use it?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <button
            onClick={() => chooseRole('simple')}
            className="p-7 rounded-3xl bg-[#0e1624] border-2 border-slate-800 hover:border-cyan-400 hover:bg-cyan-500/5 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">I'm a Village Resident</div>
              <p className="text-xs text-slate-400 mt-1">
                Report a problem or suggest something your village needs — simple and quick.
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 pt-1">
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => chooseRole('planning')}
            className="p-7 rounded-3xl bg-[#0e1624] border-2 border-slate-800 hover:border-amber-400 hover:bg-amber-500/5 transition-all text-left space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <HardHat className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">I'm a Planning Official</div>
              <p className="text-xs text-slate-400 mt-1">
                Full digital twin, budget simulation, scenario comparison and AI optimization tools.
              </p>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 pt-1">
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        <p className="text-[11px] text-slate-600">You can switch modes anytime from within the app.</p>
      </div>
    </div>
  );
}
