import React from 'react';
import { DataSourceBadge } from './DataSourceBadge';
import {
  Landmark,
  MapPin,
  Calendar,
  Layers,
  Mountain,
  Users,
  Compass,
  FileCheck,
} from 'lucide-react';

export function VillageMetaCard({ villageMeta, elevationProfile = null }) {
  if (!villageMeta) return null;

  return (
    <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4 shadow-command">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                {villageMeta.name}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {villageMeta.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {villageMeta.subDistrict}, {villageMeta.district} · {villageMeta.state} (PIN {villageMeta.pincode})
            </p>
          </div>
        </div>

        <DataSourceBadge tier={villageMeta.dataTier} />
      </div>

      {/* Geospatial Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Survey Resolution</div>
          <div className="text-white font-bold mt-0.5 text-xs">
            {villageMeta.spatialResolution}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">{villageMeta.flightAltitude}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Terrain & Slope</div>
          <div className="text-white font-bold mt-0.5 text-xs truncate">
            {villageMeta.terrainClass}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {elevationProfile ? `${elevationProfile.minElevation_m}m - ${elevationProfile.maxElevation_m}m` : 'Flat/Undulating'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Cadastral Area</div>
          <div className="text-white font-bold mt-0.5 text-xs">
            {villageMeta.areaHectares} Ha
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {villageMeta.householdsCount} Surveyed Units
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#131d2e] border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase">Survey Agency</div>
          <div className="text-white font-bold mt-0.5 text-xs truncate">
            {villageMeta.surveyAgency}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">{villageMeta.surveyDate}</div>
        </div>
      </div>

      {/* Notice for Tier 2/3 */}
      {villageMeta.dataTier?.notice && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2">
          <span className="font-bold">Notice:</span>
          <span>{villageMeta.dataTier.notice}</span>
        </div>
      )}
    </div>
  );
}
