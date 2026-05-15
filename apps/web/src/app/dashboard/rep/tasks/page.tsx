"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetchRepTasks, type APITask } from '@/lib/api';

export default function RepTasksPage() {
  const [tasks, setTasks] = useState<APITask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRepTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredTasks = tasks.filter(task => {
    const s = task.status.toLowerCase();
    switch (filter) {
      case 'active':    return s !== 'completed' && s !== 'cancelled';
      case 'completed': return s === 'completed';
      default: return true;
    }
  });

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'connection': return '🤝';
      case 'dm': return '💬';
      case 'post': return '📝';
      case 'follow_up': return '🔄';
      default: return '📋';
    }
  };

  const STATUS_STYLE: Record<string, { color: string; label: string }> = {
    pending:     { color: 'var(--accent-3)', label: 'Pending' },
    in_progress: { color: 'var(--accent-2)', label: 'In Progress' },
    completed:   { color: 'var(--accent-4)', label: 'Done' },
    skipped:     { color: 'rgba(255,255,255,0.3)', label: 'Skipped' },
    failed:      { color: 'var(--accent-1)', label: 'Failed' },
  };

  const PRIORITY_STYLE: Record<string, { color: string }> = {
    high:   { color: 'var(--accent-1)' },
    medium: { color: 'var(--accent-3)' },
    low:    { color: 'var(--accent-2)' },
  };

  const handleStartTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'active' } : t));
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-1/3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
          </div>
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-white/60 font-bold mb-4">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-full border-2 border-accent-1 text-accent-1 text-xs font-black uppercase">Retry</button>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.status.toLowerCase() !== 'completed' && t.status.toLowerCase() !== 'cancelled');
  const completedTasks = tasks.filter(t => t.status.toLowerCase() === 'completed');

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Tasks</h1>
            <p className="text-white/40 font-bold mt-1">Your daily outreach mission brief.</p>
          </div>
          <button className="text-xs font-black uppercase tracking-wide px-4 py-2 rounded-full border-2 border-accent-1 text-accent-1 hover:bg-accent-1/10 transition-colors">
            🖥 Launch Browser
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total tasks',  value: tasks.length,                                     color: 'var(--accent-1)' },
            { label: 'Active',       value: activeTasks.length,                                color: 'var(--accent-2)' },
            { label: 'Completed',    value: completedTasks.length,                             color: 'var(--accent-4)' },
            { label: 'Campaigns',    value: new Set(tasks.map(t => t.campaignId)).size,        color: 'var(--accent-3)' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border-2 transition-colors"
              style={{
                borderColor: filter === f ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)',
                color: filter === f ? 'var(--accent-1)' : 'rgba(255,255,255,0.4)',
                background: filter === f ? 'rgba(255,58,242,0.08)' : 'transparent',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task cards */}
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const statusKey = task.status.toLowerCase();
            const ss = STATUS_STYLE[statusKey] ?? STATUS_STYLE.pending;
            const pct = task.prospectCount > 0 ? (task.completedCount / task.prospectCount) * 100 : 0;
            return (
              <div
                key={task.id}
                className="border rounded-2xl p-5"
                style={{ borderColor: ss.color + '30', background: ss.color + '06' }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5 shrink-0">{getTaskIcon(task.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-white">{task.campaignName}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full border" style={{ color: ss.color, borderColor: ss.color + '50', background: ss.color + '15' }}>
                        {ss.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white/45 mb-2">
                      {task.clientName} · {task.completedCount}/{task.prospectCount} actions
                      {task.startDate ? ` · Started ${new Date(task.startDate).toLocaleDateString()}` : ''}
                    </p>
                    {task.notes && (
                      <p className="text-xs italic text-white/35 mb-3">{task.notes}</p>
                    )}
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: ss.color }} />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {(statusKey === 'pending' || statusKey === 'draft') && (
                      <button onClick={() => handleStartTask(task.id)} className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 border-accent-1 text-accent-1 hover:bg-accent-1/10 transition-colors">
                        Start
                      </button>
                    )}
                    {(statusKey === 'active' || statusKey === 'in_progress') && (
                      <button onClick={() => handleCompleteTask(task.id)} className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 text-accent-4 hover:opacity-80 transition-colors" style={{ borderColor: 'var(--accent-4)' }}>
                        Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-3xl">
            <p className="text-5xl mb-4">🎯</p>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No tasks found</h3>
            <p className="text-sm font-medium text-white/40">
              {filter === 'all' ? "No tasks assigned yet." : `No ${filter} tasks.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
