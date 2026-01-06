import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDonorByFirebaseUid, getBloodRequests } from '../../services/firebaseApi';
import { signOut } from '../../firebase/auth';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import AudioPlayer from '../../components/AudioPlayer';
import AudioNotification from '../../components/AudioNotification';
import notificationService from '../../services/notificationService';

const DonorDashboardPage = () => {
  const { user, userProfile } = useAuth();
  const [donorData, setDonorData] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [notifiedRequests, setNotifiedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAudioNotification, setShowAudioNotification] = useState(null);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(Date.now());

  const fetchDonorData = async () => {
    if (user) {
      try {
        setRefreshing(true);
        console.log('🔥 Fetching donor data for UID:', user.uid);
        
        // Get donor profile from Firebase
        const donor = await getDonorByFirebaseUid(user.uid);
        console.log('✅ Donor data fetched:', donor);
        
        if (donor) {
          setDonorData(donor);
          
          // Get all active blood requests for donor's city
          const allRequests = await getBloodRequests({
            city: donor.city,
            status: 'ACTIVE',
            limit: 20
          });
          console.log('✅ All blood requests fetched:', allRequests.length);
          
          // Filter requests where this donor was notified
          const notifiedReqs = allRequests.filter(request => 
            request.notifiedDonors && request.notifiedDonors[donor.id]
          );
          
          // Filter other compatible requests
          const compatibleReqs = allRequests.filter(request => {
            if (request.notifiedDonors && request.notifiedDonors[donor.id]) {
              return false; // Already in notified requests
            }
            
            // Check blood compatibility
            const compatibleGroups = getCompatibleBloodGroups(request.bloodGroup);
            return compatibleGroups.includes(donor.bloodGroup);
          });
          
          setNotifiedRequests(notifiedReqs || []);
          setBloodRequests(compatibleReqs || []);
          
        } else {
          console.log('❌ No donor profile found for UID:', user.uid);
          setError('Donor profile not found. Please complete registration.');
        }
        
      } catch (error) {
        console.error('❌ Error fetching donor data from Firebase:', error);
        setError(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } else {
      console.log('❌ No authenticated user found');
      setError('No authenticated user found');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, [user]);

  // Initialize audio notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      await notificationService.initialize();
      console.log('🔊 Audio notification service initialized');
    };
    
    initializeNotifications();
    
    return () => {
      notificationService.cleanup();
    };
  }, []);

  // Check for new notifications every 30 seconds
  useEffect(() => {
    if (!donorData) return;

    const checkForNewNotifications = async () => {
      try {
        const allRequests = await getBloodRequests({
          city: donorData.city,
          status: 'ACTIVE',
          limit: 10
        });

        // Find new immediate requests that this donor hasn't seen
        const newEmergencyRequests = allRequests.filter(request => {
          const isNewRequest = new Date(request.createdAt?.toDate?.() || request.createdAt) > new Date(lastNotificationCheck);
          const isEmergency = request.urgency === 'IMMEDIATE';
          const isDonorNotified = request.notifiedDonors && request.notifiedDonors[donorData.id];
          
          return isNewRequest && isEmergency && isDonorNotified;
        });

        if (newEmergencyRequests.length > 0) {
          console.log('🚨 New emergency requests found:', newEmergencyRequests.length);
          
          // Show audio notification for the first emergency request
          const emergencyRequest = newEmergencyRequests[0];
          setShowAudioNotification(emergencyRequest);
          
          // Send comprehensive notification
          await notificationService.sendBloodRequestNotification(emergencyRequest, donorData);
          
          // Update last check time
          setLastNotificationCheck(Date.now());
        }
      } catch (error) {
        console.error('❌ Error checking for new notifications:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkForNewNotifications();
    const interval = setInterval(checkForNewNotifications, 30000);

    return () => clearInterval(interval);
  }, [donorData, lastNotificationCheck]);

  // Blood compatibility logic
  const getCompatibleBloodGroups = (requestedGroup) => {
    const compatibility = {
      'O_NEGATIVE': ['O_NEGATIVE'], // Universal donor, but can only receive O-
      'O_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE'],
      'A_NEGATIVE': ['O_NEGATIVE', 'A_NEGATIVE'],
      'A_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE', 'A_NEGATIVE', 'A_POSITIVE'],
      'B_NEGATIVE': ['O_NEGATIVE', 'B_NEGATIVE'],
      'B_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE', 'B_NEGATIVE', 'B_POSITIVE'],
      'AB_NEGATIVE': ['O_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'AB_NEGATIVE'],
      'AB_POSITIVE': ['O_NEGATIVE', 'O_POSITIVE', 'A_NEGATIVE', 'A_POSITIVE', 'B_NEGATIVE', 'B_POSITIVE', 'AB_NEGATIVE', 'AB_POSITIVE'] // Universal recipient
    };
    
    return compatibility[requestedGroup] || [requestedGroup];
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = () => {
    fetchDonorData();
  };

  // Check if donor is eligible (90 days since last donation)
  const isEligible = () => {
    if (!donorData?.lastDonationDate) return true;
    try {
      let lastDonation;
      if (donorData.lastDonationDate.toDate) {
        lastDonation = donorData.lastDonationDate.toDate();
      } else {
        lastDonation = new Date(donorData.lastDonationDate);
      }
      const daysSinceLastDonation = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
      return daysSinceLastDonation >= 90;
    } catch (error) {
      return true; // Default to eligible if there's an error
    }
  };

  const getDaysUntilEligible = () => {
    if (!donorData?.lastDonationDate) return 0;
    try {
      let lastDonation;
      if (donorData.lastDonationDate.toDate) {
        lastDonation = donorData.lastDonationDate.toDate();
      } else {
        lastDonation = new Date(donorData.lastDonationDate);
      }
      const daysSinceLastDonation = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
      return Math.max(0, 90 - daysSinceLastDonation);
    } catch (error) {
      return 0;
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

  // Handle audio notification response
  const handleAudioNotificationResponse = async (response) => {
    if (!showAudioNotification) return;
    
    try {
      console.log('🔊 Audio notification response:', response);
      
      // Import the response function dynamically to avoid circular imports
      const { respondToBloodRequest } = await import('../../services/firebaseApi');
      
      if (response === 'ACCEPTED' || response === 'REJECTED') {
        await respondToBloodRequest(
          showAudioNotification.id,
          donorData.id,
          response,
          {
            fullName: donorData.fullName || donorData.name,
            bloodGroup: donorData.bloodGroup,
            city: donorData.city,
            phone: donorData.phone || donorData.contactNumber,
            isAvailable: donorData.isAvailable
          }
        );
        
        // Refresh data to show updated status
        await fetchDonorData();
        
        // Show success message
        if (response === 'ACCEPTED') {
          notificationService.speak('Thank you for accepting. Please contact the attendant immediately.');
        } else {
          notificationService.speak('Thank you for your response.');
        }
      }
    } catch (error) {
      console.error('❌ Error handling audio notification response:', error);
    } finally {
      setShowAudioNotification(null);
    }
  };

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading dashboard...</h2>
        <p>Please wait while we fetch your donor information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Error: {error}</h2>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!donorData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Donor Profile Not Found</h2>
        <p>Please complete your donor registration.</p>
        <Link to="/donor/register" className="btn btn-primary">Complete Registration</Link>
      </div>
    );
  }

  return (
    <div className="donor-dashboard">
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🩸 Donor Dashboard</h1>
            <p>Welcome back, {donorData?.fullName || donorData?.name}!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageSwitcher />
            <button 
              onClick={handleRefresh} 
              className="btn btn-secondary"
              disabled={refreshing}
              style={{ minWidth: '100px' }}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="container">
        {/* Status Overview */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h2>Your Donation Status</h2>
              {isEligible() ? (
                <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '18px' }}>
                  ✅ Eligible to Donate
                </div>
              ) : (
                <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '18px' }}>
                  ⏳ On Cooldown - {getDaysUntilEligible()} days remaining
                </div>
              )}
              <p style={{ marginTop: '10px', color: '#6b7280' }}>
                Blood Group: <strong>{donorData?.bloodGroup?.replace('_', '')}</strong> | 
                City: <strong>{donorData?.city}</strong> | 
                Available: <strong style={{ color: donorData?.isAvailable ? '#059669' : '#dc2626' }}>
                  {donorData?.isAvailable ? 'Yes' : 'No'}
                </strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Last updated</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef2f2' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem', margin: '0' }}>{donorData?.donationCount || 0}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Total Donations</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef3c7' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem', margin: '0' }}>
              {donorData?.rating ? donorData.rating.toFixed(1) : 'N/A'}⭐
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Rating</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#e0f2fe' }}>
            <h3 style={{ color: '#0369a1', fontSize: '2rem', margin: '0' }}>{notifiedRequests.length}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Requests for You</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ color: '#059669', fontSize: '2rem', margin: '0' }}>{bloodRequests.length}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Available Requests</p>
          </div>
        </div>

        {/* Requests Specifically for This Donor */}
        {notifiedRequests.length > 0 && (
          <div className="card" style={{ marginBottom: '30px', backgroundColor: '#fef2f2', border: '2px solid #dc2626' }}>
            <h2 style={{ color: '#dc2626' }}>🚨 Requests Sent to You ({notifiedRequests.length})</h2>
            <p style={{ color: '#dc2626', marginBottom: '20px' }}>
              These blood requests were specifically sent to you based on your blood group and location.
            </p>
            <div style={{ marginTop: '20px' }}>
              {notifiedRequests.map((request) => (
                <div key={request.id} className="card" style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#ffffff',
                  border: '2px solid #dc2626'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#dc2626' }}>
                        {getUrgencyIcon(request.urgency)} {request.patientName}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
                        <div><strong>Blood Group:</strong> {request.bloodGroup?.replace('_', '')}</div>
                        <div><strong>Units:</strong> {request.unitsNeeded || request.units}</div>
                        <div><strong>Hospital:</strong> {request.hospital}</div>
                        <div><strong>Urgency:</strong> 
                          <span style={{ color: getUrgencyColor(request.urgency), fontWeight: 'bold', marginLeft: '5px' }}>
                            {request.urgency}
                          </span>
                        </div>
                      </div>
                      
                      {/* Voice Message Player for Emergency Cases */}
                      {request.hasVoiceMessage && request.voiceMessageUrl && (
                        <AudioPlayer 
                          audioUrl={request.voiceMessageUrl}
                          isEmergency={request.urgency === 'IMMEDIATE'}
                          patientName={request.patientName}
                        />
                      )}
                      
                      {request.createdAt && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                          Created: {new Date(request.createdAt.toDate()).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link 
                        to={`/donor/request/${request.id}`} 
                        className="btn btn-primary"
                        style={{ textDecoration: 'none', minWidth: '120px', textAlign: 'center' }}
                      >
                        🩸 Respond Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Available Blood Requests */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>🔍 Other Compatible Requests ({bloodRequests.length})</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Additional blood requests in your area that match your blood group compatibility.
          </p>
          {bloodRequests.length > 0 ? (
            <div style={{ marginTop: '20px' }}>
              {bloodRequests.map((request) => (
                <div key={request.id} className="card" style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>
                        {getUrgencyIcon(request.urgency)} {request.patientName}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
                        <div><strong>Blood Group:</strong> {request.bloodGroup?.replace('_', '')}</div>
                        <div><strong>Units:</strong> {request.unitsNeeded || request.units}</div>
                        <div><strong>Hospital:</strong> {request.hospital}</div>
                        <div><strong>Urgency:</strong> 
                          <span style={{ color: getUrgencyColor(request.urgency), fontWeight: 'bold', marginLeft: '5px' }}>
                            {request.urgency}
                          </span>
                        </div>
                      </div>
                      
                      {/* Voice Message Player for Emergency Cases */}
                      {request.hasVoiceMessage && request.voiceMessageUrl && (
                        <AudioPlayer 
                          audioUrl={request.voiceMessageUrl}
                          isEmergency={request.urgency === 'IMMEDIATE'}
                          patientName={request.patientName}
                        />
                      )}
                      
                      {request.createdAt && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                          Created: {new Date(request.createdAt.toDate()).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div>
                      <Link 
                        to={`/donor/request/${request.id}`} 
                        className="btn btn-secondary"
                        style={{ textDecoration: 'none', minWidth: '120px', textAlign: 'center' }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>No additional compatible blood requests available at the moment.</p>
              <p style={{ fontSize: '14px' }}>Check back later or contact our helpline for urgent requests.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <Link to="/donor/profile" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>
              👤 View Profile
            </Link>
            <Link to="/donor/history" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>
              📋 Donation History
            </Link>
            <Link to="/donor/health-checklist" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center', padding: '15px' }}>
              🏥 Health Checklist
            </Link>
            <button 
              onClick={handleRefresh}
              className="btn btn-secondary"
              style={{ padding: '15px' }}
              disabled={refreshing}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <h3 style={{ color: '#dc2626' }}>🚨 Emergency Contact</h3>
          <p>For urgent blood requests or technical support:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            <div>
              <strong>Helpline:</strong> 
              <a href="tel:+919876543210" style={{ color: '#dc2626', textDecoration: 'none', marginLeft: '5px' }}>
                📞 +91-9876543210
              </a>
            </div>
            <div>
              <strong>WhatsApp:</strong> 
              <a href="https://wa.me/919876543210" style={{ color: '#dc2626', textDecoration: 'none', marginLeft: '5px' }}>
                💬 +91-9876543210
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Audio Notification Overlay */}
      {showAudioNotification && (
        <AudioNotification
          request={showAudioNotification}
          onClose={handleAudioNotificationResponse}
        />
      )}
    </div>
  );
};

export default DonorDashboardPage;