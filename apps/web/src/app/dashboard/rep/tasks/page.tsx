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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'skipped': return 'bg-gray-500/20 text-gray-400 border-gray-500';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            <p className="text-muted-foreground">Manage your daily outreach activities</p>
          </div>
          <button className="px-6 py-3 bg-accent-1 text-white rounded-lg hover:bg-accent-2 transition-colors">
            Launch Browser
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Tasks</p>
                <p className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <div className="text-3xl">⚡</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-green-400">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-accent-3/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Time Left</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {filteredTasks.reduce((acc, task) => {
                    const time = parseInt(task.estimatedTime);
                    return acc + time;
                  }, 0)} min
                </p>
              </div>
              <div className="text-3xl">⏱️</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {(['all', 'today', 'upcoming', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === status
                  ? 'bg-accent-1 text-white'
                  : 'bg-muted text-muted-foreground hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-card rounded-lg p-6 border border-accent-3/20">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTaskIcon(task.type)}</span>
                    <h3 className="text-lg font-semibold text-white">{task.campaignName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Client: {task.clientName} • Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📊 {task.completedCount}/{task.prospectCount} prospects</span>
                    <span>⏱️ {task.estimatedTime}</span>
                  </div>
                  {task.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">{task.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <button 
                      onClick={() => handleStartTask(task.id)}
                      className="px-4 py-2 bg-accent-1 text-white rounded-lg hover:bg-accent-2 transition-colors"
                    >
                      Start Task
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button 
                      onClick={() => handleCompleteTask(task.id)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <button className="px-4 py-2 bg-muted text-white rounded-lg hover:bg-accent-1/20 transition-colors">
                    View Details
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-accent-1 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(task.completedCount / task.prospectCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "You don't have any tasks assigned yet."
                : `No ${filter} tasks found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
