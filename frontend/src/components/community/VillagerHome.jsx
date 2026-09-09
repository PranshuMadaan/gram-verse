import React, { useState, useMemo } from 'react';
import { useVillage } from '../../context/VillageContext';
import { SimpleRequestModal } from './SimpleRequestModal';
import { PROBLEM_CATEGORIES } from '../../services/problemService';
import { Landmark, AlertTriangle, Lightbulb, Clock, CheckCircle2 } from 'lucide-react';

function StatusPill({ status }) {
  const isResolved = status === 'resolved';
  return (
    <span
      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        isResolved
          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
      }`}
    >
      {isResolved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      <span>{isResolved ? 'Fixed' : 'Waiting for Review'}</span>
    </span>
  );
}

export function VillagerHome() {
  const { activeVillage, reportedProblems, communityFeatures, setAppMode } = useVillage();
  const [modalMode, setModalMode] = useState(null); // null | 'problem' | 'suggestion'

  // Merge problems + community-added places into one friendly feed, most
  // recent first (both already come with createdAt as "Just now" / "N days
  // ago" strings from the community context actions).
  const feedItems = useMemo(() => {
    const problems = reportedProblems.map((p) => ({ ...p, kind: p.requestKind || 'problem' }));
    const features = communityFeatures.map((f) => ({
      ...f,
      kind: 'suggestion',
      category: f.type,
      status: 'open',
      title: f.name,
      description: f.notes,
    }));
    return [...problems, ...features];
  }, [reportedProblems, communityFeatures]);

  const getCategoryMeta = (categoryId) =>
    PROBLEM_CATEGORIES.find((c) => c.id === categoryId) || PROBLEM_CATEGORIES[PROBLEM_CATEGORIES.length - 1];

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-slate-100 font-sans">
      {/* Minimal, friendly header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-base leading-tight">GramVerse</div>
            <div className="text-xs text-slate-400">{activeVillage.name}</div>
          </div>
        </div>

        <button
          onClick={() => setAppMode('planning')}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors underline decoration-dotted"
        >
          I'm a Planning Official
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Welcome */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            What does your village need?
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Tell us in your own words — we'll pass it straight to the village planning team.
          </p>
        </div>

        {/* Two big action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setModalMode('problem')}
            className="p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 hover:border-rose-400 hover:bg-rose-500/15 transition-all text-left space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div className="text-lg font-bold text-white">Something is Broken</div>
            <div className="text-xs text-slate-400">A road, water point, drainage, or anything else that needs fixing</div>
          </button>

          <button
            onClick={() => setModalMode('suggestion')}
            className="p-6 rounded-3xl bg-cyan-500/10 border-2 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/15 transition-all text-left space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-white">We Need Something New</div>
            <div className="text-xs text-slate-400">A place or facility your village is missing</div>
          </button>
        </div>

        {/* Community feed */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
            What people have asked for ({feedItems.length})
          </h2>

          {feedItems.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              Nothing has been reported yet — be the first!
            </div>
          ) : (
            <div className="space-y-2.5">
              {feedItems.map((item) => {
                const cat = getCategoryMeta(item.category);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0e1624] border border-slate-800 flex items-start space-x-3"
                  >
                    <div className="text-2xl flex-shrink-0">{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.reportedBy || 'Village Resident'} · {item.createdAt}
                      </div>
                    </div>
                    <StatusPill status={item.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SimpleRequestModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        mode={modalMode || 'problem'}
      />
    </div>
  );
}
