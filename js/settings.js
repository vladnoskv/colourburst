export class SettingsManager {
    constructor() {
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal',
            particlesEnabled: true,
            vibrationsEnabled: true,
            highScores: {
                classic: 0,
                timeAttack: 0,
                zen: 0
            },
            statistics: {
                totalGamesPlayed: 0,
                totalOrbsPopped: 0,
                totalPlayTime: 0,
                favoriteMode: 'classic'
            }
        };
        
        this.listeners = new Map();
        this.storageKey = 'colorburst-settings';
    }

    async load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
            
            // Ensure all properties exist
            this.validateSettings();
            
            console.log('Settings loaded:', this.settings);
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    validateSettings() {
        // Ensure highScores object exists
        if (!this.settings.highScores) {
            this.settings.highScores = {
                classic: 0,
                timeAttack: 0,
                zen: 0
            };
        }
        
        // Ensure statistics object exists
        if (!this.settings.statistics) {
            this.settings.statistics = {
                totalGamesPlayed: 0,
                totalOrbsPopped: 0,
                totalPlayTime: 0,
                favoriteMode: 'classic'
            };
        }
    }

    // Getters
    isSoundEnabled() {
        return this.settings.soundEnabled;
    }

    isMusicEnabled() {
        return this.settings.musicEnabled;
    }

    getDifficulty() {
        return this.settings.difficulty;
    }

    areParticlesEnabled() {
        return this.settings.particlesEnabled;
    }

    areVibrationsEnabled() {
        return this.settings.vibrationsEnabled;
    }

    getHighScore(mode) {
        return this.settings.highScores[mode] || 0;
    }

    getAllHighScores() {
        return { ...this.settings.highScores };
    }

    getStatistics() {
        return { ...this.settings.statistics };
    }

    // Setters
    setSoundEnabled(enabled) {
        const oldValue = this.settings.soundEnabled;
        this.settings.soundEnabled = enabled;
        this.save();
        this.notify('soundEnabled', enabled, oldValue);
    }

    setMusicEnabled(enabled) {
        const oldValue = this.settings.musicEnabled;
        this.settings.musicEnabled = enabled;
        this.save();
        this.notify('musicEnabled', enabled, oldValue);
    }

    setDifficulty(difficulty) {
        const validDifficulties = ['easy', 'normal', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            console.warn(`Invalid difficulty: ${difficulty}`);
            return;
        }
        
        const oldValue = this.settings.difficulty;
        this.settings.difficulty = difficulty;
        this.save();
        this.notify('difficulty', difficulty, oldValue);
    }

    setParticlesEnabled(enabled) {
        const oldValue = this.settings.particlesEnabled;
        this.settings.particlesEnabled = enabled;
        this.save();
        this.notify('particlesEnabled', enabled, oldValue);
    }

    setVibrationsEnabled(enabled) {
        const oldValue = this.settings.vibrationsEnabled;
        this.settings.vibrationsEnabled = enabled;
        this.save();
        this.notify('vibrationsEnabled', enabled, oldValue);
    }

    updateHighScore(mode, score) {
        if (this.settings.highScores[mode] === undefined) {
            this.settings.highScores[mode] = 0;
        }
        
        if (score > this.settings.highScores[mode]) {
            this.settings.highScores[mode] = score;
            this.save();
            this.notify('highScore', { mode, score });
            return true;
        }
        return false;
    }

    updateStatistics(gameStats) {
        const stats = this.settings.statistics;
        
        stats.totalGamesPlayed++;
        stats.totalOrbsPopped += gameStats.orbsPopped || 0;
        stats.totalPlayTime += gameStats.duration || 0;
        
        // Update favorite mode
        const modeCounts = stats.modeCounts || {};
        modeCounts[gameStats.mode] = (modeCounts[gameStats.mode] || 0) + 1;
        
        let favoriteMode = 'classic';
        let maxCount = 0;
        
        for (const [mode, count] of Object.entries(modeCounts)) {
            if (count > maxCount) {
                maxCount = count;
                favoriteMode = mode;
            }
        }
        
        stats.favoriteMode = favoriteMode;
        stats.modeCounts = modeCounts;
        
        this.save();
    }

    // Event system
    addListener(setting, callback) {
        if (!this.listeners.has(setting)) {
            this.listeners.set(setting, []);
        }
        this.listeners.get(setting).push(callback);
    }

    removeListener(setting, callback) {
        if (this.listeners.has(setting)) {
            const callbacks = this.listeners.get(setting);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notify(setting, newValue, oldValue) {
        if (this.listeners.has(setting)) {
            this.listeners.get(setting).forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error('Error in settings listener:', error);
                }
            });
        }
    }

    // Reset methods
    resetSetting(setting) {
        const defaults = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal',
            particlesEnabled: true,
            vibrationsEnabled: true
        };
        
        if (defaults.hasOwnProperty(setting)) {
            this[setting] = defaults[setting];
            this.save();
        }
    }

    resetAllSettings() {
        const defaults = {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal',
            particlesEnabled: true,
            vibrationsEnabled: true
        };
        
        Object.assign(this.settings, defaults);
        this.save();
    }

    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    importSettings(settingsJson) {
        try {
            const imported = JSON.parse(settingsJson);
            this.settings = { ...this.settings, ...imported };
            this.validateSettings();
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }

    // Sync UI with current settings
    syncUI() {
        const soundToggle = document.getElementById('soundToggle');
        const musicToggle = document.getElementById('musicToggle');
        const difficultySelect = document.getElementById('difficultySelect');
        
        if (soundToggle) soundToggle.checked = this.settings.soundEnabled;
        if (musicToggle) musicToggle.checked = this.settings.musicEnabled;
        if (difficultySelect) difficultySelect.value = this.settings.difficulty;
    }

    // Utility methods
    vibrate(duration = 50) {
        if (this.settings.vibrationsEnabled && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    getDifficultyMultiplier() {
        const multipliers = {
            easy: 0.8,
            normal: 1.0,
            hard: 1.3
        };
        return multipliers[this.settings.difficulty] || 1.0;
    }
}