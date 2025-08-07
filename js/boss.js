export class BossManager {
    constructor(game) {
        this.game = game;
        this.boss = null;
        this.isActive = false;
        this.maxHealth = 20;
        this.currentHealth = 20;
        this.timer = 30;
    }
    
    start() {
        const canvas = this.game.engine.canvas;
        this.boss = new Boss(canvas.width / 2, canvas.height / 2, this.game.stats.lvl);
        this.isActive = true;
        this.currentHealth = this.maxHealth;
        this.timer = 30;
        
        this.game.ui.showBossHealth();
        this.game.ui.updateBossHealth();
    }
    
    hit() {
        if (!this.isActive || !this.boss) return;
        
        this.currentHealth--;
        this.game.ui.updateBossHealth();
        
        if (this.currentHealth <= 0) {
            this.defeat();
        }
    }
    
    defeat() {
        if (!this.isActive) return;
        
        this.game.stats.pts += 200;
        this.game.nextLevel(true);
        this.reset();
    }
    
    escape() {
        if (!this.isActive) return;
        
        this.game.lives--;
        this.game.ui.updateHUD();
        this.reset();
    }
    
    reset() {
        this.boss = null;
        this.isActive = false;
        this.game.ui.hideBossHealth();
    }
    
    update(deltaTime) {
        if (!this.isActive || !this.boss) return;
        
        this.timer -= deltaTime;
        this.boss.update(deltaTime);
        
        if (this.timer <= 0) {
            this.escape();
        }
    }
    
    render(ctx) {
        if (this.isActive && this.boss) {
            this.boss.render(ctx);
        }
    }
}

export class Boss {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.r = 50 + level * 5;
        this.speed = 100 + level * 10;
        this.vx = (Math.random() - 0.5) * this.speed;
        this.vy = (Math.random() - 0.5) * this.speed;
        this.type = 'boss';
        this.color = '#ff4757';
    }
    
    update(deltaTime) {
        const canvas = this.game?.engine?.canvas || { width: 800, height: 600 };
        const width = canvas.width;
        const height = canvas.height;
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Bounce off walls
        if (this.x - this.r <= 0 || this.x + this.r >= width) {
            this.vx *= -1;
            this.x = Math.max(this.r, Math.min(width - this.r, this.x));
        }
        if (this.y - this.r <= 0 || this.y + this.r >= height) {
            this.vy *= -1;
            this.y = Math.max(this.r, Math.min(height - this.r, this.y));
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Boss glow effect
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2);
        glow.addColorStop(0, this.color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main boss body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss details
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.15, 0, Math.PI * 2);
        ctx.arc(this.x + this.r * 0.3, this.y - this.r * 0.3, this.r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Angry eyebrows
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x - this.r * 0.5, this.y - this.r * 0.5);
        ctx.lineTo(this.x - this.r * 0.1, this.y - this.r * 0.6);
        ctx.moveTo(this.x + this.r * 0.1, this.y - this.r * 0.6);
        ctx.lineTo(this.x + this.r * 0.5, this.y - this.r * 0.5);
        ctx.stroke();
        
        // Frown
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.r * 0.3, this.r * 0.3, 0, Math.PI);
        ctx.stroke();
        
        ctx.restore();
    }
}