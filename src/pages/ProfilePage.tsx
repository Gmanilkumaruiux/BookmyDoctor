import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, ShieldCheck, Mail, Phone, MapPin, User as UserIcon, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useApp();

  // General fields
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [dob, setDob] = useState(currentUser?.dob || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'O+');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Password fields
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [isPwSaved, setIsPwSaved] = useState(false);

  if (!currentUser) return null;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();

    updateProfile(currentUser.id, {
      name,
      email,
      phone,
      gender,
      dob,
      address,
      bloodGroup,
      avatar: avatar || currentUser.avatar,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      alert('Please fill out all security fields.');
      return;
    }

    if (newPw !== confirmPw) {
      alert('New passwords do not match.');
      return;
    }

    setIsPwSaved(true);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');

    setTimeout(() => setIsPwSaved(false), 2500);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Profile Settings</h2>
        <p className="text-xs text-slate-400">Manage your medical credentials, contacts, and password overrides.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Photo & Quick Preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="relative h-28 w-28 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
              <img
                src={avatar || currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-lg leading-tight">{currentUser.name}</h4>
              <p className="text-xs font-semibold text-slate-400 capitalize tracking-wide">{currentUser.role} Account</p>
            </div>

            <div className="w-full pt-4 border-t border-slate-50 space-y-2.5 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{phone}</span>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <span className="line-clamp-2 text-left">{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Form details tab sheets */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Detail form card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
              <UserIcon className="h-4.5 w-4.5 text-[#2E6F40]" />
              Edit Personal Particulars
            </h3>

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span>Personal particulars successfully written to profile!</span>
              </div>
            )}

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email Address (Username)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={currentUser.role === 'doctor'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {/* Avatar */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Photo Avatar URL</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                {currentUser.role === 'patient' && (
                  <>
                    {/* Gender */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                      />
                    </div>

                    {/* Blood Group */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </>
                )}

              </div>

              {currentUser.role === 'patient' && (
                /* Address */
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Residential Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>
              )}

              {/* Action */}
              <div className="pt-3 border-t border-slate-50 text-right">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Save Particulars
                </button>
              </div>
            </form>
          </div>

          {/* Change password security form */}
          {currentUser.role !== 'doctor' ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                <Lock className="h-4.5 w-4.5 text-[#2E6F40]" />
                Update Account Security
              </h3>

              {isPwSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Account password successfully modified!</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Current */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* New */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 5 characters"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Confirm */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                </div>

                {/* Action */}
                <div className="pt-3 border-t border-slate-50 text-right">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                <Lock className="h-4.5 w-4.5 text-blue-600" />
                Account Security Settings
              </h3>
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-800 text-xs flex items-start gap-3 text-left font-semibold">
                <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-extrabold block text-sm text-blue-950 mb-0.5">Practitioner Credentials Locked</span>
                  Your clinical account credentials (email and password) are created permanently by clinic administrators upon application verification. They cannot be modified on this portal to preserve database records and audit tracking.
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
