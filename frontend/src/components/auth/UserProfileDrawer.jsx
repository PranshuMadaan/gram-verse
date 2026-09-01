import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVillage } from '../../context/VillageContext';
import {
  X,
  User,
  ShieldCheck,
  MapPin,
  AlertCircle,
  FileText,
  LogOut,
  RefreshCw,
  Layers,
  ChevronRight,
} from 'lucide-react';

export function UserProfileDrawer({ isOpen, onClose }) {
  const { user, logout, switchRole, userSavedVillages } = useAuth();
  const { reportedProblems, scenarios, selectVillage, setAppMode, setIsPlanningDrawerOpen } = useVillage();
  const [activeTab, setActiveTab] = useState('villages'); // 'villages' | 'reports' | 'plans'

  if (!isOpen || !user) return null;

  const myReports = reportedProblems;

  const handleSelectVillage = (v) => {
    selectVillage(v);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#0a0f19]/98 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none font-sans">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0d1422]/90 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">User Profile</h3>
            <p className="text-[10px] font-mono text-slate-400">
              GramVerse Rural Planning Identity
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Identity Card */}
      <div className="p-4 border-b border-slate-800 bg-[#0e1624]/60 space-y-3">
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-glow"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
            <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                {user.role}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {user.provider}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <div className="text-slate-400 font-mono text-[10px] uppercase">Organization / Unit</div>
          <div className="font-semibold text-white">{user.organization}</div>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-[10px] font-mono text-slate-400">Switch Role:</span>
          <button
            onClick={() => switchRole('Panchayat Officer')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              user.role === 'Panchayat Officer'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Officer
          </button>
          <button
            onClick={() => switchRole('Community Planner')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              user.role === 'Community Planner'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Planner
          </button>
          <button
            onClick={() => switchRole('Village Resident')}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              user.role === 'Village Resident'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Citizen
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="p-2.5 border-b border-slate-800 bg-[#0c121e] flex items-center space-x-1 text-xs">
        <button
          onClick={() => setActiveTab('villages')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'villages'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>My Villages</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'reports'
              ? 'bg-rose-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>My Reports ({myReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-1.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'plans'
              ? 'bg-indigo-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Plans ({scenarios.length})</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {activeTab === 'villages' && (
          <div className="space-y-2">
            {userSavedVillages.map((v) => (
              <div
                key={v.id}
                onClick={() => handleSelectVillage(v)}
                className="p-3 rounded-xl bg-[#0e1624] border border-slate-800 hover:border-cyan-500/50 hover:bg-[#131d2e] cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">{v.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {v.district}, {v.state} · <span className="text-cyan-300">{v.tier}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-2">
            {myReports.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-[#0e1624] border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{r.title}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase bg-rose-500/20 text-rose-300">
                    {r.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{r.description}</p>
                <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-1 border-t border-slate-800">
                  <span>Reported: {r.createdAt}</span>
                  <span className="text-emerald-400 font-bold uppercase">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-2">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                onClick={() => {
                  setAppMode('planning');
                  setIsPlanningDrawerOpen(true);
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#0e1624] border border-slate-800 hover:border-indigo-500/40 cursor-pointer space-y-1.5 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{sc.name}</span>
                  <span className="text-cyan-400 font-mono">
                    Score: {sc.result?.metrics?.composite_score ?? '–'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Cost: ₹{sc.result?.total_cost_lakh ?? sc.budget_lakh}L</span>
                  <span>Interventions: {sc.interventions?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Sign Out */}
      <div className="p-4 border-t border-slate-800 bg-[#0d1422]/80">
        <button
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
