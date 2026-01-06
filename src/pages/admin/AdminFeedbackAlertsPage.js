import { useState, useEffect } from 'react';
import { getFeedback } from '../../services/firebaseApi';

const AdminFeedbackAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Get all feedback and filter for suspicious ones
        const allFeedback = await getFeedback();
        // For now, just show all feedback as alerts (you can add AI filtering later)
        const suspiciousFeedback = allFeedback.filter(feedback => 
          feedback.rating <= 2 || 
          (feedback.text && feedback.text.toLowerCase().includes('scam')) ||
          (feedback.text && feedback.text.toLowerCase().includes('fraud'))
        );
        setAlerts(suspiciousFeedback);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleMarkSafe = async (feedbackId) => {
    try {
      // For now, just remove from local state
      // You can implement actual marking as safe in Firebase later
      setAlerts(prev => prev.filter(alert => alert.id !== feedbackId));
    } catch (error) {
      console.error('Error marking feedback as safe:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading feedback alerts...</div>;
  }

  return (
    <div className="admin-feedback-alerts">
      <div className="header">
        <h1>🛡️ Scam & Fraud Alerts</h1>
        <p>AI-flagged suspicious feedback for review</p>
      </div>
      
      <div className="container">
        <div className="card">
          <h2>Flagged Feedback ({alerts.length})</h2>
          
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No suspicious feedback detected. Great job!</p>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              {alerts.map((alert) => (
                <div key={alert.id} className="card" style={{ 
                  marginBottom: '20px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#fef2f2'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#dc2626' }}>⚠️ Suspicious Feedback Detected</h4>
                      <div style={{ marginTop: '15px' }}>
                        <p><strong>Feedback Text:</strong></p>
                        <div style={{ 
                          padding: '10px', 
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                          marginTop: '5px'
                        }}>
                          "{alert.text}"
                        </div>
                      </div>
                      <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                        <div>
                          <strong>Rating:</strong> {alert.rating}/5
                        </div>
                        <div>
                          <strong>Donor:</strong> {alert.donorName}
                        </div>
                        <div>
                          <strong>Requestor:</strong> {alert.needyName}
                        </div>
                        <div>
                          <strong>Date:</strong> {new Date(alert.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginLeft: '20px' }}>
                      <button
                        onClick={() => handleMarkSafe(alert.id)}
                        className="btn btn-primary"
                        style={{ marginBottom: '10px', width: '120px' }}
                      >
                        Mark Safe
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ width: '120px' }}
                      >
                        Block Donor
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackAlertsPage;