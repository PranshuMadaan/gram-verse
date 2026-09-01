import React, { useState } from 'react';
import { Modal } from '../common/Toast';
import { DataSourceBadge } from './DataSourceBadge';
import { VILLAGE_REGISTRY, DATA_TIERS } from '../../services/villageRegistry';
import {
  MapPin,
  Search,
  CheckCircle,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function VillageSelectorModal({
  isOpen,
  onClose,
  activeVillageId,
  onSelectVillage,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const states = ['all', ...new Set(VILLAGE_REGISTRY.map((v) => v.state))];

  const filteredVillages = VILLAGE_REGISTRY.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = stateFilter === 'all' || v.state === stateFilter;
    const matchesTier = tierFilter === 'all' || v.dataTier.id === tierFilter;

    return matchesSearch && matchesState && matchesTier;
  });

  const handleSelect = (village) => {
    onSelectVillage(village);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Village & Geospatial Data Repository"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Search & Hierarchy Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0e1624] p-3 rounded-xl border border-slate-800">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Village, District, or PIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131d2e] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-[#131d2e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Indian States ({states.length - 1})</option>
              {states
                .filter((s) => s !== 'all')
                .map((s) => (
                  <option key={s} value={s}>
                    State: {s}
                  </option>
                ))}
            </select>
          </div>

          {/* Data Tier Filter */}
          <div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full bg-[#131d2e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Data Tiers</option>
              <option value="tier1_drone_gis">Tier 1: Drone Survey + GIS (Live)</option>
              <option value="tier2_satellite_gis_dem">Tier 2: Satellite GIS + DEM</option>
              <option value="tier3_census_boundary">Tier 3: Census Boundary Only</option>
            </select>
          </div>
        </div>

        {/* Data Tier Transparency Banner */}
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparent Data Resolution Policy: </span>
            <span>
              Real high-resolution drone orthomosaics are loaded where surveyed under SVAMITVA. For non-drone Panchayats, GramVerse gracefully switches to OpenStreetMap vectors and satellite DEMs without pretending fake drone imagery exists.
            </span>
          </div>
        </div>

        {/* Village Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredVillages.map((v) => {
            const isSelected = v.id === activeVillageId;

            return (
              <div
                key={v.id}
                onClick={() => handleSelect(v)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#131e2e] border-cyan-500/50 ring-1 ring-cyan-400/40 shadow-glow'
                    : 'bg-[#0e1624] border-slate-800 hover:border-slate-700 hover:bg-[#111c2a]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{v.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {v.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {v.subDistrict}, {v.district}, {v.state} · PIN {v.pincode}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <DataSourceBadge tier={v.dataTier} size="xs" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {v.spatialResolution}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <span>
                    Area: {v.areaHectares} Ha · {v.population} Pop
                  </span>
                  <span className="text-cyan-400 font-sans font-semibold flex items-center space-x-1">
                    <span>{isSelected ? 'Currently Selected' : 'Load Digital Twin'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
