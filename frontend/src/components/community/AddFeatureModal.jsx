import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { Modal } from '../common/Toast';
import { MapPin, Plus, Check } from 'lucide-react';

const FEATURE_TYPES = [
  { id: 'school', label: 'Primary / Secondary School', icon: '🏫' },
  { id: 'water', label: 'Water Tank / Tube Well', icon: '💧' },
  { id: 'health', label: 'Sub-Centre / Clinic', icon: '🏥' },
  { id: 'road', label: 'Paved Road Corridor', icon: '🛣️' },
  { id: 'drainage', label: 'Storm Drainage Channel', icon: '🌊' },
  { id: 'electricity', label: 'Solar / Transformer', icon: '⚡' },
  { id: 'building', label: 'Panchayat / Community Hall', icon: '🏛️' },
  { id: 'other', label: 'Other Village Place', icon: '📍' },
];

export function AddFeatureModal({ isOpen, onClose }) {
  const {
    activeVillage,
    addCommunityFeature,
    selectedMapPoint,
    setSelectedMapPoint,
    setPickLocationMode,
  } = useVillage();

  const [type, setType] = useState(FEATURE_TYPES[0].id);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  const handlePickOnMap = () => {
    setPickLocationMode('feature');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const lat = selectedMapPoint ? selectedMapPoint.lat : activeVillage.center?.[0] || 30.3695;
    const lon = selectedMapPoint ? selectedMapPoint.lon : activeVillage.center?.[1] || 76.3775;

    const newFeature = {
      id: `feat-${Date.now()}`,
      type,
      name: name.trim(),
      lat,
      lon,
      confidence: 'community',
      confidenceLabel: '✎ Community Added',
      notes: notes.trim() || 'Added by village resident, pending formal Panchayat survey.',
      createdAt: 'Just now',
    };

    addCommunityFeature(newFeature);
    setName('');
    setNotes('');
    setSelectedMapPoint(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add or Correct Village Place" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            What would you like to add?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FEATURE_TYPES.map((t) => {
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all select-none ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-glow ring-1 ring-cyan-400/40'
                      : 'bg-[#131d2e] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="text-xs truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Place Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Place Name / Facility Label
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Anganwadi Centre 2, North Tube Well..."
            className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-sans"
          />
        </div>

        {/* Location on Map */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Location on Map
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
                : `Center of ${activeVillage.name}`}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">PINNED</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Description / Landmark Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Near old banyan tree, serves around 25 households..."
            className="w-full bg-[#131d2e] border border-slate-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 font-sans resize-none"
          />
        </div>

        {/* Actions */}
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
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 shadow-glow transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Village Place</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
