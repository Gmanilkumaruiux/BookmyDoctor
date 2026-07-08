import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import AppointmentCard from '../components/AppointmentCard';
import { CalendarRange, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

const AppointmentHistory: React.FC = () => {
  const { currentUser, appointments, updateAppointmentStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  if (!currentUser) return null;

  // Filter current user's appointments
  const myAppts = appointments.filter(
    appt => currentUser.role === 'patient' 
      ? appt.patientId === currentUser.id 
      : appt.doctorId === currentUser.id
  );

  const filteredAppts = myAppts.filter((appt) => {
    if (filter === 'active') {
      return appt.status === 'pending' || appt.status === 'approved';
    }
    if (filter === 'past') {
      return appt.status === 'completed' || appt.status === 'cancelled';
    }
    return true; // all
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Appointment Schedules</h2>
          <p className="text-xs text-slate-400">Track current doctor slot locks and medical checkup history.</p>
        </div>

        {/* Tab filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['all', 'active', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none cursor-pointer ${
                filter === tab 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      {filteredAppts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppts.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              role={currentUser.role}
              onStatusChange={updateAppointmentStatus}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-16 rounded-2xl border border-slate-100 text-center space-y-3 shadow-sm max-w-md mx-auto">
          <span className="text-4xl block">🗓️</span>
          <h4 className="font-bold text-slate-700 text-base">No appointments listed</h4>
          <p className="text-xs text-slate-400">
            {filter === 'active' 
              ? 'You have no pending slots or approved checkups.' 
              : filter === 'past' 
                ? 'No past completed or cancelled records found.' 
                : 'You have not requested any appointment slots yet.'}
          </p>
        </div>
      )}

    </div>
  );
};

export default AppointmentHistory;
