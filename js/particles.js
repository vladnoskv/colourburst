export class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    clear() {
        this.particles.length = 0;
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }
}

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 0.6;
        this.maxLife = 0.6;
        this.r = 3 + Math.random() * 4;
        
        this.vx = (Math.random() - 0.5) * 350;
        this.vy = (Math.random() - 0.5) * 350;
        this.gravity = 160;
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += this.gravity * deltaTime;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(this.life / this.maxLife, 0);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}