import React, { useState } from 'react';
import Modal from './Modal';
import { FileText, Sparkles, AlertCircle, HeartPulse } from 'lucide-react';

interface CompleteConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onComplete: (appointmentId: string, prescriptionText: string) => void;
}

const CompleteConsultationModal: React.FC<CompleteConsultationModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onComplete
}) => {
  const [prescription, setPrescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescription.trim()) {
      setError('Please provide prescription text or clinician advice.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Call parent onComplete handler
      await onComplete(appointment.id, prescription);
      setPrescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete consultation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Patient Consultation" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex gap-3">
          <HeartPulse className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block">Consultation with {appointment.patientName}</span>
            <p className="text-slate-500 mt-1">
              Provide clinical instructions, medications, dosage schedules, or lifestyle advice. 
              Our <strong>AI Medical Engine</strong> will automatically parse this text and structure real-time pill reminders for the patient.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Prescription & Clinician Advice
          </label>
          <div className="relative">
            <textarea
              required
              rows={6}
              value={prescription}
              onChange={(e) => {
                setPrescription(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Paracetamol 650mg 1 tablet three times a day for 3 days. Amoxicillin 500mg 1 capsule twice a day (morning and night) for 5 days. Drink warm fluids and rest."
              className="w-full pl-3.5 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold">
            <Sparkles className="h-3.5 w-3.5 fill-blue-100" />
            <span>AI automatically extracts medicine, dosage, duration, and time flags</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Syncing Med Reminders...' : 'Complete & Generate AI Reminders'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CompleteConsultationModal;
