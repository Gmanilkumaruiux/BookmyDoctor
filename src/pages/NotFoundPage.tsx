import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { HeartPulse, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const NotFoundPage: React.FC = () => {
  const { currentUser } = useApp();

  const getHomeLink = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'patient') return '/dashboard/patient';
    if (currentUser.role === 'doctor') return '/dashboard/doctor';
    if (currentUser.role === 'admin') return '/dashboard/admin';
    return '/';
  };

  return (
    <div className="py-20 text-center max-w-md mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md space-y-5"
      >
        <div className="inline-flex h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 items-center justify-center">
          <HeartPulse className="h-8 w-8 animate-pulse text-rose-500" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">404</h2>
          <h3 className="font-bold text-slate-700 text-lg">Page Not Found</h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
            The page path you requested does not exist or has been relocated to another secure directory.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to={getHomeLink()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all text-center flex items-center justify-center gap-1"
          >
            <Home className="h-4 w-4" />
            Go To Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
