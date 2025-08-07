export class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = new Map();
        this.currentScreen = 'loading';
        this.screenHistory = [];
        this.updateQueue = [];
        this.isAnimating = false;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        console.log('UIManager: Initializing elements...');
        // Cache frequently used elements
        this.elements.set('loadingScreen', document.getElementById('loadingScreen'));
        this.elements.set('mainMenu', document.getElementById('mainMenu'));
        this.elements.set('gameUI', document.getElementById('gameUI'));
        this.elements.set('gameOver', document.getElementById('gameOver'));
        this.elements.set('settingsPanel', document.getElementById('settingsPanel'));
        
        // Game UI elements
        this.elements.set('scoreDisplay', document.getElementById('scoreDisplay'));
        this.elements.set('levelDisplay', document.getElementById('levelDisplay'));
        this.elements.set('timeDisplay', document.getElementById('timeDisplay'));
        this.elements.set('progressBar', document.getElementById('progressBar'));
        this.elements.set('comboDisplay', document.getElementById('comboDisplay'));
        this.elements.set('powerUpIndicator', document.getElementById('powerUpIndicator'));
        this.elements.set('pauseOverlay', document.getElementById('pauseOverlay'));
        
        // Menu elements
        this.elements.set('highScoreDisplay', document.getElementById('highScoreDisplay'));
        this.elements.set('lastScoreDisplay', document.getElementById('lastScoreDisplay'));
        this.elements.set('modeButtons', document.querySelectorAll('.mode-button'));
        this.elements.set('shopButton', document.getElementById('shopButton'));
        
        // Settings elements
        this.elements.set('soundToggle', document.getElementById('soundToggle'));
        this.elements.set('musicToggle', document.getElementById('musicToggle'));
        this.elements.set('difficultySelect', document.getElementById('difficultySelect'));
        this.elements.set('particlesToggle', document.getElementById('particlesToggle'));
        this.elements.set('vibrationsToggle', document.getElementById('vibrationsToggle'));
        
        // Debug: Check if elements were found
        console.log('UIManager: Elements initialized:', Array.from(this.elements.entries()).map(([key, value]) => [key, !!value]));
    }

    setupEventListeners() {
        // Menu navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.currentScreen === 'gameUI') {
                    this.game.togglePause();
                } else if (this.currentScreen === 'settingsPanel') {
                    this.showScreen('mainMenu');
                }
            }
        });

        // Settings listeners
        const soundToggle = this.elements.get('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.game.settings.setSoundEnabled(e.target.checked);
            });
        }

        const musicToggle = this.elements.get('musicToggle');
        if (musicToggle) {
            musicToggle.addEventListener('change', (e) => {
                this.game.settings.setMusicEnabled(e.target.checked);
            });
        }

        const difficultySelect = this.elements.get('difficultySelect');
        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.game.settings.setDifficulty(e.target.value);
            });
        }

        const particlesToggle = this.elements.get('particlesToggle');
        if (particlesToggle) {
            particlesToggle.addEventListener('change', (e) => {
                this.game.settings.setParticlesEnabled(e.target.value);
            });
        }

        const vibrationsToggle = this.elements.get('vibrationsToggle');
        if (vibrationsToggle) {
            vibrationsToggle.addEventListener('change', (e) => {
                this.game.settings.setVibrationsEnabled(e.target.value);
            });
        }
    }

    showScreen(screenName, transition = true) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const currentScreenEl = this.getScreenElement(this.currentScreen);
        const newScreenEl = this.getScreenElement(screenName);

        if (!newScreenEl) {
            console.warn(`Screen ${screenName} not found`);
            this.isAnimating = false;
            return;
        }

        if (transition) {
            this.transitionScreen(currentScreenEl, newScreenEl, screenName);
        } else {
            this.switchScreen(currentScreenEl, newScreenEl, screenName);
        }
    }

    transitionScreen(currentScreenEl, newScreenEl, screenName) {
        if (currentScreenEl) {
            currentScreenEl.classList.add('screen-exit');
            setTimeout(() => {
                currentScreenEl.classList.remove('active', 'screen-exit');
                newScreenEl.classList.add('active', 'screen-enter');
                
                setTimeout(() => {
                    newScreenEl.classList.remove('screen-enter');
                    this.currentScreen = screenName;
                    this.screenHistory.push(screenName);
                    this.isAnimating = false;
                    this.onScreenChange(screenName);
                }, 300);
            }, 300);
        } else {
            newScreenEl.classList.add('active');
            this.currentScreen = screenName;
            this.screenHistory.push(screenName);
            this.isAnimating = false;
            this.onScreenChange(screenName);
        }
    }

    switchScreen(currentScreenEl, newScreenEl, screenName) {
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }
        newScreenEl.classList.add('active');
        this.currentScreen = screenName;
        this.screenHistory.push(screenName);
        this.isAnimating = false;
        this.onScreenChange(screenName);
    }

    getScreenElement(screenName) {
        return this.elements.get(screenName);
    }

    onScreenChange(screenName) {
        // Update UI based on new screen
        switch (screenName) {
            case 'mainMenu':
                this.updateMainMenu();
                break;
            case 'gameUI':
                this.updateGameUI();
                break;
            case 'gameOver':
                this.updateGameOver();
                break;
            case 'settingsPanel':
                this.updateSettingsPanel();
                break;
        }
    }

    updateMainMenu() {
        const highScoreDisplay = this.elements.get('highScoreDisplay');
        const lastScoreDisplay = this.elements.get('lastScoreDisplay');
        
        if (highScoreDisplay) {
            const allScores = this.game.settings.getAllHighScores();
            const maxScore = Math.max(...Object.values(allScores));
            highScoreDisplay.textContent = `Best: ${maxScore.toLocaleString()}`;
        }
        
        if (lastScoreDisplay && this.game.lastScore) {
            lastScoreDisplay.textContent = `Last: ${this.game.lastScore.toLocaleString()}`;
        }
    }

    updateGameUI() {
        this.updateScore(0);
        this.updateLevel(1);
        this.updateTime(0);
        this.updateProgress(0);
        this.hideCombo();
    }

    updateGameOver() {
        const finalScore = this.elements.get('finalScore');
        const newRecord = this.elements.get('newRecord');
        const gameStats = this.elements.get('gameStats');
        
        if (finalScore) {
            finalScore.textContent = this.game.score.toLocaleString();
        }
        
        if (newRecord) {
            const isNewRecord = this.game.isNewRecord;
            newRecord.style.display = isNewRecord ? 'block' : 'none';
        }
        
        if (gameStats) {
            gameStats.innerHTML = `
                <div class="stat">
                    <span class="stat-label">Orbs Popped:</span>
                    <span class="stat-value">${this.game.orbsPopped}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Combos:</span>
                    <span class="stat-value">${this.game.maxCombo}x</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Power-ups:</span>
                    <span class="stat-value">${this.game.powerUpsUsed}</span>
                </div>
            `;
        }
    }

    updateSettingsPanel() {
        this.game.settings.syncUI();
    }

    updateScore(score) {
        const scoreDisplay = this.elements.get('scoreDisplay');
        if (scoreDisplay) {
            this.animateNumber(scoreDisplay, score);
        }
    }

    updateLevel(level) {
        const levelDisplay = this.elements.get('levelDisplay');
        if (levelDisplay) {
            levelDisplay.textContent = level;
        }
    }

    updateTime(time) {
        const timeDisplay = this.elements.get('timeDisplay');
        if (timeDisplay) {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateProgress(progress) {
        const progressBar = this.elements.get('progressBar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }

    showCombo(combo) {
        const comboDisplay = this.elements.get('comboDisplay');
        if (comboDisplay && combo > 1) {
            comboDisplay.textContent = `${combo}x COMBO!`;
            comboDisplay.classList.add('show');
            
            clearTimeout(this.comboTimeout);
            this.comboTimeout = setTimeout(() => {
                this.hideCombo();
            }, 2000);
        }
    }

    hideCombo() {
        const comboDisplay = this.elements.get('comboDisplay');
        if (comboDisplay) {
            comboDisplay.classList.remove('show');
        }
    }

    showPowerUpIndicator(type, duration) {
        const powerUpIndicator = this.elements.get('powerUpIndicator');
        if (powerUpIndicator) {
            powerUpIndicator.innerHTML = `
                <div class="power-up-active">
                    <span class="power-up-icon">${this.getPowerUpIcon(type)}</span>
                    <span class="power-up-timer">${Math.ceil(duration / 1000)}s</span>
                </div>
            `;
            powerUpIndicator.classList.add('show');
        }
    }

    hidePowerUpIndicator() {
        const powerUpIndicator = this.elements.get('powerUpIndicator');
        if (powerUpIndicator) {
            powerUpIndicator.classList.remove('show');
        }
    }

    getPowerUpIcon(type) {
        const icons = {
            slowTime: '⏱️',
            multiScore: '✨',
            clearScreen: '💥'
        };
        return icons[type] || '⚡';
    }

    showPauseOverlay() {
        const pauseOverlay = this.elements.get('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.classList.add('show');
        }
    }

    hidePauseOverlay() {
        const pauseOverlay = this.elements.get('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.classList.remove('show');
        }
    }

    animateNumber(element, newValue) {
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const increment = Math.ceil((newValue - currentValue) / 10);
        
        let current = currentValue;
        const interval = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= newValue) || (increment < 0 && current <= newValue)) {
                current = newValue;
                clearInterval(interval);
            }
            element.textContent = current.toLocaleString();
        }, 50);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showLoading() {
        const loadingScreen = this.elements.get('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
        }
    }

    hideLoading() {
        const loadingScreen = this.elements.get('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    }

    // Utility methods
    getElement(id) {
        return this.elements.get(id) || document.getElementById(id);
    }

    addClass(elementId, className) {
        const element = this.getElement(elementId);
        if (element) {
            element.classList.add(className);
        }
    }

    removeClass(elementId, className) {
        const element = this.getElement(elementId);
        if (element) {
            element.classList.remove(className);
        }
    }

    toggleClass(elementId, className) {
        const element = this.getElement(elementId);
        if (element) {
            element.classList.toggle(className);
        }
    }

    // Responsive helpers
    updateResponsiveLayout() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile', isMobile);
        
        // Adjust canvas size if needed
        if (this.game.canvas) {
            this.game.resizeCanvas();
        }
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        this.frameCounter = 0;
        this.lastFrameTime = performance.now();
        this.fpsDisplay = document.getElementById('fpsDisplay');
        
        if (this.fpsDisplay) {
            this.fpsInterval = setInterval(() => {
                const now = performance.now();
                const fps = Math.round(1000 / ((now - this.lastFrameTime) / this.frameCounter));
                this.fpsDisplay.textContent = `${fps} FPS`;
                
                this.frameCounter = 0;
                this.lastFrameTime = now;
            }, 1000);
        }
    }

    stopPerformanceMonitoring() {
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
        }
    }

    // Cleanup
    destroy() {
        this.stopPerformanceMonitoring();
        this.elements.clear();
        this.listeners.clear();
        this.updateQueue.length = 0;
    }
}