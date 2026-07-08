import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Bell, Eye, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const SettingsPage: React.FC = () => {
  const { currentUser } = useApp();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [newsletters, setNewsletters] = useState(true);
  const [accessibility, setAccessibility] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [privateMode, setPrivateMode] = useState(true);

  const [isSaved, setIsSaved] = useState(false);

  if (!currentUser) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 text-left max-w-2xl">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-blue-600" />
          Platform Preferences
        </h2>
        <p className="text-xs text-slate-400">Configure notifications channels, layout metrics, and security keys.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        
        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            <span>Preferences updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Section 1: Notifications */}
          <div className="space-y-3.5 text-left">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Bell className="h-4.5 w-4.5 text-blue-500" />
              Notifications & Alerts Channels
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Email Alerts</span>
                  <span className="text-[10px] text-slate-400 block">Receive confirmations and status checkups directly in your inbox.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">SMS Notifications</span>
                  <span className="text-[10px] text-slate-400 block">Send slot confirmations straight to your registered mobile number.</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Wellness Newsletters</span>
                  <span className="text-[10px] text-slate-400 block">Receive curated medical diagnostics summaries and tips from experts monthly.</span>
                </div>
                <input
                  type="checkbox"
                  checked={newsletters}
                  onChange={(e) => setNewsletters(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Display */}
          <div className="space-y-3.5 text-left pt-4 border-t border-slate-50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Eye className="h-4.5 w-4.5 text-blue-500" />
              Interface Settings
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">High-Contrast Accessibility</span>
                  <span className="text-[10px] text-slate-400 block">Enhance visual contrast margins for clinical charts and metrics.</span>
                </div>
                <input
                  type="checkbox"
                  checked={accessibility}
                  onChange={(e) => setAccessibility(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Compact Dashboard Tables</span>
                  <span className="text-[10px] text-slate-400 block">Display schedules and slot tags with dense vertical paddings.</span>
                </div>
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Privacy */}
          <div className="space-y-3.5 text-left pt-4 border-t border-slate-50">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Volume2 className="h-4.5 w-4.5 text-blue-500" />
              Privacy & Security Keys
            </h3>
            <div className="space-y-3 pl-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Anonymize Document Scan metadata</span>
                  <span className="text-[10px] text-slate-400 block">Remove raw clinical timestamps from uploaded drag-and-drop report scans.</span>
                </div>
                <input
                  type="checkbox"
                  checked={privateMode}
                  onChange={(e) => setPrivateMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Action */}
          <div className="pt-4 border-t border-slate-100 text-right">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default SettingsPage;
