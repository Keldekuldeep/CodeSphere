import React, { useState, useEffect } from 'react';

const AudioNotification = ({ request, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    let audioContext = null;
    let cleanupInterval = null;
    
    try {
      // Create audio notification sound
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create emergency sound
      const createEmergencySound = () => {
        try {
          if (!audioContext || audioContext.state === 'closed') return;
          
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
          console.warn('⚠️ Emergency sound creation warning:', error);
        }
      };

      // Play emergency sound immediately
      if (request.urgency === 'IMMEDIATE') {
        createEmergencySound();
        
        // Repeat every 2 seconds for 10 seconds
        cleanupInterval = setInterval(() => {
          createEmergencySound();
        }, 2000);
        
        setTimeout(() => {
          if (cleanupInterval) {
            clearInterval(cleanupInterval);
            cleanupInterval = null;
          }
        }, 10000);
      }
    } catch (error) {
      console.warn('⚠️ AudioContext creation warning:', error);
    }

    return () => {
      // Cleanup interval
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
      
      // Cleanup audio
      if (audio) {
        try {
          audio.pause();
        } catch (error) {
          console.warn('⚠️ Audio cleanup warning:', error);
        }
      }
      
      // Cleanup audio context
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch (error) {
          console.warn('⚠️ AudioContext cleanup warning:', error);
        }
      }
    };
  }, [request, audio]);

  const playVoiceMessage = () => {
    if (request.voiceMessage && request.voiceMessage.url) {
      const voiceAudio = new Audio(request.voiceMessage.url);
      voiceAudio.play();
      setAudio(voiceAudio);
      setIsPlaying(true);
      
      voiceAudio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Use Hindi voice if available
      const voices = speechSynthesis.getVoices();
      const hindiVoice = voices.find(voice => voice.lang.includes('hi'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleAccept = () => {
    speakText('Thank you for accepting the blood donation request. Please contact the attendant immediately.');
    onClose('ACCEPTED');
  };

  const handleReject = () => {
    speakText('Request declined. Thank you for your response.');
    onClose('REJECTED');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 1s infinite'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        border: request.urgency === 'IMMEDIATE' ? '3px solid #dc3545' : '2px solid #007bff'
      }}>
        {/* Emergency Header */}
        {request.urgency === 'IMMEDIATE' && (
          <div style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            animation: 'blink 1s infinite'
          }}>
            <h2 style={{ margin: 0, fontSize: '24px' }}>🚨 EMERGENCY BLOOD NEEDED</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>IMMEDIATE RESPONSE REQUIRED</p>
          </div>
        )}

        {/* Request Details */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            🩸 Blood Request Notification
          </h3>
          
          <div style={{ textAlign: 'left', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <p><strong>Patient:</strong> {request.patientName}</p>
            <p><strong>Blood Group:</strong> <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{request.bloodGroup}</span></p>
            <p><strong>Units Needed:</strong> {request.unitsNeeded}</p>
            <p><strong>Hospital:</strong> {request.hospital}</p>
            <p><strong>City:</strong> {request.city}</p>
            <p><strong>Attendant:</strong> {request.attendantName}</p>
            <p><strong>Phone:</strong> <a href={`tel:${request.contactNumber}`} style={{ color: '#007bff' }}>{request.contactNumber}</a></p>
            {request.additionalNotes && (
              <p><strong>Notes:</strong> {request.additionalNotes}</p>
            )}
          </div>
        </div>

        {/* Voice Message */}
        {request.voiceMessage && (
          <div style={{ marginBottom: '25px', backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
            <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>🎙️ Emergency Voice Message</h4>
            <button
              onClick={playVoiceMessage}
              disabled={isPlaying}
              style={{
                backgroundColor: '#ffc107',
                color: '#212529',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: isPlaying ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isPlaying ? '🔊 Playing...' : '▶️ Play Voice Message'}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            onClick={handleAccept}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            ✅ ACCEPT & DONATE
          </button>
          
          <button
            onClick={handleReject}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              flex: 1
            }}
          >
            ❌ CANNOT DONATE
          </button>
        </div>

        {/* Auto-close timer */}
        <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
          This notification will auto-close in 60 seconds if no action is taken.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0% { background-color: rgba(0, 0, 0, 0.9); }
          50% { background-color: rgba(220, 53, 69, 0.1); }
          100% { background-color: rgba(0, 0, 0, 0.9); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default AudioNotification;