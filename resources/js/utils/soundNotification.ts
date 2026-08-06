// Preload audio files agar tidak ada jeda
const notificationAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/cosmic.mp3') : null;
const successAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/success.mp3') : null;

export const playNotificationSound = () => {
    try {
        if (notificationAudio) {
            // Reset ke awal jika sudah diputar
            notificationAudio.currentTime = 0;
            notificationAudio.play().catch(() => {
                playNotificationSoundFallback();
            });
        } else {
            playNotificationSoundFallback();
        }
    } catch (error) {
        console.error('Error playing notification sound:', error);
        playNotificationSoundFallback();
    }
};

// Fallback menggunakan Web Audio API jika file tidak ada
const playNotificationSoundFallback = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext);
        
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode1 = audioContext.createGain();
        const gainNode2 = audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        gainNode1.connect(audioContext.destination);
        gainNode2.connect(audioContext.destination);
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.15);
        oscillator1.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
        
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.3);
        
        gainNode1.gain.setValueAtTime(0.7, audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.4);
        oscillator2.stop(audioContext.currentTime + 0.4);
    } catch (error) {
        console.error('Error playing fallback notification sound:', error);
    }
};

export const playSuccessSound = () => {
    try {
        if (successAudio) {
            successAudio.currentTime = 0;
            successAudio.play().catch(() => {
                playSuccessSoundFallback();
            });
        } else {
            playSuccessSoundFallback();
        }
    } catch (error) {
        console.error('Error playing success sound:', error);
        playSuccessSoundFallback();
    }
};

const playSuccessSoundFallback = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.error('Error playing fallback success sound:', error);
    }
};
