import React from 'react';
import { BASEMAP_STYLES } from '../../services/imageryService';

export function BasemapSelector({ activeBasemap, onSelectBasemap }) {
  const styles = Object.values(BASEMAP_STYLES);

  return (
    <div className="flex items-center space-x-1 bg-[#0e1624]/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-md">
      {styles.map((style) => {
        const isSelected = activeBasemap === style.id;

        return (
          <button
            key={style.id}
            onClick={() => onSelectBasemap(style.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              isSelected
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title={style.name}
          >
            <span>{style.icon}</span>
            <span>{style.shortName}</span>
          </button>
        );
      })}
    </div>
  );
}
