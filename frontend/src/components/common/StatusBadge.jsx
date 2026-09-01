import React from 'react';

export function StatusBadge({ status, label = null, size = 'sm' }) {
  const isGood =
    status === true ||
    status === 'good' ||
    status === 'improved' ||
    status === 'accessible' ||
    status === 'active';

  const isPoor =
    status === false ||
    status === 'poor' ||
    status === 'inaccessible' ||
    status === 'unserved';

  const displayText =
    label ||
    (typeof status === 'boolean'
      ? status
        ? 'Accessible'
        : 'Inaccessible'
      : String(status || '–'));

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-1.5 py-0.5'
      : 'text-xs px-2.5 py-1';

  if (isGood) {
    return (
      <span
        className={`inline-flex items-center font-mono font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
        {displayText}
      </span>
    );
  }

  if (isPoor) {
    return (
      <span
        className={`inline-flex items-center font-mono font-medium rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
        {displayText}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
      {displayText}
    </span>
  );
}
