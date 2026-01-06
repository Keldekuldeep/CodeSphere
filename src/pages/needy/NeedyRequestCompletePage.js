import React, { useState, useEffect } from 'react';
import { updateBloodRequest } from '../../services/firebaseApi';

const NeedyRequestCompletePage = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const isDemoMode = process.env.REACT_APP_ENV === 'development';
    
    if (isDemoMode) {
      // Demo mode: show mock active requests
      setActiveRequests([
        {
          id: 'demo-request-123',
          bloodGroup: 'O_POSITIVE',
          units: 2,
          hospital: 'Demo Hospital',
          city: 'Demo City',
          status: 'MATCHED'
        }
      ]);
    }
  }, []);

  const handleMarkComplete = async (requestId) => {
    setLoading(true);
    try {
      const isDemoMode = process.env.REACT_APP_ENV === 'development';
      
      if (isDemoMode) {
        // Demo mode: simulate completion
        console.log('🔧 Demo mode: Marking request as complete', requestId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setActiveRequests(prev => prev.filter(req => req.id !== requestId));
        setMessage('✅ Request marked as fulfilled successfully! Thank you for using BloodSaathi.');
        return;
      }
      
      await updateBloodRequest(requestId, { status: 'FULFILLED' });
      // Refresh the list
      setActiveRequests(prev => prev.filter(req => req.id !== requestId));
      setMessage('Request completed successfully!');
    } catch (error) {
      console.error('Error completing request:', error);
      setMessage('Error completing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-request-complete">
      <div className="header">
        <h1>✅ Mark Request Complete</h1>
        <p>Mark your blood requests as fulfilled</p>
      </div>
      
      <div className="container">
        {message && (
          <div className="card" style={{ 
            backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`,
            marginBottom: '20px'
          }}>
            <p style={{ 
              color: message.includes('Error') ? '#dc2626' : '#059669',
              margin: 0,
              fontWeight: 'bold'
            }}>
              {message}
            </p>
          </div>
        )}
        
        <div className="card">
          <h2>Active Requests</h2>
          {activeRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
              <h3>All requests completed!</h3>
              <p>You have no active blood requests to mark as fulfilled.</p>
              <p style={{ marginTop: '20px' }}>
                <a href="/needy/request/create" className="btn btn-primary">
                  Create New Request
                </a>
              </p>
            </div>
          ) : (
            activeRequests.map(request => (
              <div key={request.id} className="card" style={{ 
                marginBottom: '15px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>Request #{request.id.slice(-6)}</h4>
                    <p><strong>Blood Group:</strong> {request.bloodGroup} | <strong>Units:</strong> {request.units}</p>
                    <p><strong>Hospital:</strong> {request.hospital}, {request.city}</p>
                    <p><strong>Status:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>Donors Found</span></p>
                  </div>
                  <button 
                    onClick={() => handleMarkComplete(request.id)}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : '✅ Mark Fulfilled'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="card" style={{ backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9' }}>
          <h3 style={{ color: '#0369a1' }}>📋 After Marking as Fulfilled:</h3>
          <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#0369a1' }}>
            <li>Your request will be closed and removed from active searches</li>
            <li>Donors will be notified that the request is fulfilled</li>
            <li>You can provide feedback about your experience</li>
            <li>A completion certificate will be generated for donors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NeedyRequestCompletePage;