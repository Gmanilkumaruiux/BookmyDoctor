export interface DoctorSearchFilter {
  specialization?: string;
  gender?: 'Male' | 'Female' | '';
  feesLimit?: number;
  experienceMin?: number;
  availableToday?: boolean;
  ratingMin?: number;
  location?: string;
}

export interface RecommendedDoctor {
  doctorId: string;
  name: string;
  specialization: string;
  avatar: string;
  matchScore: number;
  reasons: string[];
  experience: number;
  fees: number;
  availableSlots: string[];
  rating: number;
}

export interface RecommendationHistory {
  id: string;
  patientId: string;
  query: string;
  interpretedFilters: DoctorSearchFilter;
  results: RecommendedDoctor[];
  createdAt: string;
}

export interface WaitTimePrediction {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  queuePosition: number;
  expectedConsultation: string;
  estimatedWaitingMinutes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MedicineReminder {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  medicineName: string;
  dosage: string;
  duration: string;
  timing: {
    morning: boolean;
    afternoon: boolean;
    night: boolean;
  };
  enabled: boolean;
  snoozedUntil?: string; // ISO String
  createdAt: string;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // Morning, Afternoon, Night
  status: 'taken' | 'skipped' | 'snoozed';
  actionTime: string; // ISO string
  createdAt: string;
}
