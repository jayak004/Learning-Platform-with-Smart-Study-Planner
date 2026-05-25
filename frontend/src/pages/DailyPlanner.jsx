import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Circle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';

const DailyPlanner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch tasks that are due today or overdue
        const data = await apiFetch('/tasks/today');
        setTasks(data || []);
      } catch (error) {
        console.error("Failed to fetch today's tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: currentStatus } : t));
    }
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(deadline) < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-[#0f172a] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-primary-400" /> Daily Planner
            </h1>
            <p className="text-slate-400 mt-2">Your focus for today.</p>
          </header>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">To Do Today ({pendingTasks.length})</h2>
            {pendingTasks.length === 0 ? (
              <div className="glass p-8 rounded-2xl text-center text-slate-400">
                You have no tasks due today! Relax or get ahead.
              </div>
            ) : (
              <ul className="space-y-3">
                {pendingTasks.map((task, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={task._id} 
                    className={`glass p-4 rounded-xl flex items-center justify-between gap-4 border-l-4 ${isOverdue(task.deadline) ? 'border-l-rose-500 bg-rose-500/5' : 'border-l-primary-500'}`}
                  >
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleTaskStatus(task._id, task.status)} className="focus:outline-none cursor-pointer">
                        <Circle className="w-6 h-6 text-slate-500 hover:text-primary-400 transition-colors" />
                      </button>
                      <div>
                        <p className="font-medium text-slate-200">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {task.course && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                              {task.course.title}
                            </span>
                          )}
                          {isOverdue(task.deadline) && (
                            <span className="text-xs text-rose-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
            
            {completedTasks.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-slate-400 border-b border-white/10 pb-2 mt-8">Completed Today ({completedTasks.length})</h2>
                <ul className="space-y-3 opacity-60">
                  {completedTasks.map(task => (
                    <li key={task._id} className="glass p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-emerald-500">
                      <button onClick={() => toggleTaskStatus(task._id, task.status)} className="focus:outline-none cursor-pointer">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      </button>
                      <div>
                        <p className="font-medium text-slate-500 line-through">{task.title}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DailyPlanner;
