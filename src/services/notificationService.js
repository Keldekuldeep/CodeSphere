// Notification Service for Audio Alerts
let audioContext = null;

export const initialize = async () => {
  try {
    console.log('🔊 Initializing notification service...');
    
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    console.log('✅ Notification service initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing notification service:', error);
    return false;
  }
};

export const playNotificationSound = async () => {
  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Create a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    return true;
  } catch (error) {
    console.error('Error playing notification sound:', error);
    return false;
  }
};

export const cleanup = () => {
  if (audioContext && audioContext.state !== 'closed') {
    try {
      audioContext.close();
    } catch (error) {
      console.error('Error closing audio context:', error);
    }
  }
  audioContext = null;
};

// Default export for backward compatibility
const notificationService = {
  initialize,
  playNotificationSound,
  cleanup
};

export default notificationService;