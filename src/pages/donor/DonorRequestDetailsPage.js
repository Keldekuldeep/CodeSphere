import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBloodRequest, respondToBloodRequest, getDonorByFirebaseUid } from '../../services/firebaseApi';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DonorRequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [donorData, setDonorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [eligibilityCheck, setEligibilityCheck] = useState(null);
  const [error, setError] = useState('');

  const checkEligibility = useCallback((requestData, donor) => {
    const issues = [];
    
    // Check cooldown (90 days since last donation)
    if (donor.lastDonationDate) {
      try {
        let lastDonation;
        if (donor.lastDonationDate.toDate) {
          lastDonation = donor.lastDonationDate.toDate();
        } else {
          lastDonation = new Date(donor.lastDonationDate);
        }
        
        const today = new Date();
        const daysSince = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
        
        if (daysSince < 90) {
          issues.push(`Cooldown period: ${90 - daysSince} days remaining`);
        }
      } catch (error) {
        console.log('Error checking last donation date:', error);
      }
    }

    // Check blood group compatibility
    const compatible = checkBloodCompatibility(donor.bloodGroup, requestData.bloodGroup);
    if (!compatible) {
      issues.push(`Blood group ${donor.bloodGroup?.replace('_', '')} is not compatible with ${requestData.bloodGroup?.replace('_', '')}`);
    }

    // Check if already responded
    const donorStatus = requestData.notifiedDonors?.[donor.id]?.status;
    if (donorStatus && donorStatus !== 'NOTIFIED') {
      issues.push(`You have already ${donorStatus.toLowerCase()} this request`);
    }

    setEligibilityCheck({
      isEligible: issues.length === 0,
      issues,
      donorStatus
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) {
        setError('Missing request ID or user authentication');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔥 Fetching request details and donor data...');
        
        // Fetch request details
        const requestData = await getBloodRequest(id);
        if (!requestData) {
          setError('Blood request not found');
          setLoading(false);
          return;
        }
        
        // Fetch donor profile
        const donor = await getDonorByFirebaseUid(user.uid);
        if (!donor) {
          setError('Donor profile not found');
          setLoading(false);
          return;
        }
        
        setRequest(requestData);
        setDonorData(donor);
        
        // Check eligibility
        checkEligibility(requestData, donor);
        
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setError('Failed to load request details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, checkEligibility]);

  const checkBloodCompatibility = (donorGroup, requestedGroup) => {
    // Convert to standard format
    const normalize = (group) => group?.replace('_', '');
    const donor = normalize(donorGroup);
    const requested = normalize(requestedGroup);
    
    const compatibility = {
      'ONEGATIVE': ['ONEGATIVE', 'OPOSITIVE', 'ANEGATIVE', 'APOSITIVE', 'BNEGATIVE', 'BPOSITIVE', 'ABNEGATIVE', 'ABPOSITIVE'],
      'OPOSITIVE': ['OPOSITIVE', 'APOSITIVE', 'BPOSITIVE', 'ABPOSITIVE'],
      'ANEGATIVE': ['ANEGATIVE', 'APOSITIVE', 'ABNEGATIVE', 'ABPOSITIVE'],
      'APOSITIVE': ['APOSITIVE', 'ABPOSITIVE'],
      'BNEGATIVE': ['BNEGATIVE', 'BPOSITIVE', 'ABNEGATIVE', 'ABPOSITIVE'],
      'BPOSITIVE': ['BPOSITIVE', 'ABPOSITIVE'],
      'ABNEGATIVE': ['ABNEGATIVE', 'ABPOSITIVE'],
      'ABPOSITIVE': ['ABPOSITIVE']
    };
    
    return compatibility[donor]?.includes(requested) || false;
  };

  const handleAccept = async () => {
    if (!eligibilityCheck?.isEligible) {
      alert('You are not eligible to donate for this request. Please check the eligibility issues.');
      return;
    }

    setActionLoading(true);
    try {
      console.log('🩸 Accepting blood request...');
      
      // Helper function to safely get values
      const safeValue = (value, fallback = null) => {
        if (value === undefined || value === null || value === '') {
          return fallback;
        }
        return value;
      };
      
      // Prepare donor info for the response (only include non-null values)
      const donorInfo = {};
      
      const fullName = safeValue(donorData.fullName || donorData.name);
      if (fullName) donorInfo.fullName = fullName;
      
      const bloodGroup = safeValue(donorData.bloodGroup);
      if (bloodGroup) donorInfo.bloodGroup = bloodGroup;
      
      const city = safeValue(donorData.city);
      if (city) donorInfo.city = city;
      
      const phone = safeValue(donorData.phone || donorData.contactNumber);
      if (phone) donorInfo.phone = phone;
      
      const rating = safeValue(donorData.rating, 0);
      donorInfo.rating = rating;
      
      const donationCount = safeValue(donorData.donationCount, 0);
      donorInfo.donationCount = donationCount;
      
      console.log('📋 Prepared donor info:', donorInfo);
      
      await respondToBloodRequest(id, donorData.id, 'ACCEPTED', donorInfo);
      
      console.log('✅ Request accepted successfully');
      
      // Navigate to health checklist
      navigate('/donor/health-checklist', { 
        state: { 
          requestId: id, 
          accepted: true,
          returnTo: `/donor/request/${id}`
        }
      });
      
    } catch (error) {
      console.error('❌ Error accepting request:', error);
      alert('Failed to accept request: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this blood request?')) {
      return;
    }

    setActionLoading(true);
    try {
      console.log('❌ Rejecting blood request...');
      
      await respondToBloodRequest(id, donorData.id, 'REJECTED');
      
      console.log('✅ Request rejected successfully');
      alert('Request rejected successfully');
      navigate('/donor/dashboard');
      
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
      alert('Failed to reject request: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'IMMEDIATE': return '#dc2626';
      case 'WITHIN_24H': return '#f59e0b';
      case 'SCHEDULED': return '#059669';
      default: return '#6b7280';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'IMMEDIATE': return '🔴';
      case 'WITHIN_24H': return '🟡';
      case 'SCHEDULED': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading request details...</h2>
        <p>Please wait...</p>
      </div>
    );
  }

  if (error || !request || !donorData) {
    return (
      <div className="container" style={{ padding: '50px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Error Loading Request</h2>
          <p style={{ color: '#dc2626' }}>{error || 'Request not found'}</p>
          <button onClick={() => navigate('/donor/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const donorStatus = eligibilityCheck?.donorStatus;
  const isNotified = request.notifiedDonors?.[donorData.id];

  return (
    <div className="donor-request-details">
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🩸 Blood Request Details</h1>
            <p>Request #{request.id.slice(-6)} - {request.patientName}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        {/* Request Information */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2>Request Information</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                backgroundColor: request.urgency === 'IMMEDIATE' ? '#fef2f2' : request.urgency === 'WITHIN_24H' ? '#fef3c7' : '#f0fdf4',
                color: getUrgencyColor(request.urgency),
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {getUrgencyIcon(request.urgency)} {request.urgency}
              </div>
              {isNotified && (
                <div style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  📧 Notified to You
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h4>Blood Requirements</h4>
              <p><strong>Patient:</strong> {request.patientName}</p>
              <p><strong>Blood Group:</strong> {request.bloodGroup?.replace('_', '')}</p>
              <p><strong>Units Required:</strong> {request.unitsNeeded || request.units}</p>
              <p><strong>Urgency:</strong> {request.urgency}</p>
            </div>

            <div>
              <h4>Hospital Information</h4>
              <p><strong>Hospital:</strong> {request.hospital}</p>
              <p><strong>City:</strong> {request.city}</p>
              <p><strong>Address:</strong> {request.address || 'Contact hospital for address'}</p>
            </div>

            <div>
              <h4>Contact Information</h4>
              <p><strong>Attendant:</strong> {request.attendantName}</p>
              <p><strong>Phone:</strong> 
                {donorStatus === 'ACCEPTED' ? (
                  <a href={`tel:${request.contactNumber || request.attendantPhone}`} style={{ marginLeft: '5px', color: '#dc2626', textDecoration: 'none' }}>
                    📞 {request.contactNumber || request.attendantPhone}
                  </a>
                ) : (
                  <span style={{ marginLeft: '5px', color: '#6b7280' }}>
                    (Available after acceptance)
                  </span>
                )}
              </p>
            </div>
          </div>

          {request.additionalNotes && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h4>Additional Notes</h4>
              <p>{request.additionalNotes}</p>
            </div>
          )}

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h4>Request Status</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '10px' }}>
              <div><strong>Donors Notified:</strong> {request.notifiedDonorsCount || 0}</div>
              <div><strong>Accepted:</strong> {request.acceptedDonorsCount || 0}</div>
              <div><strong>Rejected:</strong> {request.rejectedDonorsCount || 0}</div>
              <div><strong>Created:</strong> {new Date(request.createdAt?.toDate()).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Eligibility Check */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>Your Eligibility Status</h3>
          {eligibilityCheck?.isEligible ? (
            <div style={{ color: '#059669', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <strong>✅ You are eligible to donate for this request!</strong>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                Your blood group {donorData.bloodGroup?.replace('_', '')} is compatible with {request.bloodGroup?.replace('_', '')}
              </p>
            </div>
          ) : (
            <div style={{ color: '#dc2626', padding: '15px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <strong>❌ Eligibility Issues:</strong>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                {eligibilityCheck?.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        {!donorStatus || donorStatus === 'NOTIFIED' ? (
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3>Your Response</h3>
            <p style={{ marginBottom: '20px', color: '#6b7280' }}>
              Please respond to this blood request. Your response will be immediately visible to the requester.
            </p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleAccept}
                className="btn btn-primary"
                disabled={actionLoading || !eligibilityCheck?.isEligible}
                style={{ flex: 1, minWidth: '200px', padding: '15px' }}
              >
                {actionLoading ? 'Processing...' : '✅ Accept & Donate'}
              </button>
              <button 
                onClick={handleReject}
                className="btn btn-secondary"
                disabled={actionLoading}
                style={{ flex: 1, minWidth: '200px', padding: '15px' }}
              >
                {actionLoading ? 'Processing...' : '❌ Cannot Donate'}
              </button>
            </div>
            
            {!eligibilityCheck?.isEligible && (
              <p style={{ marginTop: '15px', fontSize: '14px', color: '#dc2626' }}>
                ⚠️ Please resolve eligibility issues before accepting this request.
              </p>
            )}
          </div>
        ) : (
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3>Your Response</h3>
            <div style={{ 
              padding: '20px', 
              borderRadius: '8px',
              backgroundColor: donorStatus === 'ACCEPTED' ? '#f0fdf4' : '#fef2f2',
              border: donorStatus === 'ACCEPTED' ? '1px solid #bbf7d0' : '1px solid #fecaca',
              color: donorStatus === 'ACCEPTED' ? '#059669' : '#dc2626'
            }}>
              <strong style={{ fontSize: '18px' }}>
                {donorStatus === 'ACCEPTED' ? '✅ You have accepted this request' : '❌ You have rejected this request'}
              </strong>
              {donorStatus === 'ACCEPTED' && (
                <div style={{ marginTop: '15px' }}>
                  <p><strong>Next steps:</strong></p>
                  <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    <li>Contact the attendant using the phone number above</li>
                    <li>Coordinate the donation time with the hospital</li>
                    <li>Visit the hospital for blood donation</li>
                    <li>Upload donation proof after completion</li>
                  </ol>
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '4px' }}>
                    <strong>Contact:</strong> {request.attendantName} - 
                    <a href={`tel:${request.contactNumber || request.attendantPhone}`} style={{ color: '#059669', textDecoration: 'none', marginLeft: '5px' }}>
                      📞 {request.contactNumber || request.attendantPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => navigate('/donor/dashboard')} 
            className="btn btn-secondary"
            style={{ minWidth: '200px', padding: '12px' }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonorRequestDetailsPage;