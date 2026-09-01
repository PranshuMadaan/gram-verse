import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { PROBLEM_CATEGORIES } from '../../services/problemService';
import {
  X,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  Hammer,
  ArrowRight,
  Filter,
} from 'lucide-react';

export function ThingsToFixDrawer({ isOpen, onClose }) {
  const {
    reportedProblems,
    resolveProblem,
    deleteProblem,
    convertProblemToPlan,
    setIsReportProblemOpen,
    setFocusedLocation,
    activeVillage,
  } = useVillage();

  const [filter, setFilter] = useState('open'); // 'all' | 'open' | 'resolved'

  if (!isOpen) return null;

  const filteredProblems = reportedProblems.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const openCount = reportedProblems.filter((p) => p.status === 'open').length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#0a0f19]/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0d1422]/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span>Things to Fix</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                {openCount} Open
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {activeVillage.name} Community Issues
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

      {/* Filter Tabs & Add Button */}
      <div className="p-3 border-b border-slate-800/80 bg-[#0c121e]/60 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1 bg-[#131d2e] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('open')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filter === 'open'
                ? 'bg-rose-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filter === 'resolved'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-slate-700 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>

        <button
          onClick={() => {
            setIsReportProblemOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-glow flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report New</span>
        </button>
      </div>

      {/* Issues List Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60" />
            <p className="text-sm font-semibold text-slate-300">No {filter} problems reported</p>
            <p className="text-xs text-slate-500">
              Community members can report broken roads, water issues, or drainage deficits.
            </p>
          </div>
        ) : (
          filteredProblems.map((prob) => {
            const catObj =
              PROBLEM_CATEGORIES.find((c) => c.id === prob.category) || PROBLEM_CATEGORIES[0];
            const isResolved = prob.status === 'resolved';

            return (
              <div
                key={prob.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  isResolved
                    ? 'bg-[#0f1724]/60 border-slate-800/80 opacity-75'
                    : 'bg-[#0e1624] border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Top Row: Icon, Title, Priority */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <span className="text-xl flex-shrink-0 mt-0.5">{catObj.icon}</span>
                    <div className="min-w-0">
                      <h4
                        onClick={() => setFocusedLocation([prob.lat, prob.lon])}
                        className={`text-xs font-bold truncate cursor-pointer hover:text-cyan-300 transition-colors ${
                          isResolved ? 'line-through text-slate-400' : 'text-white'
                        }`}
                        title="Click to view on map"
                      >
                        {prob.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
                        <span>{prob.reportedBy}</span>
                        <span>·</span>
                        <span>{prob.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                      isResolved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : prob.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isResolved ? 'RESOLVED' : `${prob.priority} PRIORITY`}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {prob.description}
                </p>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setFocusedLocation([prob.lat, prob.lon])}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>View on Map</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {!isResolved && (
                      <button
                        onClick={() => resolveProblem(prob.id)}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => {
                          convertProblemToPlan(prob);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold transition-all shadow-glow flex items-center space-x-1"
                      >
                        <Hammer className="w-3 h-3" />
                        <span>Add to Plan</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteProblem(prob.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete problem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
