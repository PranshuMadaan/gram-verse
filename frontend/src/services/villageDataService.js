/**
 * GramVerse AI - Village Data & Boundary Resolution Service
 * Manages cadastral boundaries, water bodies, elevation profiles, and data-availability metadata.
 */

import { api } from '../api/client';
import { VILLAGE_REGISTRY, DATA_TIERS } from './villageRegistry';

// Cadastral Survey Boundary Polygon for Patiala Pilot (PB-PAT-001)
const PATIALA_PILOT_BOUNDARY = {
  type: 'Polygon',
  coordinates: [
    [
      [76.3745, 30.3725],
      [76.3785, 30.3728],
      [76.3812, 30.3702],
      [76.3815, 30.3675],
      [76.3788, 30.3655],
      [76.3755, 30.3658],
      [76.3735, 30.3685],
      [76.3745, 30.3725],
    ],
  ],
};

const PATIALA_WATER_BODIES = [
  {
    id: 'WB-1',
    name: 'Gram Panchayat Village Pond (Talab)',
    type: 'pond',
    lat: 30.3682,
    lon: 76.3765,
    radius_m: 38,
    depth_m: 2.5,
    status: 'Groundwater recharge & storm retention basin',
  },
];

const PATIALA_ELEVATION_PROFILE = {
  minElevation_m: 248.0,
  maxElevation_m: 252.5,
  slopeDirection: 'North-East to South-West',
  contours: [
    { label: '252m Contour (Village Core)', elev_m: 252.0 },
    { label: '250m Contour (School Junction)', elev_m: 250.0 },
    { label: '248m Contour (Lowland Hamlet)', elev_m: 248.0 },
  ],
};

export const villageDataService = {
  /**
   * Get village boundary GeoJSON polygon
   */
  getVillageBoundary(village) {
    if (!village) return null;

    // 1. If explicit GeoJSON exists on the object
    if (village.geojson) {
      return {
        type: 'Feature',
        geometry: village.geojson,
        properties: {
          name: village.name,
          isApproximate: false,
          source: 'OpenStreetMap Administrative Vector',
        },
      };
    }

    // 2. If Patiala Pilot
    if (village.id === 'PB-PAT-001' || village.name?.toLowerCase().includes('kalyan')) {
      return {
        type: 'Feature',
        geometry: PATIALA_PILOT_BOUNDARY,
        properties: {
          name: 'Kalyan (Patiala Rural Sector 1)',
          isApproximate: false,
          source: 'Drone Cadastral Survey (SVAMITVA Phase 1)',
        },
      };
    }

    // 3. Fallback: Generate an explicit 1.5km bounding box extent polygon
    const lat = village.lat || village.center?.[0] || 30.3695;
    const lon = village.lon || village.center?.[1] || 76.3775;
    const delta = 0.012; // approx 1.3km

    const approxPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [lon - delta, lat + delta],
          [lon + delta, lat + delta],
          [lon + delta, lat - delta],
          [lon - delta, lat - delta],
          [lon - delta, lat + delta],
        ],
      ],
    };

    return {
      type: 'Feature',
      geometry: approxPolygon,
      properties: {
        name: village.name,
        isApproximate: true,
        source: 'Cadastral Bounding Extent (Village boundary polygon unavailable from GIS source)',
      },
    };
  },

  /**
   * Get cadastral layers (nodes, edges, buildings, facilities)
   */
  async getVillageLayers(villageId = 'PB-PAT-001') {
    const meta =
      VILLAGE_REGISTRY.find((v) => v.id === villageId) || VILLAGE_REGISTRY[0];

    if (meta.id === 'PB-PAT-001') {
      const liveData = await api.getVillage();
      return {
        meta,
        nodes: liveData.nodes,
        edges: liveData.edges,
        proposed_edge: liveData.proposed_edge,
        buildings: liveData.buildings,
        zones: liveData.zones,
        facilities: liveData.facilities,
        water_points: liveData.water_points,
        water_bodies: PATIALA_WATER_BODIES,
        elevation: PATIALA_ELEVATION_PROFILE,
        boundary: this.getVillageBoundary(meta),
        isLiveSimSupported: true,
      };
    }

    return {
      meta,
      nodes: {},
      edges: [],
      proposed_edge: null,
      buildings: [],
      zones: {},
      facilities: {},
      water_points: [],
      water_bodies: [],
      elevation: { minElevation_m: 200, maxElevation_m: 220, contours: [] },
      boundary: this.getVillageBoundary(meta),
      isLiveSimSupported: false,
    };
  },
};
