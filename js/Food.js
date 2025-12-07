class Food {
    constructor(ctx, tileSize, boardWidth, boardHeight) {
        this.ctx = ctx;
        this.tileSize = tileSize;
        this.halfTile = this.tileSize / 2;
        this.cols = boardWidth / tileSize;
        this.rows = boardHeight / tileSize;
        this.position = {x: 10, y: 5};

        this.image = new Image();
        this.image.src = 'Assets/Food.png'; 
    }

    spawn(snakeBody) {
        let valid = false;
        while (!valid) {
            const x = Math.floor(Math.random() * this.cols);
            const y = Math.floor(Math.random() * this.rows);
            valid = true;
            for (let part of snakeBody) {
                if (part.x === x && part.y === y) {
                    valid = false;
                    break;
                }
            }
            if (valid) this.position = {x: x, y: y};
        }
    }

    draw(timestamp) {
        const px = this.position.x * this.tileSize;
        const py = this.position.y * this.tileSize;

        const swaySpeed = 0.003; 
        const swayAmount = 0.2; 
        const angle = Math.sin(timestamp * swaySpeed) * swayAmount;

        const pulseSpeed = 0.005;
        const scaleBase = 1.0;
        const scaleVar = 0.1; 
        const scale = scaleBase + (Math.sin(timestamp * pulseSpeed) * scaleVar);

        this.ctx.save();
        this.ctx.translate(px + this.halfTile, py + this.halfTile);
        this.ctx.rotate(angle);
        this.ctx.scale(scale, scale);
        
        // Standard draw (No filters)
        this.ctx.drawImage(this.image, -this.halfTile, -this.halfTile, this.tileSize, this.tileSize);

        this.ctx.restore();
    }
}