import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import { Menu, Bell, User as UserIcon, LogOut, ArrowLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DashboardLayout: React.FC = () => {
  const { currentUser, logout, notifications } = useApp();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!currentUser) return null;

  const unreadNotificationsCount = notifications.filter(
    n => n.userId === currentUser.id && !n.read
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-slate-200 bg-slate-900 flex-shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* 2. Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 max-w-xs bg-slate-900 h-full flex flex-col z-10"
            >
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Main Content Columns */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-100 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Left tools */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Back button or Quick Link */}
            <Link
              to={currentUser.role === 'patient' ? '/dashboard/patient' : currentUser.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin'}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dashboard Home</span>
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>

            {/* User Dropdown Profile Shortcut */}
            <div className="h-8 w-px bg-slate-200" />
            <Link 
              to="/profile" 
              className="flex items-center gap-2 group cursor-pointer"
              title="View Profile"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-8.5 w-8.5 rounded-full object-cover border border-slate-200 group-hover:border-blue-500 transition-colors"
              />
              <span className="hidden sm:inline text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors max-w-[120px] truncate">
                {currentUser.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Dashboard Dynamic Component Render */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
