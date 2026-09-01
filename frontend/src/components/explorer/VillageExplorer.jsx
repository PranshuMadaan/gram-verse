import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Compass,
  Home,
  Route,
  Droplets,
  Building,
  Layers,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export function VillageExplorer() {
  const { village, baselineMetrics, setActiveTab } = useVillage();
  const [filterType, setFilterType] = useState('buildings'); // 'buildings' | 'roads' | 'nodes' | 'zones'
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all'); // 'all' | 'zoneA' | 'zoneB'

  if (!village || !baselineMetrics) {
    return <div className="p-8 text-center text-slate-400">Loading village assets...</div>;
  }

  const buildingStatusMap = {};
  if (baselineMetrics.buildings) {
    baselineMetrics.buildings.forEach((b) => {
      buildingStatusMap[b.id] = b;
    });
  }

  // Filter buildings
  const filteredBuildings = village.buildings.filter((b) => {
    const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) || b.anchor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'all' || b.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1624] p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>GIS Cadastral Layer Registry</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Village Infrastructure & Cadastral Assets
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Survey inventory for Patiala pilot village: 10 cadastral households, 6 road junctions, 5 existing road corridors + 1 proposed corridor.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center space-x-1.5 bg-[#131d2e] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterType('buildings')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'buildings'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Households ({village.buildings.length})</span>
          </button>

          <button
            onClick={() => setFilterType('roads')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'roads'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Road Corridors (6)</span>
          </button>

          <button
            onClick={() => setFilterType('nodes')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'nodes'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Junctions & Facilities</span>
          </button>
        </div>
      </div>

      {/* 1. BUILDINGS LAYER */}
      {filterType === 'buildings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e1624]/60 p-3 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Household ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#131d2e] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Zone Filter:</span>
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="bg-[#131d2e] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Zones (Zone A & B)</option>
                <option value="zoneA">Zone A (Village Core)</option>
                <option value="zoneB">Zone B (Far Hamlet)</option>
              </select>
            </div>
          </div>

          <div className="bg-[#0e1624] rounded-xl border border-slate-800 overflow-hidden shadow-command">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#131d2e] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                    <th className="p-3.5">Household ID</th>
                    <th className="p-3.5">Zone</th>
                    <th className="p-3.5">Anchor Junction</th>
                    <th className="p-3.5">School Travel Time</th>
                    <th className="p-3.5">School Access (≤8m)</th>
                    <th className="p-3.5">Water Access (≤150m)</th>
                    <th className="p-3.5">Drainage Status</th>
                    <th className="p-3.5">GIS Coordinates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredBuildings.map((b) => {
                    const status = buildingStatusMap[b.id];
                    const isSchoolOk = status?.school_accessible ?? false;
                    const isWaterOk = status?.water_accessible ?? false;
                    const isDrainageOk = status?.drainage_improved ?? false;

                    return (
                      <tr key={b.id} className="hover:bg-[#131e2e]/50 transition-colors">
                        <td className="p-3.5 font-bold text-cyan-400">{b.id}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                              b.zone === 'zoneA'
                                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            }`}
                          >
                            {village.zones[b.zone]?.label || b.zone}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {b.anchor}{' '}
                          <span className="text-slate-500 text-[10px]">
                            (+{b.anchor_time_min}m)
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {status?.time_to_school_min ?? '–'} min
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={isSchoolOk} />
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={isWaterOk} />
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={isDrainageOk ? 'improved' : 'poor'} />
                        </td>
                        <td className="p-3.5 text-slate-400 text-[10px]">
                          {b.lat.toFixed(4)}, {b.lon.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ROADS LAYER */}
      {filterType === 'roads' && (
        <div className="bg-[#0e1624] rounded-xl border border-slate-800 overflow-hidden shadow-command">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#131d2e] border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <th className="p-3.5">Corridor ID</th>
                  <th className="p-3.5">From Node</th>
                  <th className="p-3.5">To Node</th>
                  <th className="p-3.5">Length (m)</th>
                  <th className="p-3.5">Travel Time (min)</th>
                  <th className="p-3.5">Current Condition</th>
                  <th className="p-3.5">Intervention Opportunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {village.edges.map((e) => (
                  <tr key={e.id} className="hover:bg-[#131e2e]/50 transition-colors">
                    <td className="p-3.5 font-bold text-cyan-400">{e.id}</td>
                    <td className="p-3.5 text-slate-200">
                      {e.a} ({village.nodes[e.a]?.label})
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {e.b} ({village.nodes[e.b]?.label})
                    </td>
                    <td className="p-3.5 text-slate-300">{e.dist_m} m</td>
                    <td className="p-3.5 font-bold text-white">{e.time_min} min</td>
                    <td className="p-3.5">
                      <StatusBadge status={e.condition} />
                    </td>
                    <td className="p-3.5">
                      {e.condition === 'poor' ? (
                        <span className="text-amber-400 text-xs font-sans font-medium">
                          Eligible for Road Upgrade (15L / 18L)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs font-sans">
                          Adequate condition
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Proposed Road E6 */}
                {village.proposed_edge && (
                  <tr className="bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
                    <td className="p-3.5 font-bold text-cyan-300">
                      {village.proposed_edge.id} (Proposed)
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {village.proposed_edge.a} (
                      {village.nodes[village.proposed_edge.a]?.label})
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {village.proposed_edge.b} (
                      {village.nodes[village.proposed_edge.b]?.label})
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {village.proposed_edge.dist_m} m
                    </td>
                    <td className="p-3.5 font-bold text-cyan-400">
                      {village.proposed_edge.time_min} min
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                        NOT BUILT
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-cyan-300 text-xs font-sans font-semibold">
                        Build New Road Corridor (20L)
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. NODES & FACILITIES LAYER */}
      {filterType === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(village.nodes).map(([nodeId, n]) => {
            const isSchoolNode = village.facilities?.SCHOOL?.node === nodeId;
            const hasWater = village.water_points.includes(nodeId);

            return (
              <div
                key={nodeId}
                className="bg-[#0e1624] p-4 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all shadow-command"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-bold text-white font-mono">{nodeId}</span>
                    <span className="text-xs text-slate-400">({n.label})</span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500">
                    {n.lat}, {n.lon}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-xs">
                  {isSchoolNode && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center space-x-1">
                      <Building className="w-3 h-3" />
                      <span>Govt Primary School</span>
                    </span>
                  )}
                  {hasWater && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center space-x-1">
                      <Droplets className="w-3 h-3" />
                      <span>Existing Water Point</span>
                    </span>
                  )}
                  {!isSchoolNode && !hasWater && (
                    <span className="text-slate-500 font-mono text-[11px]">
                      Road Intersection / Candidate Water Point Anchor
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
