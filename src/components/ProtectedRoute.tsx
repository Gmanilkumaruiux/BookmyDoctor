import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If patient tries to access doctor dashboard, redirect them to patient dashboard
    if (currentUser.role === 'patient') {
      return <Navigate to="/dashboard/patient" replace />;
    }
    if (currentUser.role === 'doctor') {
      return <Navigate to="/dashboard/doctor" replace />;
    }
    if (currentUser.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
