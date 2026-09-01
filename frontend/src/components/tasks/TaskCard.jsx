import React from 'react';
import { Target, CheckCircle2, Clock, Trash2, ArrowUpRight } from 'lucide-react';

export function TaskCard({ task, onToggleTask, onDeleteTask, isSelected }) {
  const priorityConfig = {
    high: {
      label: 'High Priority',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      border: 'border-rose-500/30',
    },
    medium: {
      label: 'Medium Priority',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      border: 'border-amber-500/30',
    },
    normal: {
      label: 'Standard Priority',
      badge: 'bg-slate-700 text-slate-300 border-slate-600',
      border: 'border-slate-800',
    },
  };

  const config = priorityConfig[task.priority] || priorityConfig.normal;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isSelected
          ? 'bg-[#131d2e] border-cyan-500/50 shadow-glow ring-1 ring-cyan-400/30'
          : 'bg-[#0e1624] border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${config.badge}`}
            >
              {config.label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Target: {task.targetMetric}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white leading-snug">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-slate-300 leading-relaxed font-sans pt-0.5">
              {task.description}
            </p>
          )}

          {task.linkedIntervention && (
            <div className="text-[11px] font-mono text-cyan-300 pt-1">
              Linked Intervention: <b>{task.linkedIntervention.label}</b> (₹{task.linkedIntervention.cost_lakh}L)
            </div>
          )}
        </div>

        {/* Task Actions & Allocation */}
        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            ₹{task.budgetLakh}L
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onToggleTask(task)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-colors border ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-[#131d2e] text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isSelected ? 'Funded' : 'Fund Task'}
            </button>

            {onDeleteTask && (
              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
