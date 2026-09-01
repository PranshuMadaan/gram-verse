import React from 'react';
import { useVillage } from '../../context/VillageContext';
import {
  Sliders,
  Coins,
  Target,
  FileText,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export function PlanningConfigPanel() {
  const {
    activePlanName,
    setActivePlanName,
    budgetLakh,
    setBudgetLakh,
    planningObjective,
    setPlanningObjective,
    targetSchoolPct,
    setTargetSchoolPct,
    targetWaterPct,
    setTargetWaterPct,
    targetDrainagePct,
    setTargetDrainagePct,
    prioritizeZoneB,
    setPrioritizeZoneB,
  } = useVillage();

  const objectives = [
    {
      id: 'holistic',
      label: 'Holistic Rural Modernization',
      desc: 'Maximize the composite score across road mobility, water access, and flood defense.',
    },
    {
      id: 'school_access',
      label: 'Priority: School & Education Mobility',
      desc: 'Focus investments on reducing walking times to primary school below 8 minutes.',
    },
    {
      id: 'monsoon_drainage',
      label: 'Priority: Monsoon Flood Resilience',
      desc: 'Prioritize stormwater drainage networks in waterlogging-prone hamlet zones.',
    },
    {
      id: 'clean_water',
      label: 'Priority: Equitable Potable Water',
      desc: 'Place decentralized water points within 150m walking radius of every household.',
    },
  ];

  return (
    <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-5 shadow-command">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <Sliders className="w-5 h-5 text-cyan-400" />
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Planning & Simulation Parameters
          </h3>
          <p className="text-[11px] text-slate-400">
            Configure financial constraints, strategic goals, and target metric thresholds
          </p>
        </div>
      </div>

      {/* 1. Scenario Namer */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scenario Plan Identifier</span>
        </label>
        <input
          type="text"
          value={activePlanName}
          onChange={(e) => setActivePlanName(e.target.value)}
          placeholder="e.g. Plan A - Monsoon Defense Strategy"
          className="w-full bg-[#131d2e] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-semibold placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* 2. Planning Objective Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>Primary Planning Objective</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {objectives.map((obj) => {
            const isSelected = planningObjective === obj.id;

            return (
              <div
                key={obj.id}
                onClick={() => setPlanningObjective(obj.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                  isSelected
                    ? 'bg-[#131d2e] border-cyan-500/50 ring-1 ring-cyan-400/30'
                    : 'bg-[#0e1624] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                    {obj.label}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{obj.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Budget Ceiling Engine */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Panchayat Capital Budget Ceiling</span>
          </label>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            ₹{budgetLakh} Lakhs
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={budgetLakh}
          onChange={(e) => setBudgetLakh(Number(e.target.value))}
          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* 4. Target Metric Goals & Constraints */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-300">
          Target Outcome Thresholds
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400">Target School Access</div>
            <div className="text-white font-bold">{targetSchoolPct}%</div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={targetSchoolPct}
              onChange={(e) => setTargetSchoolPct(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400">Target Water Access</div>
            <div className="text-white font-bold">{targetWaterPct}%</div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={targetWaterPct}
              onChange={(e) => setTargetWaterPct(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400">Target Drainage</div>
            <div className="text-white font-bold">{targetDrainagePct}%</div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={targetDrainagePct}
              onChange={(e) => setTargetDrainagePct(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Spatial Constraint Checkbox */}
        <label className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#131d2e] border border-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={prioritizeZoneB}
            onChange={(e) => setPrioritizeZoneB(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-0 w-4 h-4 accent-cyan-400"
          />
          <div className="text-xs">
            <span className="text-white font-semibold">
              Prioritize Zone B (Far Hamlet) Connectivity
            </span>
            <p className="text-[10px] text-slate-400">
              Ensure isolated households receive priority routing in planned investments.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
