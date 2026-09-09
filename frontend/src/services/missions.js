// Mission presets for the gamified Planning Suite.
// Kept separate from the UI so both VillageContext (which needs to check
// whether a mission's target was hit after a simulation) and
// MissionPresets.jsx (which renders the cards) share one source of truth.

export const MISSIONS = [
  {
    id: 'mission-school',
    title: 'Mission 1: School Access Sprint',
    name: 'Plan: School Access Sprint',
    iconKey: 'school',
    category: 'Education & Mobility',
    budget: 35,
    objective: 'school',
    targetMetric: 'School Accessibility ≥ 70%',
    color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    description:
      'Far Hamlet (Zone B) students currently face walking times up to 23 minutes. Modernize bottleneck road links (E3, E5) or build corridor E6 within a strict ₹35L budget.',
    difficulty: 'Moderate',
    checkSuccess: (metrics) => metrics.school_accessibility_pct >= 70,
  },
  {
    id: 'mission-flood',
    title: 'Mission 2: Monsoon Flood Defense',
    name: 'Plan: Monsoon Flood Defense',
    iconKey: 'flood',
    category: 'Drainage & Climate Resilience',
    budget: 30,
    objective: 'drainage',
    targetMetric: 'Drainage Coverage 100%',
    color: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    description:
      'Zero stormwater drainage exists currently, leaving both Zone A and Zone B vulnerable to monsoon waterlogging. Fund community drainage projects within ₹30L.',
    difficulty: 'Direct',
    checkSuccess: (metrics) => metrics.drainage_coverage_pct >= 100,
  },
  {
    id: 'mission-water',
    title: 'Mission 3: Clean Water Lifeline',
    name: 'Plan: Clean Water Lifeline',
    iconKey: 'water',
    category: 'Public Health',
    budget: 30,
    objective: 'water',
    targetMetric: 'Water Access ≥ 70%',
    color: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    description:
      '80% of households are outside the 150m walking buffer from existing water sources. Place new decentralized water points at key junctions within ₹30L.',
    difficulty: 'Tactical',
    checkSuccess: (metrics) => metrics.water_access_pct >= 70,
  },
  {
    id: 'mission-holistic',
    title: 'Mission 4: Comprehensive Modernization',
    name: 'Plan: Comprehensive Modernization',
    iconKey: 'holistic',
    category: 'Multi-Criteria Holistic',
    budget: 65,
    objective: 'holistic',
    targetMetric: 'Composite Score ≥ 70 pts',
    color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    description:
      'Balance road connectivity, flood prevention, and potable water distribution across both village zones to achieve an outstanding composite development score.',
    difficulty: 'Master Planner',
    checkSuccess: (metrics) => metrics.composite_score >= 70,
  },
];

export function getMissionById(id) {
  return MISSIONS.find((m) => m.id === id) || null;
}
