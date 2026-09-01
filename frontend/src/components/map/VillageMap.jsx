import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Navigation,
  Maximize,
  Minimize,
  Compass,
  MapPin,
  AlertCircle,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { BASEMAP_STYLES } from '../../services/imageryService';
import { BasemapSelector } from './BasemapSelector';
import { MapLegend } from './MapLegend';
import { DataSourceBadge } from '../village/DataSourceBadge';
import { DATA_TIERS } from '../../services/villageRegistry';
import { PROBLEM_CATEGORIES } from '../../services/problemService';

export function VillageMap({
  village,
  selectedInterventions = [],
  activeMetrics = null,
  baselineMetrics = null,
  dataTier = DATA_TIERS.TIER_1,
  boundary = null,
  reportedProblems = [],
  communityFeatures = [],
  pickLocationMode = null,
  onPickLocation = null,
  focusedLocation = null,
  onToggleIntervention = null,
  onResolveProblem = null,
  onAddToPlan = null,
  height = '100%',
  interactive = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const cadastreLayerRef = useRef(null);
  const problemsLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Map state
  const [activeBasemap, setActiveBasemap] = useState('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    boundary: true,
    roads: true,
    buildings: true,
    waterBodies: true,
    waterBuffers: true,
    facilities: true,
    problems: true,
  });

  const toggleLayer = (key) => {
    setLayerVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const center = village?.meta?.center || [30.3695, 76.3775];
      const zoom = village?.meta?.zoom || 16;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Custom Zoom Control top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Metric Scale Control bottom right
      L.control.scale({ metric: true, imperial: false, position: 'bottomright' }).addTo(map);

      // Attribution bottom right
      L.control
        .attribution({ position: 'bottomright' })
        .addAttribution('GramVerse AI &copy; SIH1704 · Esri World Imagery · OpenStreetMap')
        .addTo(map);

      // Base Tile Layer (Default Satellite)
      const baseStyle = BASEMAP_STYLES.SATELLITE;
      tileLayerRef.current = L.tileLayer(baseStyle.url, {
        maxZoom: baseStyle.maxZoom,
        attribution: baseStyle.attribution,
      }).addTo(map);

      // Layer groups
      boundaryLayerRef.current = L.layerGroup().addTo(map);
      cadastreLayerRef.current = L.layerGroup().addTo(map);
      problemsLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Basemap Style Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const style = BASEMAP_STYLES[activeBasemap.toUpperCase()] || BASEMAP_STYLES.SATELLITE;

    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (labelLayerRef.current) {
      map.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }

    tileLayerRef.current = L.tileLayer(style.url, {
      maxZoom: style.maxZoom,
      attribution: style.attribution,
    }).addTo(map);

    if (style.overlayUrl) {
      labelLayerRef.current = L.tileLayer(style.overlayUrl, {
        maxZoom: style.maxZoom,
        pane: 'overlayPane',
      }).addTo(map);
    }
  }, [activeBasemap]);

  // 3. Pan & FlyTo when village or focusedLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (focusedLocation) {
      map.flyTo(focusedLocation, 17, { duration: 1.2 });
      return;
    }

    if (village) {
      const center =
        village.meta?.center ||
        (village.meta?.lat && village.meta?.lon
          ? [village.meta.lat, village.meta.lon]
          : [30.3695, 76.3775]);
      const zoom = village.meta?.zoom || 16;
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [village?.meta?.id, village?.meta?.lat, village?.meta?.lon, focusedLocation]);

  // 4. Map Click Picker Event Listener
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (pickLocationMode && onPickLocation) {
        const { lat, lng } = e.latlng;
        onPickLocation({ lat, lon: lng });
      }
    };

    map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [pickLocationMode, onPickLocation]);

  // 5. Render Village Boundary Polygon
  useEffect(() => {
    const boundaryLayer = boundaryLayerRef.current;
    if (!boundaryLayer) return;

    boundaryLayer.clearLayers();

    const activeBoundary = boundary || village?.boundary;
    if (layerVisibility.boundary && activeBoundary && activeBoundary.geometry) {
      const isApprox = activeBoundary.properties?.isApproximate ?? false;

      const boundaryPolygon = L.geoJSON(activeBoundary, {
        style: {
          color: isApprox ? '#f59e0b' : '#00e5ff',
          weight: 2.5,
          dashArray: isApprox ? '6, 6' : '4, 4',
          fillColor: isApprox ? '#f59e0b' : '#00e5ff',
          fillOpacity: isApprox ? 0.04 : 0.08,
        },
      });

      boundaryPolygon.bindTooltip(
        `<div class="p-1 font-mono text-xs">
          <b>${activeBoundary.properties?.name || 'Village Boundary'}</b><br/>
          <span class="${isApprox ? 'text-amber-400' : 'text-cyan-400'}">
            ${activeBoundary.properties?.source || 'Cadastral Boundary'}
          </span>
        </div>`
      );

      boundaryPolygon.addTo(boundaryLayer);
    }
  }, [boundary, village?.boundary, layerVisibility.boundary]);

  // 6. Render Community Problems ('Things to Fix') Markers
  useEffect(() => {
    const problemsLayer = problemsLayerRef.current;
    if (!problemsLayer) return;

    problemsLayer.clearLayers();

    if (!layerVisibility.problems) return;

    reportedProblems.forEach((prob) => {
      const catObj =
        PROBLEM_CATEGORIES.find((c) => c.id === prob.category) || PROBLEM_CATEGORIES[0];
      const isResolved = prob.status === 'resolved';

      const iconColor = isResolved ? '#10b981' : catObj.color;

      const marker = L.circleMarker([prob.lat, prob.lon], {
        radius: isResolved ? 7 : 9,
        color: '#ffffff',
        fillColor: iconColor,
        fillOpacity: 0.95,
        weight: 2,
      });

      const popupHtml = `
        <div class="p-2.5 font-sans text-xs text-slate-100 min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
            <span class="font-bold text-white text-sm flex items-center space-x-1.5">
              <span>${catObj.icon}</span>
              <span>${prob.title}</span>
            </span>
          </div>
          <p class="text-slate-300 text-[11px] mb-2">${prob.description}</p>
          <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1.5">
            <span>Priority: <b class="${prob.priority === 'high' ? 'text-rose-400' : 'text-amber-400'} uppercase">${prob.priority}</b></span>
            <span>Status: <b class="${isResolved ? 'text-emerald-400' : 'text-rose-400'} uppercase">${prob.status}</b></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.bindTooltip(`${catObj.icon} ${prob.title} (${prob.priority.toUpperCase()})`, {
        sticky: true,
      });

      marker.addTo(problemsLayer);
    });

    // Render Community Added Places
    communityFeatures.forEach((feat) => {
      const marker = L.circleMarker([feat.lat, feat.lon], {
        radius: 8,
        color: '#00e5ff',
        fillColor: '#0284c7',
        fillOpacity: 0.9,
        weight: 2,
      });

      marker.bindPopup(`
        <div class="p-2 font-sans text-xs text-slate-100 min-w-[200px]">
          <div class="font-bold text-white mb-1">${feat.name}</div>
          <div class="text-[10px] text-cyan-300 mb-1">${feat.confidenceLabel}</div>
          <p class="text-slate-300 text-[11px]">${feat.notes}</p>
        </div>
      `);

      marker.addTo(problemsLayer);
    });
  }, [reportedProblems, communityFeatures, layerVisibility.problems]);

  // 7. Render Cadastral Layers (Roads, Buildings, Water, Facilities)
  useEffect(() => {
    const cadastreLayer = cadastreLayerRef.current;
    if (!cadastreLayer || !village) return;

    cadastreLayer.clearLayers();

    const selectedKeys = new Set(
      selectedInterventions.map((iv) => `${iv.type}:${iv.target}`)
    );

    // 7A. Water Bodies (Village Pond)
    if (layerVisibility.waterBodies && village.water_bodies) {
      village.water_bodies.forEach((wb) => {
        L.circle([wb.lat, wb.lon], {
          radius: wb.radius_m || 38,
          color: '#0284c7',
          fillColor: '#0369a1',
          fillOpacity: 0.5,
          weight: 2,
        })
          .bindTooltip(
            `<div class="p-1 font-mono text-xs">
              <b class="text-blue-300">${wb.name}</b><br/>
              <span class="text-slate-300">${wb.status}</span>
            </div>`
          )
          .addTo(cadastreLayer);
      });
    }

    // 7B. Water 150m Buffers
    const activeWaterPoints = new Set(village.water_points || []);
    selectedInterventions.forEach((iv) => {
      if (iv.type === 'water_point') activeWaterPoints.add(iv.target);
    });

    if (layerVisibility.waterBuffers && village.nodes) {
      activeWaterPoints.forEach((nodeId) => {
        const node = village.nodes[nodeId];
        if (node) {
          const isNew = selectedKeys.has(`water_point:${nodeId}`);
          L.circle([node.lat, node.lon], {
            radius: 150,
            color: isNew ? '#00e5ff' : '#0284c7',
            fillColor: isNew ? '#00e5ff' : '#0284c7',
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 4',
          })
            .bindTooltip(
              `<div class="p-1 font-mono text-xs">
                <b>150m Water Service Buffer</b><br/>Anchor: ${nodeId} (${node.label})
              </div>`
            )
            .addTo(cadastreLayer);
        }
      });
    }

    // 7C. Roads (E1-E5 + E6)
    if (layerVisibility.roads && village.edges && village.nodes) {
      village.edges.forEach((e) => {
        const a = village.nodes[e.a];
        const b = village.nodes[e.b];
        if (!a || !b) return;

        const isUpgraded = selectedKeys.has(`road_upgrade:${e.id}`);
        const strokeColor = isUpgraded
          ? '#00e5ff'
          : e.condition === 'good'
          ? '#10b981'
          : '#f59e0b';

        const polyline = L.polyline(
          [
            [a.lat, a.lon],
            [b.lat, b.lon],
          ],
          {
            color: strokeColor,
            weight: isUpgraded ? 6 : 4.5,
            opacity: 0.95,
          }
        );

        polyline.bindTooltip(
          `
          <div class="p-1 font-mono text-xs">
            <div class="font-bold text-white mb-1">Road Corridor ${e.id}</div>
            <div class="text-slate-300">${e.a} ↔ ${e.b} (${e.dist_m}m · ${isUpgraded ? Math.max(1, Math.round(e.time_min * 0.45)) : e.time_min}m walk)</div>
            <div class="mt-1 font-semibold ${isUpgraded ? 'text-cyan-400' : e.condition === 'good' ? 'text-emerald-400' : 'text-amber-400'}">
              ${isUpgraded ? 'STATUS: UPGRADED' : e.condition.toUpperCase()}
            </div>
          </div>
        `,
          { sticky: true }
        );

        if (interactive && onToggleIntervention && e.condition === 'poor') {
          polyline.on('click', () => {
            onToggleIntervention({
              type: 'road_upgrade',
              target: e.id,
              cost_lakh: 15,
              label: `Upgrade Road ${e.id}`,
            });
          });
        }

        polyline.addTo(cadastreLayer);
      });

      // Proposed Road E6
      if (village.proposed_edge) {
        const pe = village.proposed_edge;
        const pa = village.nodes[pe.a];
        const pb = village.nodes[pe.b];
        if (pa && pb) {
          const isBuilt = selectedKeys.has(`road_new:${pe.id}`);
          const polyline = L.polyline(
            [
              [pa.lat, pa.lon],
              [pb.lat, pb.lon],
            ],
            {
              color: isBuilt ? '#00e5ff' : '#94a3b8',
              weight: isBuilt ? 6 : 3,
              dashArray: isBuilt ? null : '6, 6',
              opacity: isBuilt ? 0.95 : 0.6,
            }
          );

          polyline.bindTooltip(
            `
            <div class="p-1 font-mono text-xs">
              <div class="font-bold text-white mb-1">Proposed Road Segment ${pe.id}</div>
              <div class="text-slate-300">${pe.a} ↔ ${pe.b} (${pe.dist_m}m · ${pe.time_min}m walk)</div>
              <div class="mt-1 font-semibold ${isBuilt ? 'text-cyan-400' : 'text-slate-400'}">
                ${isBuilt ? 'STATUS: INCLUDED IN PLAN' : 'STATUS: PROPOSED CORRIDOR'}
              </div>
            </div>
          `,
            { sticky: true }
          );

          if (interactive && onToggleIntervention) {
            polyline.on('click', () => {
              onToggleIntervention({
                type: 'road_new',
                target: pe.id,
                cost_lakh: 20,
                label: `Build new road (${pe.id})`,
              });
            });
          }

          polyline.addTo(cadastreLayer);
        }
      }
    }

    // 7D. Junction Nodes & Facilities
    if (layerVisibility.facilities && village.nodes) {
      Object.entries(village.nodes).forEach(([nodeId, n]) => {
        const hasWater = activeWaterPoints.has(nodeId);
        const isSchool = village.facilities?.SCHOOL?.node === nodeId;

        const marker = L.circleMarker([n.lat, n.lon], {
          radius: isSchool ? 10 : hasWater ? 8 : 5,
          color: isSchool ? '#00e5ff' : hasWater ? '#38bdf8' : '#cbd5e1',
          fillColor: isSchool ? '#00e5ff' : hasWater ? '#0284c7' : '#1e293b',
          fillOpacity: 0.95,
          weight: 2,
        });

        marker.bindTooltip(
          `
          <div class="p-1 font-mono text-xs">
            <div class="font-bold text-white">${nodeId}: ${n.label}</div>
            ${isSchool ? '<div class="text-cyan-400 font-semibold mt-0.5">Facility: Govt Primary School (✓ Verified)</div>' : ''}
            ${hasWater ? '<div class="text-blue-400 font-semibold mt-0.5">Potable Water Point (✓ Verified)</div>' : ''}
          </div>
        `,
          { sticky: true }
        );

        marker.addTo(cadastreLayer);
      });
    }

    // 7E. Buildings & Households
    if (layerVisibility.buildings && village.buildings) {
      const buildingStatusMap = {};
      const metricsToUse = activeMetrics || baselineMetrics;
      if (metricsToUse && metricsToUse.buildings) {
        metricsToUse.buildings.forEach((b) => {
          buildingStatusMap[b.id] = b;
        });
      }

      village.buildings.forEach((b) => {
        const status = buildingStatusMap[b.id];
        const isSchoolOk = status?.school_accessible ?? false;

        const circle = L.circleMarker([b.lat, b.lon], {
          radius: 6.5,
          color: isSchoolOk ? '#10b981' : '#f43f5e',
          fillColor: isSchoolOk ? '#059669' : '#e11d48',
          fillOpacity: 0.9,
          weight: 1.5,
        });

        circle.bindTooltip(`Household ${b.id} (${b.zone}) — ${isSchoolOk ? 'School OK' : 'Needs Access'}`, {
          sticky: true,
        });
        circle.addTo(cadastreLayer);
      });
    }
  }, [
    village,
    selectedInterventions,
    activeMetrics,
    baselineMetrics,
    layerVisibility,
    interactive,
    onToggleIntervention,
  ]);

  // Recenter Action
  const recenter = () => {
    if (mapInstanceRef.current && village) {
      const center = village.meta?.center || [30.3695, 76.3775];
      const zoom = village.meta?.zoom || 16;
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1 });
    }
  };

  // Fullscreen Action
  const toggleFullscreen = () => {
    const el = mapContainerRef.current?.parentElement;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => console.error('Fullscreen error:', err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error('Exit fullscreen error:', err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#080c14] ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      style={{ minHeight: height }}
    >
      {/* Top Map Floating Action Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 max-w-[80%]">
        <BasemapSelector activeBasemap={activeBasemap} onSelectBasemap={setActiveBasemap} />
        <DataSourceBadge tier={dataTier} size="xs" />

        {/* Map Layers Dropdown Button */}
        <div className="relative group">
          <button className="px-3 py-1.5 rounded-xl bg-[#0e1624]/90 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 shadow-md">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Layers</span>
          </button>

          <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-50 bg-[#0a0f19] border border-slate-800 rounded-xl p-3 shadow-2xl min-w-[210px] space-y-2 text-xs">
            <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
              Toggle Map Features
            </div>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layerVisibility.problems}
                onChange={() => toggleLayer('problems')}
                className="rounded accent-rose-500"
              />
              <span>🔴 Community Problems</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layerVisibility.boundary}
                onChange={() => toggleLayer('boundary')}
                className="rounded accent-cyan-400"
              />
              <span>Village Boundary</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layerVisibility.roads}
                onChange={() => toggleLayer('roads')}
                className="rounded accent-cyan-400"
              />
              <span>Road Corridors</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layerVisibility.buildings}
                onChange={() => toggleLayer('buildings')}
                className="rounded accent-cyan-400"
              />
              <span>Cadastral Households</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layerVisibility.waterBodies}
                onChange={() => toggleLayer('waterBodies')}
                className="rounded accent-cyan-400"
              />
              <span>Village Pond / Water Body</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layerVisibility.waterBuffers}
                onChange={() => toggleLayer('waterBuffers')}
                className="rounded accent-cyan-400"
              />
              <span>150m Water Service Buffers</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layerVisibility.facilities}
                onChange={() => toggleLayer('facilities')}
                className="rounded accent-cyan-400"
              />
              <span>Public School & Facilities</span>
            </label>
          </div>
        </div>
      </div>

      {/* Top Right Controls: Recenter, North, Fullscreen */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-2">
        <button
          onClick={recenter}
          className="p-2 rounded-xl bg-[#0e1624]/90 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-md transition-colors shadow-md"
          title="Recenter Map to Selected Village"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-[#0e1624]/90 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-md transition-colors shadow-md"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* North Compass */}
        <div
          className="p-2 rounded-xl bg-[#0e1624]/90 text-cyan-400 border border-slate-800 backdrop-blur-md shadow-md flex flex-col items-center select-none"
          title="Map Orientation: North Up"
        >
          <Compass className="w-4 h-4" />
          <span className="text-[9px] font-mono font-bold mt-0.5">N</span>
        </div>
      </div>

      {/* Coordinate Picker Banner when active */}
      {pickLocationMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[450] bg-cyan-500 text-slate-950 px-4 py-2 rounded-2xl shadow-glow font-bold text-xs flex items-center space-x-2 animate-bounce">
          <MapPin className="w-4 h-4" />
          <span>Tap anywhere on the village map to place the pin</span>
        </div>
      )}

      {/* Leaflet DOM Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] max-w-md pointer-events-auto">
        <MapLegend activeInterventions={selectedInterventions} />
      </div>
    </div>
  );
}
