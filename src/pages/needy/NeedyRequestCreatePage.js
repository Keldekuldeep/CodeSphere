import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createBloodRequestSimple, getNeedyByFirebaseUid } from '../../services/firebaseApi';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import VoiceRecorder from '../../components/VoiceRecorder';

const NeedyRequestCreatePage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    bloodGroup: '',
    units: 1,
    urgency: 'IMMEDIATE',
    hospital: '',
    city: '',
    patientName: '',
    attendantName: '',
    attendantPhone: '',
    additionalNotes: ''
  });
  const [compatibleGroups, setCompatibleGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(true); // Always enabled for immediate testing
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug logging for voice recorder
  useEffect(() => {
    console.log('🎙️ Component mounted - Initial state:');
    console.log('- Urgency:', formData.urgency);
    console.log('- ShowVoiceRecorder:', showVoiceRecorder);
    console.log('- VoiceRecorder component imported:', !!VoiceRecorder);
  }, []);

  useEffect(() => {
    console.log('🎙️ State changed:');
    console.log('- Urgency:', formData.urgency);
    console.log('- ShowVoiceRecorder:', showVoiceRecorder);
    console.log('- VoiceBlob:', !!voiceBlob);
  }, [formData.urgency, showVoiceRecorder, voiceBlob]);

  const bloodGroups = [
    { value: 'A_POSITIVE', label: 'A+' },
    { value: 'A_NEGATIVE', label: 'A-' },
    { value: 'B_POSITIVE', label: 'B+' },
    { value: 'B_NEGATIVE', label: 'B-' },
    { value: 'AB_POSITIVE', label: 'AB+' },
    { value: 'AB_NEGATIVE', label: 'AB-' },
    { value: 'O_POSITIVE', label: 'O+' },
    { value: 'O_NEGATIVE', label: 'O-' }
  ];

  const urgencyLevels = [
    { value: 'IMMEDIATE', label: '🔴 Immediate (Life-threatening)' },
    { value: 'WITHIN_24H', label: '🟡 Within 24 Hours' },
    { value: 'SCHEDULED', label: '🟢 Scheduled (Planned surgery)' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUrgencyChange = (e) => {
    const urgency = e.target.value;
    console.log('🎙️ Urgency changed to:', urgency);
    
    setFormData({
      ...formData,
      urgency: urgency
    });
    
    // ALWAYS show voice recorder for testing - user reported it's not showing
    setShowVoiceRecorder(true);
    console.log('🎙️ Voice recorder ALWAYS enabled for testing');
  };

  const handleVoiceRecording = (audioBlob) => {
    setVoiceBlob(audioBlob);
    console.log('🎙️ Voice recording received:', !!audioBlob);
  };

  const handleBloodGroupChange = async (e) => {
    const selectedGroup = e.target.value;
    setFormData({
      ...formData,
      bloodGroup: selectedGroup
    });

    // Show compatible blood groups (Firebase-only logic)
    if (selectedGroup) {
      const mockCompatibleGroups = {
        'A_POSITIVE': ['A+', 'A-', 'O+', 'O-'],
        'A_NEGATIVE': ['A-', 'O-'],
        'B_POSITIVE': ['B+', 'B-', 'O+', 'O-'],
        'B_NEGATIVE': ['B-', 'O-'],
        'AB_POSITIVE': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB_NEGATIVE': ['A-', 'B-', 'AB-', 'O-'],
        'O_POSITIVE': ['O+', 'O-'],
        'O_NEGATIVE': ['O-']
      };
      
      setCompatibleGroups(mockCompatibleGroups[selectedGroup] || []);
      setShowCompatibility(true);
    } else {
      setShowCompatibility(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔥 Form submission started');
    console.log('📋 Form data:', formData);
    console.log('👤 User:', user?.email);
    console.log('🎙️ Voice blob:', !!voiceBlob);

    if (!user) {
      setError('Please login first to create blood request');
      setLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields = ['patientName', 'bloodGroup', 'hospital', 'city', 'attendantName', 'attendantPhone'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Getting needy profile for UID:', user.uid);
      
      // Get needy profile from Firebase
      const needyProfile = await getNeedyByFirebaseUid(user.uid);
      console.log('👤 Needy profile found:', !!needyProfile);
      
      if (!needyProfile) {
        setError('Please complete your needy registration first');
        setLoading(false);
        return;
      }

      const requestData = {
        firebaseUid: user.uid,
        needyId: needyProfile.id,
        needyName: needyProfile.name || needyProfile.fullName,
        patientName: formData.patientName.trim(),
        bloodGroup: formData.bloodGroup,
        unitsNeeded: parseInt(formData.units),
        urgency: formData.urgency,
        hospital: formData.hospital.trim(),
        city: formData.city.trim(),
        attendantName: formData.attendantName.trim(),
        contactNumber: formData.attendantPhone.trim(),
        additionalNotes: formData.additionalNotes.trim(),
        hasVoiceMessage: !!voiceBlob
      };

      console.log('🔥 Creating blood request in Firebase:', requestData);
      
      // Show progress message
      const progressMessages = [
        'Creating blood request...',
        'Validating information...',
        'Saving to database...',
        'Preparing donor notifications...'
      ];
      
      let messageIndex = 0;
      const progressInterval = setInterval(() => {
        if (messageIndex < progressMessages.length - 1) {
          messageIndex++;
          // Update button text if still loading
          const button = document.querySelector('button[type="submit"]');
          if (button && loading) {
            const span = button.querySelector('span');
            if (span) {
              span.innerHTML = `
                <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></span>
                ${progressMessages[messageIndex]}
              `;
            }
          }
        }
      }, 2000);
      
      // Create request with timeout
      const requestId = await createBloodRequestSimple(requestData, voiceBlob);
      
      clearInterval(progressInterval);
      console.log('✅ Blood request created in Firebase:', requestId);
      
      // Navigate to status page
      navigate(`/needy/request/status/${requestId}`);
      
    } catch (error) {
      console.error('❌ Request creation error:', error);
      console.error('❌ Error details:', error.message, error.stack);
      
      // More specific error messages
      if (error.message.includes('timed out')) {
        setError('Request creation is taking longer than expected. Please check your internet connection and try again.');
      } else if (error.message.includes('permission')) {
        setError('Permission denied. Please check your account permissions.');
      } else if (error.message.includes('network')) {
        setError('Network error. Please check your internet connection.');
      } else if (error.message.includes('Firebase')) {
        setError('Database error: ' + error.message);
      } else {
        setError(error.message || 'Failed to create request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="needy-request-create">
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div>
            <h1>🆘 Create Blood Request</h1>
            <p>Create urgent blood request - Firebase Only</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
      
      <div className="container">
        {/* Emergency Banner */}
        <div className="card" style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626' }}>🚨 Life-Threatening Emergency</h3>
            <p style={{ color: '#dc2626', marginTop: '10px' }}>
              Call Emergency Helpline: <strong>+91-9876543210</strong>
            </p>
            <p style={{ fontSize: '14px', marginTop: '5px' }}>
              Continue filling this form while calling for immediate help
            </p>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            <h2>Blood Requirement Details / रक्त आवश्यकता विवरण</h2>
            
            <div className="form-group">
              <label htmlFor="patientName">Patient Name / मरीज़ का नाम *</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="Enter patient name"
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group Required *</label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleBloodGroupChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="units">Units Required *</label>
                <select
                  id="units"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  required
                >
                  <option value={1}>1 Unit</option>
                  <option value={2}>2 Units</option>
                  <option value={3}>3 Units</option>
                  <option value={4}>4 Units</option>
                  <option value={5}>5+ Units</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="urgency">Urgency Level *</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleUrgencyChange}
                  required
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
                {formData.urgency === 'IMMEDIATE' && (
                  <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                    🎙️ Voice message option available for immediate emergencies
                  </small>
                )}
              </div>
            </div>

            {showCompatibility && compatibleGroups.length > 0 && (
              <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: '20px' }}>
                <h4 style={{ color: '#059669' }}>💡 Compatible Blood Groups</h4>
                <p style={{ color: '#059669', marginTop: '10px' }}>
                  For <strong>{formData.bloodGroup}</strong>, these blood groups can also donate:
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {compatibleGroups.map(group => (
                    <span key={group} style={{
                      padding: '4px 12px',
                      backgroundColor: '#bbf7d0',
                      color: '#059669',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {group}
                    </span>
                  ))}
                </div>
                <small style={{ color: '#059669', marginTop: '10px', display: 'block' }}>
                  Our system will automatically notify donors with compatible blood groups
                </small>
              </div>
            )}

            {/* Voice Recorder for Emergency Cases */}
            {showVoiceRecorder && (
              <div style={{ 
                margin: '20px 0',
                border: '3px solid #dc3545',
                borderRadius: '8px',
                padding: '20px',
                background: '#fff'
              }}>
                <div style={{ 
                  background: '#fff3cd', 
                  border: '2px solid #ffc107', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px' 
                }}>
                  <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>
                    🎙️ Emergency Voice Message
                  </h4>
                  <p style={{ color: '#856404', margin: '0', fontSize: '14px' }}>
                    Record a voice message to help donors understand the emergency situation better. 
                    This will be sent to all matching donors along with your request.
                  </p>
                </div>
                <VoiceRecorder 
                  onRecordingComplete={handleVoiceRecording}
                  maxDuration={60}
                />
              </div>
            )}

            <h3 style={{ marginTop: '30px' }}>Hospital Information / अस्पताल की जानकारी</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="hospital">Hospital Name *</label>
                <input
                  type="text"
                  id="hospital"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  required
                />
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Contact Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="attendantName">Attendant Name *</label>
                <input
                  type="text"
                  id="attendantName"
                  name="attendantName"
                  value={formData.attendantName}
                  onChange={handleChange}
                  placeholder="Person coordinating at hospital"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="attendantPhone">Attendant Phone *</label>
                <input
                  type="tel"
                  id="attendantPhone"
                  name="attendantPhone"
                  value={formData.attendantPhone}
                  onChange={handleChange}
                  placeholder="+91XXXXXXXXXX"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="additionalNotes">Additional Notes (Optional)</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information for donors (patient condition, specific requirements, etc.)"
              />
            </div>

            {error && (
              <div className="error" style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #f5c6cb',
                margin: '20px 0'
              }}>
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button 
                type="button"
                onClick={() => navigate('/needy')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ 
                  flex: 2,
                  background: loading ? '#6c757d' : '#dc3545',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <span>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid #ffffff', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px'
                    }}></span>
                    Creating Request...
                  </span>
                ) : '🆘 Create Blood Request'}
              </button>
            </div>

            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NeedyRequestCreatePage;