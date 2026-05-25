import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Circle, Loader2, BookMarked, CalendarDays, MoreVertical, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourseId, setNewTaskCourseId] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, tasksData] = await Promise.all([
          apiFetch('/courses'),
          apiFetch('/tasks')
        ]);
        setCourses(coursesData || []);
        setTasks(tasksData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-rose-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const newCourse = await apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify({ title: newCourseTitle, color: randomColor })
      });
      setCourses([...courses, newCourse]);
      setNewCourseTitle('');
      setCourseModalOpen(false);
    } catch (error) {
      console.error("Failed to add course", error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskCourseId) return;

    try {
      const newTask = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle, courseId: newTaskCourseId, deadline: newTaskDeadline })
      });
      // The API populates course, but optimistic update might lack it until refetch. We can just add it and it will work enough.
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskCourseId('');
      setNewTaskDeadline('');
      setTaskModalOpen(false);
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    // Optimistic UI update
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert on failure
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: currentStatus } : t));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0f172a] flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative z-10 pb-24">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-primary-600/20 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
              <p className="text-slate-400">Track your courses and daily study tasks.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCourseModalOpen(true)}
                className="glass hover:bg-white/10 px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all text-white"
              >
                <Plus className="w-4 h-4" /> New Course
              </button>
              <button 
                onClick={() => setTaskModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-500 px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-1">Total Courses</h3>
              <p className="text-4xl font-bold text-white">{courses.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
              <h3 className="text-slate-400 text-sm font-medium mb-1">Pending Tasks</h3>
              <p className="text-4xl font-bold text-white">{tasks.length - completedTasks}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 relative overflow-hidden">
              <h3 className="text-slate-400 text-sm font-medium mb-1">Overall Progress</h3>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-bold text-white">{progressPercentage}%</p>
                <p className="text-sm text-primary-400 font-medium mb-1">{completedTasks} of {tasks.length} done</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </motion.div>
          </div>

          {/* Deadline Reminders */}
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const pendingTasks = tasks.filter(t => t.status !== 'completed');
            const overdueTasks = pendingTasks.filter(t => t.deadline && new Date(t.deadline) < today);
            const todayTasks = pendingTasks.filter(t => t.deadline && new Date(t.deadline) >= today && new Date(t.deadline) < tomorrow);
            
            if (overdueTasks.length > 0 || todayTasks.length > 0) {
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                      <Bell className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        Deadline Reminders
                        {overdueTasks.length > 0 && <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{overdueTasks.length} Overdue</span>}
                      </h3>
                      <p className="text-slate-300 text-sm mt-1">
                        You have {todayTasks.length > 0 ? `${todayTasks.length} task(s) due today` : ''} 
                        {todayTasks.length > 0 && overdueTasks.length > 0 ? ' and ' : ''}
                        {overdueTasks.length > 0 ? `${overdueTasks.length} overdue task(s)` : ''}.
                      </p>
                    </div>
                  </div>
                  <a href="/planner" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap">
                    View Planner
                  </a>
                </motion.div>
              );
            }
            return null;
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-primary-400" /> Active Courses
              </h2>
              <div className="space-y-3">
                {courses.length === 0 ? (
                  <div className="glass p-6 rounded-2xl text-center text-slate-400 text-sm border-dashed border-2 border-white/10">
                    No courses yet. Add one to get started!
                  </div>
                ) : (
                  courses.map((course, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.1 }}
                      key={course._id} 
                      className="glass p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${course.color}`}></div>
                        <span className="font-medium text-slate-200">{course.title}</span>
                      </div>
                      <MoreVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-purple-400" /> Your Tasks
              </h2>
              <div className="glass rounded-3xl overflow-hidden border border-white/5">
                {tasks.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                    <p>No tasks remaining. You're all caught up!</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {tasks.map((task, idx) => {
                      const course = courses.find(c => c._id === (task.course?._id || task.course));
                      return (
                        <motion.li 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={task._id} 
                          className="p-4 sm:px-6 hover:bg-white/5 transition-colors flex items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start sm:items-center gap-4">
                            <button 
                              onClick={() => toggleTaskStatus(task._id, task.status)}
                              className="mt-1 sm:mt-0 flex-shrink-0 focus:outline-none cursor-pointer"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-500 hover:text-primary-400 transition-colors" />
                              )}
                            </button>
                            <div>
                              <p className={`font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                {task.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {course && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${course.color}`}></span>
                                    {course.title}
                                  </span>
                                )}
                                {task.deadline && (
                                  <span className="text-xs text-slate-500">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass w-full max-w-md rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Create New Course</h3>
              <form onSubmit={handleAddCourse}>
                <input 
                  autoFocus
                  type="text" 
                  value={newCourseTitle} 
                  onChange={e => setNewCourseTitle(e.target.value)} 
                  placeholder="Course Name (e.g., Mathematics)" 
                  className="glass-input w-full pr-4 py-3 mb-4 text-white"
                  required
                />
                <div className="flex gap-3 justify-end mt-6">
                  <button type="button" onClick={() => setCourseModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors cursor-pointer">Save Course</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass w-full max-w-md rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Add Study Task</h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Task Title</label>
                  <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="What do you need to do?" className="glass-input w-full pr-4 py-3 text-white" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Course</label>
                  <select value={newTaskCourseId} onChange={e => setNewTaskCourseId(e.target.value)} className="glass-input w-full pr-4 py-3 appearance-none bg-[#1e293b] text-slate-200" required>
                    <option value="" disabled>Select a course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Deadline</label>
                  <input type="date" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} className="glass-input w-full pr-4 py-3 bg-transparent text-slate-200" style={{ colorScheme: 'dark' }} />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors cursor-pointer">Save Task</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
