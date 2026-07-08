import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Mail, Lock, HeartPulse, ShieldAlert, ArrowRight, Sparkles, UserCheck, Stethoscope, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import GoogleSignInModal from '../components/GoogleSignInModal';

interface LoginProps {
  role?: 'patient' | 'doctor' | 'admin';
}

const Login: React.FC<LoginProps> = ({ role = 'patient' }) => {
  const { login, loginWithGoogle, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'patient') navigate('/dashboard/patient', { replace: true });
      else if (currentUser.role === 'doctor') navigate('/dashboard/doctor', { replace: true });
      else if (currentUser.role === 'admin') navigate('/dashboard/admin', { replace: true });
    }
  }, [currentUser, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);



  const handleGoogleSuccess = async (email: string, name: string, avatar?: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle(email, name, avatar);
      if (result.success) {
        const savedUser = JSON.parse(localStorage.getItem('bmd_current_user') || '{}');
        const userRole = savedUser.role || 'patient';

        if (userRole === role) {
          if (userRole === 'patient') navigate('/dashboard/patient');
          else if (userRole === 'doctor') navigate('/dashboard/doctor');
          else if (userRole === 'admin') navigate('/dashboard/admin');
        } else {
          setError(`Google account is registered as a ${userRole}. Please use the correct login portal.`);
        }
      } else {
        setError(result.error || 'Google authentication failed.');
      }
    } catch (err: any) {
      setError('An error occurred during Google Sign-In.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (errMessage: string) => {
    setError(errMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password, role);
      if (result.success) {
        // Successful redirect depending on role
        const savedUser = JSON.parse(localStorage.getItem('bmd_current_user') || '{}');
        const userRole = savedUser.role;

        if (userRole === 'patient') navigate('/dashboard/patient');
        else if (userRole === 'doctor') navigate('/dashboard/doctor');
        else if (userRole === 'admin') navigate('/dashboard/admin');
        else navigate('/');
      } else {
        setError(result.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Theme settings depending on role
  const getThemeConfig = () => {
    if (role === 'doctor') {
      return {
        headerBg: 'bg-blue-50/60',
        iconBg: 'bg-blue-100/60 border-blue-200 text-blue-700',
        icon: Stethoscope,
        title: 'Physician Login Portal',
        subtitle: 'Sign in to manage patient queues, schedule working slots, and consultation history.',
        btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/10 hover:shadow-blue-900/20',
        linkColor: 'text-blue-600 hover:text-blue-800'
      };
    } else if (role === 'admin') {
      return {
        headerBg: 'bg-purple-50/60',
        iconBg: 'bg-purple-100/60 border-purple-200 text-purple-700',
        icon: ShieldCheck,
        title: 'Administrator Login Portal',
        subtitle: 'Sign in to verify practitioner applications and oversee clinic operations.',
        btnBg: 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/10 hover:shadow-purple-900/20',
        linkColor: 'text-purple-600 hover:text-purple-800'
      };
    } else {
      return {
        headerBg: 'bg-[#F5F7F5]',
        iconBg: 'bg-[#E8F5EC] border-[#D1EADE] text-[#2E6F40]',
        icon: HeartPulse,
        title: 'Patient Login Portal',
        subtitle: 'Sign in to schedule doctor appointments and check diagnostics reports.',
        btnBg: 'bg-[#2E6F40] hover:bg-[#245A33] shadow-emerald-900/10 hover:shadow-emerald-900/20',
        linkColor: 'text-[#2E6F40] hover:text-[#245A33]'
      };
    }
  };

  const theme = getThemeConfig();
  const IconComponent = theme.icon;

  return (
    <div className="max-w-md mx-auto my-12 space-y-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md border border-[#E5E7EB] overflow-hidden"
      >
        {/* Role-Specific Brand Header */}
        <div className={`p-8 ${theme.headerBg} border-b border-[#E5E7EB] text-center space-y-4`}>
          <div className={`inline-flex h-14 w-14 rounded-2xl ${theme.iconBg} border items-center justify-center shadow-sm`}>
            <IconComponent className="h-7 w-7 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-[#1F2937] tracking-tight">{theme.title}</h3>
            <p className="text-xs font-semibold text-[#6B7280] leading-relaxed max-w-sm mx-auto">{theme.subtitle}</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {location.state?.message && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs flex items-start gap-2.5 text-left font-semibold">
              <Sparkles className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-blue-600 animate-pulse" />
              <span>{location.state.message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Username / Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-[#6B7280]/60"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Password</label>
                <Link
                  to="/forgot-password"
                  className={`text-[11px] font-bold ${theme.linkColor} transition-colors`}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-[#6B7280]/60"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl ${theme.btnBg} text-white font-bold text-sm shadow-md hover:shadow-lg transition-all focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] duration-300`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Only show Google SignIn for Patient Portal */}
          {role === 'patient' && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E5E7EB]"></div>
                <span className="flex-shrink mx-4 text-[#6B7280] text-[10px] uppercase font-black tracking-widest">or</span>
                <div className="flex-grow border-t border-[#E5E7EB]"></div>
              </div>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-3 px-4 bg-white border border-[#E5E7EB] hover:border-emerald-600/40 hover:bg-[#FAF9F6] text-[#1F2937] rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-md hover:scale-[1.01]"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>
            </>
          )}

          {/* Registration Redirect for Patients */}
          {role === 'patient' && (
            <div className="text-center text-xs text-[#6B7280] pt-1 font-semibold">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#2E6F40] font-black hover:underline">
                Create an account
              </Link>
            </div>
          )}

          {/* Portal Switcher Footer Links */}
          <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Other Login Portals</span>
            <div className="flex items-center gap-3 flex-wrap justify-center text-xs font-bold text-slate-500">
              {role !== 'patient' && (
                <Link to="/login" className="text-emerald-700 hover:underline">Patient Login</Link>
              )}
              {role !== 'patient' && role !== 'doctor' && (
                <span className="h-1 w-1 rounded-full bg-slate-300" />
              )}
              {role !== 'doctor' && (
                <Link to="/login/doctor" className="text-blue-700 hover:underline">Doctor Login</Link>
              )}
              {role !== 'admin' && (
                <span className="h-1 w-1 rounded-full bg-slate-300" />
              )}
              {role !== 'admin' && (
                <Link to="/login/admin" className="text-purple-700 hover:underline">Admin Login</Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>



      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        onFailure={handleGoogleFailure}
      />
    </div>
  );
};

export default Login;
