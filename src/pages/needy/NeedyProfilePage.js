import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile, user, updateUserProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || userProfile?.name || '',
    email: userProfile?.email || user?.email || '',
    phone: userProfile?.phone || userProfile?.contactNumber || '',
    address: userProfile?.address || '',
    city: userProfile?.city || '',
    state: userProfile?.state || '',
    pincode: userProfile?.pincode || '',
    emergencyContactName: userProfile?.emergencyContactName || '',
    emergencyContactPhone: userProfile?.emergencyContactPhone || '',
    emergencyContactRelation: userProfile?.emergencyContactRelation || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    try {
      console.log('📝 Updating needy profile...');
      
      // Update in Firebase
      await updateDoc(doc(db, 'needy', userProfile.id), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      
      // Update local context
      const updatedProfile = { ...userProfile, ...formData };
      updateUserProfile(updatedProfile, 'NEEDY');
      
      setSuccess('✅ Profile updated successfully!');
      console.log('✅ Profile updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-profile">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>👤 My Profile</h1>
            <p>Update your personal information</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LanguageSwitcher />
            <button onClick={() => navigate('/needy/dashboard')} className="btn btn-secondary">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h3>Personal Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
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
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#666' }}>Email cannot be changed</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <h3 style={{ marginTop: '30px' }}>Address Information</h3>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter your complete address"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="city">City *</label>
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
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                />
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Emergency Contact</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="emergencyContactName">Contact Name</label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactPhone">Contact Phone</label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContactRelation">Relation</label>
                <select
                  id="emergencyContactRelation"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARENT">Parent</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="CHILD">Child</option>
                  <option value="FRIEND">Friend</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {error && <div className="error" style={{ marginTop: '20px' }}>{error}</div>}
            {success && <div className="success" style={{ marginTop: '20px', color: '#28a745' }}>{success}</div>}

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? 'Updating...' : '✅ Update Profile'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/needy/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .needy-profile {
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
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
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
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        
        .error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #f5c6cb;
        }
        
        .success {
          background-color: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #c3e6cb;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 20px 10px;
          }
          
          .card {
            padding: 20px;
          }
          
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NeedyProfilePage;