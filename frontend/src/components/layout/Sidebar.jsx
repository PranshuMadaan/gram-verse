import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import {
  LayoutDashboard,
  Compass,
  Hammer,
  ListTodo,
  Sliders,
  Activity,
  GitCompare,
  Sparkles,
  Target,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  Landmark,
  MapPin,
} from 'lucide-react';
import { Modal } from '../common/Toast';

export function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    selectedInterventions,
    tasks,
    scenarios,
    latestSimulation,
    resetScenarios,
    setIsVillageSelectorOpen,
    activeVillage,
  } = useVillage();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navItems = [
    {
      id: 'overview',
      label: 'Village Overview',
      subtitle: 'GIS baseline & deficit audit',
      icon: LayoutDashboard,
    },
    {
      id: 'explorer',
      label: 'Cadastral Explorer',
      subtitle: 'Layer-by-layer asset registry',
      icon: Compass,
    },
    {
      id: 'sandbox',
      label: 'Planning Sandbox',
      subtitle: 'Allocate budget & design plan',
      icon: Hammer,
      badge: selectedInterventions.length > 0 ? selectedInterventions.length : null,
      badgeColor: 'bg-cyan-500 text-slate-950 font-bold',
    },
    {
      id: 'tasks',
      label: 'Planning Tasks',
      subtitle: 'Objective & task creator',
      icon: ListTodo,
      badge: tasks.length > 0 ? tasks.length : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
    },
    {
      id: 'config',
      label: 'Plan Configuration',
      subtitle: 'Parameters & constraints',
      icon: Sliders,
    },
    {
      id: 'simulation',
      label: 'Simulation Impact',
      subtitle: 'Before vs After analytics',
      icon: Activity,
      badge: latestSimulation ? 'Active' : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'comparison',
      label: 'Scenario Comparison',
      subtitle: 'Multi-plan strategy matrix',
      icon: GitCompare,
      badge: scenarios.length > 0 ? scenarios.length : null,
      badgeColor: 'bg-slate-700 text-slate-200',
    },
    {
      id: 'optimizer',
      label: 'AI Recommendation',
      subtitle: 'Explainable greedy knapsack',
      icon: Sparkles,
    },
    {
      id: 'missions',
      label: 'Planning Missions',
      subtitle: 'SIH1704 preset challenges',
      icon: Target,
    },
  ];

  const handleConfirmReset = async () => {
    await resetScenarios();
    setShowResetConfirm(false);
  };

  return (
    <aside className="w-72 bg-[#0a0f19] border-r border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] select-none">
      {/* Brand & Village Switcher Header */}
      <div className="overflow-y-auto">
        <div className="p-4 border-b border-slate-800/80 bg-[#0d1422]/60 space-y-2.5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-glow">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-wide flex items-center space-x-1.5">
                <span>GramVerse AI</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold">
                  SIH1704
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight mt-0.5">
                Rural Planning Digital Twin
              </p>
            </div>
          </div>

          {/* Quick Village Switcher Button */}
          <button
            onClick={() => setIsVillageSelectorOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#131d2e] hover:bg-[#1a293f] border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            <span className="truncate flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate text-white font-semibold">{activeVillage.name}</span>
            </span>
            <span className="text-[10px] text-cyan-400 uppercase font-bold ml-1">Switch</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group ${
                  isActive
                    ? 'bg-[#131e2e] text-white border border-cyan-500/40 shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e1624] border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive
                        ? 'text-cyan-400 translate-x-0.5'
                        : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3.5 border-t border-slate-800 bg-[#0d1422]/60 space-y-2.5">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Saved Scenarios</span>
        </button>

        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            Digital Twin & Decision Support System
          </p>
          <p className="text-[9px] text-slate-600 mt-0.5">
            Ministry of Panchayati Raj / SIH1704
          </p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Confirm Reset Scenarios"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 text-rose-400">
            <ShieldAlert className="w-6 h-6 flex-shrink-0" />
            <div className="text-xs text-slate-300">
              This will clear all in-memory scenarios saved in the backend storage.
              Baseline data and intervention catalog will remain unchanged.
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white transition-colors"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
