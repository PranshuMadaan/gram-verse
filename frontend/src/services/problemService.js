/**
 * GramVerse AI - Community Problem & Infrastructure Service
 * Handles problem reporting, data confidence levels, and civic task tracking.
 */

export const PROBLEM_CATEGORIES = [
  { id: 'road', label: 'Broken Road / Corridor', icon: '🛣️', color: '#f43f5e', defaultCost: 15, defaultIntervention: 'road_upgrade' },
  { id: 'water', label: 'No Drinking Water', icon: '💧', color: '#00e5ff', defaultCost: 10, defaultIntervention: 'water_point' },
  { id: 'drainage', label: 'Poor Drainage / Flooding', icon: '🌊', color: '#f59e0b', defaultCost: 15, defaultIntervention: 'drainage' },
  { id: 'electricity', label: 'No Electricity / Lighting', icon: '⚡', color: '#eab308', defaultCost: 8, defaultIntervention: null },
  { id: 'school', label: 'School Access Issue', icon: '🏫', color: '#a855f7', defaultCost: 20, defaultIntervention: 'road_new' },
  { id: 'health', label: 'Health Facility Problem', icon: '🏥', color: '#10b981', defaultCost: 12, defaultIntervention: null },
  { id: 'other', label: 'Other Civic Deficit', icon: '📌', color: '#94a3b8', defaultCost: 5, defaultIntervention: null },
];

export const DATA_CONFIDENCE = {
  VERIFIED: { id: 'verified', label: 'Verified', badge: '✓ Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  IMPORTED: { id: 'imported', label: 'Imported', badge: '◐ Imported', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  COMMUNITY: { id: 'community', label: 'Community Added', badge: '✎ Community Added', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  UNVERIFIED: { id: 'unverified', label: 'Unverified', badge: '? Unverified', color: 'text-slate-400 bg-slate-800 border-slate-700' },
};

export const INITIAL_COMMUNITY_PROBLEMS = [
  {
    id: 'prob-1',
    category: 'road',
    title: 'Severe mud & waterlogging on East Corridor',
    description: 'Road E5 is severely damaged; students from Far Hamlet take 23 mins to reach school during monsoon.',
    lat: 30.3665,
    lon: 76.3792,
    priority: 'high',
    status: 'open',
    reportedBy: 'Village Youth Council',
    createdAt: '2 days ago',
    linkedIntervention: {
      type: 'road_upgrade',
      target: 'E5',
      cost_lakh: 15,
      label: 'Upgrade East–Far Hamlet Road (E5)',
    },
  },
  {
    id: 'prob-2',
    category: 'water',
    title: 'Far Hamlet lacks potable drinking water',
    description: 'Households B6–B9 walk over 400m to the nearest hand pump. Need a new solar RO water station near junction N5.',
    lat: 30.3662,
    lon: 76.3812,
    priority: 'high',
    status: 'open',
    reportedBy: 'Ward 2 Residents',
    createdAt: '4 days ago',
    linkedIntervention: {
      type: 'water_point',
      target: 'N5',
      cost_lakh: 10,
      label: 'New water point at Far Hamlet (N5)',
    },
  },
  {
    id: 'prob-3',
    category: 'drainage',
    title: 'Monsoon runoff flooding Village Core',
    description: 'Lack of paved pucca storm drainage in Zone A causes water stagnation near the Panchayat Bhavan.',
    lat: 30.3708,
    lon: 76.3755,
    priority: 'medium',
    status: 'open',
    reportedBy: 'Gram Sabha Audit',
    createdAt: '1 week ago',
    linkedIntervention: {
      type: 'drainage',
      target: 'zoneA',
      cost_lakh: 15,
      label: 'Improve drainage in Zone A',
    },
  },
];
