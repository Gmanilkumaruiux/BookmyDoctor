import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { User as UserIcon, Mail, Lock, HeartPulse, ShieldCheck, ArrowRight, ShieldAlert, Phone, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import GoogleSignInModal from '../components/GoogleSignInModal';

const Register: React.FC = () => {
  const { register, loginWithGoogle, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'patient') navigate('/dashboard/patient', { replace: true });
      else if (currentUser.role === 'doctor') navigate('/dashboard/doctor', { replace: true });
      else if (currentUser.role === 'admin') navigate('/dashboard/admin', { replace: true });
    }
  }, [currentUser, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleGoogleSuccess = async (email: string, name: string, avatar?: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle(email, name, avatar);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/patient');
        }, 2000);
      } else {
        setError(result.error || 'Google registration failed.');
      }
    } catch (err: any) {
      setError('An error occurred during Google registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (errMessage: string) => {
    setError(errMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        name,
        email,
        phone,
        gender,
        dob,
        role,
      };

      const result = await register(userData, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (role === 'patient') navigate('/dashboard/patient');
          else if (role === 'admin') navigate('/dashboard/admin');
          else navigate('/login'); // If they registered as doctor, wait for clearance
        }, 2000);
      } else {
        setError(result.error || 'Registration failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md border border-[#E5E7EB] overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 bg-[#F5F7F5] border-b border-[#E5E7EB] text-center space-y-4">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-[#E8F5EC] border border-[#D1EADE] items-center justify-center text-[#2E6F40] shadow-sm">
            <HeartPulse className="h-7 w-7 text-[#2E6F40]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl font-extrabold text-[#1F2937]">Create Account</h3>
            <p className="text-xs font-medium text-[#6B7280]">Join BookMyDoctor to book trusted healthcare.</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {location.state?.message && (
            <div className="p-3 bg-[#E8F5EC] border border-[#D1EADE] rounded-xl text-[#2E6F40] text-xs flex items-start gap-2.5 text-left font-medium">
              <Sparkles className="h-4.5 w-4.5 flex-shrink-0 mt-0.5 text-[#2E6F40]" />
              <span>{location.state.message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 text-left font-medium">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#2E6F40]" />
              <div>
                <span className="font-extrabold block text-sm">Account Registered!</span>
                {role === 'doctor' 
                  ? 'Your doctor account was submitted. Pending admin verification.'
                  : role === 'admin'
                    ? 'Redirecting to your administrator dashboard...'
                    : 'Redirecting to your patient dashboard...'}
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registered as Patient */}

              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-[#6B7280]/60"
                  />
                  <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-[#6B7280]/60"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
                </div>
              </div>

              {/* Patient Fields */}
              {role === 'patient' && (
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Phone */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-[#6B7280]/60"
                      />
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Birthdate</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                      />
                      <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 5 characters"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-[#6B7280]/60"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-sm shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all focus:outline-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-[1.02] duration-300"
              >
                {loading ? 'Creating Account...' : 'Register'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E5E7EB]"></div>
                <span className="flex-shrink mx-4 text-[#6B7280] text-[10px] uppercase font-black tracking-widest">or</span>
                <div className="flex-grow border-t border-[#E5E7EB]"></div>
              </div>

              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full py-3 px-4 bg-white border border-[#E5E7EB] hover:border-[#2E6F40]/40 hover:bg-[#FAF9F6] text-[#1F2937] rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-md hover:scale-[1.01]"
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
                Sign up with Google
              </button>
            </form>
          )}

          {/* Login Redirect */}
          <div className="text-center text-xs text-[#6B7280] pt-1 font-medium space-y-3">
            <div>
              Already have an account?{' '}
              <Link to="/login" className="text-[#2E6F40] font-bold hover:underline">
                Sign in instead
              </Link>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px]">
              Are you a medical professional?{' '}
              <Link to="/apply-doctor" className="text-blue-600 font-black hover:underline">
                Apply as Doctor
              </Link>
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

export default Register;
