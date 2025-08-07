export class SettingsManager {
    constructor() {
        this.difficulties = {
            easy: {
                name: 'Easy',
                speed: 100,
                spawn: 1.5,
                bombChance: 0.05,
                points: 1,
                lives: 15,
                lifeRule: 'miss'
            },
            normal: {
                name: 'Normal',
                speed: 140,
                spawn: 1.2,
                bombChance: 0.08,
                points: 2,
                lives: 10,
                lifeRule: 'miss'
            },
            hard: {
                name: 'Hard',
                speed: 180,
                spawn: 0.9,
                bombChance: 0.12,
                points: 3,
                lives: 5,
                lifeRule: 'twoMiss'
            },
            ranked: {
                name: 'Ranked',
                speed: 140,
                spawn: 1.2,
                bombChance: 0.08,
                points: 2,
                lives: 10,
                lifeRule: 'miss'
            }
        };
        
        this.currentDifficulty = 'normal';
        this.settings = this.loadSettings();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('colorBurstSettings');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
        
        return {
            difficulty: 'normal',
            soundEnabled: true,
            musicEnabled: true,
            particlesEnabled: true,
            animationsEnabled: true
        };
    }
    
    saveSettings() {
        localStorage.setItem('colorBurstSettings', JSON.stringify(this.settings));
    }
    
    getDifficulty() {
        return this.difficulties[this.settings.difficulty];
    }
    
    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.settings.difficulty = difficulty;
            this.saveSettings();
        }
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
    
    resetToDefaults() {
        this.settings = {
            difficulty: 'normal',
            soundEnabled: true,
            musicEnabled: true,
            particlesEnabled: true,
            animationsEnabled: true
        };
        this.saveSettings();
    }
    
    getShapeForLevel(level) {
        const shapes = ['circle', 'square', 'tri', 'star'];
        return shapes[level % shapes.length];
    }
}