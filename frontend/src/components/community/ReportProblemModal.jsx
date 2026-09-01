import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { PROBLEM_CATEGORIES } from '../../services/problemService';
import { Modal } from '../common/Toast';
import { AlertCircle, MapPin, Send, Check } from 'lucide-react';

export function ReportProblemModal({ isOpen, onClose }) {
  const {
    activeVillage,
    reportProblem,
    selectedMapPoint,
    setSelectedMapPoint,
    setPickLocationMode,
  } = useVillage();

  const [category, setCategory] = useState(PROBLEM_CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');
  const [reporter, setReporter] = useState('Village Resident');

  const selectedCategoryObj =
    PROBLEM_CATEGORIES.find((c) => c.id === category) || PROBLEM_CATEGORIES[0];

  const handlePickOnMap = () => {
    setPickLocationMode('problem');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const lat = selectedMapPoint ? selectedMapPoint.lat : activeVillage.center?.[0] || 30.3695;
    const lon = selectedMapPoint ? selectedMapPoint.lon : activeVillage.center?.[1] || 76.3775;

    // Derive linked intervention if standard type
    let linkedIntervention = null;
    if (selectedCategoryObj.defaultIntervention === 'road_upgrade') {
      linkedIntervention = {
        type: 'road_upgrade',
        target: 'E5',
        cost_lakh: selectedCategoryObj.defaultCost,
        label: `Upgrade Road corridor (${title})`,
      };
    } else if (selectedCategoryObj.defaultIntervention === 'water_point') {
      linkedIntervention = {
        type: 'water_point',
        target: 'N5',
        cost_lakh: selectedCategoryObj.defaultCost,
        label: `New water point near (${title})`,
      };
    } else if (selectedCategoryObj.defaultIntervention === 'drainage') {
      linkedIntervention = {
        type: 'drainage',
        target: 'zoneA',
        cost_lakh: selectedCategoryObj.defaultCost,
        label: `Storm drainage improvement (${title})`,
      };
    }

    const newProblem = {
      id: `prob-${Date.now()}`,
      category,
      title: title.trim(),
      description: description.trim() || 'Reported by local community member for Panchayat planning review.',
      lat,
      lon,
      priority,
      status: 'open',
      reportedBy: reporter.trim() || 'Community Member',
      createdAt: 'Just now',
      linkedIntervention,
    };

    reportProblem(newProblem);
    setTitle('');
    setDescription('');
    setSelectedMapPoint(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report a Problem / Thing to Fix" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Category Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            1. Select Problem Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PROBLEM_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all select-none ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-glow ring-1 ring-cyan-400/40'
                      : 'bg-[#131d2e] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-xs truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Problem Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            2. Problem Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken road near Primary School, Hand pump dried up..."
            className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all font-sans"
          />
        </div>

        {/* Step 3: Location on Map */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Location on Map
            </label>
            <button
              type="button"
              onClick={handlePickOnMap}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <MapPin className="w-3 h-3" />
              <span>{selectedMapPoint ? 'Change Pin on Map' : 'Tap on Map to Place'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>
              {selectedMapPoint
                ? `Pinned at ${selectedMapPoint.lat.toFixed(5)}°N, ${selectedMapPoint.lon.toFixed(5)}°E`
                : `Default village center: ${activeVillage.name}`}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">READY</span>
          </div>
        </div>

        {/* Step 4: Priority & Description */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-sans"
            >
              <option value="high">🔴 High (Urgent Deficit)</option>
              <option value="medium">🟠 Medium (Standard)</option>
              <option value="low">🟡 Low (Minor)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Reported By
            </label>
            <input
              type="text"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="e.g. Ward 2 Resident"
              className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-sans"
            >
            </input>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Additional Details (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain how this affects households, travel times, or safety..."
            className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-sans resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-glow transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Problem Report</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
