import React, { useState } from 'react';
import { useVillage } from '../../context/VillageContext';
import { TaskCard } from './TaskCard';
import { Plus, ListTodo, Target, CheckCircle2, AlertCircle } from 'lucide-react';

export function TaskPlanner() {
  const {
    tasks,
    addTask,
    deleteTask,
    catalog,
    selectedInterventions,
    toggleIntervention,
  } = useVillage();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');
  const [targetMetric, setTargetMetric] = useState('School Accessibility');
  const [selectedCatalogKey, setSelectedCatalogKey] = useState('');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let linkedIv = null;
    let cost = 15;

    if (selectedCatalogKey) {
      const [type, target] = selectedCatalogKey.split(':');
      linkedIv = catalog.find((c) => c.type === type && c.target === target);
      if (linkedIv) cost = linkedIv.cost_lakh;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      targetMetric,
      budgetLakh: cost,
      linkedIntervention: linkedIv,
    };

    addTask(newTask);

    // Auto-fund if linked intervention
    if (linkedIv) {
      const isAlreadySelected = selectedInterventions.some(
        (s) => s.type === linkedIv.type && s.target === linkedIv.target
      );
      if (!isAlreadySelected) {
        toggleIntervention(linkedIv);
      }
    }

    setTitle('');
    setDescription('');
    setSelectedCatalogKey('');
    setIsCreating(false);
  };

  const handleToggleTask = (task) => {
    if (task.linkedIntervention) {
      toggleIntervention(task.linkedIntervention);
    }
  };

  return (
    <div className="bg-[#0e1624]/90 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-4 shadow-command">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <ListTodo className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Panchayat Planning Tasks & Objectives
            </h3>
            <p className="text-[11px] text-slate-400">
              Break down capital goals into actionable, budget-linked tasks
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'New Planning Task'}</span>
        </button>
      </div>

      {/* Task Creation Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateTask}
          className="p-4 rounded-xl bg-[#131d2e] border border-cyan-500/30 space-y-3 animate-in fade-in duration-150"
        >
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Define New Development Task
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Upgrade Bottleneck Route to School"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#0e1624] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#0e1624] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="normal">Standard Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Metric Goal</label>
              <select
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
                className="w-full bg-[#0e1624] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="School Accessibility">School Accessibility (≤8m Walk)</option>
                <option value="Clean Water Access">Clean Water Access (≤150m Buffer)</option>
                <option value="Drainage Coverage">Drainage Coverage (Flood Defense)</option>
                <option value="Holistic Development">Composite Development Score</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Link to Catalog Intervention (Auto-Costs)
              </label>
              <select
                value={selectedCatalogKey}
                onChange={(e) => setSelectedCatalogKey(e.target.value)}
                className="w-full bg-[#0e1624] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="">No linked intervention (Advisory task)</option>
                {catalog.map((c) => (
                  <option key={`${c.type}:${c.target}`} value={`${c.type}:${c.target}`}>
                    {c.label} (₹{c.cost_lakh}L)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Description / Rationale</label>
            <input
              type="text"
              placeholder="Why this task is necessary for village development..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0e1624] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-glow"
            >
              Save & Link Task
            </button>
          </div>
        </form>
      )}

      {/* Task Cards List */}
      <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-600" />
            <span>No planning tasks defined. Click "New Planning Task" to create one.</span>
          </div>
        ) : (
          tasks.map((task) => {
            const isSelected =
              task.linkedIntervention &&
              selectedInterventions.some(
                (s) =>
                  s.type === task.linkedIntervention.type &&
                  s.target === task.linkedIntervention.target
              );

            return (
              <TaskCard
                key={task.id}
                task={task}
                isSelected={isSelected}
                onToggleTask={handleToggleTask}
                onDeleteTask={deleteTask}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
