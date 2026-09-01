import React from 'react';
import { ShieldCheck, Satellite, AlertCircle } from 'lucide-react';
import { DATA_TIERS } from '../../services/villageRegistry';

export function DataSourceBadge({ tier, showTooltip = true, size = 'sm' }) {
  if (!tier) return null;

  const icons = {
    tier1_drone_gis: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
    tier2_satellite_gis_dem: <Satellite className="w-3.5 h-3.5 text-cyan-400" />,
    tier3_census_boundary: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
  };

  const isSmall = size === 'xs';

  return (
    <div
      className={`inline-flex items-center space-x-1.5 rounded-full font-mono font-semibold border ${
        tier.badgeColor
      } ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
      title={showTooltip ? tier.description : ''}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tier.dotColor} animate-pulse`} />
      {icons[tier.id]}
      <span>{tier.label}</span>
    </div>
  );
}
