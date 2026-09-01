/**
 * GramVerse AI - Geospatial Data Abstraction Layer
 * Standardizes Village boundary, roads, buildings, water bodies, facilities, and DEM elevation data.
 */

import { api } from '../api/client';
import { VILLAGE_REGISTRY, DATA_TIERS } from './villageRegistry';

// Synthetic but geographically consistent pond/reservoir for Patiala pilot
const PATIALA_WATER_BODIES = [
  {
    id: 'WB-1',
    name: 'Gram Panchayat Village Pond (Talab)',
    type: 'pond',
    lat: 30.3682,
    lon: 76.3765,
    radius_m: 35,
    depth_m: 2.5,
    status: 'Monsoon catchment / groundwater recharge',
  },
];

// Elevation contour anchors for 3D terrain reconstruction (in meters AMSL)
const PATIALA_ELEVATION_PROFILE = {
  minElevation_m: 248.0,
  maxElevation_m: 252.5,
  slopeDirection: 'North-East to South-West',
  contours: [
    { label: '252m Contour (Zone A Core)', elev_m: 252.0 },
    { label: '250m Contour (School Junction)', elev_m: 250.0 },
    { label: '248m Contour (Zone B Lowland)', elev_m: 248.0 },
  ],
};

export const geoDataService = {
  // Get full layers for a village
  async getVillageLayers(villageId = 'PB-PAT-001') {
    const meta = VILLAGE_REGISTRY.find((v) => v.id === villageId) || VILLAGE_REGISTRY[0];

    // If active pilot village, fetch real backend graph and layers
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
        isLiveSimSupported: true,
      };
    }

    // For secondary regional villages (Tier 2 / Tier 3), provide GIS preview representation
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
      isLiveSimSupported: false,
    };
  },

  // Get elevation profile
  async getVillageElevation(villageId = 'PB-PAT-001') {
    if (villageId === 'PB-PAT-001') {
      return PATIALA_ELEVATION_PROFILE;
    }
    return null;
  },

  // Get water bodies
  async getVillageWaterBodies(villageId = 'PB-PAT-001') {
    if (villageId === 'PB-PAT-001') {
      return PATIALA_WATER_BODIES;
    }
    return [];
  },
};
