export class AudioManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.audioContext = null;
        this.sounds = {};
        this.musicGainNode = null;
        this.soundGainNode = null;
        this.masterGainNode = null;
        
        // Audio settings
        this.musicVolume = 0.3;
        this.soundVolume = 0.5;
        this.masterVolume = 1.0;
        
        // Background music oscillator
        this.backgroundMusic = null;
        this.musicInterval = null;
    }

    async init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.masterGainNode = this.audioContext.createGain();
            this.musicGainNode = this.audioContext.createGain();
            this.soundGainNode = this.audioContext.createGain();
            
            // Connect gain nodes
            this.musicGainNode.connect(this.masterGainNode);
            this.soundGainNode.connect(this.masterGainNode);
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.updateVolumes();
            
            // Create procedural sounds
            this.createSounds();
            
            // Start background music
            this.startBackgroundMusic();
            
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    createSounds() {
        this.sounds = {
            pop: this.createPopSound(),
            bomb: this.createBombSound(),
            star: this.createStarSound(),
            decoy: this.createDecoySound(),
            levelUp: this.createLevelUpSound(),
            gameOver: this.createGameOverSound(),
            miss: this.createMissSound(),
            powerUp: this.createPowerUpSound()
        };
    }

    createOscillator(type, frequency, duration, volume = 0.5) {
        return () => {
            if (!this.settingsManager.isSoundEnabled()) return;
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * this.soundVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createPopSound() {
        return () => {
            if (!this.settingsManager.isSoundEnabled()) return;
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3 * this.soundVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    createBombSound() {
        return () => {
            if (!this.settingsManager.isSoundEnabled()) return;
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Create explosion sound with multiple oscillators
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            oscillator1.type = 'sawtooth';
            oscillator1.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.3);
            
            oscillator2.type = 'square';
            oscillator2.frequency.setValueAtTime(100, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.3);
            
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filterNode.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4 * this.soundVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            
            oscillator1.connect(filterNode);
            oscillator2.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            oscillator1.start(this.audioContext.currentTime);
            oscillator2.start(this.audioContext.currentTime);
            oscillator1.stop(this.audioContext.currentTime + 0.3);
            oscillator2.stop(this.audioContext.currentTime + 0.3);
        };
    }

    createStarSound() {
        return this.createOscillator('sine', 1200, 0.3, 0.4);
    }

    createDecoySound() {
        return this.createOscillator('square', 300, 0.15, 0.3);
    }

    createLevelUpSound() {
        return () => {
            if (!this.settingsManager.isSoundEnabled()) return;
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.1);
                gainNode.gain.linearRampToValueAtTime(0.2 * this.soundVolume, this.audioContext.currentTime + index * 0.1 + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + index * 0.1 + 0.2);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.soundGainNode);
                
                oscillator.start(this.audioContext.currentTime + index * 0.1);
                oscillator.stop(this.audioContext.currentTime + index * 0.1 + 0.2);
            });
        };
    }

    createGameOverSound() {
        return () => {
            if (!this.settingsManager.isSoundEnabled()) return;
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const notes = [659.25, 622.25, 587.33, 523.25]; // E5, Eb5, D5, C5
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.2);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.2);
                gainNode.gain.linearRampToValueAtTime(0.3 * this.soundVolume, this.audioContext.currentTime + index * 0.2 + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + index * 0.2 + 0.3);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.soundGainNode);
                
                oscillator.start(this.audioContext.currentTime + index * 0.2);
                oscillator.stop(this.audioContext.currentTime + index * 0.2 + 0.3);
            });
        };
    }

    createMissSound() {
        return this.createOscillator('triangle', 200, 0.1, 0.2);
    }

    createPowerUpSound() {
        return () => {
            if (!this.settingsManager.isSoundEnabled()) return;
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
            
            filterNode.type = 'bandpass';
            filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filterNode.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2 * this.soundVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.soundGainNode);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }

    startBackgroundMusic() {
        if (!this.settingsManager.isMusicEnabled()) return;
        
        this.stopBackgroundMusic();
        
        const playMelody = () => {
            if (!this.settingsManager.isMusicEnabled()) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            // Create a simple ambient melody
            const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
            const note = notes[Math.floor(Math.random() * notes.length)];
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime);
            
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.05 * this.musicVolume, this.audioContext.currentTime + 0.5);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.musicGainNode);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 2);
        };
        
        // Play melody every 3-5 seconds
        this.musicInterval = setInterval(() => {
            if (this.settingsManager.isMusicEnabled()) {
                playMelody();
            }
        }, 3000 + Math.random() * 2000);
    }

    stopBackgroundMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    updateVolumes() {
        if (this.masterGainNode) {
            this.masterGainNode.gain.setValueAtTime(
                this.masterVolume, 
                this.audioContext.currentTime
            );
        }
        
        if (this.musicGainNode) {
            this.musicGainNode.gain.setValueAtTime(
                this.musicVolume, 
                this.audioContext.currentTime
            );
        }
        
        if (this.soundGainNode) {
            this.soundGainNode.gain.setValueAtTime(
                this.soundVolume, 
                this.audioContext.currentTime
            );
        }
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        
        if (volume > 0 && this.settingsManager.isMusicEnabled()) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    playAmbient() {
        this.startBackgroundMusic();
    }

    pauseAmbient() {
        this.stopBackgroundMusic();
    }

    stopAmbient() {
        this.stopBackgroundMusic();
    }
}