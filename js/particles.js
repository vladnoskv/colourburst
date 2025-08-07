export class ParticleSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
    }

    createBurst(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, this.ctx));
        }
    }

    createTrail(x, y, color) {
        this.particles.push(new TrailParticle(x, y, color, this.ctx));
    }

    createScorePopup(x, y, text, color = '#ffffff') {
        this.particles.push(new ScorePopup(x, y, text, color, this.ctx));
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        this.particles.forEach(particle => particle.render());
    }

    clear() {
        this.particles = [];
    }

    getCount() {
        return this.particles.length;
    }

    updateCanvasSize(width, height) {
        // Update canvas boundaries for particles
        this.particles.forEach(particle => {
            // Keep particles within new bounds
            if (particle.x > width) particle.x = width - 10;
            if (particle.y > height) particle.y = height - 10;
            if (particle.x < 0) particle.x = 10;
            if (particle.y < 0) particle.y = 10;
        });
    }
}

class Particle {
    constructor(x, y, color, ctx) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.ctx = ctx;
        
        // Physics
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 100;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 300;
        
        // Appearance
        this.size = Math.random() * 8 + 4;
        this.lifetime = 1.0;
        this.maxLifetime = 1.0;
        
        // Effects
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
    }

    update(deltaTime) {
        // Physics
        this.vy += this.gravity * deltaTime;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Lifetime
        this.lifetime -= deltaTime;
        
        // Rotation
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Size decay
        this.size *= 0.99;
    }

    render() {
        const alpha = this.lifetime / this.maxLifetime;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation);
        
        // Main particle
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Glow effect
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0 || this.size <= 0.5;
    }
}

class TrailParticle {
    constructor(x, y, color, ctx) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.ctx = ctx;
        
        this.size = 15;
        this.lifetime = 0.5;
        this.maxLifetime = 0.5;
    }

    update(deltaTime) {
        this.lifetime -= deltaTime;
        this.size *= 0.95;
    }

    render() {
        const alpha = this.lifetime / this.maxLifetime;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        const gradient = this.ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

class ScorePopup {
    constructor(x, y, text, color, ctx) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.ctx = ctx;
        
        this.vy = -100; // Move upward
        this.lifetime = 1.5;
        this.maxLifetime = 1.5;
        this.fontSize = 24;
    }

    update(deltaTime) {
        this.y += this.vy * deltaTime;
        this.lifetime -= deltaTime;
        this.fontSize += 10 * deltaTime; // Grow slightly
    }

    render() {
        const alpha = this.lifetime / this.maxLifetime;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = this.color;
        this.ctx.font = `bold ${this.fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillText(this.text, this.x, this.y);
        
        this.ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

class ComboEffect {
    constructor(x, y, combo, ctx) {
        this.x = x;
        this.y = y;
        this.combo = combo;
        this.ctx = ctx;
        
        this.scale = 0;
        this.targetScale = 1.5;
        this.lifetime = 1.0;
        this.maxLifetime = 1.0;
        this.rotation = 0;
    }

    update(deltaTime) {
        if (this.scale < this.targetScale) {
            this.scale += (this.targetScale - this.scale) * 5 * deltaTime;
        } else {
            this.lifetime -= deltaTime;
            this.rotation += 180 * deltaTime;
        }
    }

    render() {
        const alpha = this.lifetime / this.maxLifetime;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        this.ctx.scale(this.scale, this.scale);
        
        // Background circle
        this.ctx.fillStyle = '#ffdd44';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Text
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.combo}x COMBO!`, 0, 0);
        
        this.ctx.restore();
    }

    isDead() {
        return this.lifetime <= 0;
    }
}

// Export additional particle types
export { TrailParticle, ScorePopup, ComboEffect };

// Utility function for creating different particle effects
export const ParticleEffects = {
    createHitBurst: (x, y, color, count = 8) => {
        return Array.from({ length: count }, () => new Particle(x, y, color, null));
    },
    
    createStarBurst: (x, y, colors, count = 12) => {
        return Array.from({ length: count }, (_, i) => {
            const color = colors[i % colors.length];
            return new Particle(x, y, color, null);
        });
    },
    
    createRainbowBurst: (x, y, count = 10) => {
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#88ff00', '#00ff00', '#00ff88', '#0088ff', '#0000ff', '#8800ff', '#ff0088'];
        return this.createStarBurst(x, y, colors, count);
    }
};