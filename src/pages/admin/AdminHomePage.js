import React from 'react';
import { Link } from 'react-router-dom';

const AdminHomePage = () => {
  return (
    <div className="admin-home">
      <div className="header">
        <h1>⚙️ BloodSaathi - Admin Portal</h1>
        <p>Manage and Monitor the Blood Donation Platform</p>
      </div>
      
      <div className="container">
        <div className="hero-section">
          <div className="card">
            <h2>Admin Dashboard</h2>
            <p>
              Comprehensive administrative control for managing donors, requests, 
              feedback, and platform analytics.
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/admin/login" className="btn btn-primary" style={{ textDecoration: 'none', marginRight: '10px' }}>
                Admin Login
              </Link>
              <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <div className="features-section" style={{ marginTop: '30px' }}>
          <div className="card">
            <h2>Admin Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <h4>👥 Donor Management</h4>
                <p>View, verify, and manage all registered blood donors</p>
              </div>
              <div>
                <h4>🆘 Request Monitoring</h4>
                <p>Track all blood requests and their fulfillment status</p>
              </div>
              <div>
                <h4>🛡️ Fraud Detection</h4>
                <p>AI-powered scam detection and feedback moderation</p>
              </div>
              <div>
                <h4>🏆 Certificate Approval</h4>
                <p>Review and approve donation certificates</p>
              </div>
              <div>
                <h4>📊 Analytics Dashboard</h4>
                <p>Comprehensive platform statistics and insights</p>
              </div>
              <div>
                <h4>🔧 System Management</h4>
                <p>Platform configuration and maintenance tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;