/**
 * GramVerse AI - Geocoding & Boundary Resolution Service
 * Integrates OpenStreetMap Nominatim with caching, address parsing, and boundary polygon extraction.
 */

import { VILLAGE_REGISTRY, DATA_TIERS } from './villageRegistry';

const cache = new Map();

export const geocodingService = {
  /**
   * Search for Indian villages, towns, and districts using Nominatim
   */
  async searchIndianVillages(query) {
    if (!query || query.trim().length < 2) return [];

    const cleanQuery = query.trim().toLowerCase();

    // Check in-memory cache first
    if (cache.has(cleanQuery)) {
      return cache.get(cleanQuery);
    }

    // 1. Check local curated registry for instant high-confidence hits
    const curatedMatches = VILLAGE_REGISTRY.filter(
      (v) =>
        v.name.toLowerCase().includes(cleanQuery) ||
        v.district.toLowerCase().includes(cleanQuery) ||
        v.state.toLowerCase().includes(cleanQuery) ||
        v.id.toLowerCase().includes(cleanQuery)
    ).map((v) => ({
      id: v.id,
      displayName: `${v.name}, ${v.district}, ${v.state}`,
      name: v.name,
      subDistrict: v.subDistrict,
      district: v.district,
      state: v.state,
      pincode: v.pincode,
      lat: v.center[0],
      lon: v.center[1],
      boundingBox: [
        v.center[0] - 0.015,
        v.center[0] + 0.015,
        v.center[1] - 0.015,
        v.center[1] + 0.015,
      ],
      dataTier: v.dataTier,
      isPilot: v.id === 'PB-PAT-001',
      source: 'Curated Registry & Survey',
      geojson: null,
    }));

    try {
      // 2. Query Nominatim API with countrycodes=in and polygon_geojson=1
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=in&polygon_geojson=1&addressdetails=1&limit=6`;

      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'GramVerse-Rural-Planner-SIH1704 (contact: gramverse.sih@gov.in)',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim geocoding error: ${response.statusText}`);
      }

      const data = await response.json();

      const nominatimResults = data.map((item) => {
        const addr = item.address || {};
        const name =
          addr.village ||
          addr.hamlet ||
          addr.town ||
          addr.suburb ||
          addr.county ||
          item.name ||
          item.display_name.split(',')[0];

        const district =
          addr.state_district ||
          addr.county ||
          addr.district ||
          addr.city ||
          'Rural District';

        const state = addr.state || 'India';
        const pincode = addr.postcode || '–';

        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        return {
          id: `osm-${item.osm_id || Math.random().toString(36).substring(7)}`,
          displayName: item.display_name,
          name,
          subDistrict: addr.suburb || addr.municipality || 'Rural Block',
          district,
          state,
          pincode,
          lat,
          lon,
          boundingBox: item.boundingbox
            ? [
                parseFloat(item.boundingbox[0]),
                parseFloat(item.boundingbox[1]),
                parseFloat(item.boundingbox[2]),
                parseFloat(item.boundingbox[3]),
              ]
            : [lat - 0.015, lat + 0.015, lon - 0.015, lon + 0.015],
          dataTier: DATA_TIERS.TIER_2,
          isPilot: false,
          source: 'OpenStreetMap Nominatim',
          geojson:
            item.geojson &&
            (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon')
              ? item.geojson
              : null,
        };
      });

      // Combine curated matches first, then Nominatim results
      const combined = [...curatedMatches];
      nominatimResults.forEach((nom) => {
        if (!combined.some((c) => Math.abs(c.lat - nom.lat) < 0.005 && Math.abs(c.lon - nom.lon) < 0.005)) {
          combined.push(nom);
        }
      });

      cache.set(cleanQuery, combined);
      return combined;
    } catch (err) {
      console.warn('Geocoding live fetch failed, returning curated fallback:', err);
      cache.set(cleanQuery, curatedMatches);
      return curatedMatches;
    }
  },
};
