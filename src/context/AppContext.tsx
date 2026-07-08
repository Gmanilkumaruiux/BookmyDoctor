import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Doctor, Appointment, Notification, MedicalRecord, UserRole, DoctorApplication } from '../types';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'alert' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  doctors: Doctor[];
  doctorApplications: DoctorApplication[];
  appointments: Appointment[];
  notifications: Notification[];
  medicalRecords: MedicalRecord[];
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'alert' | 'info') => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string, requiredRole?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email: string, name: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  register: (user: Omit<User, 'id' | 'isApproved'>, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addNotification: (userId: string, message: string, type: Notification['type']) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;
  deleteNotification: (id: string) => void;
  updateProfile: (userId: string, profileData: Partial<User> & { avatar?: string }) => void;
  applyDoctor: (doctorData: Omit<DoctorApplication, 'id' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  verifyDoctor: (doctorId: string, status: 'approve' | 'reject') => void;
  verifyDoctorApplication: (applicationId: string, status: 'Approved' | 'Rejected') => Promise<{ success: boolean; error?: string }>;
  uploadMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => void;
  deleteMedicalRecord: (id: string) => void;
  rateAppointment: (appointmentId: string, rating: number) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bmd_token') || null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bmd_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorApplications, setDoctorApplications] = useState<DoctorApplication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToast = (message: string, type: 'success' | 'alert' | 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Synchronize dynamic backend data
  const loadData = async (activeToken: string | null, activeUser: User | null) => {
    setIsLoading(true);
    try {
      // 1. Fetch approved/active doctors (always public)
      const docsRes = await fetch('/api/doctors');
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDoctors(docsData);
      } else {
        addToast('Failed to load registered clinicians.', 'alert');
      }

      if (activeToken && activeUser) {
        const headers = {
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        };

        // 2. Fetch appointments
        const apptsRes = await fetch('/api/appointments', { headers });
        if (apptsRes.ok) {
          const apptsData = await apptsRes.json();
          setAppointments(apptsData);
        } else {
          addToast('Failed to sync appointment calendar.', 'alert');
        }

        // 3. Fetch medical records
        const recordsRes = await fetch('/api/medical-records', { headers });
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setMedicalRecords(recordsData);
        } else {
          addToast('Failed to load medical files.', 'alert');
        }

        // 4. Fetch notifications
        const notifsRes = await fetch('/api/notifications', { headers });
        if (notifsRes.ok) {
          const notifsData = await notifsRes.json();
          setNotifications(notifsData);
        } else {
          addToast('Failed to sync system notifications.', 'alert');
        }

        // 5. Fetch all users if admin
        if (activeUser.role === 'admin') {
          const usersRes = await fetch('/api/users', { headers });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData);
          } else {
            addToast('Failed to load user directories.', 'alert');
          }

          // Fetch doctor applications
          const appsRes = await fetch('/api/doctor-applications', { headers });
          if (appsRes.ok) {
            const appsData = await appsRes.json();
            setDoctorApplications(appsData);
          } else {
            addToast('Failed to load doctor applications.', 'alert');
          }
        }
      }
    } catch (err) {
      console.error('[Error synchronizing data with REST API]', err);
      addToast('Network connection failed. Could not sync clinic cloud.', 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync state on token change or startup
  useEffect(() => {
    loadData(token, currentUser);
  }, [token, currentUser?.id]);

  // Keep localStorage updated for persistence fallback/quick-load
  useEffect(() => {
    localStorage.setItem('bmd_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  // Auth functions
  const login = async (email: string, password: string, requiredRole?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, requiredRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('bmd_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        addToast(`Welcome back, ${data.user.name}!`, 'success');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Authentication failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Connection failed. Please try again.' };
    }
  };

  const register = async (userData: Omit<User, 'id' | 'isApproved'>, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('bmd_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        addToast(`Registered successfully, welcome ${data.user.name}!`, 'success');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Connection failed. Please try again.' };
    }
  };

  const loginWithGoogle = async (email: string, name: string, avatar?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, avatar })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('bmd_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        addToast(`Logged in via Google as ${data.user.name}`, 'success');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Google sign-in failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Connection failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('bmd_token');
    localStorage.removeItem('bmd_current_user');
    setToken(null);
    setCurrentUser(null);
    setAppointments([]);
    setMedicalRecords([]);
    setNotifications([]);
    addToast('Logged out successfully.', 'info');
  };

  // Appointments
  const bookAppointment = async (apptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apptData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Appointment requested successfully!', 'success');
        loadData(token, currentUser);
      } else {
        addToast(data.error || 'Could not request appointment.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed. Please check internet and try again.', 'alert');
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Appointment status updated to ${status}.`, 'success');
        loadData(token, currentUser);
      } else {
        addToast(data.error || 'Could not update appointment status.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed.', 'alert');
    }
  };

  // Notifications
  const addNotification = (userId: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      message,
      date: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (currentUser && userId === currentUser.id) {
      addToast(message, type);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadData(token, currentUser);
      } else {
        const data = await res.json();
        addToast(data.error || 'Could not mark notification as read.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed. Could not mark notification as read.', 'alert');
    }
  };

  const markAllNotificationsAsRead = async (userId: string) => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadData(token, currentUser);
      } else {
        const data = await res.json();
        addToast(data.error || 'Could not mark all notifications as read.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed. Could not mark all notifications as read.', 'alert');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadData(token, currentUser);
      } else {
        const data = await res.json();
        addToast(data.error || 'Could not delete notification.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed. Could not delete notification.', 'alert');
    }
  };

  // User profiles
  const updateProfile = async (userId: string, profileData: Partial<User> & { avatar?: string }) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        addToast('Profile updated successfully!', 'success');
        loadData(token, data.user);
      } else {
        addToast(data.error || 'Could not update profile.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed.', 'alert');
    }
  };

  // Applying for Doctor credentials
  const applyDoctor = async (doctorData: Omit<DoctorApplication, 'id' | 'status'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/doctor-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Doctor application submitted successfully with Pending status!', 'success');
        loadData(token, currentUser);
        return { success: true };
      } else {
        addToast(data.error || 'Could not submit application.', 'alert');
        return { success: false, error: data.error };
      }
    } catch (err) {
      addToast('Connection failed.', 'alert');
      return { success: false, error: 'Connection failed.' };
    }
  };

  // Verify doctor application (Admin workflow)
  const verifyDoctor = async (doctorId: string, status: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Doctor application verified: ${status === 'approve' ? 'Approved' : 'Rejected'}.`, 'success');
        loadData(token, currentUser);
      } else {
        addToast(data.error || 'Could not verify application.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed.', 'alert');
    }
  };

  const verifyDoctorApplication = async (applicationId: string, status: 'Approved' | 'Rejected'): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/doctor-applications/${applicationId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Doctor application approved and login credentials generated.`, 'success');
        loadData(token, currentUser);
        return { success: true };
      } else {
        addToast(data.error || 'Could not verify application.', 'alert');
        return { success: false, error: data.error };
      }
    } catch (err) {
      addToast('Connection failed.', 'alert');
      return { success: false, error: 'Connection failed.' };
    }
  };

  // Upload/delete medical records
  const uploadMedicalRecord = async (recordData: Omit<MedicalRecord, 'id'>) => {
    try {
      const res = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Medical record uploaded successfully!', 'success');
        loadData(token, currentUser);
      } else {
        addToast(data.error || 'Could not upload record.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed.', 'alert');
    }
  };

  const deleteMedicalRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/medical-records/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Medical record was deleted.', 'success');
        loadData(token, currentUser);
      } else {
        addToast(data.error || 'Could not delete record.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed.', 'alert');
    }
  };

  const rateAppointment = async (appointmentId: string, rating: number) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Thank you for rating your consultation!', 'success');
        loadData(token, currentUser);
      } else {
        addToast(data.error || 'Could not rate appointment.', 'alert');
      }
    } catch (err) {
      addToast('Connection failed. Could not submit rating.', 'alert');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      doctors,
      doctorApplications,
      appointments,
      notifications,
      medicalRecords,
      toasts,
      addToast,
      removeToast,
      login,
      loginWithGoogle,
      register,
      logout,
      bookAppointment,
      updateAppointmentStatus,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      updateProfile,
      applyDoctor,
      verifyDoctor,
      verifyDoctorApplication,
      uploadMedicalRecord,
      deleteMedicalRecord,
      rateAppointment,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
