import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { createUser, createAdmin } from '../../services/firebaseApi';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { userType, user } = useAuth();
  const isDemoMode = process.env.REACT_APP_ENV === 'development';

  const handleDemoLogin = () => {
    console.log('🔧 Demo mode: Using admin demo credentials');
    setEmail('admin@bloodsaathi.com');
    setPassword('admin123');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      console.log('🔥 Attempting admin Firebase login for:', email);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Admin Firebase login successful:', user.uid);
      console.log('🔄 AuthContext will check admin profile and redirect...');
      
      // Let AuthContext handle the redirect
      
    } catch (error) {
      console.error('❌ Admin login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No admin account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated as admin, redirect to admin dashboard
  React.useEffect(() => {
    console.log('🔄 Admin login page - Current auth state:', { userType, isAuthenticated: !!user });
    
    if (userType === 'ADMIN') {
      console.log('✅ User already logged in as admin, redirecting to admin dashboard');
      navigate('/admin/dashboard');
    }
    // Don't redirect other user types - let them login as admin if they want
  }, [userType, navigate, user]);

  const handleCreateTestAdmin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔧 Creating test admin account...');
      
      // Create Firebase Auth user
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@bloodsaathi.com', 'admin123');
        user = userCredential.user;
        console.log('✅ New admin Firebase Auth user created:', user.uid);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('🔄 Admin user already exists, signing in...');
          const userCredential = await signInWithEmailAndPassword(auth, 'admin@bloodsaathi.com', 'admin123');
          user = userCredential.user;
          console.log('✅ Signed in to existing admin user:', user.uid);
        } else {
          throw error;
        }
      }
      
      // Create admin user entry
      await createAdmin({
        firebaseUid: user.uid,
        email: 'admin@bloodsaathi.com',
        userType: 'ADMIN',
        fullName: 'System Administrator',
        role: 'ADMIN',
        permissions: ['all']
      });
      console.log('✅ Admin user document created');
      
      alert('✅ Test admin account ready!\n\nCredentials:\nEmail: admin@bloodsaathi.com\nPassword: admin123\n\nNow login - you should go directly to admin dashboard!');
      
      // Auto-fill the form
      setEmail('admin@bloodsaathi.com');
      setPassword('admin123');
      
    } catch (error) {
      console.error('❌ Error creating test admin:', error);
      setError('Failed to create test admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>⚙️ Admin Login</h1>
            <p>Administrative access to BloodSaathi platform</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleLogin}>
            <h2>Administrator Access</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Sign in to access the admin dashboard and manage the platform.
            </p>
            
            <div className="form-group">
              <label htmlFor="email">Admin Email *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginBottom: '15px' }}
            >
              {loading ? 'Signing In...' : '⚙️ Admin Login'}
            </button>
            
            {isDemoMode && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #0066cc', borderRadius: '5px' }}>
                <h4 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>🔧 Demo Mode</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                  Use demo admin credentials for testing:
                </p>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleDemoLogin}
                    style={{ flex: 1 }}
                  >
                    Fill Demo Credentials
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCreateTestAdmin}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Creating...' : 'Create Test Admin'}
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Email: admin@bloodsaathi.com<br/>
                  Password: admin123
                </div>
              </div>
            )}
          </form>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
            <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>🔍 Current Session</h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              Auth State: {userType || 'Not logged in'}<br/>
              User: {user ? 'Authenticated' : 'Not authenticated'}<br/>
              {user && `Email: ${user.email}`}
            </p>
            {user && userType !== 'ADMIN' && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '12px', color: '#856404', marginBottom: '10px' }}>
                  You're currently logged in as {userType}. To access admin panel, please logout first or use admin credentials.
                </p>
                <button 
                  onClick={async () => {
                    try {
                      const { signOut } = await import('../../firebase/auth');
                      await signOut();
                      window.location.reload();
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  Logout Current Session
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>
              Don't have an admin account? <Link to="/admin/register" style={{ color: '#007bff' }}>Register here</Link>
            </p>
            <p>
              <Link to="/">{t('nav.home')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;