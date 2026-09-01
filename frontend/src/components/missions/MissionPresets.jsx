import React from 'react';
import { useVillage } from '../../context/VillageContext';
import {
  Target,
  GraduationCap,
  Waves,
  Droplets,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export function MissionPresets() {
  const { applyMission } = useVillage();

  const missions = [
    {
      id: 'mission-school',
      title: 'Mission 1: School Access Sprint',
      name: 'Plan: School Access Sprint',
      icon: GraduationCap,
      category: 'Education & Mobility',
      budget: 35,
      targetMetric: 'School Accessibility ≥ 70%',
      color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      description:
        'Far Hamlet (Zone B) students currently face walking times up to 23 minutes. Modernize bottleneck road links (E3, E5) or build corridor E6 within a strict ₹35L budget.',
      difficulty: 'Moderate',
    },
    {
      id: 'mission-flood',
      title: 'Mission 2: Monsoon Flood Defense',
      name: 'Plan: Monsoon Flood Defense',
      icon: Waves,
      category: 'Drainage & Climate Resilience',
      budget: 30,
      targetMetric: 'Drainage Coverage 100%',
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      description:
        'Zero stormwater drainage exists currently, leaving both Zone A and Zone B vulnerable to monsoon waterlogging. Fund community drainage projects within ₹30L.',
      difficulty: 'Direct',
    },
    {
      id: 'mission-water',
      title: 'Mission 3: Clean Water Lifeline',
      name: 'Plan: Clean Water Lifeline',
      icon: Droplets,
      category: 'Public Health',
      budget: 30,
      targetMetric: 'Water Access ≥ 70%',
      color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      description:
        '80% of households are outside the 150m walking buffer from existing water sources. Place new decentralized water points at key junctions within ₹30L.',
      difficulty: 'Tactical',
    },
    {
      id: 'mission-holistic',
      title: 'Mission 4: Comprehensive Modernization',
      name: 'Plan: Comprehensive Modernization',
      icon: Zap,
      category: 'Multi-Criteria Holistic',
      budget: 65,
      targetMetric: 'Composite Score ≥ 70 pts',
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      description:
        'Balance road connectivity, flood prevention, and potable water distribution across both village zones to achieve an outstanding composite development score.',
      difficulty: 'Master Planner',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1624] p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>SIH1704 Gamified Planning Challenges</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Strategic Planning Missions
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Preset planning challenges that frame real-world panchayat budget dilemmas, trade-offs, and measurable impact targets.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#131d2e] border border-slate-700 text-xs font-mono text-cyan-300">
          <Award className="w-4 h-4 text-amber-400" />
          <span>4 Available Challenges</span>
        </div>
      </div>

      {/* Mission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missions.map((m) => {
          const Icon = m.icon;

          return (
            <div
              key={m.id}
              className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-command space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl ${m.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {m.category}
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {m.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    ₹{m.budget}L Budget
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {m.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="text-slate-400">
                    Target: <span className="font-bold text-emerald-400">{m.targetMetric}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Complexity: <span className="text-white">{m.difficulty}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => applyMission(m)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#131d2e] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>Accept Mission & Open Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
