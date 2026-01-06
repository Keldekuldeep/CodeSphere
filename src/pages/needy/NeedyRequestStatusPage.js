import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBloodRequest, triggerNotificationManually } from '../../services/firebaseApi';

const NeedyRequestStatusPage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [triggeringNotification, setTriggeringNotification] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState('');

  useEffect(() => {
    const fetchRequest = async () => {
      if (id) {
        try {
          setLoading(true);
          console.log('🔄 Fetching request:', id);
          
          const requestData = await getBloodRequest(id);
          console.log('✅ Request data:', requestData);
          
          if (requestData) {
            setRequest(requestData);
            setError('');
          } else {
            setError('Request not found');
            setRequest(null);
          }
        } catch (error) {
          console.error('❌ Error fetching blood request:', error);
          setError('Failed to load request data: ' + error.message);
          setRequest(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRequest();
    
    // Reduced auto-refresh to avoid continuous loading issues
    const interval = setInterval(fetchRequest, 60000); // 1 minute instead of 30 seconds
    
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading request status...</h2>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container">
        <div className="card">
          <h2>Request Not Found</h2>
          <p>{error || 'The requested blood request could not be found.'}</p>
          <Link to="/needy/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Calculate response statistics
  const notifiedDonors = request.notifiedDonors || {};
  const donorResponses = request.donorResponses || {};
  
  console.log('🔍 Debug - Notified Donors:', notifiedDonors);
  console.log('🔍 Debug - Donor Responses:', donorResponses);
  
  // Get all notified donors with their info and status
  const allNotifiedDonors = Object.entries(notifiedDonors).map(([donorId, donorData]) => ({
    id: donorId,
    ...donorData,
    responseStatus: donorData.status || 'NOTIFIED' // Use the status from notifiedDonors
  }));
  
  const acceptedDonors = allNotifiedDonors.filter(donor => donor.responseStatus === 'ACCEPTED');
  const rejectedDonors = allNotifiedDonors.filter(donor => donor.responseStatus === 'REJECTED');
  const pendingDonors = allNotifiedDonors.filter(donor => donor.responseStatus === 'NOTIFIED');

  const pendingCount = pendingDonors.length;

  // Manual notification trigger
  const handleManualTrigger = async () => {
    setTriggeringNotification(true);
    setTriggerMessage('');
    
    try {
      console.log('🔧 Manual trigger initiated for request:', id);
      const result = await triggerNotificationManually(id);
      
      if (result.success) {
        setTriggerMessage(`✅ Success! Notified ${result.donorsNotified} donors`);
        
        // Refresh the request data after 2 seconds
        setTimeout(async () => {
          try {
            const updatedRequest = await getBloodRequest(id);
            if (updatedRequest) {
              setRequest(updatedRequest);
            }
          } catch (refreshError) {
            console.error('❌ Error refreshing after trigger:', refreshError);
          }
        }, 2000);
        
      } else {
        setTriggerMessage(`❌ Failed: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Manual trigger error:', error);
      setTriggerMessage(`❌ Error: ${error.message}`);
    } finally {
      setTriggeringNotification(false);
      
      // Clear message after 10 seconds
      setTimeout(() => {
        setTriggerMessage('');
      }, 10000);
    }
  };

  return (
    <div className="needy-request-status">
      <div className="header">
        <h1>🆘 Request Status</h1>
        <p>Request #{request.id.slice(-6)} - Live Updates</p>
      </div>
      
      <div className="container">
        {/* Request Summary */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Request Details</h2>
            <div style={{ 
              padding: '8px 16px', 
              borderRadius: '20px', 
              backgroundColor: request.urgency === 'IMMEDIATE' ? '#fef2f2' : '#fef3c7',
              color: request.urgency === 'IMMEDIATE' ? '#dc2626' : '#f59e0b',
              fontWeight: 'bold'
            }}>
              {request.urgency}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <strong>Blood Group:</strong> {request.bloodGroup?.replace('_', '') || 'N/A'}
            </div>
            <div>
              <strong>Units:</strong> {request.unitsNeeded || request.units || request.unitsRequired || 'N/A'}
            </div>
            <div>
              <strong>Hospital:</strong> {request.hospital || 'N/A'}
            </div>
            <div>
              <strong>City:</strong> {request.city || 'N/A'}
            </div>
            <div>
              <strong>Patient:</strong> {request.patientName || 'N/A'}
            </div>
            <div>
              <strong>Status:</strong> 
              <span style={{ 
                marginLeft: '5px',
                color: request.status === 'FULFILLED' ? '#059669' : '#f59e0b',
                fontWeight: 'bold'
              }}>
                {request.status}
              </span>
            </div>
          </div>

          {request.createdAt && (
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#6b7280' }}>
              <strong>Created:</strong> {new Date(request.createdAt.toDate()).toLocaleString()}
            </div>
          )}
        </div>

        {/* Live Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#e0f2fe' }}>
            <h3 style={{ color: '#0369a1', fontSize: '2rem' }}>{request.notifiedDonorsCount || 0}</h3>
            <p>Donors Notified</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ color: '#059669', fontSize: '2rem' }}>{acceptedDonors.length}</h3>
            <p>Accepted</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef2f2' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem' }}>{rejectedDonors.length}</h3>
            <p>Rejected</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef3c7' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem' }}>{Math.max(0, pendingCount)}</h3>
            <p>Pending</p>
          </div>
        </div>

        {/* Accepted Donors */}
        {acceptedDonors.length > 0 && (
          <div className="card">
            <h3 style={{ color: '#059669' }}>✅ Donors Who Accepted ({acceptedDonors.length})</h3>
            <div style={{ marginTop: '20px' }}>
              {acceptedDonors.map((donor, index) => (
                <div key={donor.id} className="card" style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{donor.donorInfo?.fullName || `Donor #${index + 1}`}</h4>
                      <p><strong>Blood Group:</strong> {donor.donorInfo?.bloodGroup || 'N/A'}</p>
                      <p><strong>City:</strong> {donor.donorInfo?.city || 'N/A'}</p>
                      {donor.donorInfo?.phone && (
                        <p><strong>Contact:</strong> 
                          <a href={`tel:${donor.donorInfo.phone}`} style={{ 
                            marginLeft: '10px', 
                            color: '#059669',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                          }}>
                            📞 {donor.donorInfo.phone}
                          </a>
                        </p>
                      )}
                      <p><strong>Status:</strong> Ready to donate</p>
                      {donor.respondedAt && (
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          <strong>Responded:</strong> {new Date(donor.respondedAt.toDate()).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        ACCEPTED
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="card" style={{ backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9', marginTop: '20px' }}>
              <h4 style={{ color: '#0369a1' }}>📞 Next Steps:</h4>
              <ol style={{ marginTop: '10px', paddingLeft: '20px', color: '#0369a1' }}>
                <li>Call the donors immediately to coordinate</li>
                <li>Confirm their availability and timing</li>
                <li>Share hospital address and any specific instructions</li>
                <li>Arrange to meet them at the hospital</li>
                <li>Thank them after successful donation</li>
              </ol>
            </div>
          </div>
        )}

        {/* Pending Donors */}
        {pendingDonors.length > 0 && (
          <div className="card">
            <h3 style={{ color: '#f59e0b' }}>⏳ Donors Notified - Waiting for Response ({pendingDonors.length})</h3>
            <div style={{ marginTop: '20px' }}>
              {pendingDonors.map((donor, index) => (
                <div key={donor.id} className="card" style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{donor.donorInfo?.fullName || `Donor #${index + 1}`}</h4>
                      <p><strong>Blood Group:</strong> {donor.donorInfo?.bloodGroup || 'N/A'}</p>
                      <p><strong>City:</strong> {donor.donorInfo?.city || 'N/A'}</p>
                      {donor.donorInfo?.phone && (
                        <p><strong>Phone:</strong> {donor.donorInfo.phone}</p>
                      )}
                      {donor.donorInfo?.isEmergencyDonor && (
                        <p style={{ fontSize: '12px', color: '#f59e0b' }}>
                          <strong>Note:</strong> Emergency donor created for this request
                        </p>
                      )}
                      {donor.notifiedAt && (
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          <strong>Notified:</strong> {new Date(donor.notifiedAt.toDate()).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        padding: '8px 16px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        PENDING
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Donors */}
        {rejectedDonors.length > 0 && (
          <div className="card">
            <h3 style={{ color: '#dc2626' }}>❌ Donors Who Declined ({rejectedDonors.length})</h3>
            <div style={{ marginTop: '20px' }}>
              {rejectedDonors.map((donor, index) => (
                <div key={donor.id} className="card" style={{ 
                  marginBottom: '15px', 
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4>{donor.donorInfo?.fullName || `Donor #${index + 1}`}</h4>
                      <p><strong>Blood Group:</strong> {donor.donorInfo?.bloodGroup || 'N/A'}</p>
                      <p><strong>City:</strong> {donor.donorInfo?.city || 'N/A'}</p>
                      {donor.respondedAt && (
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          <strong>Declined:</strong> {new Date(donor.respondedAt.toDate()).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        padding: '8px 16px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        DECLINED
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waiting State - Only show if no donors have been notified yet */}
        {(request.notifiedDonorsCount === 0 || allNotifiedDonors.length === 0) && (
          <div className="card">
            <h3>⏳ Searching for Donors</h3>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
              <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                We're searching for compatible donors in your area...
              </p>
              <p>This may take a few moments. Please wait while we find the best matches.</p>
              
              {request.urgency === 'IMMEDIATE' && (
                <div style={{ 
                  marginTop: '30px', 
                  padding: '20px', 
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#dc2626' }}>🚨 Emergency Situation Detected</h4>
                  <p style={{ color: '#dc2626', marginTop: '10px' }}>
                    Since this is marked as immediate, we're also:
                  </p>
                  <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#dc2626' }}>
                    <li>Expanding search to nearby cities</li>
                    <li>Creating emergency donor profiles if needed</li>
                    <li>Prioritizing your request in our system</li>
                  </ul>
                  <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
                    Emergency Helpline: 1800-BLOOD-HELP
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Waiting for responses - Only show if donors are notified but none accepted yet */}
        {allNotifiedDonors.length > 0 && acceptedDonors.length === 0 && pendingDonors.length > 0 && (
          <div className="card">
            <h3>⏳ Waiting for Donor Responses</h3>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔄</div>
              <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
                We've notified {request.notifiedDonorsCount || 0} compatible donors in your area.
              </p>
              <p>Responses typically come within 15-30 minutes. This page updates automatically.</p>
            </div>
            
            {/* Show the actual pending donors here */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#f59e0b', marginBottom: '15px' }}>📋 Notified Donors:</h4>
              {pendingDonors.map((donor, index) => (
                <div key={donor.id} className="card" style={{ 
                  marginBottom: '10px', 
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  padding: '15px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0' }}>{donor.donorInfo?.fullName || `Donor #${index + 1}`}</h4>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
                        <span><strong>Blood Group:</strong> {donor.donorInfo?.bloodGroup || 'N/A'}</span>
                        <span><strong>City:</strong> {donor.donorInfo?.city || 'N/A'}</span>
                        {donor.donorInfo?.phone && (
                          <span><strong>Phone:</strong> {donor.donorInfo.phone}</span>
                        )}
                      </div>
                      {donor.donorInfo?.isEmergencyDonor && (
                        <p style={{ fontSize: '12px', color: '#f59e0b', margin: '5px 0 0 0' }}>
                          <strong>Note:</strong> Emergency donor created for this request
                        </p>
                      )}
                      {donor.notifiedAt && (
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '5px 0 0 0' }}>
                          <strong>Notified:</strong> {new Date(donor.notifiedAt.toDate()).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        padding: '6px 12px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        WAITING
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="card">
          <h3>📞 Your Contact Information</h3>
          <div style={{ marginTop: '15px' }}>
            <p><strong>Attendant:</strong> {request.attendantName || request.contactPerson || 'N/A'}</p>
            <p><strong>Phone:</strong> {request.contactNumber || request.attendantPhone || request.phone || 'N/A'}</p>
            <p><strong>Hospital:</strong> {request.hospital || 'N/A'}, {request.city || 'N/A'}</p>
            {request.additionalNotes && (
              <div style={{ marginTop: '15px' }}>
                <strong>Additional Notes:</strong>
                <p style={{ 
                  marginTop: '5px', 
                  padding: '10px', 
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  {request.additionalNotes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3>Actions</h3>
          
          {/* Manual Trigger Section - Always show for testing */}
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '2px solid #fecaca', 
            borderRadius: '8px', 
            padding: '15px', 
            marginBottom: '20px' 
          }}>
            <h4 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>🔧 Manual Notification Trigger</h4>
            <p style={{ color: '#dc2626', margin: '0 0 15px 0', fontSize: '14px' }}>
              Click below to manually trigger donor search and notification. This will create emergency donors if none exist.
            </p>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              Debug: notifiedDonorsCount = {request.notifiedDonorsCount || 0}, 
              notificationStatus = {request.notificationStatus || 'PENDING'}
            </div>
            <button 
              onClick={handleManualTrigger}
              disabled={triggeringNotification}
              className="btn btn-primary"
              style={{ 
                backgroundColor: triggeringNotification ? '#6b7280' : '#dc2626',
                cursor: triggeringNotification ? 'not-allowed' : 'pointer'
              }}
            >
              {triggeringNotification ? (
                <>
                  <span style={{ 
                    display: 'inline-block', 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #ffffff', 
                    borderTop: '2px solid transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></span>
                  Finding Donors...
                </>
              ) : '🔔 Find & Notify Donors Now'}
            </button>
            
            {triggerMessage && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                borderRadius: '4px',
                backgroundColor: triggerMessage.includes('✅') ? '#d1fae5' : '#fee2e2',
                color: triggerMessage.includes('✅') ? '#065f46' : '#dc2626',
                fontSize: '14px'
              }}>
                {triggerMessage}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
            {acceptedDonors.length > 0 && request.status !== 'FULFILLED' && (
              <Link 
                to={`/needy/request/complete`}
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                ✅ Mark as Fulfilled
              </Link>
            )}
            
            {acceptedDonors.length > 0 && (
              <Link 
                to={`/needy/feedback/${id}`}
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                ⭐ Give Feedback
              </Link>
            )}
            
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              🔄 Refresh Status
            </button>
            
            <Link 
              to="/needy/dashboard"
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              📊 Back to Dashboard
            </Link>
          </div>
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>

        {/* Auto-refresh indicator */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            🔄 This page updates automatically every 60 seconds.
          </p>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NeedyRequestStatusPage;