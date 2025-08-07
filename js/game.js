import { Orb, Bomb, Star, Decoy } from './entities.js';
import { ParticleSystem } from './particles.js';
import { PowerUpManager } from './powerups.js';

export class GameEngine {
    constructor(canvas, ctx, audioManager, settingsManager) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.audioManager = audioManager;
        this.settingsManager = settingsManager;
        
        this.entities = [];
        this.particles = new ParticleSystem(ctx);
        this.powerUpManager = new PowerUpManager(this);
        
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.gameMode = 'classic';
        
        // Game variables
        this.score = 0;
        this.level = 1;
        this.progress = 0;
        this.timeLeft = 60;
        this.orbsPopped = 0;
        
        // Spawning
        this.spawnTimer = 0;
        this.spawnInterval = 1.5;
        
        // Difficulty scaling
        this.baseSpeed = 100;
        this.currentSpeed = 100;
        this.orbLifetime = 6;
        
        // Power-ups
        this.activePowerUps = new Set();
        
        // Mouse/touch handling
        this.setupInputHandling();
        
        // Game loop
        this.lastTime = 0;
        this.isRunning = false;
    }

    setupInputHandling() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.handleClick({
                clientX: touch.clientX,
                clientY: touch.clientY,
                target: e.target
            });
        });
    }

    start(mode) {
        this.gameMode = mode;
        this.gameState = 'playing';
        this.reset();
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    reset() {
        this.entities = [];
        this.particles.clear();
        this.powerUpManager.reset();
        
        this.score = 0;
        this.level = 1;
        this.progress = 0;
        this.orbsPopped = 0;
        
        // Set mode-specific settings
        switch(this.gameMode) {
            case 'timeAttack':
                this.timeLeft = 60;
                break;
            case 'zen':
                this.timeLeft = Infinity;
                this.spawnInterval = 2.0;
                break;
            default: // classic
                this.timeLeft = Infinity;
                this.spawnInterval = 1.5;
        }
        
        this.updateDifficulty();
    }

    restart() {
        this.start(this.gameMode);
    }

    pause() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        this.isRunning = this.gameState === 'playing';
        if (this.isRunning) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update timer for time-based modes
        if (this.gameMode === 'timeAttack' && this.timeLeft !== Infinity) {
            this.timeLeft -= deltaTime;
            if (this.timeLeft <= 0) {
                this.endGame();
                return;
            }
        }
        
        // Update power-ups
        this.powerUpManager.update(deltaTime);
        
        // Spawn entities
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.spawnEntity();
            this.spawnTimer = this.spawnInterval;
        }
        
        // Update entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            entity.update(deltaTime);
            
            if (entity.isExpired()) {
                this.entities.splice(i, 1);
                if (entity.type !== 'decoy') {
                    this.score = Math.max(0, this.score - 5);
                }
            }
        }
        
        // Update particles
        this.particles.update(deltaTime);
        
        // Update progress and level
        this.updateProgress();
        
        // Update UI
        this.updateUI();
    }

    spawnEntity() {
        const entityType = this.getRandomEntityType();
        let entity;
        
        switch(entityType) {
            case 'bomb':
                entity = new Bomb(this.canvas.width, this.canvas.height, this.currentSpeed);
                break;
            case 'star':
                entity = new Star(this.canvas.width, this.canvas.height, this.currentSpeed);
                break;
            case 'decoy':
                entity = new Decoy(this.canvas.width, this.canvas.height, this.currentSpeed);
                break;
            default:
                entity = new Orb(this.canvas.width, this.canvas.height, this.currentSpeed);
        }
        
        // Set canvas dimensions for proper collision detection
        entity.canvasWidth = this.canvas.width;
        entity.canvasHeight = this.canvas.height;
        
        this.entities.push(entity);
    }

    getRandomEntityType() {
        const difficulty = this.settingsManager.getDifficulty();
        const rand = Math.random();
        
        let bombChance, starChance, decoyChance;
        
        switch(difficulty) {
            case 'easy':
                bombChance = 0.05;
                starChance = 0.08;
                decoyChance = 0.1;
                break;
            case 'hard':
                bombChance = 0.15;
                starChance = 0.12;
                decoyChance = 0.2;
                break;
            default: // normal
                bombChance = 0.1;
                starChance = 0.1;
                decoyChance = 0.15;
        }
        
        if (rand < bombChance) return 'bomb';
        if (rand < bombChance + starChance) return 'star';
        if (rand < bombChance + starChance + decoyChance) return 'decoy';
        return 'orb';
    }

    handleClick(event) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        let hit = false;
        
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.contains(x, y)) {
                this.hitEntity(entity, i);
                hit = true;
                break;
            }
        }
        
        if (!hit) {
            this.audioManager.playSound('miss');
        }
    }

    hitEntity(entity, index) {
        const multiplier = this.activePowerUps.has('multiScore') ? 2 : 1;
        
        switch(entity.type) {
            case 'orb':
                this.score += 10 * multiplier;
                this.progress += 8;
                this.orbsPopped++;
                this.audioManager.playSound('pop');
                break;
            case 'star':
                this.score += 25 * multiplier;
                this.progress += 15;
                this.orbsPopped++;
                this.audioManager.playSound('star');
                break;
            case 'bomb':
                this.score = Math.max(0, this.score - 20);
                this.progress = Math.max(0, this.progress - 10);
                this.audioManager.playSound('bomb');
                break;
            case 'decoy':
                this.score = Math.max(0, this.score - 5);
                this.audioManager.playSound('decoy');
                break;
        }
        
        // Create particles
        this.particles.createBurst(entity.x, entity.y, entity.color, 8);
        
        // Remove entity
        this.entities.splice(index, 1);
        
        // Check for combo
        this.checkCombo();
    }

    checkCombo() {
        // Simple combo system - could be enhanced
        const now = Date.now();
        if (this.lastHitTime && (now - this.lastHitTime < 1000)) {
            this.combo = (this.combo || 0) + 1;
            if (this.combo >= 3) {
                this.score += this.combo * 5; // Bonus points for combo
                this.showComboEffect();
            }
        } else {
            this.combo = 1;
        }
        this.lastHitTime = now;
    }

    showComboEffect() {
        // Could add visual combo effect here
    }

    updateProgress() {
        this.progress = Math.min(this.progress, 100);
        
        if (this.progress >= 100) {
            this.levelUp();
            this.progress = 0;
        }
    }

    levelUp() {
        this.level++;
        this.currentSpeed = this.baseSpeed + (this.level - 1) * 20;
        this.spawnInterval = Math.max(0.5, 1.5 - (this.level - 1) * 0.1);
        this.orbLifetime = Math.max(3, 6 - (this.level - 1) * 0.2);
        
        this.updateDifficulty();
        this.audioManager.playSound('levelUp');
    }

    updateDifficulty() {
        const difficulty = this.settingsManager.getDifficulty();
        const multiplier = {
            easy: 0.8,
            normal: 1.0,
            hard: 1.3
        };
        
        this.currentSpeed *= multiplier[difficulty];
        this.orbLifetime *= multiplier[difficulty];
    }

    activatePowerUp(type) {
        const cost = {
            slowTime: 50,
            multiScore: 100,
            clearScreen: 200
        };
        
        if (this.score >= cost[type]) {
            this.score -= cost[type];
            this.powerUpManager.activate(type);
            this.activePowerUps.add(type);
            
            setTimeout(() => {
                this.activePowerUps.delete(type);
            }, this.powerUpManager.getDuration(type) * 1000);
        }
    }

    endGame() {
        this.gameState = 'gameOver';
        this.isRunning = false;
        
        const stats = {
            score: this.score,
            level: this.level,
            orbsPopped: this.orbsPopped,
            gameMode: this.gameMode
        };
        
        // Call back to main game
        if (window.game) {
            window.game.onGameEnd(stats);
        }
    }

    updateUI() {
        // Update UI elements
        const scoreEl = document.getElementById('scoreValue');
        const levelEl = document.getElementById('levelValue');
        const timerEl = document.getElementById('timerValue');
        const progressEl = document.getElementById('progressFill');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (levelEl) levelEl.textContent = this.level;
        if (timerEl) timerEl.textContent = Math.ceil(this.timeLeft);
        if (progressEl) progressEl.style.width = `${this.progress}%`;
        
        // Update power-up buttons
        this.updatePowerUpButtons();
    }

    updatePowerUpButtons() {
        const powerUps = [
            { id: 'slowTimeBtn', cost: 50 },
            { id: 'multiScoreBtn', cost: 100 },
            { id: 'clearScreenBtn', cost: 200 }
        ];
        
        powerUps.forEach(({ id, cost }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = this.score < cost;
                btn.style.opacity = this.score < cost ? '0.5' : '1';
            }
        });
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background gradient
        this.renderBackground();
        
        // Render entities
        this.entities.forEach(entity => entity.render(this.ctx));
        
        // Render particles
        this.particles.render();
        
        // Render power-up effects
        this.powerUpManager.render(this.ctx);
    }

    renderBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
        );
        
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f1e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateCanvasSize(width, height) {
        // Update canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update entity boundaries and positions
        this.entities.forEach(entity => {
            entity.canvasWidth = width;
            entity.canvasHeight = height;
            
            // Keep entities within new bounds
            if (entity.x > width) entity.x = width - entity.size;
            if (entity.y > height) entity.y = height - entity.size;
            if (entity.x < 0) entity.x = entity.size;
            if (entity.y < 0) entity.y = entity.size;
        });
        
        // Update particle system
        if (this.particles) {
            this.particles.updateCanvasSize(width, height);
        }
        
        // Update power-up manager
        if (this.powerUpManager) {
            this.powerUpManager.updateCanvasSize(width, height);
        }
    }
}