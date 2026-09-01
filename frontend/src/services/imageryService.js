/**
 * GramVerse AI - Basemap Imagery Service
 * Supports legitimate Satellite, Hybrid, Street, and Terrain basemaps with proper attribution.
 */

export const BASEMAP_STYLES = {
  SATELLITE: {
    id: 'satellite',
    name: 'Satellite Imagery',
    shortName: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  HYBRID: {
    id: 'hybrid',
    name: 'Satellite + Labels',
    shortName: 'Hybrid',
    icon: '🏷️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    attribution: 'Tiles &copy; Esri, Labels &copy; CARTO & OpenStreetMap',
    maxZoom: 19,
  },
  STREET: {
    id: 'street',
    name: 'Dark Cadastral Vector',
    shortName: 'Dark Street',
    icon: '🗺️',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  TERRAIN: {
    id: 'terrain',
    name: 'Topographic Terrain',
    shortName: 'Terrain',
    icon: '⛰️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
};

export const imageryService = {
  getBasemaps: () => Object.values(BASEMAP_STYLES),
  getDefaultBasemap: () => BASEMAP_STYLES.SATELLITE,
};
