import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookMarked, Loader2, ArrowLeft, Plus, CheckCircle, Circle, Play, FileText, ExternalLink, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' or 'tasks'
  
  // Modals state
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState('text');
  const [newMaterialContent, setNewMaterialContent] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseData, tasksData, materialsData] = await Promise.all([
          apiFetch(`/courses/${id}`),
          apiFetch('/tasks'),
          apiFetch(`/materials/course/${id}`)
        ]);
        
        setCourse(courseData);
        setTasks((tasksData || []).filter(t => (t.course?._id || t.course) === id));
        setMaterials(materialsData || []);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle, courseId: id, deadline: newTaskDeadline })
      });
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDeadline('');
      setTaskModalOpen(false);
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterialTitle.trim() || !newMaterialContent.trim()) return;

    try {
      const newMaterial = await apiFetch('/materials', {
        method: 'POST',
        body: JSON.stringify({ title: newMaterialTitle, content: newMaterialContent, type: newMaterialType, courseId: id })
      });
      setMaterials([...materials, newMaterial]);
      setNewMaterialTitle('');
      setNewMaterialContent('');
      setMaterialModalOpen(false);
    } catch (error) {
      console.error("Failed to add material", error);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await apiFetch(`/tasks/${taskId}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    } catch (error) {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: currentStatus } : t));
    }
  };

  const toggleMaterialStatus = async (materialId, currentStatus) => {
    setMaterials(materials.map(m => m._id === materialId ? { ...m, isCompleted: !currentStatus } : m));
    try {
      await apiFetch(`/materials/${materialId}/status`, { method: 'PUT', body: JSON.stringify({ isCompleted: !currentStatus }) });
    } catch (error) {
      setMaterials(materials.map(m => m._id === materialId ? { ...m, isCompleted: currentStatus } : m));
    }
  };

  const deleteMaterial = async (materialId) => {
    if (!confirm('Delete this material?')) return;
    try {
      await apiFetch(`/materials/${materialId}`, { method: 'DELETE' });
      setMaterials(materials.filter(m => m._id !== materialId));
    } catch (error) {
      console.error("Failed to delete material", error);
    }
  };

  // Helper to extract YouTube ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        Course not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Background Accent */}
        <div className={`absolute top-0 right-0 w-full max-w-lg h-64 ${course.color} rounded-bl-[100px] blur-[150px] opacity-10 pointer-events-none`}></div>

        <div className="max-w-5xl mx-auto p-6 pb-24 md:p-10 space-y-8">
          <header className="space-y-4">
            <Link to="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${course.color} bg-opacity-20 flex items-center justify-center`}>
                  <BookMarked className={`w-7 h-7 ${course.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{course.title}</h1>
                  <p className="text-slate-400 mt-1">Course details and learning materials</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTaskModalOpen(true)}
                  className="glass hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all text-white"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
                <button 
                  onClick={() => setMaterialModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Material
                </button>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="flex space-x-1 glass p-1 rounded-2xl max-w-sm">
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'materials' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Study Materials
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'tasks' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Tasks
            </button>
          </div>

          {/* Content Area */}
          <div className="mt-6">
            {activeTab === 'materials' && (
              <div className="space-y-6">
                {materials.length === 0 ? (
                  <div className="glass p-10 rounded-2xl text-center text-slate-400">
                    No study materials added yet. Click "Add Material" to get started!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {materials.map((mat, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        key={mat._id} className="glass rounded-2xl p-6 relative group overflow-hidden border border-white/5"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${mat.type === 'video' ? 'bg-rose-500/20 text-rose-400' : mat.type === 'link' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {mat.type === 'video' ? <Play className="w-5 h-5" /> : mat.type === 'link' ? <ExternalLink className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <h3 className="text-lg font-bold text-white">{mat.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => deleteMaterial(mat._id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-all rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleMaterialStatus(mat._id, mat.isCompleted)} className="focus:outline-none">
                              {mat.isCompleted ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-500 hover:text-emerald-400 transition-colors" />}
                            </button>
                          </div>
                        </div>

                        {/* Viewer */}
                        <div className="mt-4 bg-[#0f172a]/50 rounded-xl p-4 overflow-hidden">
                          {mat.type === 'video' ? (
                            getYouTubeId(mat.content) ? (
                              <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe 
                                  width="100%" height="100%" 
                                  src={`https://www.youtube.com/embed/${getYouTubeId(mat.content)}`} 
                                  title="YouTube video player" frameBorder="0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                  allowFullScreen>
                                </iframe>
                              </div>
                            ) : (
                              <a href={mat.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-400 hover:text-primary-300">
                                <ExternalLink className="w-4 h-4" /> Open Video Link
                              </a>
                            )
                          ) : mat.type === 'link' ? (
                            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                              <p className="text-slate-300 text-sm">This is an external resource link.</p>
                              <a href={mat.content} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white transition-colors">
                                <ExternalLink className="w-4 h-4" /> Visit Website
                              </a>
                            </div>
                          ) : (
                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 max-h-48 overflow-y-auto custom-scrollbar">
                              <p className="whitespace-pre-wrap">{mat.content}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="glass rounded-3xl overflow-hidden border border-white/5 max-w-3xl">
                {tasks.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">
                    No tasks for this course.
                  </div>
                ) : (
                  <ul className="divide-y divide-white/5">
                    {tasks.map((task, idx) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        key={task._id} className="p-4 sm:px-6 hover:bg-white/5 transition-colors flex items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <button onClick={() => toggleTaskStatus(task._id, task.status)} className="focus:outline-none">
                            {task.status === 'completed' ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-500 hover:text-primary-400 transition-colors" />}
                          </button>
                          <div>
                            <p className={`font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</p>
                            {task.deadline && <span className="text-xs text-slate-500">Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass w-full max-w-md rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Add Task to {course.title}</h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Task Title</label>
                  <input type="text" autoFocus value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="What do you need to do?" className="glass-input w-full px-4 py-3 text-white" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Deadline</label>
                  <input type="date" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} className="glass-input w-full px-4 py-3 bg-transparent text-slate-200" style={{ colorScheme: 'dark' }} />
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors cursor-pointer">Save Task</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isMaterialModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass w-full max-w-lg rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Add Study Material</h3>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Material Title</label>
                  <input type="text" autoFocus value={newMaterialTitle} onChange={e => setNewMaterialTitle(e.target.value)} placeholder="e.g., Chapter 1 Notes" className="glass-input w-full px-4 py-3 text-white" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Material Type</label>
                  <select value={newMaterialType} onChange={e => setNewMaterialType(e.target.value)} className="glass-input w-full px-4 py-3 bg-[#1e293b] text-slate-200">
                    <option value="text">Text / Notes</option>
                    <option value="video">Video URL (YouTube)</option>
                    <option value="link">Official Website Link</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">
                    {newMaterialType === 'text' ? 'Notes Content' : newMaterialType === 'video' ? 'YouTube Video URL' : 'Website URL'}
                  </label>
                  {newMaterialType === 'text' ? (
                    <textarea value={newMaterialContent} onChange={e => setNewMaterialContent(e.target.value)} placeholder="Type or paste your notes here..." className="glass-input w-full px-4 py-3 text-white h-32 resize-none" required></textarea>
                  ) : (
                    <input type="url" value={newMaterialContent} onChange={e => setNewMaterialContent(e.target.value)} placeholder="https://..." className="glass-input w-full px-4 py-3 text-white" required />
                  )}
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button type="button" onClick={() => setMaterialModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors cursor-pointer">Save Material</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetail;
