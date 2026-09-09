import React, { useState, useMemo } from 'react';
import { useVillage } from '../../context/VillageContext';
import { PROBLEM_CATEGORIES } from '../../services/problemService';
import { classifyRequest } from '../../services/requestClassifier';
import { VillageMap } from '../map/VillageMap';
import { Sparkles, MapPin, Send, Check, ChevronDown } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Can Wait', color: 'bg-slate-700 text-slate-200 border-slate-600' },
  { id: 'medium', label: 'Important', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'high', label: 'Urgent', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
];

function buildLinkedIntervention(categoryObj, title) {
  if (categoryObj.defaultIntervention === 'road_upgrade') {
    return { type: 'road_upgrade', target: 'E5', cost_lakh: categoryObj.defaultCost, label: `Upgrade Road corridor (${title})` };
  }
  if (categoryObj.defaultIntervention === 'water_point') {
    return { type: 'water_point', target: 'N5', cost_lakh: categoryObj.defaultCost, label: `New water point near (${title})` };
  }
  if (categoryObj.defaultIntervention === 'drainage') {
    return { type: 'drainage', target: 'zoneA', cost_lakh: categoryObj.defaultCost, label: `Storm drainage improvement (${title})` };
  }
  if (categoryObj.defaultIntervention === 'road_new') {
    return { type: 'road_new', target: 'E6', cost_lakh: categoryObj.defaultCost, label: `New road access (${title})` };
  }
  return null;
}

/**
 * Villager-facing request form. Unlike the professional ReportProblemModal
 * (pick a technical category first, then describe), this flips the order:
 * the person just describes their problem in their own words, and a
 * rule-based "AI assist" suggests the category, title and urgency for them
 * to confirm or correct — no jargon, no dropdowns required up front.
 */
export function SimpleRequestModal({ isOpen, onClose, mode = 'problem', bountyContext = null }) {
  const {
    activeVillage,
    village,
    reportProblem,
    selectedMapPoint,
    setSelectedMapPoint,
  } = useVillage();

  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState(null); // null = follow AI suggestion
  const [priority, setPriority] = useState(null); // null = follow AI suggestion
  const [reporter, setReporter] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // If opened via a bounty quest, pre-fill text and category
  React.useEffect(() => {
    if (bountyContext && isOpen) {
      setText(bountyContext.description || bountyContext.title);
      setCategoryId(bountyContext.category || null);
      setPriority(bountyContext.urgency || 'high');
    }
  }, [bountyContext, isOpen]);

  const suggestion = useMemo(() => classifyRequest(text), [text]);
  const finalCategoryId = categoryId || (bountyContext ? bountyContext.category : suggestion.categoryId);
  const finalPriority = priority || (bountyContext ? bountyContext.urgency : suggestion.suggestedPriority);
  const categoryObj = PROBLEM_CATEGORIES.find((c) => c.id === finalCategoryId) || PROBLEM_CATEGORIES[PROBLEM_CATEGORIES.length - 1];

  const isProblem = mode === 'problem';
  const heading = isProblem ? 'Tell Us What\u2019s Wrong' : 'Tell Us What Your Village Needs';
  const placeholder = isProblem
    ? 'e.g. The road near my house floods every monsoon and it is hard to walk to school...'
    : 'e.g. It would help if we had a new water point near the far hamlet...';

  const canSubmit = text.trim().length >= 5;

  const resetAndClose = () => {
    setText('');
    setCategoryId(null);
    setPriority(null);
    setReporter('');
    setShowMap(false);
    setShowCategoryPicker(false);
    setSubmitted(false);
    setSelectedMapPoint(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const lat = selectedMapPoint ? selectedMapPoint.lat : activeVillage.center?.[0] || 30.3695;
    const lon = selectedMapPoint ? selectedMapPoint.lon : activeVillage.center?.[1] || 76.3775;

    const newProblem = {
      id: `prob-${Date.now()}`,
      category: finalCategoryId,
      title: suggestion.suggestedTitle,
      description: text.trim(),
      lat,
      lon,
      priority: finalPriority,
      status: 'open',
      reportedBy: reporter.trim() || 'Village Resident',
      createdAt: 'Just now',
      requestKind: mode,
      aiAssisted: true,
      aiMatchedKeywords: suggestion.matchedKeywords,
      linkedIntervention: buildLinkedIntervention(categoryObj, suggestion.suggestedTitle),
      questTitle: bountyContext ? bountyContext.title : null,
    };

    reportProblem(newProblem);
    setSubmitted(true);
    setTimeout(resetAndClose, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0e1624] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-[#131d2e]/80 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{heading}</h2>
          <button
            onClick={resetAndClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 text-xl"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="p-10 flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Sent!</h3>
            <p className="text-sm text-slate-400">
              Your {isProblem ? 'problem' : 'idea'} has been sent to the Panchayat planning team.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Step 1: free text */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                In your own words:
              </label>
              <textarea
                autoFocus
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#131d2e] border-2 border-slate-700 focus:border-cyan-400 rounded-2xl p-4 text-base text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>

            {/* Step 2: AI-suggested category, shown once they've typed something */}
            {text.trim().length >= 5 && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-wide">
                  <Sparkles className="w-4 h-4" />
                  <span>We think this is about:</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCategoryPicker((s) => !s)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0e1624] border border-slate-700 hover:border-cyan-400 transition-all"
                >
                  <span className="flex items-center space-x-2.5 text-base font-semibold text-white">
                    <span className="text-2xl">{categoryObj.icon}</span>
                    <span>{categoryObj.label}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <span>Not right?</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {showCategoryPicker && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {PROBLEM_CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setCategoryId(c.id); setShowCategoryPicker(false); }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1 text-center transition-all ${
                          finalCategoryId === c.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-white'
                            : 'bg-[#131d2e] border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-[10px] leading-tight">{c.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Urgency */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">
                    How urgent is it?
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {PRIORITY_OPTIONS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                          finalPriority === p.id
                            ? p.color + ' ring-1 ring-white/20'
                            : 'bg-[#131d2e] border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: location (optional) */}
            {text.trim().length >= 5 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowMap((s) => !s)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#131d2e] border border-slate-700 hover:border-cyan-400 transition-all"
                >
                  <span className="flex items-center space-x-2 text-sm font-semibold text-white">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>{selectedMapPoint ? 'Location pinned ✓' : 'Show us where (optional)'}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMap ? 'rotate-180' : ''}`} />
                </button>

                {showMap && village && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-700" style={{ height: 220 }}>
                    <VillageMap
                      village={village}
                      pickLocationMode={mode === 'suggestion' ? 'feature' : 'problem'}
                      onPickLocation={(coords) => setSelectedMapPoint(coords)}
                      height="100%"
                      interactive={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: name (optional) */}
            {text.trim().length >= 5 && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Your name (optional)
                </label>
                <input
                  type="text"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="e.g. Ward 2 Resident"
                  className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {!submitted && (
          <div className="p-5 border-t border-slate-800 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-base transition-all flex items-center justify-center space-x-2 shadow-glow disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
              <span>Send to the Panchayat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
