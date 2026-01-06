import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { getBloodRequests, updateBloodRequest } from '../../services/firebaseApi';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const NeedyDashboardPage = () => {
  const navigate = useNavigate();
  const { userProfile, user } = useAuth();
  
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    cancelledRequests: 0
  });

  useEffect(() => {
    loadMyRequests();
  }, [userProfile]);

  const loadMyRequests = async () => {
    if (!userProfile?.id) return;
    
    try {
      console.log('📋 Loading requests for needy:', userProfile.id);
      
      // Get all blood requests for this needy user
      const allRequests = await getBloodRequests();
      const myRequests = allRequests.filter(request => 
        request.needyId === userProfile.id || 
        request.createdBy === userProfile.id ||
        request.needyFirebaseUid === user?.uid
      );
      
      console.log(`📊 Found ${myRequests.length} requests for user`);
      
      // Sort by creation date (newest first)
      myRequests.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime;
      });
      
      setMyRequests(myRequests);
      
      // Calculate stats
      const stats = {
        totalRequests: myRequests.length,
        activeRequests: myRequests.filter(r => r.status === 'ACTIVE').length,
        completedRequests: myRequests.filter(r => r.status === 'COMPLETED').length,
        cancelledRequests: myRequests.filter(r => r.status === 'CANCELLED').length
      };
      
      setStats(stats);
      
    } catch (error) {
      console.error('❌ Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const handleCreateRequest = () => {
    navigate('/needy/request/create');
  };

  const handleViewRequest = (requestId) => {
    navigate(`/needy/request/status/${requestId}`);
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this blood request?')) {
      return;
    }
    
    try {
      await updateBloodRequest(requestId, { 
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        cancelledBy: userProfile.id
      });
      
      // Reload requests
      loadMyRequests();
      
      alert('✅ Blood request cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling request:', error);
      alert('❌ Failed to cancel request: ' + error.message);
    }
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
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="needy-dashboard">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 Needy Dashboard</h1>
            <p>Welcome back, {userProfile?.fullName || userProfile?.name || 'User'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LanguageSwitcher />
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Emergency Banner */}
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626' }}>🚨 Emergency? Call Immediately!</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px', flexWrap: 'wrap' }}>
              <div>
                <strong>Emergency Helpline:</strong>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>
                  📞 +91-9876543210
                </p>
              </div>
              <div>
                <strong>WhatsApp Support:</strong>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626' }}>
                  💬 +91-9876543210
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>{stats.totalRequests}</h3>
            <p style={{ margin: 0, color: '#666' }}>Total Requests</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#d4edda' }}>
            <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>{stats.activeRequests}</h3>
            <p style={{ margin: 0, color: '#666' }}>Active Requests</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#d1ecf1' }}>
            <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>{stats.completedRequests}</h3>
            <p style={{ margin: 0, color: '#666' }}>Completed</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f8d7da' }}>
            <h3 style={{ color: '#dc3545', margin: '0 0 10px 0' }}>{stats.cancelledRequests}</h3>
            <p style={{ margin: 0, color: '#666' }}>Cancelled</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>🚀 Quick Actions</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleCreateRequest}
              className="btn btn-primary"
              style={{ fontSize: '1.1rem', padding: '12px 24px' }}
            >
              🩸 Create New Blood Request
            </button>
            <button 
              onClick={() => navigate('/needy/profile')}
              className="btn btn-secondary"
            >
              👤 View Profile
            </button>
            <button 
              onClick={() => navigate('/needy/history')}
              className="btn btn-secondary"
            >
              📋 Request History
            </button>
          </div>
        </div>

        {/* My Blood Requests */}
        <div className="card">
          <h3>📋 My Blood Requests</h3>
          
          {myRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <h4>No blood requests yet</h4>
              <p>Create your first blood request to get started</p>
              <button 
                onClick={handleCreateRequest}
                className="btn btn-primary"
                style={{ marginTop: '15px' }}
              >
                🩸 Create Blood Request
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Patient</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Blood Group</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Units</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Hospital</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Created</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Donors</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((request) => (
                    <tr key={request.id}>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <strong>{request.patientName}</strong>
                        <br />
                        <small style={{ color: '#666' }}>Age: {request.patientAge}</small>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <span style={{ 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}>
                          {request.bloodGroup?.replace('_', '')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        {request.unitsRequired} units
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        {request.hospitalName}
                        <br />
                        <small style={{ color: '#666' }}>{request.city}</small>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <span style={{ color: getStatusColor(request.status), fontWeight: 'bold' }}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <small>{formatDate(request.createdAt)}</small>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                          <div>📧 Notified: {request.notifiedDonorsCount || 0}</div>
                          <div>✅ Accepted: {request.acceptedDonorsCount || 0}</div>
                          <div>❌ Rejected: {request.rejectedDonorsCount || 0}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <button 
                            onClick={() => handleViewRequest(request.id)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                          >
                            👁️ View
                          </button>
                          {request.status === 'ACTIVE' && (
                            <button 
                              onClick={() => handleCancelRequest(request.id)}
                              className="btn btn-danger"
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Profile Summary */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h3>👤 Profile Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Name:</strong> {userProfile?.fullName || userProfile?.name || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {userProfile?.email || user?.email || 'N/A'}
            </div>
            <div>
              <strong>Phone:</strong> {userProfile?.phone || userProfile?.contactNumber || 'N/A'}
            </div>
            <div>
              <strong>City:</strong> {userProfile?.city || 'N/A'}
            </div>
            <div>
              <strong>Member Since:</strong> {formatDate(userProfile?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .needy-dashboard {
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
        
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #c82333;
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

export default NeedyDashboardPage;