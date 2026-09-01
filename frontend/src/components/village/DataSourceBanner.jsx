import React from 'react';
import { ShieldCheck, Satellite, AlertCircle, Info, Layers } from 'lucide-react';
import { DataSourceBadge } from './DataSourceBadge';

export function DataSourceBanner({ villageMeta, isBoundaryApproximate = false }) {
  if (!villageMeta) return null;

  const isDronePilot = villageMeta.id === 'PB-PAT-001';

  return (
    <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-2 shadow-command">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {isDronePilot ? <ShieldCheck className="w-5 h-5" /> : <Satellite className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Geospatial Data Source Mode:
              </span>
              <DataSourceBadge tier={villageMeta.dataTier} size="xs" />
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {isDronePilot
                ? 'High-Resolution Drone Survey + GIS Cadastral (Pilot)'
                : 'ArcGIS World Imagery Satellite + OpenStreetMap GIS Vectors'}
            </h4>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
            Resolution: {villageMeta.spatialResolution || '10m Satellite'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {villageMeta.surveyAgency || 'Esri / OpenStreetMap'}
          </span>
        </div>
      </div>

      {/* Explicit disclaimer when drone data is unavailable */}
      {!isDronePilot && (
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-start space-x-2">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            <b>Data Transparency Note:</b> High-resolution drone survey is unavailable for this specific village. GramVerse is displaying high-resolution satellite imagery (ArcGIS World Imagery) and OpenStreetMap cadastral vectors.
          </span>
        </div>
      )}

      {/* Boundary Approximation Notice */}
      {isBoundaryApproximate && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <b>Boundary Note:</b> Official village boundary polygon is unavailable from open GIS sources for this location. Displaying an estimated 1.5km surrounding cadastral area.
          </span>
        </div>
      )}
    </div>
  );
}
