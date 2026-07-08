import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types';
import Modal from './Modal';
import { Calendar, Clock, FileText, Upload, CheckCircle2, User as UserIcon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose, doctor }) => {
  const { currentUser, appointments, bookAppointment } = useApp();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  
  // File upload state
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [isSuccess, setIsSuccess] = useState(false);

  // AI Appointment Scheduler State
  const [aiRecommendation, setAiRecommendation] = useState<{ recommendedSlot: string | null; reasons: string[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Already booked slots for this doctor on the selected date
  const bookedSlots = appointments
    .filter(appt => appt.doctorId === (doctor?.id || '') && appt.date === appointmentDate && appt.status !== 'cancelled')
    .map(appt => appt.time);

  // Fetch slot recommendations from AI Scheduler MVC backend
  useEffect(() => {
    if (!appointmentDate || !doctor) {
      setAiRecommendation(null);
      return;
    }

    const fetchAiRecommendation = async () => {
      setIsAiLoading(true);
      try {
        const response = await fetch('/api/ai/scheduler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorId: doctor.id,
            patientId: currentUser?.id,
            preferredTime: selectedSlot,
            bookedSlots
          })
        });

        if (response.ok) {
          const data = await response.json();
          setAiRecommendation(data);
        }
      } catch (err) {
        console.error('Error fetching AI slot recommendation:', err);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiRecommendation();
  }, [appointmentDate, doctor?.id, appointments]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setReportFile(file);
      setReportName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setReportFile(file);
      setReportName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      navigate('/login');
      onClose();
      return;
    }

    if (!patientName || !appointmentDate || !selectedSlot) {
      alert('Please fill out all required fields.');
      return;
    }

    bookAppointment({
      patientId: currentUser.id,
      patientName: patientName,
      patientEmail: currentUser.email,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization,
      doctorAvatar: doctor.avatar,
      date: appointmentDate,
      time: selectedSlot,
      symptoms: symptoms,
      reportUrl: reportName ? '#' : undefined,
      reportName: reportName || undefined,
      status: 'pending'
    });

    setIsSuccess(true);
  };

  const handleSuccessClose = () => {
    setIsSuccess(false);
    setAppointmentDate('');
    setSelectedSlot('');
    setSymptoms('');
    setReportFile(null);
    setReportName('');
    onClose();
  };

  if (!doctor) return null;

  return (
    <Modal isOpen={isOpen} onClose={isSuccess ? handleSuccessClose : onClose} title={`Book Appointment with ${doctor.name}`} size="md">
      {isSuccess ? (
        <div className="text-center py-8 space-y-5">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#E8F5EC] border border-[#D1EADE] text-[#2E6F40] mb-2 shadow-sm">
            <CheckCircle2 className="h-10 w-10 animate-bounce text-[#2E6F40]" />
          </div>
          <h4 className="text-2xl font-extrabold text-[#1F2937]">Booking Request Sent!</h4>
          <p className="text-[#6B7280] max-w-sm mx-auto text-sm leading-relaxed font-medium">
            Your appointment has been requested with <strong>{doctor.name}</strong> for <strong>{appointmentDate}</strong> at <strong>{selectedSlot}</strong>.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                handleSuccessClose();
                navigate('/appointments');
              }}
              className="px-6 py-3 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold transition-all text-sm shadow-md cursor-pointer hover:scale-[1.03]"
            >
              View Appointment History
            </button>
            <button
              onClick={() => {
                handleSuccessClose();
                if (currentUser && currentUser.role === 'patient') {
                  navigate('/dashboard/patient', { state: { activeSection: 'browse' } });
                } else {
                  navigate('/');
                }
              }}
              className="px-6 py-3 rounded-xl bg-[#F5F7F5] hover:bg-[#FAF9F6] border border-[#E5E7EB] text-[#1F2937] font-bold transition-all text-sm cursor-pointer hover:scale-[1.03]"
            >
              Back to Doctors
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {!currentUser ? (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm flex items-start gap-3">
              <span className="text-base">⚠️</span>
              <div>
                <span className="font-semibold">Authorization required:</span> You must be logged in as a patient to schedule bookings.
                <button
                  type="button"
                  onClick={() => { onClose(); navigate('/login'); }}
                  className="block mt-2 font-bold text-[#2E6F40] hover:underline"
                >
                  Log In or Register Now
                </button>
              </div>
            </div>
          ) : currentUser.role !== 'patient' ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm">
              <span className="font-semibold">Note:</span> You are currently logged in as a <strong>{currentUser.role}</strong>. Please switch accounts or log in as a patient to request appointments.
            </div>
          ) : null}

          {/* Patient Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Patient Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled={!currentUser || currentUser.role !== 'patient'}
                placeholder="Full Name of Patient"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all disabled:opacity-60"
              />
              <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
            </div>
          </div>

          {/* Date & Time Slots Selection */}
          {(() => {
            const getDayOfWeekName = (dateStr: string) => {
              if (!dateStr) return '';
              const dateObj = new Date(dateStr + 'T00:00:00');
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return days[dateObj.getDay()];
            };

            const selectedDayName = appointmentDate ? getDayOfWeekName(appointmentDate) : '';
            const isWorkingDay = doctor?.availability && appointmentDate ? doctor.availability.includes(selectedDayName) : true;
            const isLeaveDay = doctor?.leaves && appointmentDate ? doctor.leaves.includes(appointmentDate) : false;
            const isAvailable = appointmentDate && isWorkingDay && !isLeaveDay;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Appointment Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={appointmentDate}
                        onChange={(e) => {
                          setAppointmentDate(e.target.value);
                          setSelectedSlot(''); // Reset slot on date change
                        }}
                        disabled={!currentUser || currentUser.role !== 'patient'}
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all"
                      />
                      <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
                    </div>
                  </div>

                  {/* Appointment Time Slots */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Available Time Slot</label>
                    <div className="relative">
                      <select
                        required
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        disabled={!currentUser || currentUser.role !== 'patient' || !isAvailable}
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-60"
                      >
                        <option value="">
                          {!appointmentDate 
                            ? "Select a date first" 
                            : isLeaveDay 
                            ? "Doctor is on leave" 
                            : !isWorkingDay 
                            ? `No consultations on ${selectedDayName}s` 
                            : "Select a Slot"}
                        </option>
                        {isAvailable && (doctor?.slots || []).map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <option key={slot} value={slot} disabled={isBooked} className={isBooked ? 'text-slate-400 line-through bg-[#F5F7F5]' : 'text-[#1F2937]'}>
                              {slot} {isBooked ? ' (Already Booked)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
                    </div>
                  </div>
                </div>

                {/* Helper Alerts for unavailable dates */}
                {appointmentDate && isLeaveDay && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <span className="text-sm">⚠️</span>
                    <span>Dr. {doctor?.name} is on leave / unavailable on {appointmentDate}. Please choose another date.</span>
                  </div>
                )}
                {appointmentDate && !isLeaveDay && !isWorkingDay && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-semibold flex items-center gap-2">
                    <span className="text-sm">⚠️</span>
                    <span>Dr. {doctor?.name} does not schedule slots on {selectedDayName}s. Configured working days: {(doctor?.availability || []).join(', ')}.</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* AI Recommended Time Slot Section */}
          {appointmentDate && (
            <div className="p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 rounded-2xl border border-blue-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 fill-blue-100 animate-pulse" />
                  AI Smart Scheduler Recommendation
                </span>
                {isAiLoading && <span className="text-[10px] text-blue-500 font-bold animate-pulse">Analyzing schedule...</span>}
              </div>

              {aiRecommendation?.recommendedSlot ? (
                <div className="space-y-3.5 text-xs text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-blue-50">
                    <p className="text-[#1F2937] text-xs font-semibold leading-relaxed">
                      AI recommends booking <span className="text-blue-600 font-black">{aiRecommendation.recommendedSlot}</span> based on optimal patient wait times.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(aiRecommendation.recommendedSlot!)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 shadow-sm"
                    >
                      Apply Optimal Slot
                    </button>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {(aiRecommendation.reasons || []).map((reason, i) => (
                      <p key={i} className="text-[11px] text-[#6B7280] flex items-start gap-2 leading-relaxed font-medium">
                        <span className="text-emerald-600 font-extrabold">✔</span> 
                        <span>{reason}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                !isAiLoading && (
                  <p className="text-[11px] text-[#6B7280] font-medium pl-1">
                    No vacant slots matching optimal clinical thresholds. Please pick any manual slot above.
                  </p>
                )
              )}
            </div>
          )}

          {/* Symptoms */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Symptoms / Purpose</label>
            <div className="relative">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={!currentUser || currentUser.role !== 'patient'}
                placeholder="Describe any symptoms, current medications, or details of this visit..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl text-[#1F2937] text-sm focus:border-[#2E6F40] focus:bg-white focus:outline-none transition-all resize-none"
              />
              <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
            </div>
          </div>

          {/* Upload Medical Report */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">Upload Medical Reports (Optional)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 ${
                isDragging 
                  ? 'border-[#2E6F40] bg-[#E8F5EC]/50' 
                  : reportName 
                    ? 'border-emerald-300 bg-emerald-50/20' 
                    : 'border-[#E5E7EB] bg-[#FAF9F6] hover:bg-[#F5F7F5] hover:border-[#2E6F40]/30'
              } ${(!currentUser || currentUser.role !== 'patient') ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                type="file"
                id="modal-report-upload"
                onChange={handleFileChange}
                disabled={!currentUser || currentUser.role !== 'patient'}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="modal-report-upload" className="cursor-pointer block w-full">
                {reportName ? (
                  <div className="flex items-center justify-center gap-2.5 text-[#2E6F40] font-bold">
                    <FileText className="h-5.5 w-5.5 text-[#2E6F40]" />
                    <span className="text-sm truncate max-w-xs">{reportName}</span>
                    <span className="text-xs text-[#6B7280] font-medium">({(reportFile?.size ? (reportFile.size / 1024).toFixed(1) : 150)} KB)</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="mx-auto h-8 w-8 text-[#6B7280] flex items-center justify-center">
                      <Upload className="h-5.5 w-5.5" />
                    </div>
                    <p className="text-sm text-[#1F2937] font-bold">Drag and drop file, or <span className="text-[#2E6F40] hover:underline">browse</span></p>
                    <p className="text-xs text-[#6B7280] font-medium">PDF, JPG, PNG, DOC up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[#6B7280] bg-[#F5F7F5] hover:bg-[#FAF9F6] transition-all text-sm font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!currentUser || currentUser.role !== 'patient'}
              className="px-6 py-2.5 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white transition-all text-sm font-bold shadow-md shadow-emerald-900/10 disabled:opacity-50 disabled:shadow-none cursor-pointer hover:scale-[1.02] duration-300"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default BookAppointmentModal;
