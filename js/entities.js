export class EntityManager {
    constructor(game) {
        this.game = game;
        this.entities = [];
        this.shapes = ['circle', 'square', 'tri', 'star'];
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#fec957', '#ff9ff3', '#54a0ff', '#48dbfb'];
    }
    
    spawn() {
        const canvas = this.game.engine.canvas;
        const type = this.getRandomType();
        const entity = new Entity(type, canvas.width, canvas.height, this.game.stats.speed);
        this.entities.push(entity);
    }
    
    getRandomType() {
        const rand = Math.random();
        
        if (rand < 0.05) return 'bomb';
        if (rand < 0.15) return 'star';
        if (rand < 0.35) return 'square';
        if (rand < 0.55) return 'tri';
        return 'circle';
    }
    
    checkHit(x, y, radius) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            const dx = x - entity.x;
            const dy = y - entity.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= entity.r + radius * 25) {
                return entity;
            }
        }
        return null;
    }
    
    remove(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
    
    clear() {
        this.entities.length = 0;
    }
    
    update(deltaTime) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            entity.update(deltaTime);
            
            if (entity.life <= 0) {
                if (entity.type !== 'bomb') {
                    this.game.loseLife();
                }
                this.entities.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.entities.forEach(entity => entity.render(ctx));
    }
}

export class Entity {
    constructor(type, canvasWidth, canvasHeight, speed) {
        this.type = type;
        this.r = this.getRadius(type);
        this.life = 6;
        
        // Ensure valid canvas dimensions
        const width = canvasWidth || 800;
        const height = canvasHeight || 600;
        
        this.x = Math.random() * (width - 2 * this.r) + this.r;
        this.y = Math.random() * (height - 2 * this.r - 70) + this.r + 70;
        
        const angle = Math.random() * Math.PI * 2;
        const spd = speed * (0.5 + Math.random() * 0.7);
        this.vx = Math.cos(angle) * spd;
        this.vy = Math.sin(angle) * spd;
        
        this.color = this.getColor(type);
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
    
    getRadius(type) {
        switch (type) {
            case 'star': return 30;
            case 'bomb': return 25;
            default: return 25;
        }
    }
    
    getColor(type) {
        switch (type) {
            case 'circle': return '#ff6b6b';
            case 'square': return '#4ecdc4';
            case 'tri': return '#45b7d1';
            case 'star': return '#fec957';
            case 'bomb': return '#000';
            default: return '#ff6b6b';
        }
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime;
        
        // Bounce off walls
        const width = this.canvasWidth;
        const height = this.canvasHeight;
        
        if (this.x <= this.r || this.x >= width - this.r) {
            this.vx *= -1;
            this.x = Math.max(this.r, Math.min(width - this.r, this.x));
        }
        if (this.y <= this.r || this.y >= height - this.r) {
            this.vy *= -1;
            this.y = Math.max(this.r, Math.min(height - this.r, this.y));
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Draw glow effect
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 1.5);
        glow.addColorStop(0, this.color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw main shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        switch (this.type) {
            case 'circle':
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                break;
            case 'square':
                ctx.rect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
                break;
            case 'tri':
                this.drawTriangle(ctx);
                break;
            case 'star':
                this.drawStar(ctx);
                break;
            case 'bomb':
                this.drawBomb(ctx);
                break;
        }
        
        ctx.fill();
        
        // Add special effects
        if (this.type === 'star') {
            ctx.fillStyle = '#ffff88';
            for (let i = 0; i < 4; i++) {
                const angle = (Date.now() * 0.005) + (i * Math.PI / 2);
                const x = this.x + Math.cos(angle) * (this.r + 5);
                const y = this.y + Math.sin(angle) * (this.r + 5);
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    drawTriangle(ctx) {
        const angle = 0;
        const points = 3;
        const outerRadius = this.r;
        const innerRadius = this.r * 0.5;
        
        ctx.moveTo(this.x + outerRadius * Math.cos(angle), this.y + outerRadius * Math.sin(angle));
        
        for (let i = 1; i <= points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const a = angle + (i * Math.PI) / points;
            ctx.lineTo(this.x + radius * Math.cos(a), this.y + radius * Math.sin(a));
        }
        
        ctx.closePath();
    }
    
    drawStar(ctx) {
        const angle = 0;
        const points = 5;
        const outerRadius = this.r;
        const innerRadius = this.r * 0.5;
        
        ctx.moveTo(this.x + outerRadius * Math.cos(angle), this.y + outerRadius * Math.sin(angle));
        
        for (let i = 1; i <= points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const a = angle + (i * Math.PI) / points;
            ctx.lineTo(this.x + radius * Math.cos(a), this.y + radius * Math.sin(a));
        }
        
        ctx.closePath();
    }
    
    drawBomb(ctx) {
        // Main bomb body
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        
        // Fuse
        ctx.moveTo(this.x, this.y - this.r);
        ctx.lineTo(this.x, this.y - this.r - 8);
        
        // Spark at end of fuse
        ctx.arc(this.x, this.y - this.r - 8, 3, 0, Math.PI * 2);
    }
}