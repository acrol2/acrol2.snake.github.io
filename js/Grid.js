class Grid {
    constructor(ctx, width, height, tileSize) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        
        // Load the Tile directly. No processing.
        this.image = new Image();
        this.image.src = 'Assets/Tile.png';
    }

    draw() {
        // --- STEP 1: DRAW THE TILES (Background) ---
        const cols = this.width / this.tileSize;
        const rows = this.height / this.tileSize;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.ctx.drawImage(
                    this.image, 
                    c * this.tileSize, 
                    r * this.tileSize, 
                    this.tileSize, 
                    this.tileSize
                );
            }
        }

        // --- STEP 2: DRAW THE GRID LINES (Overlay) ---
        this.ctx.save();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"; // 80% Black lines
        
        this.ctx.beginPath();
        for (let x = 0; x <= this.width; x += this.tileSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
        }
        for (let y = 0; y <= this.height; y += this.tileSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
        this.ctx.restore();
    }
}