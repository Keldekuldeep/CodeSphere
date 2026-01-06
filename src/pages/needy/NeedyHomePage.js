import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyHomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, userType, userProfile } = useAuth();

  // Redirect existing needy users to dashboard
  useEffect(() => {
    if (isAuthenticated && userType === 'NEEDY' && userProfile) {
      console.log('✅ Existing needy user detected, redirecting to dashboard');
      navigate('/needy/dashboard');
    }
  }, [isAuthenticated, userType, userProfile, navigate]);

  return (
    <div className="needy-home">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 रक्तसाथी - {t('needy.title')}</h1>
            <p>{t('needy.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        <div className="hero-section">
          <div className="card">
            <h2>{t('needy.welcome')}</h2>
            <p>
              {t('needy.welcome_desc')}
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/needy/login" className="btn btn-primary" style={{ textDecoration: 'none', marginRight: '10px' }}>
                {t('needy.create_request')} अभी
              </Link>
              <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                {t('nav.home')}
              </Link>
            </div>
          </div>
        </div>

        <div className="emergency-section" style={{ marginTop: '30px' }}>
          <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
            <h2 style={{ color: '#dc2626' }}>🚨 {t('emergency.title')} {t('emergency.call_now')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' }}>
              <div>
                <h4>24/7 {t('needy.emergency_helpline')}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                  📞 {t('emergency.helpline')}
                </p>
              </div>
              <div>
                <h4>{t('needy.whatsapp_support')}</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                  💬 {t('emergency.whatsapp')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="process-section" style={{ marginTop: '30px' }}>
          <div className="card">
            <h2>रक्त कैसे मांगें / How to Request Blood</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>1️⃣</div>
                <h4>{t('nav.register')} / Register</h4>
                <p>Quick phone verification and basic details</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>2️⃣</div>
                <h4>{t('needy.create_request')}</h4>
                <p>Specify blood group, units, and hospital details</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>3️⃣</div>
                <h4>Get Matched / मैच पाएं</h4>
                <p>Our AI finds and notifies compatible donors</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>4️⃣</div>
                <h4>Connect / जुड़ें</h4>
                <p>Get donor contact details and coordinate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section" style={{ marginTop: '30px' }}>
          <div className="card">
            <h2>रक्तसाथी क्यों चुनें? / Why Choose BloodSaathi?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <h4>⚡ तत्काल मैचिंग / Instant Matching</h4>
                <p>AI-powered donor matching within minutes, not hours</p>
              </div>
              <div>
                <h4>✅ सत्यापित दाता / Verified Donors</h4>
                <p>All donors are phone-verified with health screening</p>
              </div>
              <div>
                <h4>📍 स्थान-आधारित / Location-Based</h4>
                <p>Find donors in your city and nearby areas</p>
              </div>
              <div>
                <h4>🔄 रियल-टाइम अपडेट / Real-time Updates</h4>
                <p>Live status updates without page refresh</p>
              </div>
              <div>
                <h4>🛡️ सुरक्षित / Safe & Secure</h4>
                <p>Privacy-protected with secure data handling</p>
              </div>
              <div>
                <h4>💰 पूर्णतः निःशुल्क / Completely Free</h4>
                <p>No charges for blood requests or donor connections</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-section" style={{ marginTop: '30px', textAlign: 'center' }}>
          <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
            <h2 style={{ color: '#dc2626' }}>आपातकाल में हर सेकंड मायने रखता है / Every Second Counts in Emergencies</h2>
            <p style={{ fontSize: '1.1rem', marginTop: '15px' }}>
              Don't wait. Start your blood request now and get connected with donors in your area.
            </p>
            <Link to="/needy/login" className="btn btn-primary" style={{ 
              textDecoration: 'none', 
              marginTop: '20px',
              fontSize: '1.2rem',
              padding: '15px 30px'
            }}>
              🆘 {t('needy.create_request')} अभी / Request Blood Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedyHomePage;