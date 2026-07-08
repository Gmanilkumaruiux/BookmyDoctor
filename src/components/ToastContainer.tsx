import React, { useEffect } from 'react';
import { useApp, Toast } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const duration = toast.message === 'Logged out successfully.' ? 2500 : 4500;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.message, onClose]);

  let bgClass = 'bg-white border-slate-100';
  let icon = <Info className="h-5 w-5 text-blue-500" />;
  let borderAccent = 'border-l-blue-500';

  if (toast.type === 'success') {
    bgClass = 'bg-white border-slate-100';
    icon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    borderAccent = 'border-l-emerald-500';
  } else if (toast.type === 'alert') {
    bgClass = 'bg-white border-slate-100';
    icon = <AlertCircle className="h-5 w-5 text-rose-500" />;
    borderAccent = 'border-l-rose-500';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur border border-l-4 ${borderAccent} ${bgClass} rounded-2xl shadow-xl shadow-slate-200/40 max-w-full overflow-hidden`}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-xs font-semibold text-slate-800 leading-normal text-left">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all focus:outline-none cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
