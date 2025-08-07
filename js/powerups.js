export class PowerUpManager {
    constructor(game) {
        this.game = game;
        this.activePowerUps = new Map();
        this.effects = {
            slowTime: {
                duration: 5,
                cost: 50,
                active: false,
                originalSpeed: null
            },
            multiScore: {
                duration: 8,
                cost: 100,
                active: false,
                multiplier: 2
            },
            clearScreen: {
                duration: 0,
                cost: 200,
                active: false
            }
        };
    }

    activate(type) {
        if (!this.effects[type]) return false;
        
        const effect = this.effects[type];
        
        switch (type) {
            case 'slowTime':
                this.activateSlowTime();
                break;
            case 'multiScore':
                this.activateMultiScore();
                break;
            case 'clearScreen':
                this.activateClearScreen();
                break;
        }
        
        return true;
    }

    activateSlowTime() {
        const effect = this.effects.slowTime;
        
        if (effect.active) {
            this.extendPowerUp('slowTime', effect.duration);
            return;
        }
        
        effect.active = true;
        effect.originalSpeed = this.game.currentSpeed;
        this.game.currentSpeed *= 0.5;
        
        this.activePowerUps.set('slowTime', {
            endTime: Date.now() + effect.duration * 1000,
            cleanup: () => {
                this.game.currentSpeed = effect.originalSpeed;
                effect.active = false;
                effect.originalSpeed = null;
            }
        });
    }

    activateMultiScore() {
        const effect = this.effects.multiScore;
        
        if (effect.active) {
            this.extendPowerUp('multiScore', effect.duration);
            return;
        }
        
        effect.active = true;
        
        this.activePowerUps.set('multiScore', {
            endTime: Date.now() + effect.duration * 1000,
            cleanup: () => {
                effect.active = false;
            }
        });
    }

    activateClearScreen() {
        const effect = this.effects.clearScreen;
        
        // Clear all orbs and stars, but keep bombs and decoys
        const remainingEntities = [];
        let clearedCount = 0;
        
        this.game.entities.forEach(entity => {
            if (entity.type === 'orb' || entity.type === 'star') {
                // Add points for cleared entities
                const points = entity.getPoints();
                const multiplier = this.effects.multiScore.active ? 2 : 1;
                this.game.score += points * multiplier;
                
                // Create particle effects
                this.game.particles.createBurst(entity.x, entity.y, entity.color, 5);
                
                clearedCount++;
            } else {
                remainingEntities.push(entity);
            }
        });
        
        this.game.entities = remainingEntities;
        
        // Bonus points for clearing
        this.game.score += clearedCount * 5;
        
        // Visual effect
        this.createClearScreenEffect();
    }

    extendPowerUp(type, duration) {
        const powerUp = this.activePowerUps.get(type);
        if (powerUp) {
            powerUp.endTime += duration * 1000;
        }
    }

    update(deltaTime) {
        const now = Date.now();
        
        for (const [type, powerUp] of this.activePowerUps.entries()) {
            if (now >= powerUp.endTime) {
                powerUp.cleanup();
                this.activePowerUps.delete(type);
            }
        }
    }

    isActive(type) {
        return this.activePowerUps.has(type);
    }

    getDuration(type) {
        return this.effects[type]?.duration || 0;
    }

    getRemainingTime(type) {
        const powerUp = this.activePowerUps.get(type);
        if (!powerUp) return 0;
        
        return Math.max(0, (powerUp.endTime - Date.now()) / 1000);
    }

    getCost(type) {
        return this.effects[type]?.cost || 0;
    }

    createClearScreenEffect() {
        // Create a flash effect
        const canvas = this.game.canvas;
        const ctx = this.game.ctx;
        
        let alpha = 0.8;
        const fadeOut = () => {
            alpha -= 0.05;
            if (alpha > 0) {
                requestAnimationFrame(fadeOut);
            }
        };
        
        fadeOut();
    }

    render(ctx) {
        // Render active power-up indicators
        const activePowerUps = Array.from(this.activePowerUps.keys());
        if (activePowerUps.length === 0) return;
        
        // Display active power-ups in corner
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 70, 150, 25 + activePowerUps.length * 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('Active Power-ups:', 15, 85);
        
        activePowerUps.forEach((type, index) => {
            const remaining = this.getRemainingTime(type);
            ctx.fillStyle = this.getPowerUpColor(type);
            ctx.fillText(`${type}: ${remaining.toFixed(1)}s`, 15, 100 + index * 20);
        });
        
        ctx.restore();
    }

    getPowerUpColor(type) {
        const colors = {
            slowTime: '#00aaff',
            multiScore: '#ffaa00',
            clearScreen: '#ff00aa'
        };
        return colors[type] || '#ffffff';
    }

    updateCanvasSize(width, height) {
        // Update canvas dimensions for power-up rendering
        // This is mainly for positioning UI elements correctly
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    reset() {
        // Clean up all active power-ups
        for (const [type, powerUp] of this.activePowerUps.entries()) {
            powerUp.cleanup();
        }
        
        this.activePowerUps.clear();
        
        // Reset all effects
        Object.values(this.effects).forEach(effect => {
            effect.active = false;
            if (effect.originalSpeed !== null) {
                effect.originalSpeed = null;
            }
        });
    }
}

// Power-up effects visual system
export class PowerUpEffects {
    static createSlowTimeEffect(canvas, ctx) {
        // Create time dilation visual effect
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        );
        
        gradient.addColorStop(0, 'rgba(0, 170, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 170, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    static createMultiScoreEffect(canvas, ctx) {
        // Create score multiplier visual effect
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 170, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 170, 0, 0.05)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    static createScreenFlash(canvas, ctx, color = '#ffffff') {
        // Create flash effect
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    }
}