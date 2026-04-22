import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import PendingApproval from './user/PendingApproval';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user is pending and trying to access user routes, show approval screen
  if (user.role === 'user' && user.status === 'pending') {
    return <PendingApproval user={user} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
