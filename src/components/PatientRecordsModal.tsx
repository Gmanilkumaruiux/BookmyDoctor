import React from 'react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import { User, FileText, Calendar, Clock, MapPin, Phone, Mail, FileIcon, ShieldCheck } from 'lucide-react';

interface PatientRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
}

const PatientRecordsModal: React.FC<PatientRecordsModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName
}) => {
  const { users, medicalRecords, appointments } = useApp();

  // Find user details
  const patientDetails = users.find(u => u.id === patientId);

  // Filter medical records for this patient
  const records = medicalRecords.filter(r => r.patientId === patientId);

  // Filter appointments for this patient
  const patientAppointments = appointments.filter(a => a.patientId === patientId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Patient Record: ${patientName}`}
      size="lg"
    >
      <div className="space-y-6 text-left">
        {/* Patient Profile Card Header */}
        <div className="bg-[#FAF9F6] border border-[#E5E7EB] rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="h-16 w-16 rounded-2xl bg-[#E8F5EC] border border-[#D1EADE] flex items-center justify-center text-[#2E6F40] text-2xl font-black flex-shrink-0 shadow-sm">
            {patientName.charAt(0)}
          </div>
          <div className="flex-grow space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-lg font-extrabold text-[#1F2937] leading-none">{patientName}</h4>
              <span className="text-[10px] bg-[#E8F5EC] border border-[#D1EADE] text-[#2E6F40] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active Patient
              </span>
            </div>
            
            {/* Quick badges for Blood Group and Age */}
            <div className="flex gap-2 flex-wrap text-xs font-semibold">
              {patientDetails?.bloodGroup && (
                <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100">
                  Blood Group: {patientDetails.bloodGroup}
                </span>
              )}
              {patientDetails?.gender && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                  {patientDetails.gender}
                </span>
              )}
              {patientDetails?.dob && (
                <span className="px-2.5 py-1 bg-[#E8F5EC] text-[#2E6F40] rounded-lg border border-[#D1EADE]">
                  Born: {new Date(patientDetails.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-[#1F2937]">
          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-2.5 shadow-sm">
            <h5 className="font-extrabold text-[#1F2937] uppercase tracking-wider text-[10px] text-[#6B7280]">Contact Info</h5>
            <div className="flex items-center gap-2.5 text-[#6B7280]">
              <Mail className="h-4 w-4 text-[#2E6F40] flex-shrink-0" />
              <span className="truncate">{patientDetails?.email || 'N/A'}</span>
            </div>
            {patientDetails?.phone && (
              <div className="flex items-center gap-2.5 text-[#6B7280]">
                <Phone className="h-4 w-4 text-[#2E6F40] flex-shrink-0" />
                <span>{patientDetails.phone}</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-2.5 shadow-sm">
            <h5 className="font-extrabold text-[#1F2937] uppercase tracking-wider text-[10px] text-[#6B7280]">Residential Info</h5>
            <div className="flex items-start gap-2.5 text-[#6B7280]">
              <MapPin className="h-4 w-4 text-[#2E6F40] mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{patientDetails?.address || 'No registered residential address'}</span>
            </div>
          </div>
        </div>

        {/* Medical History Records Tab */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-[#1F2937] text-base flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <FileText className="h-5 w-5 text-[#2E6F40]" />
            Medical History & Files ({records.length})
          </h4>

          {records.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-white border border-[#E5E7EB] hover:border-[#2E6F40]/30 rounded-xl flex flex-col sm:flex-row justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#1F2937] text-sm">{rec.title}</span>
                      <span className="text-[10px] text-[#6B7280] font-semibold">({rec.date})</span>
                    </div>
                    <p className="text-[#6B7280] leading-relaxed font-medium">{rec.description}</p>
                    <div className="text-[10px] text-[#6B7280] font-semibold flex items-center gap-1">
                      <span className="text-[#2E6F40]">● Issued by:</span>
                      <span>{rec.doctorName}</span>
                    </div>
                  </div>

                  {rec.attachmentName && (
                    <div className="flex items-center gap-2 bg-[#FAF9F6] border border-[#E5E7EB] px-3 py-2 rounded-xl h-fit self-start sm:self-center">
                      <FileIcon className="h-4 w-4 text-[#2E6F40] flex-shrink-0" />
                      <div className="min-w-0 max-w-[120px] text-[10px]">
                        <span className="font-bold text-[#1F2937] block truncate leading-tight">{rec.attachmentName}</span>
                      </div>
                      <a
                        href={rec.attachmentUrl || '#'}
                        onClick={(e) => e.preventDefault()}
                        className="text-[9px] font-extrabold text-[#2E6F40] bg-white border border-[#E5E7EB] hover:bg-[#E8F5EC]/10 px-2 py-1 rounded-lg transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl p-8 text-center text-xs text-[#6B7280] font-medium leading-relaxed">
              No historical medical files or report uploads present for this patient.
            </div>
          )}
        </div>

        {/* Appointments List Tab */}
        <div className="space-y-4 pt-2">
          <h4 className="font-extrabold text-[#1F2937] text-base flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <Calendar className="h-5 w-5 text-[#2E6F40]" />
            BMD Appointments Ledger ({patientAppointments.length})
          </h4>

          {patientAppointments.length > 0 ? (
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {patientAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between text-xs font-semibold text-[#1F2937]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#FAF9F6] border border-[#E5E7EB] flex items-center justify-center text-[#2E6F40]">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-sm">{appt.doctorName}</span>
                      <span className="text-[10px] text-[#6B7280] block mt-0.5">{appt.date} at {appt.time} • {appt.doctorSpecialization}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                    appt.status === 'completed'
                      ? 'bg-[#E8F5EC] border border-[#D1EADE] text-[#2E6F40]'
                      : appt.status === 'approved'
                        ? 'bg-blue-50 border border-blue-100 text-blue-700'
                        : appt.status === 'cancelled'
                          ? 'bg-rose-50 border border-rose-100 text-rose-700'
                          : 'bg-amber-50 border border-amber-100 text-amber-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF9F6] border border-[#E5E7EB] rounded-xl p-6 text-center text-xs text-[#6B7280] font-medium">
              No appointments registered under this patient account.
            </div>
          )}
        </div>

        {/* Footer info lock */}
        <div className="pt-4 border-t border-[#E5E7EB] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2E6F40] hover:bg-[#245A33] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            Close Record View
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PatientRecordsModal;
