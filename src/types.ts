export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  gender?: string;
  dob?: string;
  avatar?: string;
  address?: string;
  bloodGroup?: string;
  isApproved?: boolean; // For doctors applying
}

export interface Doctor {
  id: string; // matches user id or separate
  name: string;
  email: string;
  specialization: string;
  experience: number; // in years
  fees: number;
  hospital: string;
  rating: number;
  reviewsCount: number;
  availability: string[]; // e.g., ['Monday', 'Wednesday', 'Friday']
  slots: string[]; // e.g., ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM']
  leaves?: string[]; // e.g., ['2026-07-10']
  avatar: string;
  bio: string;
  education: string;
  isApproved: boolean;
  phone?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar: string;
  date: string;
  time: string;
  symptoms: string;
  reportUrl?: string;
  reportName?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: string;
  rating?: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  date: string;
  doctorName: string;
  attachmentUrl?: string;
  attachmentName?: string;
  description: string;
}

export interface DoctorApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  hospital: string;
  registrationNumber: string;
  address: string;
  medicalCertificate: string;
  governmentId: string;
  avatar: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  generatedEmail?: string;
  generatedPassword?: string;
}

