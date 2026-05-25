import React from 'react';
import { BookOpen, LayoutDashboard, BookMarked, CalendarDays, LogOut, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItemClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
      isActive 
        ? 'bg-white/10 text-primary-400' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 glass border-r border-white/5 hidden md:flex flex-col z-20 relative h-full min-h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center border border-primary-500/30">
            <BookOpen className="text-primary-400 w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SmartPlanner</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink to="/dashboard" className={navItemClass}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>
          <NavLink to="/courses" className={navItemClass}>
            <BookMarked className="w-5 h-5" /> My Courses
          </NavLink>
          <NavLink to="/planner" className={navItemClass}>
            <CalendarDays className="w-5 h-5" /> Daily Planner
          </NavLink>
          <NavLink to="/profile" className={navItemClass}>
            <User className="w-5 h-5" /> Profile
          </NavLink>
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass border-t border-white/10 z-50 flex items-center justify-around px-2 py-3 pb-safe">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>
        <NavLink to="/courses" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
          <BookMarked className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Courses</span>
        </NavLink>
        <NavLink to="/planner" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
          <CalendarDays className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Planner</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-colors ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Sidebar;
