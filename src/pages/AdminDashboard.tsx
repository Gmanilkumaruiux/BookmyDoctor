import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import AppointmentCard from '../components/AppointmentCard';
import { 
  Users, 
  Stethoscope, 
  Clock, 
  ShieldAlert, 
  Check, 
  X, 
  ShieldCheck, 
  Mail, 
  Calendar,
  Shield,
  Award,
  FileText,
  MapPin,
  Building,
  Phone,
  Key,
  Eye,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { 
    users, 
    doctors, 
    doctorApplications = [], 
    appointments, 
    verifyDoctor, 
    verifyDoctorApplication, 
    updateAppointmentStatus 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'applications' | 'users' | 'appointments'>('applications');

  // Filter metrics
  const patientUsers = users.filter(u => u.role === 'patient');
  const doctorUsers = users.filter(u => u.role === 'doctor');
  
  // Doctor applications
  const pendingApplications = doctorApplications.filter(app => app.status === 'Pending');
  const approvedDoctors = doctors.filter(doc => doc.isApproved);

  const totalUsers = users.length;
  const totalDoctors = approvedDoctors.length;
  const pendingApprovalsCount = pendingApplications.length;

  return (
    <div className="space-y-8 text-left">
      
      {/* Admin Title banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">Admin Console</h2>
        <p className="text-slate-400 text-xs">Verify doctor registrations, manage system users, and override slot reservations.</p>
      </div>

      {/* 1. METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Registered Users"
          value={totalUsers}
          description="Patients, doctors & admins"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Verified Doctors"
          value={totalDoctors}
          description="Active on public search"
          icon={Stethoscope}
          color="green"
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingApprovalsCount}
          description="Doctor credentials reviews"
          icon={ShieldAlert}
          color="amber"
        />
        <StatsCard
          title="Total Appointments"
          value={appointments.length}
          description="All system schedules"
          icon={Calendar}
          color="indigo"
        />
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer focus:outline-none transition-colors ${
              activeTab === 'applications' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Doctor Requests ({pendingApprovalsCount})
            {activeTab === 'applications' && (
              <motion.div layoutId="adminTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer focus:outline-none transition-colors ${
              activeTab === 'users' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            System Users ({users.length})
            {activeTab === 'users' && (
              <motion.div layoutId="adminTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider relative cursor-pointer focus:outline-none transition-colors ${
              activeTab === 'appointments' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Schedules Overseer ({appointments.length})
            {activeTab === 'appointments' && (
              <motion.div layoutId="adminTabLine" className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      {/* Render tabs content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
        
        {/* TAB 1: Doctor Applications Requests */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">Doctor Applications & Credentials Reviews</h3>
              <p className="text-xs text-slate-400">Review practitioner board certifications, medical licenses, and professional background records before authorizing portal login access.</p>
            </div>

            {doctorApplications.length > 0 ? (
              <div className="space-y-6">
                {doctorApplications.map((app) => (
                  <div key={app.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-all text-left">
                    {/* Header: Name, Avatar, Specialty, Experience, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={app.avatar} 
                          alt={app.name} 
                          className="h-12 w-12 rounded-full object-cover border border-slate-200" 
                          referrerPolicy="no-referrer" 
                        />
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{app.name}</h4>
                          <p className="text-[10px] text-slate-400 font-medium">{app.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600">
                          {app.specialization}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                          {app.experience} Years Exp
                        </span>
                        {app.status === 'Approved' ? (
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Approved
                          </span>
                        ) : app.status === 'Rejected' ? (
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                            <X className="h-3 w-3" /> Rejected
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-150 animate-pulse">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detailed Clinical and Contact credentials */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-200">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Education & Degree</span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <GraduationCap className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>{app.qualification}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Clinical Contact</span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>{app.phone}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Medical Council Reg No</span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Shield className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">{app.registrationNumber}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Primary Clinic / Hospital</span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Building className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>{app.hospital}</span>
                        </div>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hospital Address</span>
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span>{app.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Documents */}
                    <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Uploaded Application Materials & Verification Proofs</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-600">
                        {/* Medical Certificate */}
                        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-[#2E6F40] flex-shrink-0" />
                              <span className="text-slate-500 font-medium">Medical Certificate:</span>
                            </div>
                            <span className="text-blue-600 truncate font-mono text-[11px] block mt-1" title={app.medicalCertificate}>{app.medicalCertificate || 'medical-credentials-board.pdf'}</span>
                          </div>
                          <button type="button" className="text-left text-[10px] font-bold text-blue-600 hover:underline cursor-pointer mt-1 flex items-center gap-1">
                            📄 Download & Inspect Certificate
                          </button>
                        </div>

                        {/* Government ID */}
                        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                              <span className="text-slate-500 font-medium">Government ID Proof:</span>
                            </div>
                            <span className="text-blue-600 truncate font-mono text-[11px] block mt-1" title={app.governmentId}>{app.governmentId || 'national-identity-proof.pdf'}</span>
                          </div>
                          <button type="button" className="text-left text-[10px] font-bold text-blue-600 hover:underline cursor-pointer mt-1 flex items-center gap-1">
                            🪪 View ID Document
                          </button>
                        </div>

                        {/* Profile Photo */}
                        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <img src={app.avatar} className="h-4 w-4 rounded-full object-cover border border-slate-300" referrerPolicy="no-referrer" />
                              <span className="text-slate-500 font-medium">Profile Photo Proof:</span>
                            </div>
                            <span className="text-blue-600 truncate font-mono text-[11px] block mt-1" title={app.avatar}>{app.avatar ? 'uploaded-avatar-preview.jpg' : 'default-photo.jpg'}</span>
                          </div>
                          <button type="button" className="text-left text-[10px] font-bold text-blue-600 hover:underline cursor-pointer mt-1 flex items-center gap-1" onClick={() => window.open(app.avatar, '_blank')}>
                            🖼️ View Fullsize Image
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Generated Credentials for approved applications */}
                    {app.status === 'Approved' && app.generatedPassword && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                          <Key className="h-3.5 w-3.5 text-emerald-600" /> Authorized Login Credentials (Displayed)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="text-slate-400 font-medium">Username:</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 select-all">{app.generatedEmail || app.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="text-slate-400 font-medium">Temp Password:</span>
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 select-all text-emerald-700 font-bold">{app.generatedPassword}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pending Actions */}
                    {app.status === 'Pending' && (
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => verifyDoctorApplication(app.id, 'Rejected')}
                          className="px-4 py-2 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-rose-100"
                        >
                          <X className="h-4 w-4" /> Reject Credentials
                        </button>
                        <button
                          onClick={() => verifyDoctorApplication(app.id, 'Approved')}
                          className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="h-4 w-4" /> Approve & Generate Credentials
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-1.5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <span>🎉</span>
                <p className="font-bold text-slate-700 text-sm">No Pending Applications Requests</p>
                <p>All submitted clinical registration applications have been processed.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: System Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">Registered System Users</h3>
              <p className="text-xs text-slate-400">Complete listing of patients, active doctors, and system administrators.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Role Tag</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      {/* Name / Avatar */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-800">{u.name}</span>
                      </td>

                      {/* Role Tag */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : u.role === 'doctor' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        <div className="space-y-0.5">
                          <span className="block">{u.email}</span>
                          {u.phone && <span className="text-[10px] text-slate-400 block">{u.phone}</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.role === 'doctor' ? (
                          u.isApproved ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                              <ShieldCheck className="h-3.5 w-3.5" /> Approved Practice
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold flex items-center gap-1 text-[11px]">
                              <Clock className="h-3.5 w-3.5" /> Pending Check
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 font-semibold text-[11px]">
                            ● Standard Active Account
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Schedules Overseer */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">All Slot Bookings</h3>
              <p className="text-xs text-slate-400">Complete historical oversight and status overrides of bookings across the platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  role="admin"
                  onStatusChange={updateAppointmentStatus}
                />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
