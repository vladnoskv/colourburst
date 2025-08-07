import { GameEngine } from './game-engine.js';
import { AudioManager } from './audio.js';
import { EntityManager } from './entities.js';
import { ParticleSystem } from './particles.js';
import { PowerUpManager } from './powerups.js';
import { BossManager } from './boss.js';
import { UIManager } from './ui.js';
import { SettingsManager } from './settings.js';

class Game {
    constructor() {
        this.engine = new GameEngine();
        this.audio = new AudioManager();
        this.entities = new EntityManager(this);
        this.particles = new ParticleSystem();
        this.powerups = new PowerUpManager(this);
        this.boss = new BossManager(this);
        this.ui = new UIManager(this);
        this.settings = new SettingsManager();
        
        this.diff = null;
        this.stats = {
            lvl: 1,
            pts: 0,
            speed: 140,
            spawn: 1.2,
            rad: 1
        };
        this.task = {
            shape: 'circle',
            need: 10,
            got: 0
        };
        this.lives = 10;
        this.missBuffer = 0;
        this.bombs = 0;
        this.slowC = 0;
        this.slowT = 0;
        this.timer = 90;
        this.spawnTimer = 0;
        this.prices = {
            radius: 150,
            life: 120,
            bomb: 200,
            slow: 240
        };
        this.mode = 'menu';
        
        this.bindEvents();
        this.ui.showMainMenu();
    }
    
    bindEvents() {
        document.querySelectorAll('.mode-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (mode === 'classic') this.start('normal');
                else if (mode === 'timeAttack') this.start('ranked');
                else if (mode === 'zen') this.start('easy');
            });
        });
        
        window.addEventListener('keydown', (e) => {
            if (this.mode !== 'menu') {
                if (e.key === 's') this.ui.toggleShop();
                if (e.key === 'b') this.powerups.blast();
                if (e.key === 'f') this.powerups.slow();
            }
        });
        
        this.engine.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('shop').addEventListener('click', (e) => {
            const item = e.target.closest('.item');
            if (item) this.buy(item.dataset.id);
        });
    }
    
    start(difficulty = 'normal') {
        this.diff = this.settings.getDifficulty(difficulty);
        this.lives = this.diff.lives;
        this.mode = difficulty === 'ranked' ? 'ranked' : 'play';
        
        this.ui.showGame();
        this.ui.updateShop();
        this.ui.updateHUD();
        
        this.engine.start();
    }
    
    reset() {
        this.entities.clear();
        this.particles.clear();
        this.boss.reset();
        
        this.stats = {
            lvl: 1,
            pts: 0,
            speed: 140,
            spawn: 1.2,
            rad: 1
        };
        this.task = {
            shape: 'circle',
            need: 10,
            got: 0
        };
        this.lives = 10;
        this.missBuffer = 0;
        this.bombs = 0;
        this.slowC = 0;
        this.slowT = 0;
        this.timer = 90;
        this.spawnTimer = 0;
    }
    
    handleClick(e) {
        if (this.mode === 'menu') return;
        
        const rect = this.engine.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ui.createClickEffect(x, y);
        
        const hit = this.entities.checkHit(x, y, this.stats.rad);
        if (hit) {
            this.hitEntity(hit);
        } else if (this.diff.lifeRule === 'miss') {
            this.loseLife();
        }
    }
    
    hitEntity(entity) {
        if (entity.type === 'boss') {
            this.boss.hit();
            return;
        }
        
        this.particles.createExplosion(entity.x, entity.y, entity.color);
        this.entities.remove(entity);
        
        const values = {
            circle: 10,
            square: 15,
            tri: 20,
            star: 30,
            bomb: -40
        };
        
        const value = values[entity.type] || 10;
        
        if (value < 0) {
            this.audio.play('bomb');
            this.stats.pts = Math.max(0, this.stats.pts + value);
            this.loseLife();
        } else {
            this.audio.play('pop');
            this.stats.pts += value;
            
            if (entity.type === this.task.shape) {
                this.task.got++;
                if (this.task.got >= this.task.need) {
                    this.nextLevel();
                }
            }
        }
        
        this.ui.updateHUD();
    }
    
    loseLife() {
        if (this.diff.lifeRule === 'twoMiss') {
            this.missBuffer++;
            if (this.missBuffer < 2) return;
            this.missBuffer = 0;
        }
        
        this.lives--;
        this.audio.play('dud');
        
        if (this.lives <= 0) {
            this.gameOver('No lives');
        }
        
        this.ui.updateHUD();
    }
    
    buy(itemId) {
        if (this.stats.pts < this.prices[itemId]) return;
        
        this.stats.pts -= this.prices[itemId];
        
        switch (itemId) {
            case 'radius':
                this.stats.rad += 0.25;
                this.prices.radius = Math.round(this.prices.radius * 1.5);
                break;
            case 'life':
                this.lives++;
                this.prices.life = Math.round(this.prices.life * 1.6);
                break;
            case 'bomb':
                this.bombs++;
                this.prices.bomb = Math.round(this.prices.bomb * 1.4);
                break;
            case 'slow':
                this.slowC++;
                this.prices.slow = Math.round(this.prices.slow * 1.45);
                break;
        }
        
        this.ui.updateShop();
        this.ui.updateHUD();
    }
    
    nextLevel(fromBoss = false) {
        this.stats.lvl++;
        this.task.got = 0;
        this.stats.speed += 25;
        this.stats.spawn = Math.max(0.4, this.stats.spawn * 0.9);
        this.task.need += 5;
        this.task.shape = this.settings.getShapeForLevel(this.stats.lvl);
        
        if (this.stats.lvl % 5 === 0 && !fromBoss) {
            this.boss.start();
        }
        
        this.ui.levelUp();
        this.ui.updateHUD();
    }
    
    gameOver(reason) {
        this.engine.stop();
        this.ui.showGameOver();
    }
    
    update(deltaTime) {
        if (this.mode === 'menu') return;
        
        if (this.mode === 'ranked') {
            this.timer -= deltaTime;
            if (this.timer <= 0) {
                this.gameOver('Time up');
                return;
            }
        }
        
        if (this.slowT > 0) {
            this.slowT -= deltaTime;
        }
        
        this.spawnTimer -= deltaTime;
        if (this.spawnTimer <= 0) {
            this.entities.spawn();
            this.spawnTimer = this.stats.spawn * (0.5 + Math.random() * 0.5);
        }
        
        this.entities.update(deltaTime * (this.slowT > 0 ? 0.4 : 1));
        this.particles.update(deltaTime);
        this.boss.update(deltaTime);
        
        this.ui.updateHUD();
    }
    
    render() {
        this.engine.clear();
        this.entities.render(this.engine.ctx);
        this.particles.render(this.engine.ctx);
        this.boss.render(this.engine.ctx);
    }
}

export { Game };