import { gameConfig } from '../config/game-config.json';

export class EnhancedPowerUpManager {
    constructor(game) {
        this.game = game;
        this.config = gameConfig;
        this.activePowerUps = new Map();
        this.upgradeLevels = new Map();
        
        // Enhanced power-up definitions
        this.powerUpDefinitions = {
            slowTime: {
                name: 'Slow Time',
                duration: 5,
                cost: 50,
                maxLevel: 1,
                description: 'Slows down all entities'
            },
            multiScore: {
                name: 'Double Points',
                duration: 8,
                cost: 100,
                maxLevel: 3,
                description: 'Doubles score from all sources',
                levels: [2, 3, 4]
            },
            clearScreen: {
                name: 'Clear Screen',
                duration: 0,
                cost: 200,
                maxLevel: 1,
                description: 'Clears all orbs and stars'
            },
            shield: {
                name: 'Shield',
                duration: 10,
                cost: 100,
                maxLevel: 3,
                description: 'Protects against bomb damage',
                levels: [1, 2, 3]
            },
            comboBoost: {
                name: 'Combo Boost',
                duration: 12,
                cost: 250,
                maxLevel: 2,
                description: 'Increases combo multiplier',
                levels: [1.5, 2.0]
            },
            autoClick: {
                name: 'Auto Clicker',
                duration: 15,
                cost: 300,
                maxLevel: 2,
                description: 'Automatically clicks nearby orbs',
                levels: [1, 2]
            },
            radiusBoost: {
                name: 'Radius Boost',
                duration: 20,
                cost: 75,
                maxLevel: 3,
                description: 'Increases click radius',
                levels: [1.5, 2.0, 3.0]
            }
        };
        
        this.initializeUpgrades();
    }
    
    initializeUpgrades() {
        // Initialize all power-ups to level 1
        Object.keys(this.powerUpDefinitions).forEach(type => {
            this.upgradeLevels.set(type, 1);
        });
    }
    
    getUpgradeLevel(type) {
        return this.upgradeLevels.get(type) || 1;
    }
    
    canUpgrade(type) {
        const definition = this.powerUpDefinitions[type];
        const currentLevel = this.getUpgradeLevel(type);
        return currentLevel < definition.maxLevel;
    }
    
    getUpgradeCost(type) {
        const definition = this.powerUpDefinitions[type];
        const currentLevel = this.getUpgradeLevel(type);
        return definition.cost * currentLevel;
    }
    
    upgradePowerUp(type) {
        if (!this.canUpgrade(type)) return false;
        
        const currentLevel = this.getUpgradeLevel(type);
        this.upgradeLevels.set(type, currentLevel + 1);
        return true;
    }
    
    activate(type, manual = true) {
        const definition = this.powerUpDefinitions[type];
        if (!definition) return false;
        
        const level = this.getUpgradeLevel(type);
        const cost = manual ? definition.cost * level : 0;
        
        // Check if we can afford it
        if (manual && this.game.score < cost) return false;
        
        // Deduct cost
        if (manual) {
            this.game.score -= cost;
        }
        
        // Activate based on type
        switch (type) {
            case 'slowTime':
                this.activateSlowTime(level);
                break;
            case 'multiScore':
                this.activateMultiScore(level);
                break;
            case 'clearScreen':
                this.activateClearScreen();
                break;
            case 'shield':
                this.activateShield(level);
                break;
            case 'comboBoost':
                this.activateComboBoost(level);
                break;
            case 'autoClick':
                this.activateAutoClick(level);
                break;
            case 'radiusBoost':
                this.activateRadiusBoost(level);
                break;
        }
        
        return true;
    }
    
    activateSlowTime(level) {
        const duration = this.powerUpDefinitions.slowTime.duration;
        const effectKey = 'slowTime';
        
        if (this.activePowerUps.has(effectKey)) {
            this.extendPowerUp(effectKey, duration);
            return;
        }
        
        const originalSpeed = this.game.currentSpeed;
        this.game.currentSpeed *= 0.5;
        
        this.activePowerUps.set(effectKey, {
            endTime: Date.now() + duration * 1000,
            cleanup: () => {
                this.game.currentSpeed = originalSpeed;
            },
            level: level
        });
    }
    
    activateMultiScore(level) {
        const duration = this.powerUpDefinitions.multiScore.duration;
        const effectKey = 'multiScore';
        const multiplier = this.powerUpDefinitions.multiScore.levels[level - 1];
        
        if (this.activePowerUps.has(effectKey)) {
            this.extendPowerUp(effectKey, duration);
            return;
        }
        
        this.activePowerUps.set(effectKey, {
            endTime: Date.now() + duration * 1000,
            cleanup: () => {},
            level: level,
            multiplier: multiplier
        });
    }
    
    activateShield(level) {
        const duration = this.powerUpDefinitions.shield.duration;
        const effectKey = 'shield';
        const shieldStrength = this.powerUpDefinitions.shield.levels[level - 1];
        
        if (this.activePowerUps.has(effectKey)) {
            this.extendPowerUp(effectKey, duration);
            return;
        }
        
        this.activePowerUps.set(effectKey, {
            endTime: Date.now() + duration * 1000,
            cleanup: () => {},
            level: level,
            strength: shieldStrength
        });
    }
    
    activateComboBoost(level) {
        const duration = this.powerUpDefinitions.comboBoost.duration;
        const effectKey = 'comboBoost';
        const multiplier = this.powerUpDefinitions.comboBoost.levels[level - 1];
        
        if (this.activePowerUps.has(effectKey)) {
            this.extendPowerUp(effectKey, duration);
            return;
        }
        
        this.activePowerUps.set(effectKey, {
            endTime: Date.now() + duration * 1000,
            cleanup: () => {},
            level: level,
            multiplier: multiplier
        });
    }
    
    activateAutoClick(level) {
        const duration = this.powerUpDefinitions.autoClick.duration;
        const effectKey = 'autoClick';
        const clickRate = this.powerUpDefinitions.autoClick.levels[level - 1];
        
        if (this.activePowerUps.has(effectKey)) {
            this.extendPowerUp(effectKey, duration);
            return;
        }
        
        const interval = setInterval(() => {
            this.autoClickNearby();
        }, 1000 / clickRate);
        
        this.activePowerUps.set(effectKey, {
            endTime: Date.now() + duration * 1000,
            cleanup: () => {
                clearInterval(interval);
            },
            level: level,
            interval: interval
        });
    }
    
    activateRadiusBoost(level) {
        const duration = this.powerUpDefinitions.radiusBoost.duration;
        const effectKey = 'radiusBoost';
        const multiplier = this.powerUpDefinitions.radiusBoost.levels[level - 1];
        
        if (this.activePowerUps.has(effectKey)) {
            this.extendPowerUp(effectKey, duration);
            return;
        }
        
        this.activePowerUps.set(effectKey, {
            endTime: Date.now() + duration * 1000,
            cleanup: () => {},
            level: level,
            multiplier: multiplier
        });
    }
    
    activateClearScreen() {
        const effectKey = 'clearScreen';
        
        // Clear all orbs and stars, but keep bombs and decoys
        const remainingEntities = [];
        let clearedCount = 0;
        let totalPoints = 0;
        
        this.game.entities.forEach(entity => {
            if (entity.type === 'orb' || entity.type === 'star') {
                const points = entity.getPoints ? entity.getPoints() : (entity.type === 'orb' ? 10 : 25);
                totalPoints += points;
                clearedCount++;
                
                // Create particle effects
                if (this.game.particleSystem) {
                    this.game.particleSystem.createBurst(entity.x, entity.y, entity.color, 5);
                }
            } else {
                remainingEntities.push(entity);
            }
        });
        
        this.game.entities = remainingEntities;
        
        // Apply score multiplier if active
        const multiplier = this.isActive('multiScore') ? 
            this.activePowerUps.get('multiScore').multiplier : 1;
        this.game.score += totalPoints * multiplier;
        
        // Bonus points for clearing
        this.game.score += clearedCount * 5;
        
        // Create visual effect
        this.createClearScreenEffect();
    }
    
    autoClickNearby() {
        const radius = 100; // Auto-click radius
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        
        this.game.entities.forEach(entity => {
            if (entity.type === 'orb' || entity.type === 'star') {
                const dx = entity.x - centerX;
                const dy = entity.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= radius) {
                    // Simulate click on this entity
                    this.game.hitEntity(entity, this.game.entities.indexOf(entity));
                }
            }
        });
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
    
    getRemainingTime(type) {
        const powerUp = this.activePowerUps.get(type);
        if (!powerUp) return 0;
        
        return Math.max(0, (powerUp.endTime - Date.now()) / 1000);
    }
    
    getEffectMultiplier(type) {
        const powerUp = this.activePowerUps.get(type);
        if (!powerUp) return 1;
        
        return powerUp.multiplier || 1;
    }
    
    getClickRadius() {
        const baseRadius = 25;
        const multiplier = this.isActive('radiusBoost') ? 
            this.activePowerUps.get('radiusBoost').multiplier : 1;
        return baseRadius * multiplier;
    }
    
    hasShield() {
        return this.isActive('shield');
    }
    
    getShieldStrength() {
        return this.isActive('shield') ? this.activePowerUps.get('shield').strength : 0;
    }
    
    createClearScreenEffect() {
        // Create a flash effect across the entire screen
        const canvas = this.game.canvas;
        const ctx = this.game.ctx;
        
        let alpha = 0.8;
        const fadeOut = () => {
            alpha -= 0.05;
            if (alpha > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
                requestAnimationFrame(fadeOut);
            }
        };
        
        fadeOut();
    }
    
    render(ctx) {
        // Render active power-up indicators
        const activePowerUps = Array.from(this.activePowerUps.entries());
        if (activePowerUps.length === 0) return;
        
        ctx.save();
        
        // Background panel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 70, 180, 30 + activePowerUps.length * 25);
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Active Power-ups:', 15, 90);
        
        // List active power-ups
        activePowerUps.forEach(([type, powerUp], index) => {
            const definition = this.powerUpDefinitions[type];
            const remaining = this.getRemainingTime(type);
            
            ctx.fillStyle = this.getPowerUpColor(type);
            ctx.font = '12px Arial';
            ctx.fillText(
                `${definition.name} (${powerUp.level}): ${remaining.toFixed(1)}s`,
                15, 110 + index * 25
            );
        });
        
        ctx.restore();
    }
    
    getPowerUpColor(type) {
        const colors = {
            slowTime: '#00aaff',
            multiScore: '#ffaa00',
            clearScreen: '#ff00aa',
            shield: '#00ff00',
            comboBoost: '#ff6600',
            autoClick: '#aa00ff',
            radiusBoost: '#00ffaa'
        };
        return colors[type] || '#ffffff';
    }
    
    getAvailablePowerUps() {
        return Object.entries(this.powerUpDefinitions).map(([type, definition]) => ({
            type,
            name: definition.name,
            cost: definition.cost * this.getUpgradeLevel(type),
            level: this.getUpgradeLevel(type),
            maxLevel: definition.maxLevel,
            description: definition.description,
            canUpgrade: this.canUpgrade(type),
            upgradeCost: this.getUpgradeCost(type)
        }));
    }
}