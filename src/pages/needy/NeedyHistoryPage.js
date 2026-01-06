import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBloodRequests } from '../../services/firebaseApi';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyHistoryPage = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED

  useEffect(() => {
    loadRequestHistory();
  }, [userProfile]);

  const loadRequestHistory = async () => {
    if (!userProfile?.id) return;
    
    try {
      console.log('📋 Loading request history for needy:', userProfile.id);
      
      // Get all blood requests for this needy user
      const allRequests = await getBloodRequests();
      const myRequests = allRequests.filter(request => 
        request.needyId === userProfile.id || 
        request.createdBy === userProfile.id ||
        request.needyFirebaseUid === user?.uid
      );
      
      console.log(`📊 Found ${myRequests.length} requests in history`);
      
      // Sort by creation date (newest first)
      myRequests.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime;
      });
      
      setRequests(myRequests);
      
    } catch (error) {
      console.error('❌ Error loading request history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (filter === 'ALL') return requests;
    return requests.filter(request => request.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'COMPLETED': return '#007bff';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return '🔴 Active';
      case 'COMPLETED': return '✅ Completed';
      case 'CANCELLED': return '❌ Cancelled';
      default: return '⏳ Pending';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'IMMEDIATE': return '#dc3545';
      case 'WITHIN_24H': return '#fd7e14';
      case 'SCHEDULED': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'IMMEDIATE': return '🚨 Immediate';
      case 'WITHIN_24H': return '⏰ Within 24H';
      case 'SCHEDULED': return '📅 Scheduled';
      default: return '⏳ Normal';
    }
  };

  const filteredRequests = getFilteredRequests();

  if (loading) {
    return (
      <div className="loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #dc3545',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p>Loading request history...</p>
      </div>
    );
  }

  return (
    <div className="needy-history">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>📋 Request History</h1>
            <p>View all your blood requests</p>
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
        {/* Filter Buttons */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Filter Requests</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.9rem' }}
              >
                {status === 'ALL' ? '📋 All' : getStatusText(status)} 
                ({status === 'ALL' ? requests.length : requests.filter(r => r.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Request History */}
        <div className="card">
          <h3>
            📊 Request History 
            {filter !== 'ALL' && ` - ${getStatusText(filter)}`}
            ({filteredRequests.length})
          </h3>
          
          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h4>No requests found</h4>
              <p>
                {filter === 'ALL' 
                  ? 'You haven\'t created any blood requests yet'
                  : `No ${filter.toLowerCase()} requests found`
                }
              </p>
              {filter === 'ALL' && (
                <button 
                  onClick={() => navigate('/needy/request/create')}
                  className="btn btn-primary"
                  style={{ marginTop: '15px' }}
                >
                  🩸 Create First Request
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Patient Details</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Blood & Units</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Hospital</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Urgency</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Donor Response</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Created</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div>
                          <strong>{request.patientName}</strong>
                          <br />
                          <small style={{ color: '#666' }}>
                            Age: {request.patientAge} | Gender: {request.patientGender}
                          </small>
                        </div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            display: 'block',
                            marginBottom: '5px'
                          }}>
                            {request.bloodGroup?.replace('_', '')}
                          </span>
                          <strong>{request.unitsRequired} units</strong>
                        </div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div>
                          <strong>{request.hospitalName}</strong>
                          <br />
                          <small style={{ color: '#666' }}>{request.city}</small>
                          {request.hospitalAddress && (
                            <>
                              <br />
                              <small style={{ color: '#999' }}>{request.hospitalAddress}</small>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <span style={{ 
                          color: getUrgencyColor(request.urgencyLevel), 
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {getUrgencyText(request.urgencyLevel)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <span style={{ 
                          color: getStatusColor(request.status), 
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div style={{ fontSize: '0.8rem' }}>
                          <div>📧 Notified: {request.notifiedDonorsCount || 0}</div>
                          <div style={{ color: '#28a745' }}>✅ Accepted: {request.acceptedDonorsCount || 0}</div>
                          <div style={{ color: '#dc3545' }}>❌ Rejected: {request.rejectedDonorsCount || 0}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <small>{formatDate(request.createdAt)}</small>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <button 
                          onClick={() => navigate(`/needy/request/status/${request.id}`)}
                          className="btn btn-primary"
                          style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                        >
                          👁️ View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {requests.length > 0 && (
          <div className="card" style={{ marginTop: '30px' }}>
            <h3>📊 Summary Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ color: '#007bff', margin: '0 0 5px 0' }}>
                  {requests.length}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Requests</p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
                <h4 style={{ color: '#28a745', margin: '0 0 5px 0' }}>
                  {requests.filter(r => r.status === 'COMPLETED').length}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Successful</p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                <h4 style={{ color: '#856404', margin: '0 0 5px 0' }}>
                  {requests.reduce((sum, r) => sum + (r.acceptedDonorsCount || 0), 0)}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Donors Helped</p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
                <h4 style={{ color: '#721c24', margin: '0 0 5px 0' }}>
                  {requests.reduce((sum, r) => sum + (r.unitsRequired || 0), 0)}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Total Units Requested</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .needy-history {
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
        
        .btn {
          padding: 8px 16px;
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
        
        .btn-primary:hover {
          background-color: #c82333;
        }
        
        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        
        table {
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 20px 10px;
          }
          
          table {
            font-size: 0.8rem;
          }
          
          .btn {
            font-size: 0.8rem;
            padding: 6px 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default NeedyHistoryPage;