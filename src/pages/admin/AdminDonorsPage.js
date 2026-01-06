import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllDonors, updateDonorStatus } from '../../services/firebaseApi';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const AdminDonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    bloodGroup: '',
    status: 'all'
  });

  const fetchDonors = async () => {
    try {
      setRefreshing(true);
      console.log('🔥 Fetching all donors from Firebase...');
      const data = await getAllDonors();
      setDonors(data || []);
      console.log('✅ Donors loaded from Firebase:', data.length);
    } catch (error) {
      console.error('❌ Error fetching donors from Firebase:', error);
      setDonors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleToggleAvailability = async (donorId, currentStatus) => {
    try {
      console.log('🔄 Updating donor availability:', donorId, !currentStatus);
      await updateDonorStatus(donorId, !currentStatus);
      
      // Update local state
      setDonors(prev => prev.map(donor => 
        donor.id === donorId ? { ...donor, isAvailable: !currentStatus } : donor
      ));
      
      console.log('✅ Donor availability updated successfully');
    } catch (error) {
      console.error('❌ Error updating donor status:', error);
      alert('Failed to update donor status: ' + error.message);
    }
  };

  const handleRefresh = () => {
    fetchDonors();
  };

  // Filter donors based on current filters
  const filteredDonors = donors.filter(donor => {
    const matchesCity = !filters.city || 
      donor.city?.toLowerCase().includes(filters.city.toLowerCase());
    
    const matchesBloodGroup = !filters.bloodGroup || 
      donor.bloodGroup === filters.bloodGroup;
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'available' && donor.isAvailable) ||
      (filters.status === 'unavailable' && !donor.isAvailable);
    
    return matchesCity && matchesBloodGroup && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading donors...</h2>
        <p>Please wait while we fetch donor information from Firebase...</p>
      </div>
    );
  }

  return (
    <div className="admin-donors">
      {/* Header */}
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>👥 Manage Donors</h1>
            <p>View and manage all registered blood donors</p>
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
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ color: '#059669', fontSize: '2rem', margin: '0' }}>{donors.length}</h3>
            <p style={{ margin: '5px 0 0 0' }}>Total Donors</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef3c7' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem', margin: '0' }}>
              {donors.filter(d => d.isAvailable).length}
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Available Donors</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#fef2f2' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem', margin: '0' }}>
              {donors.filter(d => !d.isAvailable).length}
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Unavailable Donors</p>
          </div>
          <div className="card" style={{ textAlign: 'center', backgroundColor: '#e0f2fe' }}>
            <h3 style={{ color: '#0369a1', fontSize: '2rem', margin: '0' }}>
              {filteredDonors.length}
            </h3>
            <p style={{ margin: '5px 0 0 0' }}>Filtered Results</p>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Donor List ({filteredDonors.length})</h2>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Filter by city..."
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '150px' }}
            />
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
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <button 
              onClick={() => setFilters({ city: '', bloodGroup: '', status: 'all' })}
              className="btn btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Clear Filters
            </button>
          </div>

          {/* Donor Table */}
          {filteredDonors.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>City</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Blood Group</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Donations</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map((donor) => (
                    <tr key={donor.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{donor.fullName || donor.name}</strong>
                        <br />
                        <small style={{ color: '#6b7280' }}>Age: {donor.age || 'N/A'}</small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <small>{donor.email}</small>
                      </td>
                      <td style={{ padding: '12px' }}>{donor.phone || donor.contactNumber}</td>
                      <td style={{ padding: '12px' }}>{donor.city}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626'
                        }}>
                          {donor.bloodGroup?.replace('_', '') || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {donor.donationCount || 0} times
                        <br />
                        <small style={{ color: '#6b7280' }}>
                          Rating: {donor.rating ? donor.rating.toFixed(1) : 'N/A'}⭐
                        </small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: donor.isAvailable ? '#f0fdf4' : '#fef2f2',
                          color: donor.isAvailable ? '#059669' : '#dc2626'
                        }}>
                          {donor.isAvailable ? '✅ Available' : '❌ Unavailable'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleToggleAvailability(donor.id, donor.isAvailable)}
                          className={`btn ${donor.isAvailable ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          {donor.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>No donors found matching the current filters.</p>
              <p style={{ fontSize: '14px' }}>Try adjusting your search criteria or clearing the filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDonorsPage;