import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, hasAnyRole, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions
  if (allowedRoles && allowedRoles.length > 0) {
    // Admin always has access unless explicitly forbidden
    const isAllowed = isAdmin || hasAnyRole(allowedRoles);
    if (!isAllowed) {
      return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname, requiredRoles: allowedRoles }} replace />;
    }
  }

  return children;
}
