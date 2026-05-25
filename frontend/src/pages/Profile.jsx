import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { apiFetch } from '../utils/api';

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, tasksData] = await Promise.all([
          apiFetch('/auth/me'),
          apiFetch('/tasks')
        ]);
        
        if (profileData) {
          setName(profileData.name || '');
          setEmail(profileData.email || '');
        }
        if (tasksData) {
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    
    try {
      const body = { name, email };
      if (password) body.password = password;

      const data = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      }
      
      setMessage('Profile updated successfully!');
      setPassword(''); 
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
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
      <main className="flex-1 overflow-y-auto relative z-10 p-6 md:p-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <User className="w-8 h-8 text-primary-400" /> My Profile
            </h1>
            <p className="text-slate-400 mt-2">Manage your personal information and view your progress.</p>
          </header>

          {/* Profile Overview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-1 flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full rounded-full bg-[#1e293b] flex items-center justify-center border-2 border-[#0f172a]">
                <span className="text-3xl font-bold text-white">{name.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left z-10">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {name}!</h2>
              <p className="text-slate-400 text-sm mb-4">{email}</p>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                  <span className="text-xl font-bold text-primary-400">{progressPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">{completedTasks} of {tasks.length} tasks completed</p>
              </div>
            </div>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-8 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Account Settings</h3>
            {message && (
              <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {message.includes('success') && <CheckCircle className="w-5 h-5" />}
                <p>{message}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input w-full pl-11 py-3.5 text-white focus:ring-primary-500"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full pl-11 py-3.5 text-white focus:ring-primary-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">New Password (Optional)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full pl-11 py-3.5 text-white focus:ring-primary-500"
                    placeholder="Leave blank to keep current"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center cursor-pointer"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
