import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BookAppointmentModal from '../components/BookAppointmentModal';
import { 
  Star, 
  MapPin, 
  Briefcase, 
  CalendarRange, 
  DollarSign, 
  ShieldCheck, 
  ArrowLeft, 
  Phone, 
  Mail, 
  HeartPulse, 
  Award,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';

const DoctorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { doctors, currentUser } = useApp();
  const navigate = useNavigate();

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Find doctor
  const doctor = doctors.find(d => d.id === id);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentUser) {
      if (currentUser.role === 'patient') {
        navigate('/dashboard/patient', { state: { activeSection: 'browse' } });
      } else if (currentUser.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else if (currentUser.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  if (!doctor) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <span className="text-4xl block">🔍</span>
        <h4 className="font-bold text-slate-800 text-lg">Physician Profile Not Found</h4>
        <p className="text-xs text-slate-400">The medical professional credentials details you requested are not listed in our register.</p>
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Back to listings bar */}
      <div>
        <button
          onClick={handleBackClick}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search directory
        </button>
      </div>

      {/* Main doctor card panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
        {/* Left Column: Avatar & quick indicators */}
        <div className="md:col-span-4 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
          <div className="h-40 w-40 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 justify-center">
              <h3 className="font-bold text-slate-800 text-xl">{doctor.name}</h3>
              <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-blue-600 tracking-wider uppercase">{doctor.specialization}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 py-1 px-3 rounded-xl border border-amber-100">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-xs font-bold">{doctor.rating.toFixed(1)} Rating</span>
            <span className="text-[10px] text-slate-400 font-medium">({doctor.reviewsCount} reviews)</span>
          </div>

          <div className="w-full space-y-2.5 text-xs text-slate-500 pt-2">
            <div className="flex items-center gap-2.5 justify-center">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{doctor.phone || '+1 (555) 019-1100'}</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{doctor.email}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Bio & Schedule booking trigger */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Bio */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Professional Biography</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {doctor.bio}
              </p>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {/* Exp */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <Briefcase className="h-4.5 w-4.5 text-slate-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-medium block">Experience</span>
                <span className="text-sm font-bold text-slate-800">{doctor.experience}+ Years</span>
              </div>
              {/* Fee */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <DollarSign className="h-4.5 w-4.5 text-slate-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-medium block">Consultation Fee</span>
                <span className="text-sm font-extrabold text-slate-800">${doctor.fees}</span>
              </div>
              {/* Education */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center col-span-2">
                <GraduationCap className="h-4.5 w-4.5 text-slate-400 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400 font-medium block">Credentials</span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{doctor.education}</span>
              </div>
            </div>

            {/* Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">Active Practice Location</span>
                <span className="text-xs font-semibold text-slate-700">{doctor.hospital}</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">Weekly Consultation Schedule</span>
                <span className="text-xs font-semibold text-slate-700">{(doctor.availability || []).join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Booking Slots Call-to-action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 py-0.5 px-2 rounded-md uppercase tracking-wide inline-block mb-1">
                Available Today
              </span>
              <p className="text-xs text-slate-400">Click below to review times and reserve your doctor consultation slot.</p>
            </div>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm shadow-blue-100 text-center"
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      </div>

      {/* Appointment confirmation modal */}
      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctor={doctor}
      />

    </div>
  );
};

export default DoctorDetails;
