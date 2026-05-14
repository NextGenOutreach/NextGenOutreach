"use client";

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  campaignId: string;
  campaignName: string;
  clientName: string;
  type: 'connection' | 'dm' | 'post' | 'follow_up';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  priority: 'low' | 'medium' | 'high';
  prospectCount: number;
  completedCount: number;
  dueDate: string;
  estimatedTime: string;
  templateId?: string;
  notes?: string;
}

export default function RepTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    // TODO: Fetch real tasks data from API
    const fetchTasks = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTasks([
          {
            id: '1',
            campaignId: '1',
            campaignName: 'Tech SaaS Outreach',
            clientName: 'TechCorp Inc.',
            type: 'connection',
            status: 'pending',
            priority: 'high',
            prospectCount: 15,
            completedCount: 0,
            dueDate: new Date().toISOString().split('T')[0],
            estimatedTime: '45 min',
            templateId: 'template-1',
            notes: 'Focus on CTOs and VPs of Engineering at companies with 100-500 employees'
          },
          {
            id: '2',
            campaignId: '1',
            campaignName: 'Tech SaaS Outreach',
            clientName: 'TechCorp Inc.',
            type: 'dm',
            status: 'in_progress',
            priority: 'medium',
            prospectCount: 8,
            completedCount: 3,
            dueDate: new Date().toISOString().split('T')[0],
            estimatedTime: '30 min',
            templateId: 'template-2'
          },
          {
            id: '3',
            campaignId: '2',
            campaignName: 'Finance Companies',
            clientName: 'FinanceHub',
            type: 'follow_up',
            status: 'pending',
            priority: 'medium',
            prospectCount: 5,
            completedCount: 0,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            estimatedTime: '20 min'
          },
          {
            id: '4',
            campaignId: '3',
            campaignName: 'Healthcare Startups',
            clientName: 'MediTech Solutions',
            type: 'post',
            status: 'completed',
            priority: 'low',
            prospectCount: 1,
            completedCount: 1,
            dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            estimatedTime: '15 min'
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = task.dueDate;
    
    switch (filter) {
      case 'today':
        return taskDate === today;
      case 'upcoming':
        return taskDate > today;
      case 'overdue':
        return taskDate < today && task.status !== 'completed';
      default:
        return true;
    }
  }).sort((a, b) => {
    // Sort by priority and due date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
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
    // TODO: Implement task start logic
    console.log('Starting task:', taskId);
  };

  const handleCompleteTask = (taskId: string) => {
    // TODO: Implement task completion logic
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'completed' as const } : task
    ));
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

  const today = new Date().toISOString().split('T')[0];
  const timeLeft = filteredTasks.filter(t => t.status !== 'completed').reduce((acc, t) => acc + parseInt(t.estimatedTime), 0);

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
            { label: "Today's tasks",  value: tasks.filter(t => t.dueDate === today).length,       color: 'var(--accent-1)' },
            { label: 'In progress',     value: tasks.filter(t => t.status === 'in_progress').length, color: 'var(--accent-2)' },
            { label: 'Completed',       value: tasks.filter(t => t.status === 'completed').length,   color: 'var(--accent-4)' },
            { label: 'Est. time left',  value: `${timeLeft} min`,                                    color: 'var(--accent-3)' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{s.label}</p>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'today', 'upcoming', 'overdue'] as const).map((f) => (
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
            const ss = STATUS_STYLE[task.status] ?? STATUS_STYLE.pending;
            const ps = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium;
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
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: ps.color, background: ps.color + '15' }}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white/45 mb-2">
                      {task.clientName} · Due {new Date(task.dueDate).toLocaleDateString()} · {task.completedCount}/{task.prospectCount} prospects · ⏱ {task.estimatedTime}
                    </p>
                    {task.notes && (
                      <p className="text-xs italic text-white/35 mb-3">{task.notes}</p>
                    )}
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: ss.color }} />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {task.status === 'pending' && (
                      <button onClick={() => handleStartTask(task.id)} className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full border-2 border-accent-1 text-accent-1 hover:bg-accent-1/10 transition-colors">
                        Start
                      </button>
                    )}
                    {task.status === 'in_progress' && (
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
