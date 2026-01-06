import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { createDonor, createUser } from '../../services/firebaseApi';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DonorLoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, user, userProfile } = useAuth();
  
  // Check if demo mode is requested via URL parameter
  const isDemoMode = process.env.REACT_APP_ENV === 'development' || location.search.includes('demo=true');

  // Auto-fill demo credentials if demo mode is requested
  useEffect(() => {
    if (location.search.includes('demo=true') && !email && !password) {
      console.log('🚀 Quick demo mode activated - auto-filling credentials');
      setEmail('donor@demo.com');
      setPassword('demo123');
    }
  }, [location.search, email, password]);

  const handleDemoLogin = () => {
    console.log('🔧 Demo mode: Using demo credentials');
    setEmail('donor@demo.com');
    setPassword('demo123');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      console.log('🔥 Attempting Firebase login for:', email);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('✅ Firebase login successful:', firebaseUser.uid);
      
      // Wait a bit for AuthContext to process the user
      console.log('⏳ Waiting for AuthContext to process user...');
      
      // Set a timeout to wait for AuthContext to determine user type
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max
      
      const checkUserType = () => {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            attempts++;
            console.log(`🔄 Attempt ${attempts}: Checking user type...`, { userType, user: !!user });
            
            if (userType && userType !== 'NEW') {
              clearInterval(interval);
              console.log('✅ User type determined:', userType);
              resolve(userType);
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              console.log('⚠️ Timeout waiting for user type, proceeding anyway');
              resolve(userType || 'UNKNOWN');
            }
          }, 500); // Check every 500ms
        });
      };
      
      const finalUserType = await checkUserType();
      
      // Navigate based on user type
      if (finalUserType === 'DONOR') {
        console.log('🎯 Redirecting to donor dashboard');
        navigate('/donor/dashboard');
      } else if (finalUserType === 'NEEDY') {
        console.log('🎯 Redirecting to needy dashboard');
        navigate('/needy/dashboard');
      } else if (finalUserType === 'ADMIN') {
        console.log('🎯 Redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else if (finalUserType === 'NEW') {
        console.log('🎯 New user, redirecting to registration');
        navigate('/donor/register');
      } else {
        console.log('⚠️ Unknown user type, staying on login page');
        setError('Login successful but unable to determine account type. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please register first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated and has a type, redirect appropriately
  useEffect(() => {
    console.log('🔄 Login page - Current auth state:', { userType, isAuthenticated: !!user });
    
    if (userType === 'DONOR' && user) {
      console.log('✅ User already logged in as donor, redirecting to dashboard');
      navigate('/donor/dashboard');
    } else if (userType === 'NEEDY' && user) {
      console.log('✅ User already logged in as needy, redirecting to needy dashboard');
      navigate('/needy/dashboard');
    } else if (userType === 'ADMIN' && user) {
      console.log('✅ User already logged in as admin, redirecting to admin dashboard');
      navigate('/admin/dashboard');
    } else if (userType === 'NEW') {
      console.log('🔄 New user detected, staying on login page for now');
      // Don't auto-redirect to registration from login page
    }
  }, [userType, navigate, user]);

  const handleCreateTestDonor = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔧 Creating proper test donor account...');
      
      // Create Firebase Auth user
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, 'donor@demo.com', 'demo123');
        user = userCredential.user;
        console.log('✅ New Firebase Auth user created:', user.uid);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('🔄 User already exists, signing in...');
          const userCredential = await signInWithEmailAndPassword(auth, 'donor@demo.com', 'demo123');
          user = userCredential.user;
          console.log('✅ Signed in to existing user:', user.uid);
        } else {
          throw error;
        }
      }
      
      // Create user entry
      await createUser(user.uid, {
        email: 'donor@demo.com',
        userType: 'DONOR'
      });
      console.log('✅ User document created');
      
      // Create donor profile with CORRECT firebaseUid
      const donorData = {
        firebaseUid: user.uid, // CRITICAL: This must match Firebase Auth UID
        fullName: 'Test Donor',
        name: 'Test Donor',
        email: 'donor@demo.com',
        phone: '+91-9876543210',
        contactNumber: '+91-9876543210',
        bloodGroup: 'O_POSITIVE',
        city: 'Mumbai',
        address: '123 Test Street, Mumbai, Maharashtra',
        age: 25,
        weight: 70,
        gender: 'Male',
        isAvailable: true,
        donationCount: 5,
        rating: 4.5,
        lastDonationDate: null
      };
      
      await createDonor(donorData);
      console.log('✅ Donor profile created with correct firebaseUid');
      
      alert('✅ Test donor account ready!\n\nCredentials:\nEmail: donor@demo.com\nPassword: demo123\n\nNow login - you should go directly to dashboard!');
      
      // Auto-fill the form
      setEmail('donor@demo.com');
      setPassword('demo123');
      
    } catch (error) {
      console.error('❌ Error creating test donor:', error);
      setError('Failed to create test donor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-login">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🩸 Donor Login</h1>
            <p>Sign in to your donor account</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleLogin}>
            <h2>Welcome Back!</h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Sign in to access your donor dashboard and view blood requests.
            </p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
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
              {loading ? 'Signing In...' : '🩸 Sign In'}
            </button>
            
            {isDemoMode && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #0066cc', borderRadius: '5px' }}>
                <h4 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>🔧 Demo Mode</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                  {location.search.includes('demo=true') ? 
                    '🚀 Quick Demo activated! Credentials auto-filled.' :
                    'Use demo credentials for testing:'
                  }
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
                    onClick={handleCreateTestDonor}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? 'Creating...' : 'Create Test Donor'}
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Email: donor@demo.com<br/>
                  Password: demo123
                </div>
                {location.search.includes('demo=true') && (
                  <div style={{ fontSize: '12px', color: '#28a745', marginTop: '10px', fontWeight: 'bold' }}>
                    ✅ Ready to login! Just click "Sign In" button above.
                  </div>
                )}
              </div>
            )}
          </form>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px' }}>
              <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>🔍 Debug Info</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                Current Auth State: {userType || 'Not set'}<br/>
                User Authenticated: {user ? 'Yes' : 'No'}<br/>
                {user && `Firebase UID: ${user.uid}`}
              </p>
              <button 
                type="button" 
                onClick={() => {
                  console.log('🔍 Current auth state:', { user, userType, userProfile });
                  if (user) {
                    import('../../services/firebaseApi').then(({ getDonorByFirebaseUid }) => {
                      getDonorByFirebaseUid(user.uid).then(profile => {
                        console.log('👤 Donor profile check result:', profile);
                        if (profile) {
                          alert('Donor profile found! Should redirect to dashboard.');
                          navigate('/donor/dashboard');
                        } else {
                          alert('No donor profile found. Need to register first.');
                        }
                      }).catch(err => {
                        console.error('Error:', err);
                        alert('Error checking profile: ' + err.message);
                      });
                    });
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                Check Profile Status
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DonorLoginPage;