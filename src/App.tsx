import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ToastContainer from './components/ToastContainer';

// Layout wrappers
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guard components
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DoctorDetails from './pages/DoctorDetails';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import GoogleCallback from './pages/GoogleCallback';

// Protected pages (Dashboard context)
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentHistory from './pages/AppointmentHistory';
import NotificationsPage from './pages/NotificationsPage';
import ApplyDoctor from './pages/ApplyDoctor';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <ToastContainer />
      <HashRouter>
        <ScrollToTop />
        <Routes>
          
          {/* 1. Client / Public Facing Layout Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login role="patient" />} />
            <Route path="login/doctor" element={<Login role="doctor" />} />
            <Route path="login/admin" element={<Login role="admin" />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="doctors/:id" element={<DoctorDetails />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="apply-doctor" element={<ApplyDoctor />} />
            <Route path="404" element={<NotFoundPage />} />
          </Route>

          {/* 2. Dashboard Protected Routes Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Patients console */}
            <Route path="dashboard/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />

            {/* Doctors portal */}
            <Route path="dashboard/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />

            {/* Admin console */}
            <Route path="dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Shared dashboard tools (available to any authenticated user role) */}
            <Route path="appointments" element={<AppointmentHistory />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 3. Google OAuth Callback */}
          <Route path="auth/google/callback" element={<GoogleCallback />} />

          {/* 4. Fallback redirects */}
          <Route path="*" element={<Navigate to="/404" replace />} />

        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
