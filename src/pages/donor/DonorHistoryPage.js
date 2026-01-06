import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDonationHistory } from '../../services/firebaseApi';

const DonorHistoryPage = () => {
  const { userProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    year: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchHistory = async () => {
      const isDemoMode = process.env.REACT_APP_ENV === 'development';
      
      if (isDemoMode) {
        // Demo mode: use mock donation history
        console.log('🔧 Demo mode: Using mock donation history');
        const mockHistory = [
          {
            id: 1,
            donationDate: '2024-10-15',
            hospitalName: 'City General Hospital',
            requestId: 'req-123456',
            units: 1,
            status: 'VERIFIED',
            proofImageUrl: 'https://demo-storage.bloodsaathi.com/proof1.jpg',
            certificateId: 'cert-001'
          },
          {
            id: 2,
            donationDate: '2024-07-20',
            hospitalName: 'Metro Blood Bank',
            requestId: 'req-789012',
            units: 1,
            status: 'VERIFIED',
            proofImageUrl: 'https://demo-storage.bloodsaathi.com/proof2.jpg',
            certificateId: 'cert-002'
          },
          {
            id: 3,
            donationDate: '2024-04-10',
            hospitalName: 'Community Health Center',
            requestId: 'req-345678',
            units: 1,
            status: 'PENDING',
            proofImageUrl: 'https://demo-storage.bloodsaathi.com/proof3.jpg',
            certificateId: null
          }
        ];
        setHistory(mockHistory);
        setLoading(false);
        return;
      }
      
      if (userProfile?.id) {
        try {
          const data = await getDonationHistory(userProfile.id);
          setHistory(data);
        } catch (error) {
          console.error('Error fetching donation history:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHistory();
  }, [userProfile]);

  const filteredHistory = history.filter(item => {
    if (filter.year !== 'all') {
      const itemYear = new Date(item.donationDate).getFullYear().toString();
      if (itemYear !== filter.year) return false;
    }
    if (filter.status !== 'all' && item.status !== filter.status) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const styles = {
      VERIFIED: { backgroundColor: '#f0fdf4', color: '#059669', text: '✅ Verified' },
      PENDING: { backgroundColor: '#fef3c7', color: '#f59e0b', text: '⏳ Pending' },
      REJECTED: { backgroundColor: '#fef2f2', color: '#dc2626', text: '❌ Rejected' }
    };
    
    const style = styles[status] || styles.PENDING;
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        ...style
      }}>
        {style.text}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading donation history...</div>;
  }

  return (
    <div className="donor-history">
      <div className="header">
        <h1>📋 Donation History</h1>
        <p>Your complete blood donation record</p>
      </div>
      
      <div className="container">
        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem' }}>{history.length}</h3>
            <p>Total Donations</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem' }}>
              {history.filter(h => h.status === 'VERIFIED').length}
            </h3>
            <p>Verified Donations</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem' }}>
              {history.reduce((sum, h) => sum + (h.units || 1), 0)}
            </h3>
            <p>Total Units</p>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', fontSize: '2rem' }}>
              {history.length > 0 ? new Date().getFullYear() - new Date(history[0]?.donationDate).getFullYear() + 1 : 0}
            </h3>
            <p>Years Active</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <h3>Filter History</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
            <div>
              <label htmlFor="yearFilter" style={{ display: 'block', marginBottom: '5px' }}>Year:</label>
              <select
                id="yearFilter"
                value={filter.year}
                onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="all">All Years</option>
                {[...new Set(history.map(h => new Date(h.donationDate).getFullYear()))]
                  .sort((a, b) => b - a)
                  .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
            </div>
            <div>
              <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
              <select
                id="statusFilter"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="all">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card">
          <h3>Donation Records ({filteredHistory.length})</h3>
          
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No donation records found.</p>
              <Link to="/donor/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '15px' }}>
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Hospital</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Request ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Units</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((record) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>
                        {new Date(record.donationDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>{record.hospitalName}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                        #{record.requestId?.slice(-6) || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>{record.units || 1}</td>
                      <td style={{ padding: '12px' }}>
                        {getStatusBadge(record.status)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {record.proofImageUrl && (
                            <a 
                              href={record.proofImageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                fontSize: '12px', 
                                color: '#dc2626', 
                                textDecoration: 'none',
                                padding: '4px 8px',
                                border: '1px solid #dc2626',
                                borderRadius: '4px'
                              }}
                            >
                              📸 View Proof
                            </a>
                          )}
                          {record.certificateId && record.status === 'VERIFIED' && (
                            <Link 
                              to={`/donor/certificate/${record.certificateId}`}
                              style={{ 
                                fontSize: '12px', 
                                color: '#059669', 
                                textDecoration: 'none',
                                padding: '4px 8px',
                                border: '1px solid #059669',
                                borderRadius: '4px'
                              }}
                            >
                              🏆 Certificate
                            </Link>
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

        {/* Achievement Badges */}
        {history.length > 0 && (
          <div className="card">
            <h3>🏆 Your Achievements</h3>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
              {history.length >= 1 && (
                <div style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#fef3c7', 
                  color: '#92400e',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  🥉 First Donation
                </div>
              )}
              {history.length >= 5 && (
                <div style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#e0f2fe', 
                  color: '#0369a1',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  🥈 5 Donations
                </div>
              )}
              {history.length >= 10 && (
                <div style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#fef2f2', 
                  color: '#dc2626',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  🥇 10 Donations
                </div>
              )}
              {history.filter(h => h.status === 'VERIFIED').length >= 3 && (
                <div style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#f0fdf4', 
                  color: '#059669',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ✅ Verified Donor
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link to="/donor/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonorHistoryPage;