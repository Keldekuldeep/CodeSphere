import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests, updateRequestStatus } from '../../services/firebaseApi';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    bloodGroup: '',
    city: ''
  });

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      console.log('🔥 Fetching all blood requests from Firebase...');
      const data = await getAllRequests();
      setRequests(data || []);
      console.log('✅ Blood requests loaded from Firebase:', data.length);
    } catch (error) {
      console.error('❌ Error fetching requests from Firebase:', error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      console.log('🔄 Updating request status:', requestId, newStatus);
      await updateRequestStatus(requestId, newStatus);
      
      // Update local state
      setRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, status: newStatus } : request
      ));
      
      console.log('✅ Request status updated successfully');
    } catch (error) {
      console.error('❌ Error updating request status:', error);
      alert('Failed to update request status: ' + error.message);
    }
  };

  const handleRefresh = () => {
    fetchRequests();
  };

  // Filter requests based on current filters
  const filteredRequests = requests.filter(request => {
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    
    const matchesBloodGroup = !filters.bloodGroup || 
      request.bloodGroup === filters.bloodGroup;
    
    const matchesCity = !filters.city || 
      request.city?.toLowerCase().includes(filters.city.toLowerCase());
    
    return matchesStatus && matchesBloodGroup && matchesCity;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'FULFILLED': return { bg: '#f0fdf4', color: '#059669' };
      case 'CANCELLED': return { bg: '#fef2f2', color: '#dc2626' };
      case 'EXPIRED': return { bg: '#f3f4f6', color: '#6b7280' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
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

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading blood requests...</h2>
        <p>Please wait while we fetch request information from Firebase...</p>
      </div>
    );
  }

  return (
    <div className="admin-requests">
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 Blood Requests</h1>
            <p>Monitor and manage all blood requests on the platform</p>
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
            <Link to="/admin/dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef3c7' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem', margin: '0' }}>
              {requests.filter(r => r.status === 'ACTIVE').length}
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Active Requests</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ color: '#059669', fontSize: '2rem', margin: '0' }}>
              {requests.filter(r => r.status === 'FULFILLED').length}
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Fulfilled</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef2f2' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem', margin: '0' }}>
              {requests.filter(r => r.urgency === 'IMMEDIATE').length}
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Immediate</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#e0f2fe' }}>
            <h3 style={{ color: '#0369a1', fontSize: '2rem', margin: '0' }}>
              {filteredRequests.length}
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Filtered Results</p>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>All Requests ({filteredRequests.length})</h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <select
              value={filters.bloodGroup}
              onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">All Blood Groups</option>
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
            </select>
            <input
              type="text"
              placeholder="Filter by city..."
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '150px' }}
            />
            <button 
              onClick={() => setFilters({ status: 'all', bloodGroup: '', city: '' })}
              className="btn btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Clear Filters
            </button>
          </div>
          
          {/* Requests Table */}
          {filteredRequests.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Patient</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Blood Group</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Units</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Hospital</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>City</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Urgency</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Donors</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => {
                    const statusStyle = getStatusColor(request.status);
                    return (
                      <tr key={request.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px' }}>
                          <strong>{request.patientName}</strong>
                          <br />
                          <small style={{ color: '#6b7280' }}>
                            ID: #{request.id.slice(-6)}
                          </small>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626'
                          }}>
                            {request.bloodGroup?.replace('_', '') || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{request.unitsNeeded || request.units}</td>
                        <td style={{ padding: '12px' }}>{request.hospital}</td>
                        <td style={{ padding: '12px' }}>{request.city}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            color: getUrgencyColor(request.urgency),
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}>
                            {request.urgency || 'NORMAL'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontSize: '12px' }}>
                            Notified: {request.notifiedDonorsCount || 0}<br />
                            Accepted: {request.acceptedDonorsCount || 0}<br />
                            Rejected: {request.rejectedDonorsCount || 0}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color
                          }}>
                            {request.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {request.status === 'ACTIVE' && (
                            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'FULFILLED')}
                                className="btn btn-primary"
                                style={{ fontSize: '10px', padding: '4px 8px' }}
                              >
                                Mark Fulfilled
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(request.id, 'CANCELLED')}
                                className="btn btn-secondary"
                                style={{ fontSize: '10px', padding: '4px 8px' }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {request.status !== 'ACTIVE' && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'ACTIVE')}
                              className="btn btn-secondary"
                              style={{ fontSize: '10px', padding: '4px 8px' }}
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>No blood requests found matching the current filters.</p>
              <p style={{ fontSize: '14px' }}>Try adjusting your search criteria or clearing the filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequestsPage;