const STORAGE_KEY = 'sharencrypt_sound_enabled';

export const isSoundEnabled = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  // Default to true if env var is missing or 'true'
  return import.meta.env.VITE_ENABLE_SOUND !== 'false';
};

export const setSoundEnabled = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEY, String(enabled));
};

export const playSound = (type: 'success' | 'error' | 'notification' | 'message') => {
  if (!isSoundEnabled()) return;

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  switch (type) {
    case 'success':
      oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1); // A5
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case 'error':
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.1); // F4
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case 'notification':
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      break;
    case 'message':
      // Gentle double ping for message
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      break;
  }
};