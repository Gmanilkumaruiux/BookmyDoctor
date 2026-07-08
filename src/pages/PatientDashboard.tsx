import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import StatsCard from '../components/StatsCard';
import AppointmentCard from '../components/AppointmentCard';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { 
  Calendar, FileText, ShieldAlert, Upload, Sparkles, 
  Search, Filter, MapPin, UserCheck, Trash2, Pill, Check, Star 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientDashboardSkeleton } from '../components/DashboardSkeleton';
import { GamificationEngine } from '../components/GamificationEngine';
import { calculatePatientGamification } from '../utils/gamification';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentUser, 
    appointments, 
    doctors, 
    medicalRecords, 
    updateAppointmentStatus, 
    uploadMedicalRecord,
    deleteMedicalRecord,
    isLoading
  } = useApp();

  const [activeSection, setActiveSection] = useState<'dashboard' | 'browse'>(
    location.state?.activeSection || 'dashboard'
  );

  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
    }
  }, [location.state]);
  
  // Record upload fields
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDoctor, setRecordDoctor] = useState('');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordFileName, setRecordFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Doctor search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

  // Booking Modal States
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // AI Pill & Medicine Reminders State
  const [reminders, setReminders] = useState<any[]>([]);
  const [isRemindersLoading, setIsRemindersLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchReminders = async () => {
      setIsRemindersLoading(true);
      try {
        const response = await fetch(`/api/ai/reminders?patientId=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setReminders(data);
        }
      } catch (err) {
        console.error('[Error fetching medicine reminders]', err);
      } finally {
        setIsRemindersLoading(false);
      }
    };

    fetchReminders();
  }, [currentUser?.id, appointments]);

  if (!currentUser) return null;

  if (isLoading && appointments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <PatientDashboardSkeleton />
      </div>
    );
  }

  // Filter patient metrics
  const patientAppts = appointments.filter(a => a.patientId === currentUser.id);
  const patientRecords = medicalRecords.filter(r => r.patientId === currentUser.id);

  const gamifiedStats = calculatePatientGamification(currentUser, appointments, medicalRecords);

  const handleQuestActionClick = (section: string) => {
    if (section === 'browse') {
      setActiveSection('browse');
    } else if (section === 'records') {
      setActiveSection('dashboard');
      setTimeout(() => {
        const recordsSection = document.getElementById('medical-records-container');
        if (recordsSection) {
          recordsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (section === 'profile') {
      navigate('/profile');
    } else if (section === 'dashboard') {
      setActiveSection('dashboard');
    }
  };
  
  const upcomingAppts = patientAppts.filter(a => a.status === 'approved' || a.status === 'pending');
  const pastAppts = patientAppts.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const pendingCount = patientAppts.filter(a => a.status === 'pending').length;
  const approvedCount = patientAppts.filter(a => a.status === 'approved').length;

  // Form submit for medical records
  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle || !recordDoctor) {
      alert('Please fill out Title and Doctor fields.');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      uploadMedicalRecord({
        patientId: currentUser.id,
        title: recordTitle,
        doctorName: recordDoctor,
        date: new Date().toISOString().split('T')[0],
        description: recordDesc,
        attachmentName: recordFileName || 'uploaded_lab_report.pdf',
        attachmentUrl: '#'
      });

      // Clear states
      setRecordTitle('');
      setRecordDoctor('');
      setRecordDesc('');
      setRecordFileName('');
      setIsUploading(false);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setRecordFileName(e.target.files[0].name);
    }
  };

  // Get unique specialties and locations for filters
  const specialties = Array.from(new Set((doctors || []).map(d => d.specialization || '')));
  const locations = Array.from(new Set((doctors || []).map(d => {
    if (!d.hospital) return 'General Clinic';
    const parts = d.hospital.split(',');
    return parts[parts.length - 1]?.trim() || d.hospital;
  })));

  // Filter approved doctors
  const filteredDoctors = (doctors || []).filter(doc => {
    const matchesSearch = (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.hospital || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty ? doc.specialization === selectedSpecialty : true;
    
    const matchesLocation = selectedLocation 
      ? (doc.hospital || '').toLowerCase().includes(selectedLocation.toLowerCase()) 
      : true;

    // Check availability matching
    const matchesAvailability = onlyAvailableToday ? (doc.availability || []).length > 0 : true;

    return matchesSearch && matchesSpecialty && matchesLocation && matchesAvailability && doc.isApproved;
  });

  const handleOpenBooking = (doc: any) => {
    setSelectedDoc(doc);
    setIsBookModalOpen(true);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Hello, {currentUser.name}!</h2>
            <Sparkles className="h-5 w-5 text-amber-300 fill-amber-300" />
          </div>
          <p className="text-slate-100 text-xs md:text-sm max-w-md">
            Welcome back to BookMyDoctor. Access your appointments, history reports, and specialists below.
          </p>
        </div>
        <div className="flex gap-3 z-10">
          <button
            onClick={() => setActiveSection(activeSection === 'dashboard' ? 'browse' : 'dashboard')}
            className="px-6 py-2.5 rounded-2xl bg-white text-blue-600 hover:bg-slate-50 font-bold text-sm shadow-sm transition-all cursor-pointer flex-shrink-0"
          >
            {activeSection === 'dashboard' ? 'Book Appointment' : 'View My Dashboard'}
          </button>
        </div>
      </div>

      {/* Gamification Hub */}
      <GamificationEngine stats={gamifiedStats} role="patient" onActionClick={handleQuestActionClick} />

      {/* RENDER BROWSE & BOOK SECTION */}
      {activeSection === 'browse' ? (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Search className="h-6 w-6 text-blue-400" />
                Find & Filter Clinicians
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Browse approved medical specialists, review credentials, check day availability, and lock your slot instantly.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('dashboard')}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 transition-all font-semibold self-start"
            >
              &larr; Back to Dashboard
            </button>
          </div>

          {/* Search Filters Row */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name, specialty, or clinic..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Specialty Filter */}
            <div className="md:col-span-3 relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all font-semibold appearance-none cursor-pointer"
              >
                <option value="">All Specializations</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="md:col-span-3 relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all font-semibold appearance-none cursor-pointer"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-1">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('');
                  setSelectedLocation('');
                }}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors font-bold cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Doctor Cards List */}
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-5 text-left">
                  
                  {/* Doctor Info */}
                  <div className="flex gap-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                        {doc.specialization}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-base truncate">{doc.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        {doc.hospital}
                      </p>
                    </div>
                  </div>

                  {/* Rating / Experience */}
                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-50 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Rating</span>
                      <span className="font-extrabold text-slate-800 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        {doc.rating}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Experience</span>
                      <span className="font-extrabold text-slate-800">{doc.experience} Years</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Consult Fee</span>
                      <span className="font-extrabold text-green-600">${doc.fees}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  {/* Availability badge row */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Day Availability</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(doc.availability || []).map((day: string) => (
                        <span key={day} className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded-lg text-[10px] font-bold">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => navigate(`/doctors/${doc.id}`)}
                      className="text-center py-2.5 px-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-slate-50 transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleOpenBooking(doc)}
                      className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                    >
                      <Calendar className="h-4 w-4" />
                      Book Slot
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3 shadow-sm">
              <span className="text-4xl block">🔍</span>
              <h4 className="font-bold text-slate-700">No doctors matched your criteria</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Try resetting or modifying your specialization, keyword, or clinic search filters.</p>
            </div>
          )}
        </div>
      ) : (
        /* RENDER STANDARD PATIENT DASHBOARD */
        <>
          {/* 1. METRICS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Total Scheduled Bookings"
              value={patientAppts.length}
              description="Approved & historical visits"
              icon={Calendar}
              color="blue"
            />
            <StatsCard
              title="Pending Verification"
              value={pendingCount}
              description="Waiting for clinician slot lock"
              icon={ShieldAlert}
              color="amber"
            />
            <StatsCard
              title="My Medical Records"
              value={patientRecords.length}
              description="Scans, blood trials & scripts"
              icon={FileText}
              color="green"
            />
          </div>

          {/* Bento Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Appointments List */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Upcoming appointments */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  Upcoming Scheduled Visits
                </h3>
                
                {upcomingAppts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingAppts.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        role="patient"
                        onStatusChange={updateAppointmentStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-3 shadow-sm">
                    <span className="text-3xl block">🗓️</span>
                    <h4 className="font-bold text-slate-700 text-sm">No upcoming appointments</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">You have no active slot confirmations. Access our doctor registry to schedule a consultation.</p>
                    <button
                      onClick={() => setActiveSection('browse')}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-block cursor-pointer"
                    >
                      Browse Doctors Now &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Past Appointments */}
              {pastAppts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Visit History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastAppts.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        role="patient"
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Upload Files Panel */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* AI Pill & Medicine Reminders */}
              <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/30 rounded-3xl p-6 border border-blue-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-blue-600 fill-blue-100 animate-pulse" />
                    AI Pill & Medicine Reminders
                  </h4>
                  <p className="text-[11px] text-slate-500">Automatically parsed from clinician prescription advice.</p>
                </div>

                {isRemindersLoading ? (
                  <div className="text-center py-4 text-xs text-slate-400">Syncing dose alerts...</div>
                ) : reminders.length > 0 ? (
                  <div className="space-y-3">
                    {reminders.map((rem, idx) => (
                      <div key={rem.id || idx} className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-7 w-7 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
                              <Pill className="h-4 w-4" />
                            </span>
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 text-xs block leading-tight">{rem.medicineName}</span>
                              <span className="text-[10px] text-slate-400 block">Prescribed by {rem.doctorName}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[9px] uppercase tracking-wide">
                            {rem.duration}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Dosage:</span>
                            <span className="font-semibold text-slate-700">{rem.dosage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Timing:</span>
                            <span className="font-semibold text-slate-700">{rem.timing}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white/70 border border-slate-100 rounded-2xl text-center text-[11px] text-slate-400">
                    No active drug reminder schedules found. Consultations completed by doctors will appear here.
                  </div>
                )}
              </div>

              {/* Medical records upload form */}
              <div id="medical-records-container" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Upload className="h-4.5 w-4.5 text-blue-600" />
                    Upload Medical Record
                  </h4>
                  <p className="text-xs text-slate-400">Save lab summaries, scan diagnostics, or prescription scripts securely.</p>
                </div>

                <form onSubmit={handleSimulatedUpload} className="space-y-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Record Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Blood Lipid Panel"
                      value={recordTitle}
                      onChange={(e) => setRecordTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Doctor / Clinic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Dr. Sarah Jenkins"
                      value={recordDoctor}
                      onChange={(e) => setRecordDoctor(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Summary Description</label>
                    <textarea
                      placeholder="Notes, values, dosages..."
                      rows={2}
                      value={recordDesc}
                      onChange={(e) => setRecordDesc(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Report Attachment File</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="dash-record-upload"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc"
                      />
                      <label
                        htmlFor="dash-record-upload"
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Browse file
                      </label>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {recordFileName || 'No file chosen'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? 'Securing record...' : 'Add to My Files'}
                  </button>
                </form>
              </div>

              {/* Quick List of Medical Records */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-base">Stored Files</h4>
                
                {patientRecords.length > 0 ? (
                  <div className="space-y-3">
                    {patientRecords.map((rec) => (
                      <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-left relative group">
                        <FileText className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-800 block truncate">{rec.title}</span>
                          <span className="text-[10px] text-slate-400 block truncate">Dr. {rec.doctorName} • {rec.date}</span>
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-1">"{rec.description}"</p>
                        </div>
                        <button
                          onClick={() => deleteMedicalRecord(rec.id)}
                          className="absolute right-2 top-2 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No medical records uploaded yet.</p>
                )}
              </div>

            </div>

          </div>
        </>
      )}

      {/* Booking Modal render */}
      <AnimatePresence>
        {isBookModalOpen && (
          <BookAppointmentModal
            isOpen={isBookModalOpen}
            onClose={() => {
              setIsBookModalOpen(false);
              setSelectedDoc(null);
            }}
            doctor={selectedDoc}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default PatientDashboard;
