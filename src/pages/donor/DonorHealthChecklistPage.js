import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DonorHealthChecklistPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, returnTo, accepted } = location.state || {};
  
  const [checklist, setChecklist] = useState({
    noFever: false,
    noIllness: false,
    weightAbove50: false,
    noMedications: false,
    wellRested: false
  });
  
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allChecked = Object.values(checklist).every(value => value);

  const handleProceed = async () => {
    if (!allChecked) {
      alert('Please complete all health checks before proceeding.');
      return;
    }

    setLoading(true);
    
    try {
      // Here you would typically save the health checklist status
      // For now, we'll just navigate to the next step
      
      if (accepted && requestId) {
        // If coming from accepted request, go to proof upload preparation
        navigate(`/donor/request/${requestId}`, { 
          state: { healthCheckPassed: true }
        });
      } else if (returnTo) {
        navigate(returnTo, { state: { healthCheckPassed: true } });
      } else {
        navigate('/donor/dashboard');
      }
    } catch (error) {
      console.error('Error saving health checklist:', error);
      alert('Failed to save health checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const healthChecks = [
    {
      key: 'noFever',
      label: 'I have no fever (temperature below 99°F/37.2°C)',
      description: 'You should not donate if you have any signs of fever or infection'
    },
    {
      key: 'noIllness',
      label: 'I have no major illness or infection currently',
      description: 'Including cold, flu, or any other illness that might affect your health'
    },
    {
      key: 'weightAbove50',
      label: 'My weight is above 50 kg (110 lbs)',
      description: 'Minimum weight requirement for safe blood donation'
    },
    {
      key: 'noMedications',
      label: 'I am not taking any medications that prevent donation',
      description: 'Some medications may make you ineligible to donate'
    },
    {
      key: 'wellRested',
      label: 'I am well-rested and have eaten properly today',
      description: 'Proper rest and nutrition are important for safe donation'
    }
  ];

  return (
    <div className="donor-health-checklist">
      <div className="header">
        <h1>🏥 Health Checklist</h1>
        <p>Please confirm your health status before donation</p>
      </div>
      
      <div className="container">
        <div className="card">
          <div style={{ marginBottom: '30px' }}>
            <h2>Pre-Donation Health Assessment</h2>
            <p>
              Your safety and the safety of blood recipients is our top priority. 
              Please honestly assess your current health status.
            </p>
          </div>

          <div className="checklist-container">
            {healthChecks.map((check) => (
              <div key={check.key} className="card" style={{ 
                marginBottom: '20px', 
                border: checklist[check.key] ? '2px solid #059669' : '1px solid #e5e7eb',
                backgroundColor: checklist[check.key] ? '#f0fdf4' : 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                  <input
                    type="checkbox"
                    id={check.key}
                    checked={checklist[check.key]}
                    onChange={() => handleCheckboxChange(check.key)}
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      marginTop: '2px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <label 
                      htmlFor={check.key} 
                      style={{ 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        color: checklist[check.key] ? '#059669' : '#374151'
                      }}
                    >
                      {check.label}
                    </label>
                    <p style={{ 
                      marginTop: '5px', 
                      fontSize: '14px', 
                      color: '#6b7280' 
                    }}>
                      {check.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #f59e0b',
            marginTop: '30px'
          }}>
            <h4 style={{ color: '#92400e' }}>⚠️ Important Reminders:</h4>
            <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#92400e' }}>
              <li>If you answer "No" to any question, please do not donate today</li>
              <li>You can always donate another time when you're feeling better</li>
              <li>Donating when unwell can be dangerous for you and recipients</li>
              <li>When in doubt, consult with medical staff at the donation center</li>
            </ul>
          </div>

          {!allChecked && (
            <div className="card" style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca',
              marginTop: '20px'
            }}>
              <h4 style={{ color: '#dc2626' }}>❌ Cannot Proceed</h4>
              <p style={{ color: '#dc2626' }}>
                Please complete all health checks. If you cannot honestly check all items, 
                we recommend postponing your donation until you're in better health.
              </p>
            </div>
          )}

          {allChecked && (
            <div className="card" style={{ 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #bbf7d0',
              marginTop: '20px'
            }}>
              <h4 style={{ color: '#059669' }}>✅ Health Check Complete</h4>
              <p style={{ color: '#059669' }}>
                Great! You've passed the health checklist and are ready to proceed with donation.
              </p>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginTop: '30px',
            justifyContent: 'center'
          }}>
            <button 
              onClick={() => navigate('/donor/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleProceed}
              className="btn btn-primary"
              disabled={!allChecked || loading}
            >
              {loading ? 'Processing...' : 'Proceed to Donation'}
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3>What Happens Next?</h3>
          <div style={{ marginTop: '15px' }}>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>Visit the Hospital:</strong> Go to the specified hospital for donation</li>
              <li><strong>Medical Screening:</strong> Hospital staff will conduct additional health checks</li>
              <li><strong>Donation Process:</strong> The actual blood donation (usually 10-15 minutes)</li>
              <li><strong>Rest & Refreshments:</strong> Take time to rest and have refreshments</li>
              <li><strong>Upload Proof:</strong> Take a photo of your donation certificate/receipt</li>
              <li><strong>Get Certificate:</strong> Receive your verified donation certificate</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorHealthChecklistPage;