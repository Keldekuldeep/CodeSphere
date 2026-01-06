import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DonorRoute = ({ children }) => {
  const { isAuthenticated, userType, loading, userProfile, user } = useAuth();

  console.log('🔍 DonorRoute check:', { 
    isAuthenticated, 
    userType, 
    hasProfile: !!userProfile, 
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
        <div style={{ fontSize: '14px', color: '#666' }}>Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/donor/login" replace />;
  }

  // If user is DONOR type, allow access
  if (userType === 'DONOR') {
    console.log('✅ User is DONOR, allowing access');
    return children;
  }

  // If user is authenticated but not DONOR type, redirect based on type
  if (userType === 'NEEDY') {
    console.log('🔄 User is NEEDY, redirecting to needy dashboard');
    return <Navigate to="/needy/dashboard" replace />;
  }

  if (userType === 'ADMIN') {
    console.log('🔄 User is ADMIN, redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  // CRITICAL: Only redirect to registration if we're SURE the user is new
  // Wait longer for profile check to complete before assuming user is new
  if (userType === 'NEW') {
    console.log('🆕 Confirmed new user, redirecting to registration');
    return <Navigate to="/donor/register" replace />;
  }

  // If userType is not set but user is authenticated, show loading for longer
  // This prevents premature redirect to registration while profile is being checked
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
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Checking Profile...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we verify your account...</div>
        <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Firebase UID: {user.uid}<br/>
          Email: {user.email}
        </div>
      </div>
    );
  }

  // Default: redirect to home
  console.log('🏠 Unknown state, redirecting to home');
  return <Navigate to="/" replace />;
};

export default DonorRoute;