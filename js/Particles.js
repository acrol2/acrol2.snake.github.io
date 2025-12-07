class Particles {
    constructor(ctx) {
        this.ctx = ctx;
        this.particles = [];
    }

    // Call this when eating food
    spawn(x, y, color) {
        const particleCount = 8; // Number of bits
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                // Random velocity
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                // Life (1.0 = full, 0.0 = dead)
                life: 1.0,
                color: color
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            
            // Move
            p.x += p.vx;
            p.y += p.vy;
            
            // Decay life
            p.life -= 0.05; // Fade speed

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            // Use globalAlpha to fade them out
            this.ctx.globalAlpha = p.life;
            // Draw tiny 4x4 pixel squares
            this.ctx.fillRect(p.x, p.y, 4, 4);
        }
        this.ctx.globalAlpha = 1.0; // Reset alpha
    }
    
    reset() {
        this.particles = [];
    }
}