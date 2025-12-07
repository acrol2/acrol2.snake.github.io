class Snake {
    constructor(ctx, tileSize) {
        this.ctx = ctx;
        this.tileSize = tileSize;
        this.halfTile = this.tileSize / 2; 

        // Load images directly
        this.imgHead = new Image();   this.imgHead.src = 'Assets/Snakehead.png';
        this.imgBody = new Image();   this.imgBody.src = 'Assets/Snakebody.png';
        this.imgTail = new Image();   this.imgTail.src = 'Assets/Snaketail.png';
        this.imgCorner = new Image(); this.imgCorner.src = 'Assets/Snakecorner.png';

        this.reset();
    }

    reset() {
        // Center of 18x18 grid is 9,9
        // Initial Body is vertical, facing UP
        this.body = [
            {x: 9, y: 9},  // Head
            {x: 9, y: 10}, // Neck (The danger zone for "Down" input)
            {x: 9, y: 11}, 
            {x: 8, y: 11}, 
            {x: 7, y: 11}  
        ];
        
        this.lastPoppedTail = {x: 6, y: 11}; 
        
        // Default Direction: UP
        this.dx = 0;
        this.dy = -1;
        
        this.inputQueue = [];
        this.growing = false;
    }

    // FIXED: Now checks against the neck to prevent 180-degree start deaths
    setInstantDirection(key) {
        let newDx = 0; 
        let newDy = 0;
        
        if (key === 'ArrowUp')    { newDx = 0; newDy = -1; }
        if (key === 'ArrowDown')  { newDx = 0; newDy = 1; }
        if (key === 'ArrowLeft')  { newDx = -1; newDy = 0; }
        if (key === 'ArrowRight') { newDx = 1; newDy = 0; }

        // SAFETY CHECK:
        // Calculate where the head would go with this new direction
        const head = this.body[0];
        const neck = this.body[1]; // The segment right behind the head

        // If the new direction lands on the neck, it's a suicide turn.
        // We ignore it and keep the default direction (UP) set in reset().
        if (head.x + newDx === neck.x && head.y + newDy === neck.y) {
            return; 
        }

        // Otherwise, apply the direction
        this.dx = newDx;
        this.dy = newDy;
    }

    handleInput(key) {
        let move = null;
        if (key === 'ArrowUp')    move = {x: 0, y: -1};
        if (key === 'ArrowDown')  move = {x: 0, y: 1};
        if (key === 'ArrowLeft')  move = {x: -1, y: 0};
        if (key === 'ArrowRight') move = {x: 1, y: 0};

        if (move && this.inputQueue.length < 2) {
            this.inputQueue.push(move);
        }
    }

    getHead() { return this.body[0]; }

    checkCollision(boardWidth, boardHeight) {
        const head = this.body[0];
        const cols = boardWidth / this.tileSize;
        const rows = boardHeight / this.tileSize;

        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) return true;
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) return true;
        }
        return false;
    }

    grow() { this.growing = true; }

    update(soundModule) {
        if (this.inputQueue.length > 0) {
            const nextMove = this.inputQueue.shift();
            if (!(nextMove.x === -this.dx && nextMove.y === -this.dy)) {
                if (nextMove.x !== this.dx || nextMove.y !== this.dy) {
                    this.dx = nextMove.x;
                    this.dy = nextMove.y;
                    if (soundModule) soundModule.playTurn();
                }
            } else if (this.inputQueue.length > 0) {
                 const secondMove = this.inputQueue.shift();
                 if (!(secondMove.x === -this.dx && secondMove.y === -this.dy)) {
                    if (secondMove.x !== this.dx || secondMove.y !== this.dy) {
                        this.dx = secondMove.x;
                        this.dy = secondMove.y;
                        if (soundModule) soundModule.playTurn();
                    }
                 }
            }
        }

        const head = { x: this.body[0].x + this.dx, y: this.body[0].y + this.dy };
        this.body.unshift(head);
        
        if (this.growing) {
            this.lastPoppedTail = { ...this.body[this.body.length - 1] };
            this.growing = false;
        } else {
            this.lastPoppedTail = this.body.pop();
        }
    }

    draw(progress) {
        // Body
        for (let i = 1; i < this.body.length; i++) {
            const segment = this.body[i];
            const prev = this.body[i-1]; 
            const next = this.body[i+1] || this.lastPoppedTail; 

            if (i === 1) {
                const headDirX = this.body[0].x - segment.x;
                const headDirY = this.body[0].y - segment.y;
                this.drawRevealingBody(segment, prev, next, headDirX, headDirY, progress);
            } else if (i === this.body.length - 1) {
                const currentTail = this.body[this.body.length-1];
                let tailDirX = currentTail.x - this.lastPoppedTail.x;
                let tailDirY = currentTail.y - this.lastPoppedTail.y;
                if (tailDirX === 0 && tailDirY === 0) {
                     const neighbor = this.body[this.body.length - 2];
                     tailDirX = neighbor.x - currentTail.x;
                     tailDirY = neighbor.y - currentTail.y;
                }
                this.drawVanishingBody(segment, prev, next, tailDirX, tailDirY, progress);
            } else {
                this.drawStaticBodyPart(segment, prev, next);
            }
        }

        // Tail
        const currentTail = this.body[this.body.length - 1];
        const tailStartX = this.lastPoppedTail.x * this.tileSize;
        const tailStartY = this.lastPoppedTail.y * this.tileSize;
        const tailEndX   = currentTail.x * this.tileSize;
        const tailEndY   = currentTail.y * this.tileSize;

        const animTailX = tailStartX + (tailEndX - tailStartX) * progress;
        const animTailY = tailStartY + (tailEndY - tailStartY) * progress;

        let tDirX = currentTail.x - this.lastPoppedTail.x;
        let tDirY = currentTail.y - this.lastPoppedTail.y;
        
        if (tDirX === 0 && tDirY === 0) {
             const neighbor = this.body[this.body.length - 2];
             tDirX = neighbor.x - currentTail.x;
             tDirY = neighbor.y - currentTail.y;
        }
        this.drawRotatedImage(this.imgTail, animTailX + this.halfTile, animTailY + this.halfTile, this.getDirectionAngle(tDirX, tDirY));

        // Head
        const oldHead = this.body[1];
        const newHead = this.body[0];
        const headStartX = oldHead.x * this.tileSize;
        const headStartY = oldHead.y * this.tileSize;
        const headEndX   = newHead.x * this.tileSize;
        const headEndY   = newHead.y * this.tileSize;

        const animHeadX = headStartX + (headEndX - headStartX) * progress;
        const animHeadY = headStartY + (headEndY - headStartY) * progress;
        const hDirX = newHead.x - oldHead.x;
        const hDirY = newHead.y - oldHead.y;

        this.drawRotatedImage(this.imgHead, animHeadX + this.halfTile, animHeadY + this.halfTile, this.getDirectionAngle(hDirX, hDirY));
    }

    drawRevealingBody(current, neighborA, neighborB, dirX, dirY, progress) {
        const pxRevealed = Math.floor(progress * this.tileSize);
        if (pxRevealed <= 0) return;
        const drawX = current.x * this.tileSize;
        const drawY = current.y * this.tileSize;
        this.ctx.save(); 
        this.ctx.beginPath();
        if (dirX === 1)       this.ctx.rect(drawX, drawY, pxRevealed, this.tileSize);
        else if (dirX === -1) this.ctx.rect(drawX + (this.tileSize - pxRevealed), drawY, pxRevealed, this.tileSize);
        else if (dirY === 1)  this.ctx.rect(drawX, drawY, this.tileSize, pxRevealed);
        else if (dirY === -1) this.ctx.rect(drawX, drawY + (this.tileSize - pxRevealed), this.tileSize, pxRevealed);
        this.ctx.clip();
        this.drawSmartBodySprite(current, neighborA, neighborB, drawX, drawY);
        this.ctx.restore();
    }

    drawVanishingBody(current, neighborA, neighborB, dirX, dirY, progress) {
        const pxRemaining = Math.ceil((1.0 - progress) * this.tileSize);
        if (pxRemaining <= 0) return;
        const drawX = current.x * this.tileSize;
        const drawY = current.y * this.tileSize;
        this.ctx.save();
        this.ctx.beginPath();
        if (dirX === 1)       this.ctx.rect(drawX + (this.tileSize - pxRemaining), drawY, pxRemaining, this.tileSize); 
        else if (dirX === -1) this.ctx.rect(drawX, drawY, pxRemaining, this.tileSize); 
        else if (dirY === 1)  this.ctx.rect(drawX, drawY + (this.tileSize - pxRemaining), this.tileSize, pxRemaining); 
        else if (dirY === -1) this.ctx.rect(drawX, drawY, this.tileSize, pxRemaining); 
        this.ctx.clip();
        this.drawSmartBodySprite(current, neighborA, neighborB, drawX, drawY);
        this.ctx.restore();
    }

    drawStaticBodyPart(current, neighborA, neighborB) {
        this.drawSmartBodySprite(current, neighborA, neighborB, current.x * this.tileSize, current.y * this.tileSize);
    }

    drawSmartBodySprite(current, neighborA, neighborB, x, y) {
        let img = this.imgBody;
        let rot = 0;
        if (neighborA.x === neighborB.x) rot = 0;
        else if (neighborA.y === neighborB.y) rot = 90;
        else {
            img = this.imgCorner;
            const cx = current.x, cy = current.y;
            const hasRight = (neighborA.x > cx || neighborB.x > cx);
            const hasLeft  = (neighborA.x < cx || neighborB.x < cx);
            const hasUp    = (neighborA.y < cy || neighborB.y < cy);
            const hasDown  = (neighborA.y > cy || neighborB.y > cy);
            if (hasDown && hasRight) rot = 0;
            else if (hasDown && hasLeft) rot = 90;
            else if (hasUp && hasLeft) rot = 180;
            else if (hasUp && hasRight) rot = 270;
        }
        this.drawRotatedImage(img, x + this.halfTile, y + this.halfTile, rot);
    }

    getDirectionAngle(vx, vy) {
        if (vx === 0 && vy === -1) return 0;   
        if (vx === 1 && vy === 0)  return 90;  
        if (vx === 0 && vy === 1)  return 180; 
        if (vx === -1 && vy === 0) return 270; 
        return 0;
    }

    drawRotatedImage(img, cx, cy, degrees) {
        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(degrees * Math.PI / 180);
        this.ctx.drawImage(img, -this.halfTile, -this.halfTile, this.tileSize, this.tileSize);
        this.ctx.restore();
    }
}