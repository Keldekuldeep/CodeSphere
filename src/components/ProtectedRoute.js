import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const isDemoMode = process.env.REACT_APP_ENV === 'development';

  if (loading) {
    return (
      <div className="loading">
        <div>Loading...</div>
      </div>
    );
  }

  // In demo mode, allow access without authentication
  if (isDemoMode) {
    console.log('🔧 Demo mode: Allowing access to protected route');
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;