import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userType, userProfile } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');

  const handleUserTypeSelection = (type) => {
    setSelectedUserType(type);
    setShowLoginModal(true);
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    
    if (selectedUserType === 'donor') {
      if (isAuthenticated && userType === 'DONOR' && userProfile) {
        navigate('/donor/dashboard');
      } else {
        navigate('/donor/login');
      }
    } else if (selectedUserType === 'needy') {
      if (isAuthenticated && userType === 'NEEDY' && userProfile) {
        navigate('/needy/dashboard');
      } else {
        navigate('/needy/login');
      }
    } else if (selectedUserType === 'admin') {
      if (isAuthenticated && userType === 'ADMIN' && userProfile) {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/login');
      }
    }
  };

  const handleQuickDemo = () => {
    setShowLoginModal(false);
    
    if (selectedUserType === 'donor') {
      // Navigate to donor login with demo flag
      navigate('/donor/login?demo=true');
    } else if (selectedUserType === 'needy') {
      navigate('/needy/login?demo=true');
    } else if (selectedUserType === 'admin') {
      navigate('/admin/login?demo=true');
    }
  };

  const handleRegister = () => {
    setShowLoginModal(false);
    
    if (selectedUserType === 'donor') {
      navigate('/donor/register');
    } else if (selectedUserType === 'needy') {
      navigate('/needy/register');
    } else if (selectedUserType === 'admin') {
      navigate('/admin/register');
    }
  };

  const LoginModal = () => {
    if (!showLoginModal) return null;

    const userTypeInfo = {
      donor: {
        title: t('landing.modal.donor.title', '🫱 Become a Blood Donor'),
        subtitle: t('landing.modal.donor.subtitle', 'Join thousands of verified donors saving lives'),
        description: t('landing.modal.donor.description', 'Register as a donor to help people in need of blood. Your donation can save up to 3 lives.'),
        color: '#dc3545'
      },
      needy: {
        title: t('landing.modal.needy.title', '🆘 Request Blood'),
        subtitle: t('landing.modal.needy.subtitle', 'Get connected with verified donors instantly'),
        description: t('landing.modal.needy.description', 'Create blood requests and get matched with compatible donors in your area within minutes.'),
        color: '#dc3545'
      },
      admin: {
        title: t('landing.modal.admin.title', '⚙️ Admin Access'),
        subtitle: t('landing.modal.admin.subtitle', 'Manage the RakhtSaathi platform'),
        description: t('landing.modal.admin.description', 'Administrative access to manage donors, requests, and monitor the platform.'),
        color: '#6c757d'
      }
    };

    const info = userTypeInfo[selectedUserType];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ color: info.color, marginBottom: '10px' }}>{info.title}</h2>
          <h4 style={{ color: '#666', marginBottom: '20px' }}>{info.subtitle}</h4>
          <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
            {info.description}
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleLogin}
              style={{
                backgroundColor: info.color,
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isAuthenticated && userType === selectedUserType.toUpperCase() ? 
                t('common.dashboard', '📊 Go to Dashboard') : 
                t('common.login', '🔐 Login')
              }
            </button>
            
            <button
              onClick={handleRegister}
              style={{
                backgroundColor: 'transparent',
                color: info.color,
                border: `2px solid ${info.color}`,
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {t('common.register', '📝 Register')}
            </button>
            
            {/* Quick Demo Button */}
            <button
              onClick={handleQuickDemo}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              🚀 Quick Demo
            </button>
            
            {/* Debug Test Button - Only show in development */}
            {process.env.REACT_APP_ENV === 'development' && (
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/test-auth');
                }}
                style={{
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🧪 Debug Test
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowLoginModal(false)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              marginTop: '20px',
              fontSize: '14px'
            }}
          >
            {t('common.close', '✕ Close')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="landing-page">
      <LoginModal />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div>
              <h1 className="hero-title">🩸 रक्तसाथी - RakhtSaathi</h1>
              <p className="hero-subtitle">{t('landing.subtitle', 'Save Lives Together - Blood Emergency Coordination System')}</p>
            </div>
            <LanguageSwitcher />
          </div>
          
          <div className="hero-main">
            <h2 className="hero-heading">{t('landing.heroHeading', 'Connect Blood Donors with Those in Need')}</h2>
            <p className="hero-description">
              {t('landing.heroDescription', 'RakhtSaathi is India\'s most trusted blood emergency coordination platform that connects verified donors with people in urgent need of blood. Join our community and help save lives.')}
            </p>
            
            {/* Emergency Banner */}
            <div className="emergency-banner">
              <div className="emergency-content">
                <h3>{t('landing.emergency.title', '🚨 Life-Threatening Emergency?')}</h3>
                <div className="emergency-contacts">
                  <div className="emergency-item">
                    <strong>{t('landing.emergency.helpline', '24/7 Helpline:')}</strong>
                    <span className="emergency-number">📞 1800-BLOOD-HELP</span>
                  </div>
                  <div className="emergency-item">
                    <strong>{t('landing.emergency.whatsapp', 'WhatsApp Support:')}</strong>
                    <span className="emergency-number">💬 +91-9999-BLOOD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="container">
        <div className="action-cards">
          <div className="action-card donor-card">
            <div className="card-icon">🫱</div>
            <h3>{t('landing.donor.title', 'Become a Blood Donor')}</h3>
            <p>{t('landing.donor.description', 'Join thousands of verified blood donors who are making a difference. Your donation can save up to 3 lives.')}</p>
            <ul className="card-features">
              <li>✅ {t('landing.donor.feature1', 'Free health checkup')}</li>
              <li>✅ {t('landing.donor.feature2', 'Digital certificates')}</li>
              <li>✅ {t('landing.donor.feature3', 'Emergency notifications')}</li>
              <li>✅ {t('landing.donor.feature4', 'Donation tracking')}</li>
            </ul>
            <button 
              onClick={() => handleUserTypeSelection('donor')}
              className="btn btn-primary btn-large"
            >
              {isAuthenticated && userType === 'DONOR' ? 
                t('landing.donor.dashboard', '📊 Go to Dashboard') : 
                t('landing.donor.button', '🫱 Become a Donor')
              }
            </button>
          </div>

          <div className="action-card needy-card">
            <div className="card-icon">🆘</div>
            <h3>{t('landing.needy.title', 'Request Blood')}</h3>
            <p>{t('landing.needy.description', 'Get connected with verified blood donors in your area within minutes. Our AI-powered matching system ensures fastest response.')}</p>
            <ul className="card-features">
              <li>✅ {t('landing.needy.feature1', 'Instant donor matching')}</li>
              <li>✅ {t('landing.needy.feature2', 'Real-time notifications')}</li>
              <li>✅ {t('landing.needy.feature3', 'Emergency support')}</li>
              <li>✅ {t('landing.needy.feature4', 'Free service')}</li>
            </ul>
            <button 
              onClick={() => handleUserTypeSelection('needy')}
              className="btn btn-primary btn-large"
            >
              {isAuthenticated && userType === 'NEEDY' ? 
                t('landing.needy.dashboard', '📊 Go to Dashboard') : 
                t('landing.needy.button', '🆘 Request Blood')
              }
            </button>
          </div>

          <div className="action-card admin-card">
            <div className="card-icon">⚙️</div>
            <h3>{t('landing.admin.title', 'Admin Access')}</h3>
            <p>{t('landing.admin.description', 'Manage and monitor the RakhtSaathi platform. Administrative access for healthcare professionals and authorized personnel.')}</p>
            <ul className="card-features">
              <li>✅ {t('landing.admin.feature1', 'User management')}</li>
              <li>✅ {t('landing.admin.feature2', 'Request monitoring')}</li>
              <li>✅ {t('landing.admin.feature3', 'Analytics dashboard')}</li>
              <li>✅ {t('landing.admin.feature4', 'System controls')}</li>
            </ul>
            <button 
              onClick={() => handleUserTypeSelection('admin')}
              className="btn btn-secondary btn-large"
            >
              {isAuthenticated && userType === 'ADMIN' ? 
                t('landing.admin.dashboard', '📊 Go to Dashboard') : 
                t('landing.admin.button', '⚙️ Admin Login')
              }
            </button>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="how-it-works">
          <h2>How BloodSaathi Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>📱 Quick Registration</h4>
              <p>Sign up with email verification and complete your profile with basic information.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>🎯 Smart Matching</h4>
              <p>Our AI-powered system matches blood requests with compatible donors based on location and blood group.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>⏱️ Real-time Updates</h4>
              <p>Get instant notifications and status updates without page refresh for faster coordination.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4>🏥 Verified Donations</h4>
              <p>Upload donation proof and get verified digital certificates for your contribution.</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2>Why Choose BloodSaathi?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h4>Instant Matching</h4>
              <p>AI-powered donor matching within minutes, not hours</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✅</div>
              <h4>Verified Users</h4>
              <p>All donors and requestors are verified with proper documentation</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📍</div>
              <h4>Location-Based</h4>
              <p>Find donors in your city and nearby areas for faster response</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔄</div>
              <h4>Real-time Updates</h4>
              <p>Live status updates and notifications without page refresh</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <h4>Safe & Secure</h4>
              <p>Privacy-protected with secure data handling and encryption</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h4>Completely Free</h4>
              <p>No charges for blood requests or donor connections</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Registered Donors</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Lives Saved</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Cities Covered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Emergency Support</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2>Ready to Save Lives?</h2>
          <p>Join thousands of people who are making a difference in their communities</p>
          <div className="cta-buttons">
            <button 
              onClick={() => handleUserTypeSelection('donor')}
              className="btn btn-primary btn-large"
            >
              🫱 Become a Donor
            </button>
            <button 
              onClick={() => handleUserTypeSelection('needy')}
              className="btn btn-primary btn-large"
            >
              🆘 Request Blood
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🩸 रक्तसाथी - RakhtSaathi</h4>
              <p>{t('landing.footer.description', 'Connecting blood donors with those in need across India')}</p>
            </div>
            <div className="footer-section">
              <h4>{t('landing.footer.quickLinks', 'Quick Links')}</h4>
              <ul>
                <li><a href="#" onClick={() => handleUserTypeSelection('donor')}>{t('landing.donor.button', 'Become Donor')}</a></li>
                <li><a href="#" onClick={() => handleUserTypeSelection('needy')}>{t('landing.needy.button', 'Request Blood')}</a></li>
                <li><a href="#" onClick={() => handleUserTypeSelection('admin')}>{t('landing.admin.button', 'Admin Login')}</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t('landing.emergency.title', 'Emergency')}</h4>
              <p>📞 1800-BLOOD-HELP</p>
              <p>💬 +91-9999-BLOOD</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 रक्तसाथी - RakhtSaathi. {t('landing.footer.rights', 'All rights reserved.')} | {t('landing.footer.tagline', 'Saving lives together')}</p>
          </div>
        </div>
      </div>

      <style>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .hero-section {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          padding: 20px 0 60px 0;
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.1;
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .hero-subtitle {
          font-size: 1.2rem;
          margin: 10px 0 0 0;
          opacity: 0.9;
        }

        .hero-main {
          text-align: center;
          max-width: 800px;
          margin: 40px auto 0;
          padding: 0 20px;
        }

        .hero-heading {
          font-size: 2.2rem;
          font-weight: bold;
          margin-bottom: 20px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .hero-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 30px;
          opacity: 0.95;
        }

        .emergency-banner {
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          padding: 20px;
          margin: 30px 0;
          backdrop-filter: blur(10px);
        }

        .emergency-content h3 {
          margin: 0 0 15px 0;
          font-size: 1.3rem;
        }

        .emergency-contacts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .emergency-item {
          text-align: center;
        }

        .emergency-number {
          display: block;
          font-size: 1.2rem;
          font-weight: bold;
          margin-top: 5px;
          color: #fff3cd;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin: -30px 0 60px 0;
          position: relative;
          z-index: 2;
        }

        .action-card {
          background: white;
          padding: 30px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 3px solid transparent;
        }

        .action-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .donor-card:hover {
          border-color: #dc3545;
        }

        .needy-card:hover {
          border-color: #dc3545;
        }

        .admin-card:hover {
          border-color: #6c757d;
        }

        .card-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .action-card h3 {
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: #333;
        }

        .action-card p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .card-features {
          list-style: none;
          padding: 0;
          margin: 20px 0;
          text-align: left;
        }

        .card-features li {
          padding: 5px 0;
          color: #555;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .btn-large {
          padding: 15px 30px;
          font-size: 18px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
          color: white;
        }

        .btn-secondary:hover {
          background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
          transform: translateY(-2px);
        }

        .how-it-works {
          margin: 80px 0;
          text-align: center;
        }

        .how-it-works h2 {
          font-size: 2.5rem;
          margin-bottom: 50px;
          color: #333;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .step-card {
          background: white;
          padding: 30px 20px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          position: relative;
        }

        .step-number {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .step-card h4 {
          margin: 20px 0 15px 0;
          color: #333;
        }

        .features-section {
          margin: 80px 0;
          text-align: center;
        }

        .features-section h2 {
          font-size: 2.5rem;
          margin-bottom: 50px;
          color: #333;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
        }

        .feature-item {
          background: white;
          padding: 30px 20px;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .feature-item h4 {
          margin-bottom: 10px;
          color: #333;
        }

        .stats-section {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          padding: 60px 20px;
          border-radius: 20px;
          margin: 80px 0;
          text-align: center;
        }

        .stats-section h2 {
          font-size: 2.5rem;
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: bold;
          display: block;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .cta-section {
          text-align: center;
          margin: 80px 0;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .cta-section h2 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          color: #333;
        }

        .cta-section p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 30px;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .footer {
          background: #333;
          color: white;
          padding: 40px 0 20px 0;
          margin-top: 80px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .footer-section h4 {
          margin-bottom: 15px;
          color: #dc3545;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
        }

        .footer-section ul li {
          padding: 5px 0;
        }

        .footer-section ul li a {
          color: #ccc;
          text-decoration: none;
          cursor: pointer;
        }

        .footer-section ul li a:hover {
          color: white;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #555;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-heading {
            font-size: 1.8rem;
          }

          .action-cards {
            grid-template-columns: 1fr;
            margin: -20px 0 40px 0;
          }

          .emergency-contacts {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn-large {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;