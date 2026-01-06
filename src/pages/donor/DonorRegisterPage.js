import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DonorRegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: '',
    city: '',
    district: '',
    bloodGroup: '',
    age: '',
    weight: '',
    lastDonationDate: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();

  const bloodGroups = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
  const bloodGroupLabels = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-'
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (parseInt(formData.age) < 18) {
      setError('Age must be at least 18 years');
      return false;
    }
    if (parseInt(formData.weight) < 50) {
      setError('Weight must be at least 50 kg');
      return false;
    }
    if (formData.aadhaarNumber.length !== 12) {
      setError('Aadhaar number must be 12 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is authenticated
      if (!user) {
        setError('Please login first to register as donor');
        setLoading(false);
        return;
      }

      console.log('🔥 Registering donor with Firebase UID:', user.uid);
      
      // Save ONLY to Firebase Firestore (NO BACKEND)
      const { createDonor, createUser } = await import('../../services/firebaseApi');
      
      // Create user profile in Firestore
      await createUser(user.uid, {
        email: user.email,
        userType: 'DONOR',
        fullName: formData.fullName,
        isActive: true
      });
      
      // Create donor profile in Firestore
      const firestoreDonorData = {
        firebaseUid: user.uid,
        email: user.email,
        fullName: formData.fullName,
        aadhaarNumber: formData.aadhaarNumber,
        city: formData.city,
        district: formData.district,
        bloodGroup: formData.bloodGroup,
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        gender: formData.gender,
        lastDonationDate: formData.lastDonationDate || null,
        isAvailable: true,
        isVerified: false,
        donationCount: 0,
        rating: 0,
        totalFeedbackCount: 0
      };
      
      const firestoreId = await createDonor(firestoreDonorData);
      console.log('✅ Donor saved to Firebase Firestore with ID:', firestoreId);
      
      // Update user profile in context (NO BACKEND CALL)
      updateUserProfile({
        id: firestoreId,
        ...firestoreDonorData
      }, 'DONOR');
      
      // Navigate to dashboard
      navigate('/donor/dashboard');
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donor-register">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🩸 {t('donor.register_title')}</h1>
            <p>{t('donor.register_subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>{t('form.personal_info')}</h2>
            
            <div className="form-group">
              <label htmlFor="fullName">{t('donor.full_name')} *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="aadhaarNumber">{t('donor.aadhaar')} *</label>
              <input
                type="text"
                id="aadhaarNumber"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="12-digit Aadhaar number"
                maxLength="12"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

              <div className="form-group">
                <label htmlFor="age">{t('donor.age')} *</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="65"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="weight">{t('donor.weight')} (kg) *</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="50"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bloodGroup">{t('donor.blood_group')} *</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{bloodGroupLabels[group]}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>{t('form.location_info')}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="city">{t('donor.city')} *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="district">{t('donor.district')} *</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>{t('form.medical_info')}</h3>
            
            <div className="form-group">
              <label htmlFor="lastDonationDate">{t('donor.last_donation')} (if any)</label>
              <input
                type="date"
                id="lastDonationDate"
                name="lastDonationDate"
                value={formData.lastDonationDate}
                onChange={handleChange}
              />
              <small>Leave empty if you've never donated before</small>
            </div>

            <div className="card" style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', marginTop: '20px' }}>
              <h4>⚠️ Important Notes:</h4>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li>You must wait 90 days between blood donations</li>
                <li>Ensure you meet all health requirements before donating</li>
                <li>Your information will be verified before activation</li>
              </ul>
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
      </div>
    </div>
  );
};

export default DonorRegisterPage;