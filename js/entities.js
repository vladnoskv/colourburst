export class BaseEntity {
    constructor(x, y, speed, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = speed;
        this.lifetime = 6;
        this.age = 0;
        
        // Canvas dimensions (will be updated)
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Visual properties
        this.color = this.getColor();
        this.size = this.getSize();
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 4;
        
        // Animation
        this.scale = 0;
        this.targetScale = 1;
        this.animationSpeed = 3;
    }

    getColor() {
        return '#ffffff';
    }

    getSize() {
        return 20;
    }

    update(deltaTime) {
        this.age += deltaTime;
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Bounce off walls
        if (this.x - this.size < 0 || this.x + this.size > this.canvasWidth) {
            this.vx *= -1;
            this.x = Math.max(this.size, Math.min(this.canvasWidth - this.size, this.x));
        }
        
        if (this.y - this.size < 60 || this.y + this.size > this.canvasHeight) {
            this.vy *= -1;
            this.y = Math.max(60 + this.size, Math.min(this.canvasHeight - this.size, this.y));
        }
        
        // Scale animation
        if (this.scale < this.targetScale) {
            this.scale = Math.min(this.targetScale, this.scale + this.animationSpeed * deltaTime);
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        this.renderShape(ctx);
        
        ctx.restore();
    }

    renderShape(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    contains(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.size * this.scale;
    }

    isExpired() {
        return this.age >= this.lifetime;
    }

    getPoints() {
        return 0;
    }

    getProgress() {
        return 0;
    }
}

export class Orb extends BaseEntity {
    constructor(x, y, speed) {
        super(x, y, speed, 'orb');
        this.lifetime = 6;
    }

    getColor() {
        const hue = (Date.now() * 0.001 + this.x * 0.01) % 360;
        return `hsl(${hue}, 80%, 60%)`;
    }

    getSize() {
        return 25;
    }

    getPoints() {
        return 10;
    }

    getProgress() {
        return 8;
    }

    renderShape(ctx) {
        // Main circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Bomb extends BaseEntity {
    constructor(x, y, speed) {
        super(x, y, speed * 0.8, 'bomb');
        this.lifetime = 5;
        this.pulsePhase = 0;
    }

    getColor() {
        return '#ff4444';
    }

    getSize() {
        return 30;
    }

    getPoints() {
        return -20;
    }

    getProgress() {
        return -10;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.pulsePhase += deltaTime * 4;
    }

    renderShape(ctx) {
        // Bomb body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Fuse
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(10, -this.size - 10, 15, -this.size - 5);
        ctx.stroke();
        
        // Warning symbol
        ctx.fillStyle = '#ffff00';
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, 0);
        
        // Pulsing effect
        const pulseSize = this.size + Math.sin(this.pulsePhase) * 3;
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
    }
}

export class Star extends BaseEntity {
    constructor(x, y, speed) {
        super(x, y, speed * 1.2, 'star');
        this.lifetime = 7;
        this.twinklePhase = 0;
    }

    getColor() {
        return '#ffdd44';
    }

    getSize() {
        return 20;
    }

    getPoints() {
        return 25;
    }

    getProgress() {
        return 15;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.twinklePhase += deltaTime * 3;
    }

    renderShape(ctx) {
        const spikes = 5;
        const innerRadius = this.size * 0.5;
        const outerRadius = this.size;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Twinkle effect
        const alpha = 0.5 + Math.sin(this.twinklePhase) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Decoy extends BaseEntity {
    constructor(x, y, speed) {
        super(x, y, speed * 0.9, 'decoy');
        this.lifetime = 4;
        this.alpha = 0.7;
    }

    getColor() {
        return '#666666';
    }

    getSize() {
        return 22;
    }

    getPoints() {
        return -5;
    }

    getProgress() {
        return 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.alpha = 0.4 + Math.sin(this.age * 4) * 0.3;
    }

    renderShape(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Question mark
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 0, 0);
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        this.renderShape(ctx);
        
        ctx.restore();
    }
}