import React, { useState, useEffect } from 'react';
import { Appointment, UserRole } from '../types';
import { Calendar, Clock, FileText, Check, X, ShieldAlert, CheckCircle, RefreshCcw, User as UserIcon, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import PatientRecordsModal from './PatientRecordsModal';
import { useApp } from '../context/AppContext';

interface AppointmentCardProps {
  appointment: Appointment;
  role: UserRole;
  onStatusChange?: (id: string, status: Appointment['status']) => void;
  onCompleteClick?: (appointment: Appointment) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  role, 
  onStatusChange,
  onCompleteClick
}) => {
  const { rateAppointment } = useApp();
  const [prediction, setPrediction] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleRatingSubmit = async (ratingVal: number) => {
    setSubmittingRating(true);
    try {
      await rateAppointment(appointment.id, ratingVal);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const fetchPrediction = async () => {
    setIsPredicting(true);
    try {
      const response = await fetch('/api/ai/wait-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          doctorId: appointment.doctorId,
          time: appointment.time
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPrediction(data);
      }
    } catch (e) {
      console.error('Error fetching wait time prediction', e);
    } finally {
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    if (role === 'patient' && appointment.status === 'approved') {
      fetchPrediction();
    }
  }, [appointment.id, appointment.status]);
  const statusConfig = {
    pending: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      pillBg: 'bg-amber-100/70 border border-amber-200',
      icon: ShieldAlert,
      label: 'Pending Approval'
    },
    approved: {
      bg: 'bg-[#E8F5EC] border-[#D1EADE]',
      text: 'text-[#2E6F40]',
      pillBg: 'bg-[#E8F5EC] border border-[#D1EADE]',
      icon: Clock,
      label: 'Approved'
    },
    completed: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      pillBg: 'bg-emerald-50 border border-emerald-100',
      icon: CheckCircle,
      label: 'Completed'
    },
    cancelled: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      pillBg: 'bg-rose-50 border border-rose-100',
      icon: X,
      label: 'Cancelled'
    },
  };

  const currentStatus = statusConfig[appointment.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md hover:border-[#2E6F40]/20 transition-all duration-300 text-left"
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex gap-3.5">
          {role === 'patient' ? (
            // Patient sees Doctor Info
            <>
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-[#F5F7F5] border border-[#E5E7EB] flex-shrink-0 shadow-inner">
                <img 
                  src={appointment.doctorAvatar} 
                  alt={appointment.doctorName} 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="space-y-0.5">
                <h5 className="font-extrabold text-[#1F2937] text-sm md:text-base leading-snug">{appointment.doctorName}</h5>
                <p className="text-[11px] font-extrabold text-[#2E6F40] tracking-wider uppercase">{appointment.doctorSpecialization}</p>
              </div>
            </>
          ) : (
            // Doctor/Admin sees Patient Info
            <>
              <div className="h-12 w-12 rounded-xl bg-[#E8F5EC] text-[#2E6F40] border border-[#D1EADE] flex items-center justify-center flex-shrink-0 shadow-sm">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-extrabold text-[#1F2937] text-sm md:text-base leading-snug">{appointment.patientName}</h5>
                  <span className="text-[10px] text-[#6B7280] font-bold px-1.5 py-0.5 bg-[#F5F7F5] border border-[#E5E7EB] rounded-md">
                    {role === 'doctor' ? 'Patient' : `To: ${appointment.doctorName}`}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">{appointment.patientEmail}</p>
                {(role === 'doctor' || role === 'admin') && (
                  <button
                    onClick={() => setIsRecordsOpen(true)}
                    className="text-[10px] font-extrabold text-[#2E6F40] hover:text-[#245A33] bg-[#E8F5EC] border border-[#D1EADE] hover:bg-white px-2 py-1 rounded-lg mt-1 cursor-pointer transition-all flex items-center gap-1 w-fit focus:outline-none"
                  >
                    <FileText className="h-3 w-3" /> View Patient Record
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Status Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold ${currentStatus.pillBg} ${currentStatus.text}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          <span>{currentStatus.label}</span>
        </div>
      </div>

      {/* Appointment Specifics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F5F7F5] p-3.5 rounded-xl border border-[#E5E7EB]/70">
        <div className="flex items-center gap-2.5 text-xs text-[#1F2937] font-medium">
          <Calendar className="h-4 w-4 text-[#2E6F40]" />
          <span className="text-[#6B7280] font-bold">Date:</span>
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-[#1F2937] font-medium">
          <Clock className="h-4 w-4 text-[#2E6F40]" />
          <span className="text-[#6B7280] font-bold">Time Slot:</span>
          <span>{appointment.time}</span>
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold text-[#6B7280] tracking-wider uppercase block">Symptoms / Reason</span>
        <p className="text-xs text-[#1F2937] leading-relaxed italic font-medium">
          "{appointment.symptoms || 'No symptoms provided'}"
        </p>
      </div>

      {/* Attached Files */}
      {appointment.reportName && (
        <div className="flex items-center gap-3 bg-[#E8F5EC]/50 p-3 rounded-xl border border-[#D1EADE]">
          <FileText className="h-4.5 w-4.5 text-[#2E6F40]" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-[#1F2937] block truncate leading-tight">
              {appointment.reportName}
            </span>
            <span className="text-[10px] text-[#6B7280] font-semibold mt-0.5 block">Attached medical report</span>
          </div>
          <a
            href={appointment.reportUrl}
            onClick={(e) => e.preventDefault()} // dummy
            className="text-[10px] font-extrabold text-[#2E6F40] bg-white border border-[#D1EADE] hover:bg-[#FAF9F6] px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
          >
            Download
          </a>
        </div>
      )}

      {/* AI Wait Time Prediction Section */}
      {role === 'patient' && appointment.status === 'approved' && prediction && (
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 fill-blue-100 text-blue-500 animate-pulse" />
              AI Wait Time Prediction
            </span>
            <button
              onClick={fetchPrediction}
              disabled={isPredicting}
              className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-white/50 border border-transparent hover:border-slate-100 cursor-pointer disabled:opacity-50"
              title="Recalibrate Wait Time"
            >
              <RefreshCcw className={`h-3 w-3 ${isPredicting ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-white p-2.5 rounded-xl border border-blue-50 shadow-sm">
              <span className="text-[9px] text-[#6B7280] block font-extrabold uppercase tracking-wider">Queue</span>
              <span className="text-[11px] font-extrabold text-[#1F2937] mt-0.5 block">#{prediction.queuePosition} in line</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-blue-50 shadow-sm">
              <span className="text-[9px] text-[#6B7280] block font-extrabold uppercase tracking-wider">Delay</span>
              <span className="text-[11px] font-extrabold text-amber-600 mt-0.5 block">~{prediction.estimatedWaitingMinutes} mins</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-blue-50 shadow-sm">
              <span className="text-[9px] text-[#6B7280] block font-extrabold uppercase tracking-wider">Consult</span>
              <span className="text-[11px] font-extrabold text-blue-600 mt-0.5 block">{prediction.expectedConsultation}</span>
            </div>
          </div>

          <div className="space-y-1 pt-1.5 border-t border-blue-100/50">
            {(prediction.reasons || []).map((reason: string, idx: number) => (
              <p key={idx} className="text-[10px] text-[#6B7280] leading-normal flex items-start gap-1.5 font-medium">
                <span className="text-blue-500 font-bold">•</span>
                <span>{reason}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {onStatusChange && (
        <div className="pt-4 border-t border-[#E5E7EB]/60 flex items-center justify-end gap-2">
          {role === 'patient' && (appointment.status === 'pending' || appointment.status === 'approved') && (
            <button
              onClick={() => onStatusChange(appointment.id, 'cancelled')}
              className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
            >
              Cancel Appointment
            </button>
          )}

          {role === 'doctor' && (
            <>
              {appointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => onStatusChange(appointment.id, 'cancelled')}
                    className="px-4 py-2.5 text-xs font-bold text-[#6B7280] bg-[#F5F7F5] border border-[#E5E7EB] hover:bg-[#FAF9F6] rounded-xl transition-all cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => onStatusChange(appointment.id, 'approved')}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-[#2E6F40] hover:bg-[#245A33] rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                </>
              )}
              {appointment.status === 'approved' && (
                <>
                  <button
                    onClick={() => onStatusChange(appointment.id, 'cancelled')}
                    className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (onCompleteClick) {
                        onCompleteClick(appointment);
                      } else if (onStatusChange) {
                        onStatusChange(appointment.id, 'completed');
                      }
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark Completed
                  </button>
                </>
              )}
            </>
          )}

          {role === 'admin' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#6B7280] mr-2 font-bold uppercase tracking-wider">Admin Override:</span>
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <button
                  onClick={() => onStatusChange(appointment.id, 'completed')}
                  className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all cursor-pointer"
                  title="Force Complete"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                </button>
              )}
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={() => onStatusChange(appointment.id, 'cancelled')}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                  title="Force Cancel"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              )}
              {(appointment.status === 'cancelled' || appointment.status === 'completed') && (
                <button
                  onClick={() => onStatusChange(appointment.id, 'pending')}
                  className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                  title="Reset to Pending"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {role === 'patient' && appointment.status === 'completed' && (
        <div className="pt-4 border-t border-[#E5E7EB]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-[#6B7280] tracking-wider uppercase block">Clinician Consultation Rating</span>
            <p className="text-xs text-[#374151] font-medium">
              {appointment.rating 
                ? 'Thank you for your rating of this visit!' 
                : 'How was your consultation experience with this provider?'}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            {appointment.rating ? (
              <div className="flex items-center gap-1 bg-[#2E6F40]/5 border border-[#2E6F40]/10 px-3 py-1.5 rounded-xl">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 ${star <= appointment.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#2E6F40] ml-1.5">{appointment.rating}.0 / 5</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={submittingRating}
                      onClick={() => handleRatingSubmit(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 rounded-md hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm cursor-pointer disabled:opacity-50 transition-all focus:outline-none"
                    >
                      <Star 
                        className={`h-4.5 w-4.5 transition-all ${
                          star <= (hoverRating ?? 0) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                {hoverRating !== null && (
                  <span className="text-[11px] font-extrabold text-amber-500 animate-pulse min-w-[32px] text-center">
                    {hoverRating} Star{hoverRating > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Patient Records & Clinical History Modal Overlay */}
      <PatientRecordsModal
        isOpen={isRecordsOpen}
        onClose={() => setIsRecordsOpen(false)}
        patientId={appointment.patientId}
        patientName={appointment.patientName}
      />
    </motion.div>
  );
};

export default AppointmentCard;
