import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { createUser, createDonor, getDonorByFirebaseUid } from '../services/firebaseApi';

const TestAuthFlow = () => {
  const [status, setStatus] = useState('Ready to test');
  const [logs, setLogs] = useState([]);
  const { user, userType, userProfile } = useAuth();

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCompleteFlow = async () => {
    setStatus('Testing complete flow...');
    setLogs([]);
    
    try {
      addLog('🚀 Starting complete authentication flow test');
      
      // Step 1: Create or sign in to demo account
      addLog('📧 Step 1: Creating/signing in to demo account');
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, 'donor@demo.com', 'demo123');
        user = userCredential.user;
        addLog('✅ New Firebase Auth user created: ' + user.uid);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          addLog('🔄 User already exists, signing in...');
          const userCredential = await signInWithEmailAndPassword(auth, 'donor@demo.com', 'demo123');
          user = userCredential.user;
          addLog('✅ Signed in to existing user: ' + user.uid);
        } else {
          throw error;
        }
      }
      
      // Step 2: Create user entry
      addLog('👤 Step 2: Creating user entry');
      await createUser(user.uid, {
        email: 'donor@demo.com',
        userType: 'DONOR'
      });
      addLog('✅ User document created');
      
      // Step 3: Create donor profile
      addLog('🩸 Step 3: Creating donor profile');
      const donorData = {
        firebaseUid: user.uid,
        fullName: 'Test Donor',
        name: 'Test Donor',
        email: 'donor@demo.com',
        phone: '+91-9876543210',
        contactNumber: '+91-9876543210',
        bloodGroup: 'O_POSITIVE',
        city: 'Mumbai',
        address: '123 Test Street, Mumbai, Maharashtra',
        age: 25,
        weight: 70,
        gender: 'Male',
        isAvailable: true,
        donationCount: 5,
        rating: 4.5,
        lastDonationDate: null
      };
      
      await createDonor(donorData);
      addLog('✅ Donor profile created');
      
      // Step 4: Verify profile can be retrieved
      addLog('🔍 Step 4: Verifying profile retrieval');
      const retrievedProfile = await getDonorByFirebaseUid(user.uid);
      if (retrievedProfile) {
        addLog('✅ Profile retrieved successfully: ' + retrievedProfile.fullName);
        addLog('📋 Profile details: ' + JSON.stringify({
          id: retrievedProfile.id,
          name: retrievedProfile.fullName,
          bloodGroup: retrievedProfile.bloodGroup,
          city: retrievedProfile.city
        }, null, 2));
      } else {
        addLog('❌ Profile not found after creation');
      }
      
      addLog('🎉 Complete flow test completed successfully!');
      setStatus('✅ Test completed successfully');
      
    } catch (error) {
      addLog('❌ Test failed: ' + error.message);
      setStatus('❌ Test failed: ' + error.message);
    }
  };

  const testLogin = async () => {
    setStatus('Testing login...');
    setLogs([]);
    
    try {
      addLog('🔐 Testing login with demo credentials');
      const userCredential = await signInWithEmailAndPassword(auth, 'donor@demo.com', 'demo123');
      addLog('✅ Login successful: ' + userCredential.user.email);
      addLog('🔑 Firebase UID: ' + userCredential.user.uid);
      
      // Check profile
      const profile = await getDonorByFirebaseUid(userCredential.user.uid);
      if (profile) {
        addLog('✅ Donor profile found: ' + profile.fullName);
      } else {
        addLog('❌ No donor profile found');
      }
      
      setStatus('✅ Login test completed');
    } catch (error) {
      addLog('❌ Login failed: ' + error.message);
      setStatus('❌ Login failed: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Authentication Flow Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <h3>Current Auth State:</h3>
        <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
        <p><strong>User Type:</strong> {userType || 'Not set'}</p>
        <p><strong>Profile:</strong> {userProfile ? userProfile.fullName || userProfile.name : 'No profile'}</p>
        <p><strong>Firebase UID:</strong> {user ? user.uid : 'N/A'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testCompleteFlow}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🚀 Test Complete Flow (Create Account)
        </button>
        
        <button 
          onClick={testLogin}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔐 Test Login Only
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status: {status}</h3>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        maxHeight: '400px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <h4>Logs:</h4>
        {logs.map((log, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestAuthFlow;