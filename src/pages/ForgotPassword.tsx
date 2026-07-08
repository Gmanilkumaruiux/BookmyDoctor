import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, HeartPulse, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const ForgotPassword: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'patient') navigate('/dashboard/patient', { replace: true });
      else if (currentUser.role === 'doctor') navigate('/dashboard/doctor', { replace: true });
      else if (currentUser.role === 'admin') navigate('/dashboard/admin', { replace: true });
    }
  }, [currentUser, navigate]);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 text-center space-y-3">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center text-white shadow-md shadow-blue-100">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800">Reset Password</h3>
            <p className="text-xs text-slate-400">Receive reset links to regain access to your medical account.</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 mb-1">
                <CheckCircle2 className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 text-base">Check Your Inbox</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                  A dynamic link has been dispatched to <strong>{email}</strong>. Follow the instructions to configure a new access password.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Send Reset Link
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Return to login */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to login page
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
