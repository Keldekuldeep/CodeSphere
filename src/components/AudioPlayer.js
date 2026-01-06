import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ audioUrl, isEmergency = false, patientName = 'Patient' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Audio could not be loaded');
      setLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing audio:', error);
        setError('Could not play audio');
      });
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <div className={`audio-player ${isEmergency ? 'emergency' : ''}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="audio-header">
        <div className="audio-icon">
          {isEmergency ? '🆘' : '🎙️'}
        </div>
        <div className="audio-info">
          <h4>{isEmergency ? 'Emergency Voice Message' : 'Voice Message'}</h4>
          <p>From: {patientName}</p>
        </div>
      </div>

      {loading ? (
        <div className="audio-loading">
          <div className="loading-spinner"></div>
          <span>Loading audio...</span>
        </div>
      ) : error ? (
        <div className="audio-error">
          <span>❌ {error}</span>
        </div>
      ) : (
        <div className="audio-controls">
          <button 
            onClick={togglePlayPause}
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            disabled={loading}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="audio-progress">
            <div 
              className="progress-bar"
              onClick={handleSeek}
            >
              <div 
                className="progress-fill"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="time-display">
              <span className="current-time">{formatTime(currentTime)}</span>
              <span className="duration">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .audio-player {
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 12px;
          padding: 15px;
          margin: 15px 0;
          transition: all 0.3s ease;
        }

        .audio-player.emergency {
          background: #fff3cd;
          border-color: #ffc107;
          box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
        }

        .audio-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .audio-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 123, 255, 0.1);
          border-radius: 50%;
        }

        .emergency .audio-icon {
          background: rgba(255, 193, 7, 0.2);
          animation: pulse-emergency 2s infinite;
        }

        @keyframes pulse-emergency {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .audio-info h4 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 16px;
        }

        .audio-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .audio-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          padding: 20px;
          color: #666;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .audio-error {
          text-align: center;
          padding: 20px;
          color: #dc3545;
        }

        .audio-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .play-button {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          background: #007bff;
          color: white;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .play-button:hover {
          background: #0056b3;
          transform: scale(1.05);
        }

        .play-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
        }

        .emergency .play-button {
          background: #ffc107;
          color: #212529;
        }

        .emergency .play-button:hover {
          background: #e0a800;
        }

        .audio-progress {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar {
          height: 6px;
          background: #e9ecef;
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #007bff;
          border-radius: 3px;
          transition: width 0.1s ease;
        }

        .emergency .progress-fill {
          background: #ffc107;
        }

        .time-display {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        @media (max-width: 768px) {
          .audio-header {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }
          
          .audio-controls {
            flex-direction: column;
            gap: 10px;
          }
          
          .audio-progress {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;