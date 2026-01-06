import React from 'react';
import { Link } from 'react-router-dom';

const DonorHomePage = () => {
  return (
    <div className="donor-home">
      <div className="header">
        <h1>🩸 BloodSaathi - Donor Portal</h1>
        <p>Be a Hero, Donate Blood, Save Lives</p>
      </div>
      
      <div className="container">
        <div className="hero-section">
          <div className="card">
            <h2>Welcome to Donor Portal</h2>
            <p>
              Join thousands of verified blood donors who are making a difference. 
              Your donation can save up to 3 lives. Register now and be part of 
              our life-saving community.
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/donor/login" className="btn btn-primary" style={{ textDecoration: 'none', marginRight: '10px' }}>
                Login as Donor
              </Link>
              <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <div className="benefits-section" style={{ marginTop: '30px' }}>
          <div className="card">
            <h2>Why Donate Blood?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <h4>❤️ Save Lives</h4>
                <p>One donation can save up to 3 lives in emergency situations</p>
              </div>
              <div>
                <h4>🏥 Health Benefits</h4>
                <p>Regular donation helps maintain healthy iron levels and reduces heart disease risk</p>
              </div>
              <div>
                <h4>🏆 Recognition</h4>
                <p>Get verified certificates and build your donor reputation</p>
              </div>
              <div>
                <h4>📱 Smart Matching</h4>
                <p>Get notified only for requests in your area that match your blood group</p>
              </div>
            </div>
          </div>
        </div>

        <div className="process-section" style={{ marginTop: '30px' }}>
          <div className="card">
            <h2>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>1️⃣</div>
                <h4>Register</h4>
                <p>Complete your profile with medical details</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>2️⃣</div>
                <h4>Get Matched</h4>
                <p>Receive notifications for compatible requests</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>3️⃣</div>
                <h4>Donate</h4>
                <p>Visit the hospital and donate blood</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>4️⃣</div>
                <h4>Get Certified</h4>
                <p>Upload proof and receive verified certificate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="eligibility-section" style={{ marginTop: '30px' }}>
          <div className="card">
            <h2>Donation Eligibility</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
              <div>
                <h4 style={{ color: '#059669' }}>✅ You Can Donate If:</h4>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Age between 18-65 years</li>
                  <li>Weight above 50 kg</li>
                  <li>Good general health</li>
                  <li>90+ days since last donation</li>
                  <li>No fever or illness</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: '#dc2626' }}>❌ Please Wait If:</h4>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Recent illness or fever</li>
                  <li>Donated blood in last 90 days</li>
                  <li>Taking certain medications</li>
                  <li>Recent surgery or dental work</li>
                  <li>Pregnancy or breastfeeding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorHomePage;