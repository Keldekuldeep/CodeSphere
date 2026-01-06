import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDonorByFirebaseUid } from '../../services/firebaseApi';
import { signOut } from '../../firebase/auth';

const DonorProfilePage = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const donor = await getDonorByFirebaseUid(user.uid);
          setUserProfile(donor);
        } catch (error) {
          console.error('Error fetching donor profile from Firebase:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleEdit = () => {
    setEditData({ ...userProfile });
    setIsEditing(true);
  };

  const handleSave = async () => {
    // TODO: Update profile in Firebase
    console.log('🔥 Saving profile to Firebase:', editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const calculateNextEligibleDate = () => {
    if (!userProfile?.lastDonationDate) return 'Eligible now';
    
    const lastDonation = new Date(userProfile.lastDonationDate);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + 90);
    
    const today = new Date();
    if (nextEligible <= today) return 'Eligible now';
    
    return nextEligible.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading profile from Firebase...</div>;
  }

  if (!userProfile) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Profile Not Found</h2>
        <p>Please complete your donor registration.</p>
        <Link to="/donor/register" className="btn btn-primary">Complete Registration</Link>
      </div>
    );
  }

  return (
    <div className="donor-profile">
      <div className="header">
        <h1>👤 Donor Profile</h1>
        <p>Manage your donor information - Firebase Only</p>
      </div>
      
      <div className="container">
        {/* Profile Header */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>{userProfile.fullName}</h2>
              <p style={{ color: '#6b7280' }}>Firebase UID: {userProfile.firebaseUid}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isEditing ? (
                <button onClick={handleEdit} className="btn btn-secondary">
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={handleSave} className="btn btn-primary">
                    💾 Save to Firebase
                  </button>
                  <button onClick={handleCancel} className="btn btn-secondary">
                    ❌ Cancel
                  </button>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-secondary">
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Profile Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
              <h3 style={{ color: '#dc2626', fontSize: '1.5rem' }}>{userProfile.bloodGroup?.replace('_', '')}</h3>
              <p>Blood Group</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <h3 style={{ color: '#059669', fontSize: '1.5rem' }}>{userProfile.donationCount || 0}</h3>
              <p>Total Donations</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <h3 style={{ color: '#f59e0b', fontSize: '1.5rem' }}>
                {userProfile.rating ? userProfile.rating.toFixed(1) : 'N/A'}
              </h3>
              <p>Rating</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
              <h3 style={{ color: '#0369a1', fontSize: '1.5rem' }}>
                {userProfile.totalFeedbackCount || 0}
              </h3>
              <p>Feedback Count</p>
            </div>
          </div>
        </div>

        {/* Firebase Status */}
        <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h3 style={{ color: '#059669' }}>🔥 Firebase Profile Status</h3>
          <div style={{ marginTop: '15px' }}>
            <p><strong>✅ Data Source:</strong> Firebase Firestore</p>
            <p><strong>✅ Authentication:</strong> Firebase Auth</p>
            <p><strong>❌ Backend:</strong> Not Required</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="card">
          <h3>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label><strong>Full Name:</strong></label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.fullName || ''}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  style={{ width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              ) : (
                <p>{userProfile.fullName}</p>
              )}
            </div>
            
            <div>
              <label><strong>Email:</strong></label>
              <p>{userProfile.email}</p>
              <small style={{ color: '#6b7280' }}>Email cannot be changed</small>
            </div>
            
            <div>
              <label><strong>Aadhaar:</strong></label>
              <p>****-****-{userProfile.aadhaarNumber?.slice(-4)}</p>
              <small style={{ color: '#6b7280' }}>Aadhaar is masked for security</small>
            </div>
            
            <div>
              <label><strong>Gender:</strong></label>
              {isEditing ? (
                <select
                  value={editData.gender || ''}
                  onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                  style={{ width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p>{userProfile.gender}</p>
              )}
            </div>
            
            <div>
              <label><strong>Age:</strong></label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.age || ''}
                  onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                  style={{ width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              ) : (
                <p>{userProfile.age} years</p>
              )}
            </div>
            
            <div>
              <label><strong>Weight:</strong></label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.weight || ''}
                  onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                  style={{ width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              ) : (
                <p>{userProfile.weight} kg</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="card">
          <h3>Location Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label><strong>City:</strong></label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.city || ''}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                  style={{ width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              ) : (
                <p>{userProfile.city}</p>
              )}
            </div>
            
            <div>
              <label><strong>District:</strong></label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.district || ''}
                  onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                  style={{ width: '100%', marginTop: '5px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              ) : (
                <p>{userProfile.district}</p>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card">
          <h3>Medical Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <label><strong>Blood Group:</strong></label>
              <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {userProfile.bloodGroup?.replace('_', '')}
              </p>
              <small style={{ color: '#6b7280' }}>Blood group cannot be changed</small>
            </div>
            
            <div>
              <label><strong>Last Donation:</strong></label>
              <p>{userProfile.lastDonationDate ? new Date(userProfile.lastDonationDate).toLocaleDateString() : 'Never'}</p>
            </div>
            
            <div>
              <label><strong>Next Eligible Date:</strong></label>
              <p style={{ 
                color: calculateNextEligibleDate() === 'Eligible now' ? '#059669' : '#f59e0b',
                fontWeight: 'bold'
              }}>
                {calculateNextEligibleDate()}
              </p>
            </div>
            
            <div>
              <label><strong>Account Status:</strong></label>
              <p style={{ 
                color: userProfile.isAvailable ? '#059669' : '#dc2626',
                fontWeight: 'bold'
              }}>
                {userProfile.isAvailable ? '✅ Available' : '❌ Unavailable'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <Link to="/donor/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              🏠 Dashboard
            </Link>
            <Link to="/donor/history" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              📋 Donation History
            </Link>
            <Link to="/donor/health-checklist" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              🏥 Health Checklist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfilePage;