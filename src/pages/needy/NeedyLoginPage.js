import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmail, createAccountWithEmail } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { userType, userProfile, isAuthenticated } = useAuth();

  // Redirect existing needy users to dashboard
  useEffect(() => {
    console.log('🔄 NeedyLoginPage useEffect - Auth state:', { isAuthenticated, userType, userProfile: !!userProfile });
    
    if (isAuthenticated && userType === 'NEEDY' && userProfile) {
      console.log('✅ Existing needy user detected in useEffect, redirecting to dashboard');
      navigate('/needy/dashboard');
    }
  }, [isAuthenticated, userType, userProfile, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login existing user
        console.log('🔐 Logging in needy user with email:', formData.email);
        const user = await signInWithEmail(formData.email, formData.password);
        console.log('✅ User logged in successfully:', user.email);
        console.log('✅ User UID:', user.uid);
        
        // Wait for AuthContext to process and check user type
        console.log('⏳ Waiting for AuthContext to process user...');
        
        // Check user profile immediately after login
        setTimeout(async () => {
          try {
            console.log('🔍 Checking user profile after login...');
            
            // Import Firebase functions
            const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../../firebase/firebaseConfig');
            
            // Check if user has needy profile by UID
            console.log('🔍 Step 1: Checking needy profile by UID...');
            const needyQuery = query(
              collection(db, 'needy'), 
              where('firebaseUid', '==', user.uid)
            );
            const needySnapshot = await getDocs(needyQuery);
            
            if (!needySnapshot.empty) {
              // Existing needy user - go to dashboard
              console.log('✅ Existing needy user found by UID - redirecting to dashboard');
              navigate('/needy/dashboard');
              setLoading(false);
              return;
            }
            
            // Check needy by email as fallback
            console.log('🔍 Step 2: Checking needy profile by email...');
            const emailQuery = query(
              collection(db, 'needy'), 
              where('email', '==', user.email)
            );
            const emailSnapshot = await getDocs(emailQuery);
            
            if (!emailSnapshot.empty) {
              // Existing needy user found by email - go to dashboard
              console.log('✅ Existing needy user found by email - redirecting to dashboard');
              navigate('/needy/dashboard');
              setLoading(false);
              return;
            }
            
            // Check if user is actually a donor (wrong login page)
            console.log('🔍 Step 3: Checking if user is a donor...');
            const donorQuery = query(
              collection(db, 'donors'), 
              where('firebaseUid', '==', user.uid)
            );
            const donorSnapshot = await getDocs(donorQuery);
            
            if (!donorSnapshot.empty) {
              const donorDoc = donorSnapshot.docs[0];
              const donorData = donorDoc.data();
              
              console.log('⚠️ User is a DONOR, not NEEDY!');
              setError(`You are registered as a DONOR (${donorData.fullName || donorData.name}). Please use the Donor Login page instead.`);
              setLoading(false);
              
              // Optionally redirect to donor login after showing error
              setTimeout(() => {
                window.location.href = '/donor/login';
              }, 3000);
              return;
            }
            
            // Check if user is actually an admin (wrong login page)
            console.log('🔍 Step 4: Checking if user is an admin...');
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.userType === 'ADMIN' || userData.role === 'ADMIN') {
                console.log('⚠️ User is an ADMIN, not NEEDY!');
                setError(`You are registered as an ADMIN (${userData.fullName || userData.name}). Please use the Admin Login page instead.`);
                setLoading(false);
                
                // Optionally redirect to admin login after showing error
                setTimeout(() => {
                  window.location.href = '/admin/login';
                }, 3000);
                return;
              }
            }
            
            // No needy profile found - new user, go to registration
            console.log('🆕 New needy user detected - redirecting to registration');
            navigate('/needy/register');
            setLoading(false);
            
          } catch (profileError) {
            console.error('❌ Error checking profile:', profileError);
            // Default to registration if there's an error
            console.log('🔄 Defaulting to registration due to error');
            navigate('/needy/register');
            setLoading(false);
          }
        }, 2000); // Wait 2 seconds for AuthContext
        
      } else {
        // Create new account
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        console.log('📝 Creating new needy account with email:', formData.email);
        const user = await createAccountWithEmail(formData.email, formData.password);
        console.log('✅ User account created successfully:', user.email);
        console.log('✅ New user UID:', user.uid);
        
        // New users always go to registration
        console.log('🚀 Redirecting new user to registration...');
        navigate('/needy/register');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Auth error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please create a new account.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError('Login failed: ' + error.message);
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="needy-login">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 {isLogin ? 'Needy Login' : 'Create Needy Account'}</h1>
            <p>{isLogin ? 'Login to request blood' : 'Create account to request blood'}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        {/* Emergency Banner */}
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626' }}>🚨 Life-Threatening Emergency</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px', flexWrap: 'wrap' }}>
              <div>
                <strong>Emergency Helpline:</strong>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>
                  📞 +91-9876543210
                </p>
              </div>
              <div>
                <strong>WhatsApp Support:</strong>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>
                  💬 +91-9876543210
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
            )}

            {error && (
              <div className="error" style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '10px', 
                borderRadius: '4px', 
                border: '1px solid #f5c6cb',
                marginTop: '15px'
              }}>
                {error}
              </div>
            )}

            {loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '10px', 
                backgroundColor: '#d1ecf1', 
                color: '#0c5460',
                borderRadius: '4px',
                marginTop: '15px'
              }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #007bff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '10px'
                }}></div>
                Processing login... Please wait
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>
              Want to donate blood? <a href="/donor/auth">Become a Donor</a> | 
              <a href="/" style={{ marginLeft: '10px' }}>Home</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .needy-login {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        
        .header {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          padding: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        
        .card {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background-color: #dc3545;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background-color: #c82333;
        }
        
        .btn-primary:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 20px 10px;
          }
          
          .card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default NeedyLoginPage;