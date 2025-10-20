
let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (typeof window !== 'undefined' && !audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Browsers require a user gesture to start the audio context
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

const playTone = (freq: number, duration: number, type: OscillatorType) => {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const playNoise = (duration: number) => {
    if (!audioContext) return;
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    noise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noise.start();
    noise.stop(audioContext.currentTime + duration);
}


export const SFX = {
  // UI Sounds
  buttonClick: () => {
    initAudioContext();
    playTone(800, 0.05, 'square');
  },
  turnChange: () => {
    playTone(440, 0.1, 'sine');
    setTimeout(() => playTone(550, 0.1, 'sine'), 100);
  },
  
  // Game Action Sounds
  move: () => playTone(150, 0.1, 'sine'),
  capture: () => playTone(80, 0.2, 'sawtooth'),
  surrender: () => {
    playTone(300, 0.1, 'sawtooth');
    setTimeout(() => playTone(200, 0.2, 'sawtooth'), 100);
  },

  // Gacha Sounds
  gachaDraw: () => {
    playTone(200, 0.5, 'sine');
    setTimeout(() => playTone(400, 0.5, 'sine'), 100);
    setTimeout(() => playTone(600, 0.5, 'sine'), 200);
  },
  gachaFlip: () => playTone(1000, 0.1, 'triangle'),
  
  // Game State Sounds
  gameStart: () => {
    initAudioContext();
    playTone(523.25, 0.2, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.2, 'sine'), 200); // E5
    setTimeout(() => playTone(783.99, 0.3, 'sine'), 400); // G5
  },
  gameOver: () => {
    playTone(783.99, 0.2, 'sawtooth');
    setTimeout(() => playTone(659.25, 0.2, 'sawtooth'), 200);
    setTimeout(() => playTone(523.25, 0.4, 'sawtooth'), 400);
  },

  // Ability Sounds
  playAbility: (className: string) => {
    switch (className) {
      case 'Thief':
        playTone(1200, 0.05, 'triangle');
        setTimeout(() => playTone(1500, 0.05, 'triangle'), 70);
        break;
      case 'Assassin':
        playNoise(0.15);
        setTimeout(() => playTone(100, 0.1, 'square'), 100);
        break;
      case 'Guard':
        playTone(100, 0.5, 'sawtooth');
        break;
      case 'Knight':
        const osc = audioContext!.createOscillator();
        const gain = audioContext!.createGain();
        osc.connect(gain);
        gain.connect(audioContext!.destination);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, audioContext!.currentTime);
        osc.frequency.setValueAtTime(200, audioContext!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioContext!.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + 0.4);
        osc.start();
        osc.stop(audioContext!.currentTime + 0.4);
        setTimeout(() => playNoise(0.1), 300);
        break;
      case 'Archer':
        const archerOsc = audioContext!.createOscillator();
        const archerGain = audioContext!.createGain();
        archerOsc.connect(archerGain);
        archerGain.connect(audioContext!.destination);
        archerOsc.type = 'square';
        archerGain.gain.setValueAtTime(0.2, audioContext!.currentTime);
        archerOsc.frequency.setValueAtTime(600, audioContext!.currentTime);
        archerOsc.frequency.exponentialRampToValueAtTime(200, audioContext!.currentTime + 0.1);
        archerGain.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + 0.15);
        archerOsc.start();
        archerOsc.stop(audioContext!.currentTime + 0.15);
        setTimeout(() => playNoise(0.2), 50);
        break;
      case 'Mage':
        playTone(1000, 0.3, 'sine');
        playTone(1005, 0.3, 'sine');
        setTimeout(() => {
            playTone(1200, 0.3, 'sine');
            playTone(1205, 0.3, 'sine');
        }, 100);
        break;
      case 'Healer':
        playTone(783.99, 0.4, 'sine'); // G5
        playTone(987.77, 0.4, 'sine'); // B5
        break;
    }
  },
};
