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

const GHARUAN_BOUNDARY = {
  type: 'Polygon',
  coordinates: [
    [
      [76.5720, 30.7075],
      [76.5780, 30.7078],
      [76.5800, 30.7045],
      [76.5790, 30.7010],
      [76.5740, 30.7005],
      [76.5715, 30.7035],
      [76.5720, 30.7075],
    ],
  ],
};

const GHARUAN_WATER_BODIES = [
  {
    id: 'GWB-1',
    name: 'Gharuan Sarovar & Groundwater Recharge Basin',
    type: 'sarovar',
    lat: 30.7025,
    lon: 76.5745,
    radius_m: 42,
    depth_m: 3.0,
    status: 'Natural catchment & rainwater percolation pond',
  },
];

const GHARUAN_ELEVATION_PROFILE = {
  minElevation_m: 298.0,
  maxElevation_m: 304.5,
  slopeDirection: 'North to South-East',
  contours: [
    { label: '304m Contour (GT Junction)', elev_m: 304.0 },
    { label: '301m Contour (Smart School & Chowk)', elev_m: 301.0 },
    { label: '298m Contour (Kisan Hamlet Lowland)', elev_m: 298.0 },
  ],
};

export const villageDataService = {
  /**
   * Get village boundary GeoJSON polygon
   */
  getVillageBoundary(village) {
    if (!village) return null;

    if (village.id === 'PB-SAS-002' || village.name?.toLowerCase().includes('gharuan')) {
      return {
        type: 'Feature',
        geometry: GHARUAN_BOUNDARY,
        properties: {
          name: 'Gharuan (Mohali Smart Rural Sector)',
          isApproximate: false,
          source: 'Drone Cadastral Survey (SVAMITVA Phase 2)',
        },
      };
    }

    // If explicit GeoJSON exists on the object
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

    // If Patiala Pilot
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

    // Fallback: Generate an explicit bounding box extent polygon
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
        source: 'Cadastral Bounding Extent',
      },
    };
  },

  /**
   * Get cadastral layers (nodes, edges, buildings, facilities)
   */
  async getVillageLayers(villageId = 'PB-PAT-001') {
    const meta =
      VILLAGE_REGISTRY.find((v) => v.id === villageId) || VILLAGE_REGISTRY[0];

    try {
      const liveData = await api.getVillage(meta.id);
      const isGharuan = meta.id === 'PB-SAS-002';
      return {
        meta,
        nodes: liveData.nodes,
        edges: liveData.edges,
        proposed_edge: liveData.proposed_edge,
        buildings: liveData.buildings,
        zones: liveData.zones,
        facilities: liveData.facilities,
        water_points: liveData.water_points,
        water_bodies: isGharuan ? GHARUAN_WATER_BODIES : PATIALA_WATER_BODIES,
        elevation: isGharuan ? GHARUAN_ELEVATION_PROFILE : PATIALA_ELEVATION_PROFILE,
        boundary: this.getVillageBoundary(meta),
        isLiveSimSupported: true,
      };
    } catch (err) {
      console.warn(`Falling back to local registry for ${villageId}:`, err);
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
    }
  },
};
