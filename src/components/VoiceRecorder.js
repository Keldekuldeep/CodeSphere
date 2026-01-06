import React, { useState, useRef, useEffect } from 'react';

const VoiceRecorder = ({ onRecordingComplete, maxDuration = 60 }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Cleanup media recorder
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        } catch (error) {
          console.warn('⚠️ MediaRecorder cleanup warning:', error);
        }
        mediaRecorderRef.current = null;
      }
      
      // Cleanup audio element
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          if (audioRef.current.src) {
            URL.revokeObjectURL(audioRef.current.src);
            audioRef.current.src = '';
          }
        } catch (error) {
          console.warn('⚠️ Audio cleanup warning:', error);
        }
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('🎙️ Starting voice recording...');
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('🎙️ Recording stopped');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setHasRecording(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Call parent callback
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop at max duration
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          
          return newTime;
        });
      }, 1000);
      
      console.log('✅ Recording started successfully');
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      alert('माइक्रोफोन access नहीं मिल सका। कृपया permission दें और फिर कोशिश करें।');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      try {
        // Stop any currently playing audio first
        if (audioRef.current.src) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        
        // Add error handling for audio playback
        audioRef.current.onerror = (error) => {
          console.error('❌ Audio playback error:', error);
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('❌ Audio play failed:', error);
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        });
        
      } catch (error) {
        console.error('❌ Error playing recording:', error);
        setIsPlaying(false);
      }
    }
  };

  const deleteRecording = () => {
    try {
      // Stop any playing audio first
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = '';
        }
      }
      
      setAudioBlob(null);
      setHasRecording(false);
      setRecordingTime(0);
      setIsPlaying(false);
      
      if (onRecordingComplete) {
        onRecordingComplete(null);
      }
    } catch (error) {
      console.error('❌ Error deleting recording:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder">
      <audio ref={audioRef} style={{ display: 'none' }} />
      
      <div className="recorder-header">
        <h4>🎙️ Emergency Voice Message</h4>
        <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
          Record a voice message to help donors understand the emergency (Max {maxDuration}s)
        </p>
      </div>

      <div className="recorder-controls">
        {!hasRecording ? (
          <div className="recording-section">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="record-btn start-record"
                type="button"
              >
                🎙️ Start Recording
              </button>
            ) : (
              <div className="recording-active">
                <button
                  onClick={stopRecording}
                  className="record-btn stop-record"
                  type="button"
                >
                  ⏹️ Stop Recording
                </button>
                <div className="recording-indicator">
                  <div className="recording-dot"></div>
                  <span className="recording-time">{formatTime(recordingTime)}</span>
                  <div className="recording-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="playback-section">
            <div className="recording-info">
              <span className="recording-duration">📼 Recorded: {formatTime(recordingTime)}</span>
            </div>
            
            <div className="playback-controls">
              <button
                onClick={playRecording}
                className="play-btn"
                disabled={isPlaying}
                type="button"
              >
                {isPlaying ? '⏸️ Playing...' : '▶️ Play'}
              </button>
              
              <button
                onClick={deleteRecording}
                className="delete-btn"
                type="button"
              >
                🗑️ Delete
              </button>
              
              <button
                onClick={startRecording}
                className="re-record-btn"
                type="button"
              >
                🔄 Re-record
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .voice-recorder {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }

        .recorder-header h4 {
          margin: 0 0 5px 0;
          color: #856404;
        }

        .recorder-controls {
          margin-top: 15px;
        }

        .record-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .start-record {
          background: #dc3545;
          color: white;
        }

        .start-record:hover {
          background: #c82333;
          transform: translateY(-2px);
        }

        .stop-record {
          background: #6c757d;
          color: white;
        }

        .stop-record:hover {
          background: #5a6268;
        }

        .recording-active {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(220, 53, 69, 0.1);
          padding: 10px 20px;
          border-radius: 25px;
          border: 2px solid #dc3545;
        }

        .recording-dot {
          width: 12px;
          height: 12px;
          background: #dc3545;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .recording-time {
          font-weight: bold;
          color: #dc3545;
          font-size: 18px;
          min-width: 50px;
        }

        .recording-progress {
          width: 100px;
          height: 4px;
          background: rgba(220, 53, 69, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #dc3545;
          transition: width 0.3s ease;
        }

        .playback-section {
          text-align: center;
        }

        .recording-info {
          margin-bottom: 15px;
        }

        .recording-duration {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          border: 1px solid #28a745;
        }

        .playback-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .play-btn, .delete-btn, .re-record-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .play-btn {
          background: #28a745;
          color: white;
        }

        .play-btn:hover:not(:disabled) {
          background: #218838;
        }

        .play-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .delete-btn {
          background: #dc3545;
          color: white;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .re-record-btn {
          background: #ffc107;
          color: #212529;
        }

        .re-record-btn:hover {
          background: #e0a800;
        }

        @media (max-width: 768px) {
          .playback-controls {
            flex-direction: column;
            align-items: center;
          }
          
          .play-btn, .delete-btn, .re-record-btn {
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecorder;