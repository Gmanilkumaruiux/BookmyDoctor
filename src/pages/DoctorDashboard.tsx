import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import AppointmentCard from '../components/AppointmentCard';
import CompleteConsultationModal from '../components/CompleteConsultationModal';
import { Calendar, ShieldAlert, CheckCircle2, DollarSign, Clock, Plus, Trash2, ShieldCheck, HeartPulse, CalendarX, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { DoctorDashboardSkeleton } from '../components/DashboardSkeleton';
import { GamificationEngine } from '../components/GamificationEngine';
import { calculateDoctorGamification } from '../utils/gamification';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, appointments, doctors, medicalRecords, updateProfile, updateAppointmentStatus, uploadMedicalRecord, isLoading } = useApp();
  
  // Find corresponding doctor object
  const doctorProfile = doctors.find(d => d.id === currentUser?.id);

  const [newSlotTime, setNewSlotTime] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'history'>('all');
  
  // AI Consultation Complete State
  const [selectedApptForCompletion, setSelectedApptForCompletion] = useState<any | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  // Practice & Schedule Settings local states
  const [feeInput, setFeeInput] = useState<number>(doctorProfile?.fees || 120);
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [leaveDateInput, setLeaveDateInput] = useState('');

  useEffect(() => {
    if (doctorProfile?.fees !== undefined) {
      setFeeInput(doctorProfile.fees);
    }
  }, [doctorProfile?.fees]);

  if (!currentUser) return null;

  // Calculate clinician stats
  const profileForStats = (doctors || []).find(d => d.id === currentUser.id) || currentUser;
  const gamifiedStats = calculateDoctorGamification(profileForStats, appointments, medicalRecords || []);

  const handleQuestActionClick = (section: string) => {
    if (section === 'slots') {
      const slotsSection = document.getElementById('manage-slots-container');
      if (slotsSection) {
        slotsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (section === 'queue') {
      const queueSection = document.getElementById('patient-queue-container');
      if (queueSection) {
        queueSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (section === 'reviews') {
      navigate('/profile');
    }
  };

  if (isLoading && appointments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <DoctorDashboardSkeleton />
      </div>
    );
  }

  const handleOpenCompletion = (appt: any) => {
    setSelectedApptForCompletion(appt);
    setIsCompletionModalOpen(true);
  };

  const handleCompleteConsultation = async (appointmentId: string, prescriptionText: string) => {
    if (!selectedApptForCompletion) return;
    
    // 1. Update appointment status in AppContext state
    updateAppointmentStatus(appointmentId, 'completed');

    // 2. Automatically write this visit summary to patient's medical records
    try {
      uploadMedicalRecord({
        patientId: selectedApptForCompletion.patientId,
        title: `Clinical Visit Summary: ${selectedApptForCompletion.doctorSpecialization || 'General Consultation'}`,
        doctorName: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        description: prescriptionText,
        attachmentName: 'consultation_prescription.pdf',
        attachmentUrl: '#'
      });
    } catch (err) {
      console.error('[Error saving consultation to patient records]', err);
    }

    // 3. Trigger Express server reminder generation API
    try {
      await fetch('/api/ai/reminders/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          patientId: selectedApptForCompletion.patientId,
          patientName: selectedApptForCompletion.patientName,
          doctorName: currentUser.name,
          prescriptionText
        })
      });
    } catch (err) {
      console.error('[Error generating AI reminders]', err);
    }
  };

  const isDoctorVerified = currentUser.isApproved || doctorProfile?.isApproved;

  // Filter doctor appointments
  const docAppts = appointments.filter(a => a.doctorId === currentUser.id);

  const pendingAppts = docAppts.filter(a => a.status === 'pending');
  const approvedAppts = docAppts.filter(a => a.status === 'approved');
  const completedAppts = docAppts.filter(a => a.status === 'completed');

  const filteredAppts = docAppts.filter(appt => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return appt.status === 'pending';
    if (activeTab === 'approved') return appt.status === 'approved';
    if (activeTab === 'history') return appt.status === 'completed' || appt.status === 'cancelled';
    return true;
  });

  // Revenue calculation
  const sessionFee = doctorProfile?.fees || 120;
  const currentRevenue = completedAppts.length * sessionFee;

  // Availability slots
  const availableSlots = doctorProfile?.slots || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'];

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime) return;

    if (availableSlots.includes(newSlotTime)) {
      alert('This slot already exists.');
      return;
    }

    const updatedSlots = [...availableSlots, newSlotTime].sort();
    
    // Update profile with only changed slots field
    updateProfile(currentUser.id, { slots: updatedSlots });

    setNewSlotTime('');
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    const updatedSlots = availableSlots.filter(s => s !== slotToRemove);
    updateProfile(currentUser.id, { slots: updatedSlots });
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingFee(true);
    await updateProfile(currentUser.id, { fees: Number(feeInput) });
    setIsUpdatingFee(false);
  };

  const handleToggleWorkingDay = (day: string) => {
    const workingDays = doctorProfile?.availability || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let updatedDays;
    if (workingDays.includes(day)) {
      updatedDays = workingDays.filter(d => d !== day);
    } else {
      updatedDays = [...workingDays, day];
    }
    updateProfile(currentUser.id, { availability: updatedDays });
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDateInput) return;

    const leaves = doctorProfile?.leaves || [];
    if (leaves.includes(leaveDateInput)) {
      alert('This leave date is already marked.');
      return;
    }

    const updatedLeaves = [...leaves, leaveDateInput].sort();
    updateProfile(currentUser.id, { leaves: updatedLeaves });
    setLeaveDateInput('');
  };

  const handleRemoveLeave = (leaveToRemove: string) => {
    const leaves = doctorProfile?.leaves || [];
    const updatedLeaves = leaves.filter(l => l !== leaveToRemove);
    updateProfile(currentUser.id, { leaves: updatedLeaves });
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Clinician Welcome Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {currentUser.name}!</h2>
          <p className="text-xs text-slate-400">Manage patient bookings, clinic diagnostics, and slot calendars.</p>
        </div>

        {/* Verification Pill */}
        {isDoctorVerified ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Verified Physician</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
            <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Verification Pending Admin Review</span>
          </div>
        )}
      </div>

      {/* Gamification Hub */}
      <GamificationEngine stats={gamifiedStats} role="doctor" onActionClick={handleQuestActionClick} />

      {/* 1. METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Active Queue"
          value={approvedAppts.length}
          description="Approved slots scheduled"
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingAppts.length}
          description="Patient requests waiting"
          icon={ShieldAlert}
          color="amber"
        />
        <StatsCard
          title="Completed Consultations"
          value={completedAppts.length}
          description="Historical checked visits"
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Estimated Earnings"
          value={`$${currentRevenue}`}
          description={`Based on $${sessionFee}/consultation`}
          icon={DollarSign}
          color="indigo"
        />
      </div>

      {/* Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Appointments Queue */}
        <div id="patient-queue-container" className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                Clinic Appointment Queue
              </h3>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 overflow-x-auto gap-2 pb-px scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                All ({docAppts.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full bg-amber-500 ${pendingAppts.length > 0 ? 'animate-ping' : ''}`} />
                Pending Requests ({pendingAppts.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'approved'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Approved Schedule ({approvedAppts.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                History ({docAppts.filter(a => a.status === 'completed' || a.status === 'cancelled').length})
              </button>
            </div>

            {filteredAppts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAppts.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    role="doctor"
                    onStatusChange={updateAppointmentStatus}
                    onCompleteClick={handleOpenCompletion}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-[24px] border border-slate-100 text-center space-y-5 shadow-sm max-w-lg mx-auto flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-[#2E6F40] border border-emerald-100 flex items-center justify-center shadow-inner relative">
                  <div className="absolute inset-0 bg-emerald-100/40 rounded-2xl animate-pulse" />
                  <CalendarX className="h-8 w-8 relative z-10 text-[#2E6F40]" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-[#1F2937] text-base leading-snug">No Patient Consultations Yet</h4>
                  <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                    {activeTab === 'all' && 'Your clinical schedule is currently wide open. Once patients book clinical slots from your profile, active queue alerts will populate here.'}
                    {activeTab === 'pending' && 'No pending slots waiting for clinical triage. Good work keeping your queue clean!'}
                    {activeTab === 'approved' && 'No approved slots scheduled for active visits. Add new slots on the right sidebar to increase patient traffic.'}
                    {activeTab === 'history' && 'Your historical consultation records are empty. Completed visits will be logged here.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calendar Slots & Availability Sync */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Practice Specifics & Consultation Fee */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <DollarSign className="h-4.5 w-4.5 text-blue-600" />
              Consultation Fee
            </h4>
            <p className="text-xs text-slate-400">Set and update your clinical appointment session rate.</p>
            
            <form onSubmit={handleSaveFee} className="space-y-3 pt-2">
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={feeInput}
                  onChange={(e) => setFeeInput(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="120"
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingFee}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {isUpdatingFee ? 'Saving Rate...' : 'Save Consultation Fee'}
              </button>
            </form>
          </div>

          {/* Configure Working Days */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-600" />
              Configure Working Days
            </h4>
            <p className="text-xs text-slate-400">Select days of the week you are actively consulting.</p>
            
            <div className="grid grid-cols-1 gap-2 pt-1">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const isSelected = (doctorProfile?.availability || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']).includes(day);
                return (
                  <label
                    key={day}
                    onClick={() => handleToggleWorkingDay(day)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-200 text-blue-800'
                        : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>{day}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Availability Slots list */}
          <div id="manage-slots-container" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-blue-600" />
                Active Time Slots
              </h4>
              <p className="text-xs text-slate-400">Add or remove hourly booking slots for working days.</p>
            </div>

            {/* Existing slots tags */}
            {availableSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {availableSlots.map((slot) => (
                  <span
                    key={slot}
                    className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <span>{slot}</span>
                    <button
                      onClick={() => handleRemoveSlot(slot)}
                      className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Slot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active slots configured. Patients will not be able to schedule appointments.</p>
            )}

            {/* Add new slots form */}
            <form onSubmit={handleAddSlot} className="pt-3 border-t border-slate-50 flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g., 05:00 PM"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Slot
              </button>
            </form>
          </div>

          {/* Mark Leaves & Out-of-Office Dates */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-rose-600" />
              Mark Leave Dates
            </h4>
            <p className="text-xs text-slate-400">Specify precise dates you are on leave or out of office.</p>

            {/* Add Leave Date */}
            <form onSubmit={handleAddLeave} className="flex gap-2">
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={leaveDateInput}
                onChange={(e) => setLeaveDateInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all cursor-pointer"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Mark
              </button>
            </form>

            {/* Leaves listing */}
            {(doctorProfile?.leaves || []).length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leaves Configured:</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(doctorProfile?.leaves || []).map((lDate) => (
                    <span
                      key={lDate}
                      className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold"
                    >
                      <span>{lDate}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLeave(lDate)}
                        className="p-0.5 rounded text-rose-400 hover:text-rose-800 transition-colors"
                        title="Remove Leave"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 pt-1">No upcoming leaves scheduled. Your calendar is clear.</p>
            )}
          </div>

        </div>

      </div>

      <CompleteConsultationModal
        isOpen={isCompletionModalOpen}
        onClose={() => {
          setIsCompletionModalOpen(false);
          setSelectedApptForCompletion(null);
        }}
        appointment={selectedApptForCompletion}
        onComplete={handleCompleteConsultation}
      />

    </div>
  );
};

export default DoctorDashboard;
