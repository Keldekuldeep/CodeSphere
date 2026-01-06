import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyRegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    age: '',
    gender: '',
    relationToPatient: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

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
      // Check if user is authenticated
      if (!user) {
        setError('Please login first to register');
        setLoading(false);
        return;
      }

      console.log('🔥 Registering needy with Firebase UID:', user.uid);
      
      // Save ONLY to Firebase Firestore (NO BACKEND)
      const { createUser, createNeedy } = await import('../../services/firebaseApi');
      
      // Create user profile in Firestore
      await createUser(user.uid, {
        email: user.email,
        userType: 'NEEDY',
        fullName: formData.name,
        isActive: true
      });
      
      // Create needy profile in Firestore
      const firestoreNeedyData = {
        firebaseUid: user.uid,
        email: user.email,
        name: formData.name,
        city: formData.city,
        age: parseInt(formData.age),
        gender: formData.gender,
        relationToPatient: formData.relationToPatient,
        isActive: true,
        requestCount: 0
      };
      
      const firestoreId = await createNeedy(firestoreNeedyData);
      console.log('✅ Needy saved to Firebase Firestore with ID:', firestoreId);
      
      // Update user profile in context (NO BACKEND CALL)
      updateUserProfile({
        id: firestoreId,
        ...firestoreNeedyData
      }, 'NEEDY');
      
      // Navigate to create request page
      navigate('/needy/request/create');
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-register">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 {t('needy.register_title')}</h1>
            <p>{t('needy.register_subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>{t('form.personal_info')}</h2>
            
            <div className="form-group">
              <label htmlFor="name">{t('donor.full_name')} *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="age">{t('donor.age')} *</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">{t('donor.gender')} *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male / पुरुष</option>
                  <option value="Female">Female / महिला</option>
                  <option value="Other">Other / अन्य</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="city">{t('donor.city')} *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="relationToPatient">Relation to Patient / मरीज़ से रिश्ता *</label>
              <select
                id="relationToPatient"
                name="relationToPatient"
                value={formData.relationToPatient}
                onChange={handleChange}
                required
              >
                <option value="">Select Relation</option>
                <option value="Self">Self / स्वयं</option>
                <option value="Father">Father / पिता</option>
                <option value="Mother">Mother / माता</option>
                <option value="Spouse">Spouse / पति/पत्नी</option>
                <option value="Son">Son / पुत्र</option>
                <option value="Daughter">Daughter / पुत्री</option>
                <option value="Brother">Brother / भाई</option>
                <option value="Sister">Sister / बहन</option>
                <option value="Friend">Friend / मित्र</option>
                <option value="Relative">Relative / रिश्तेदार</option>
                <option value="Other">Other / अन्य</option>
              </select>
            </div>

            <div className="card" style={{ backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9', marginTop: '20px' }}>
              <h4>📱 {t('donor.phone_number')}</h4>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0369a1' }}>
                {process.env.REACT_APP_ENV === 'development' ? '+91-9876543210 (Demo)' : user?.phoneNumber}
              </p>
              <small>This will be used for donor communication</small>
            </div>

            {error && <div className="error">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '20px' }}
            >
              {loading ? t('status.registering') : t('common.submit')}
            </button>
          </form>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3>What Happens Next? / आगे क्या होगा?</h3>
          <div style={{ marginTop: '15px' }}>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>{t('needy.create_request')}:</strong> Specify blood group, units, and hospital details</li>
              <li><strong>AI Matching:</strong> Our system finds compatible donors in your area</li>
              <li><strong>Real-time Updates:</strong> Track donor responses live on your dashboard</li>
              <li><strong>Direct Contact:</strong> Get donor phone numbers once they accept</li>
              <li><strong>Coordinate:</strong> Work directly with donors to arrange donation</li>
            </ol>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', marginTop: '20px' }}>
          <h4 style={{ color: '#dc2626' }}>🚨 {t('emergency.title')} Situations</h4>
          <p style={{ color: '#dc2626' }}>
            If this is a life-threatening emergency, please call our 24/7 helpline 
            immediately while also creating your request online.
          </p>
          <div style={{ marginTop: '10px' }}>
            <strong>{t('needy.emergency_helpline')}: {t('emergency.helpline')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedyRegisterPage;