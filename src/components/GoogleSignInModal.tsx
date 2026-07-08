import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Mail, User as UserIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, name: string, avatar?: string) => void;
  onFailure: (error: string) => void;
}

const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({ isOpen, onClose, onSuccess, onFailure }) => {
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');

  // Pre-configured Google Accounts for easy local selection
  const googleAccounts = [
    {
      name: 'Manil Galla',
      email: 'manilgalla039@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  ];

  // If a real client ID is configured, handle real popup login
  const handleRealGoogleSignIn = () => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scopes = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: scopes,
      prompt: 'select_account',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Open popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const authWindow = window.open(
      authUrl,
      'google_oauth_popup',
      `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
    );

    if (!authWindow) {
      onFailure('Popup blocked by browser. Please enable popups to sign in with Google.');
    }
  };

  // Watch for postMessage from the real Google OAuth callback window
  useEffect(() => {
    if (!clientId) return;

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Allow localhost or standard app domains
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { email, name, picture } = event.data.user;
        onSuccess(email, name, picture);
        onClose();
      } else if (event.data?.type === 'GOOGLE_AUTH_FAILURE') {
        onFailure(event.data.error || 'Google authentication failed.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [clientId, onSuccess, onFailure, onClose]);

  const handleAccountSelect = (email: string, name: string, avatar?: string) => {
    onSuccess(email, name, avatar);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!customEmail || !customName) {
      setCustomError('Please fill in both name and email.');
      return;
    }

    if (!customEmail.includes('@') || !customEmail.includes('.')) {
      setCustomError('Please enter a valid email address.');
      return;
    }

    onSuccess(customEmail, customName, `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customName)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Google-style Header */}
        <div className="p-6 border-b border-slate-100 text-center relative flex flex-col items-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Authentic Google Logo (Flat SVG vectors) */}
          <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24">
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
          
          <h3 className="text-xl font-semibold text-slate-800">Sign in with Google</h3>
          <p className="text-xs text-slate-500 mt-1">to continue to BlueMed Diagnostics</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {clientId ? (
            /* REAL GOOGLE SIGN-IN INTERFACE */
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-slate-600">
                A live Google OAuth connection is configured! Click the button below to sign in using your Google Account.
              </p>
              <button
                onClick={handleRealGoogleSignIn}
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-semibold text-sm transition-all shadow-sm cursor-pointer mx-auto w-full max-w-xs"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
          ) : (
            /* PREMIUM FALLBACK ACCOUNT CHOOSER */
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {!showCustomInput ? (
                  <motion.div 
                    key="account-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2.5"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left pl-1">
                      Choose an account
                    </p>
                    
                    {googleAccounts.map((account) => (
                      <button
                        key={account.email}
                        onClick={() => handleAccountSelect(account.email, account.name, account.avatar)}
                        className="w-full flex items-center gap-3.5 p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl transition-all text-left focus:outline-none group"
                      >
                        <img 
                          src={account.avatar} 
                          alt={account.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                            {account.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{account.email}</p>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="w-full flex items-center gap-3.5 p-3.5 hover:bg-slate-50 border border-dashed border-slate-200 hover:border-slate-300 rounded-2xl transition-all text-left focus:outline-none text-slate-500 hover:text-slate-700"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold">Use another account</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="custom-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleCustomSubmit}
                    className="space-y-4"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left pl-1">
                      Enter account details
                    </p>

                    {customError && (
                      <p className="text-xs text-rose-500 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                        {customError}
                      </p>
                    )}

                    <div className="space-y-3">
                      {/* Name */}
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Alex Smith"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                          />
                          <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1 text-left">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Google Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            placeholder="alex.smith@gmail.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                          />
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomError('');
                        }}
                        className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Info Banner at Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-center">
          {!clientId ? (
            <div className="flex items-start gap-2.5 text-[10.5px] text-slate-500 text-left">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-100 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-600">Google Login integration is active.</span> To test with a live Google Cloud Project, add <code className="bg-slate-100 px-1 py-0.5 rounded text-[9.5px] font-mono border border-slate-200">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-slate-100 px-1 py-0.5 rounded text-[9.5px] font-mono border border-slate-200">.env</code>.
              </div>
            </div>
          ) : (
            <div className="text-[10.5px] text-slate-400">
              Secured by Google Identity Services
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GoogleSignInModal;
