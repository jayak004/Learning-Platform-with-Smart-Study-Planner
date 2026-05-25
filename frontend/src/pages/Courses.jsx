import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, tasksData, materialsData] = await Promise.all([
          apiFetch('/courses'),
          apiFetch('/tasks'),
          apiFetch('/materials')
        ]);
        setCourses(coursesData || []);
        setTasks(tasksData || []);
        setMaterials(materialsData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await apiFetch(`/courses/${courseId}`, { method: 'DELETE' });
      setCourses(courses.filter(c => c._id !== courseId));
      setTasks(tasks.filter(t => (t.course?._id || t.course) !== courseId));
      setMaterials(materials.filter(m => (m.course?._id || m.course) !== courseId));
    } catch (error) {
      console.error("Failed to delete course", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10 p-6 pb-24 md:p-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <BookMarked className="w-8 h-8 text-primary-400" /> My Courses
            </h1>
            <p className="text-slate-400 mt-2">Track your learning progress across all enrolled courses.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full glass p-10 rounded-2xl text-center text-slate-400">
                You haven't added any courses yet. Go to Dashboard to add one!
              </div>
            ) : (
              courses.map((course, idx) => {
                const courseMaterials = materials.filter(m => (m.course?._id || m.course) === course._id);
                const completedCourseMaterials = courseMaterials.filter(m => m.isCompleted).length;
                const progressPercentage = courseMaterials.length > 0 ? Math.round((completedCourseMaterials / courseMaterials.length) * 100) : 0;
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={course._id}
                  >
                    <Link to={`/courses/${course._id}`} className="glass p-6 rounded-2xl relative group overflow-hidden flex flex-col h-full hover:bg-white/5 transition-colors cursor-pointer block">
                      <div className={`absolute top-0 left-0 w-full h-1 ${course.color}`}></div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl ${course.color} bg-opacity-20 flex items-center justify-center`}>
                          <BookMarked className={`w-6 h-6 ${course.color.replace('bg-', 'text-')}`} />
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteCourse(course._id); }} 
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer z-10"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-4">{course.title}</h3>
                      
                      <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-medium text-slate-400">Course Progress</span>
                          <span className="text-sm font-bold text-white">{progressPercentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                          <div className={`h-full ${course.color} transition-all duration-1000`} style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500 text-right">
                          {completedCourseMaterials} / {courseMaterials.length} materials completed
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Courses;
