import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, userType, loading, user } = useAuth();

  console.log('🔍 AdminRoute check:', { 
    isAuthenticated, 
    userType, 
    loading,
    firebaseUid: user?.uid,
    userEmail: user?.email
  });

  if (loading) {
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Checking admin authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  // If user is ADMIN type, allow access
  if (userType === 'ADMIN') {
    console.log('✅ User is ADMIN, allowing access');
    return children;
  }

  // If user is authenticated but not ADMIN type, redirect based on type
  if (userType === 'DONOR') {
    console.log('🔄 User is DONOR but trying to access admin, redirecting to donor dashboard');
    return <Navigate to="/donor/dashboard" replace />;
  }

  if (userType === 'NEEDY') {
    console.log('🔄 User is NEEDY but trying to access admin, redirecting to needy dashboard');
    return <Navigate to="/needy/dashboard" replace />;
  }

  // If userType is NEW, redirect to admin login (not home)
  if (userType === 'NEW') {
    console.log('🆕 New user trying to access admin, redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  // If userType is not set but user is authenticated, show loading
  if (!userType && user) {
    console.log('⏳ UserType not set yet, waiting for profile check...');
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Checking Admin Access...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we verify your admin privileges...</div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Firebase UID: {user.uid}<br/>
          Email: {user.email}
        </div>
      </div>
    );
  }

  // Default: redirect to admin login
  console.log('🔐 Unknown state, redirecting to admin login');
  return <Navigate to="/admin/login" replace />;
};

export default AdminRoute;