import { GameEngine } from './game.js';
import { AudioManager } from './audio.js';
import { UIManager } from './ui.js';
import { SettingsManager } from './settings.js';
import { ParticleSystem } from './particles.js';
import { PowerUpManager } from './powerups.js';

export class ColorBurstGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameEngine = null;
        this.audioManager = null;
        this.uiManager = null;
        this.settings = null;
        this.particleSystem = null;
        this.powerUpManager = null;
        
        this.gameState = 'loading';
        this.lastScore = 0;
        this.isNewRecord = false;
        
        this.isPaused = false;
        this.isInitialized = false;
        
        this.bindMethods();
    }

    async init() {
        try {
            console.log('Starting ColorBurstGame initialization...');
            
            // Initialize canvas
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas || !this.ctx) {
                throw new Error('Canvas initialization failed');
            }
            console.log('Canvas initialized successfully');
            
            // Initialize systems
            this.settings = new SettingsManager();
            await this.settings.load();
            console.log('Settings loaded');
            
            this.audioManager = new AudioManager(this.settings);
            this.particleSystem = new ParticleSystem();
            this.powerUpManager = new PowerUpManager(this);
            
            this.uiManager = new UIManager(this);
            this.gameEngine = new GameEngine(this.canvas, this.ctx, this.audioManager, this.settings);
            
            // Setup canvas
            this.resizeCanvas();
            console.log('Canvas resized');
            
            // Setup event listeners
            this.setupEventListeners();
            console.log('Event listeners set up');
            
            // Initialize systems
            await this.audioManager.init();
            console.log('Audio manager initialized');
            
            this.isInitialized = true;
            
            // Start main menu
            console.log('Showing main menu...');
            this.showMainMenu();
            
            console.log('ColorBurstGame initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ColorBurstGame:', error);
            alert('Failed to load game. Please refresh the page.');
        }
    }

    bindMethods() {
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.handleResize);
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Mouse events
        this.canvas.addEventListener('click', this.handleClick);
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        
        // Prevent context menu and default touch behaviors
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault(); // Prevent pinch zoom
            }
        }, { passive: false });
        
        // Menu buttons
        document.addEventListener('click', (e) => {
            console.log('Button clicked:', e.target.id || e.target.className);
            if (e.target.matches('.mode-button')) {
                const mode = e.target.dataset.mode;
                console.log('Starting game mode:', mode);
                this.startGame(mode);
            } else if (e.target.id === 'settingsBtn') {
                console.log('Opening settings');
                this.showSettings();
            } else if (e.target.id === 'closeSettings') {
                console.log('Closing settings');
                this.hideSettings();
            } else if (e.target.id === 'restartBtn') {
                console.log('Restarting game');
                this.restart();
            } else if (e.target.id === 'menuBtn' || e.target.id === 'quitBtn') {
                console.log('Quitting to menu');
                this.quit();
            } else if (e.target.id === 'resumeBtn') {
                console.log('Resuming game');
                this.togglePause();
            }
        });
    }

    handleResize() {
        this.resizeCanvas();
        this.uiManager.updateResponsiveLayout();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Maintain aspect ratio
        const aspectRatio = 16 / 9;
        let width = rect.width;
        let height = rect.height;
        
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Scale for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Update game engine
        if (this.gameEngine) {
            this.gameEngine.updateCanvasSize(width, height);
        }
    }

    handleKeyDown(e) {
        if (this.gameState === 'playing') {
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'Escape':
                    this.showMainMenu();
                    break;
            }
        }
    }

    handleClick(e) {
        if (this.gameState === 'playing' && !this.isPaused) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.gameEngine.handleClick(x, y);
        }
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (this.gameState === 'playing' && !this.isPaused) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.gameEngine.handleClick(x, y);
            
            // Add haptic feedback on supported devices
            if (window.navigator.vibrate) {
                window.navigator.vibrate(10);
            }
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        // Prevent scrolling while playing
    }

    handleTouchEnd(e) {
        e.preventDefault();
        // Handle touch release if needed
    }

    showLoading() {
        this.gameState = 'loading';
        this.uiManager.showLoading();
    }

    hideLoading() {
        this.uiManager.hideLoading();
    }

    showMainMenu() {
        console.log('showMainMenu called, hiding loading...');
        this.gameState = 'menu';
        this.audioManager.playAmbient();
        this.uiManager.hideLoading();
        this.uiManager.showScreen('mainMenu');
        console.log('Main menu should be visible now');
    }

    startGame(mode) {
        this.gameState = 'playing';
        this.isPaused = false;
        
        this.gameEngine.start(mode);
        this.audioManager.playAmbient();
        this.uiManager.showScreen('gameUI');
        
        this.startGameLoop();
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.isPaused = !this.isPaused;
            
            if (this.isPaused) {
                this.uiManager.showPauseOverlay();
                this.audioManager.pauseAmbient();
            } else {
                this.uiManager.hidePauseOverlay();
                this.audioManager.playAmbient();
            }
        }
    }

    endGame() {
        this.gameState = 'gameOver';
        this.isPaused = false;
        
        const gameStats = this.gameEngine.getGameStats();
        this.lastScore = gameStats.score;
        this.isNewRecord = this.settings.updateHighScore(gameStats.mode, gameStats.score);
        this.settings.updateStatistics(gameStats);
        
        this.audioManager.stopAmbient();
        this.uiManager.showScreen('gameOver');
        
        this.stopGameLoop();
    }

    startGameLoop() {
        if (this.gameLoop) return;
        
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }

    stopGameLoop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }

    update(currentTime) {
        if (!this.isInitialized || this.gameState !== 'playing') {
            return;
        }
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            this.gameEngine.update(deltaTime);
            this.particleSystem.update(deltaTime);
            this.powerUpManager.update(deltaTime);
        }
        
        this.render();
        
        this.gameLoop = requestAnimationFrame(this.update.bind(this));
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Render game
        if (this.gameState === 'playing') {
            this.gameEngine.render(this.ctx);
            this.particleSystem.render(this.ctx);
            this.powerUpManager.render(this.ctx);
        }
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle pattern
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    showSettings() {
        this.uiManager.showScreen('settingsPanel');
    }

    hideSettings() {
        this.uiManager.showScreen('mainMenu');
    }

    showError(message) {
        this.uiManager.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.uiManager.showNotification(message, 'success');
    }

    // Game controls
    restart() {
        this.gameEngine.reset();
        this.startGame(this.gameEngine.currentMode);
    }

    quit() {
        this.stopGameLoop();
        this.gameEngine.reset();
        this.showMainMenu();
    }

    // Utility methods
    vibrate(duration = 50) {
        this.settings.vibrate(duration);
    }

    getDifficultyMultiplier() {
        return this.settings.getDifficultyMultiplier();
    }

    // Cleanup
    destroy() {
        this.stopGameLoop();
        
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyDown);
        this.canvas.removeEventListener('click', this.handleClick);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        
        if (this.audioManager) {
            this.audioManager.destroy();
        }
        
        if (this.uiManager) {
            this.uiManager.destroy();
        }
        
        if (this.gameEngine) {
            this.gameEngine.destroy();
        }
        
        this.isInitialized = false;
    }

    // Debug methods
    toggleDebug() {
        this.debugMode = !this.debugMode;
        if (this.gameEngine) {
            this.gameEngine.debugMode = this.debugMode;
        }
    }

    exportSettings() {
        return this.settings.exportSettings();
    }

    importSettings(settingsJson) {
        return this.settings.importSettings(settingsJson);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.colorBurstGame = new ColorBurstGame();
    window.colorBurstGame.init();
});