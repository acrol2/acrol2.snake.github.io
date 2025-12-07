const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false; 

const TILE_SIZE = 32; 
const SPEED = 160; 

// Initialize Modules
const ui = new UI();
const grid = new Grid(ctx, canvas.width, canvas.height, TILE_SIZE);
const snake = new Snake(ctx, TILE_SIZE);
const food = new Food(ctx, TILE_SIZE, canvas.width, canvas.height);
const sound = new Sound();
const particles = new Particles(ctx);

const STATE = {
    MENU: 0,
    RUNNING: 1,
    PAUSED: 2,
    GAMEOVER: 3
};

let currentState = STATE.MENU;
let lastTickTime = 0;
let screenShake = 0;
let resetTimerNextFrame = false; 

// --- INPUTS ---
document.addEventListener('keydown', (e) => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    if (e.key === 'Escape') togglePause();
    
    handleGameInput(e.key);
});

setupDPad('btnUp', 'ArrowUp');
setupDPad('btnDown', 'ArrowDown');
setupDPad('btnLeft', 'ArrowLeft');
setupDPad('btnRight', 'ArrowRight');

function setupDPad(id, key) {
    const btn = document.getElementById(id);
    const handlePress = (e) => {
        e.preventDefault();
        handleGameInput(key);
    };
    btn.addEventListener('touchstart', handlePress, {passive: false});
    btn.addEventListener('mousedown', handlePress);
}

function handleGameInput(key) {
    if (currentState === STATE.RUNNING) {
        snake.handleInput(key);
    } 
    else if (currentState === STATE.MENU || currentState === STATE.GAMEOVER) {
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(key)) {
            startGame(key);
        }
    }
}

document.getElementById('startBtn').addEventListener('click', () => startGame());
document.getElementById('restartBtn').addEventListener('click', () => startGame());
document.getElementById('resumeBtn').addEventListener('click', togglePause);

// --- FUNCTIONS ---
function startGame(startKey = null) {
    snake.reset();
    particles.reset(); 
    if (startKey) snake.setInstantDirection(startKey);
    food.spawn(snake.body);
    ui.updateScore(snake.body.length);
    ui.hideAll();
    screenShake = 0;
    currentState = STATE.RUNNING;
    resetTimerNextFrame = true;
}

function togglePause() {
    if (currentState === STATE.RUNNING) {
        currentState = STATE.PAUSED;
        ui.showPause();
    } else if (currentState === STATE.PAUSED) {
        currentState = STATE.RUNNING;
        ui.hideAll();
        resetTimerNextFrame = true; 
    }
}

function gameOver() {
    screenShake = 0;
    sound.playDie();
    currentState = STATE.GAMEOVER;
    ui.showGameOver(snake.body.length);
}

// --- GAME LOOP ---
function gameLoop(timestamp) {
    if (!lastTickTime) lastTickTime = timestamp;

    if (resetTimerNextFrame) {
        lastTickTime = timestamp;
        resetTimerNextFrame = false;
    }

    if (currentState === STATE.RUNNING) {
        let timeSinceTick = timestamp - lastTickTime;

        if (timeSinceTick > 1000) {
            timeSinceTick = SPEED;
            lastTickTime = timestamp - SPEED;
        }

        if (timeSinceTick >= SPEED) {
            snake.update(sound);

            // 1. Check Collision
            if (snake.checkCollision(canvas.width, canvas.height)) {
                screenShake = 15; 
                render(1.0, timestamp); 
                gameOver();
                requestAnimationFrame(gameLoop); 
                return; 
            }

            // 2. Check Food
            const head = snake.getHead();
            if (head.x === food.position.x && head.y === food.position.y) {
                snake.grow();
                food.spawn(snake.body);
                
                // FIXED: Manually add 1 to the score because the snake
                // body length won't physically change until the NEXT update frame.
                ui.updateScore(snake.body.length + 1);
                
                sound.playEat();
                screenShake = 5;
                
                const centerX = (head.x * TILE_SIZE) + (TILE_SIZE/2);
                const centerY = (head.y * TILE_SIZE) + (TILE_SIZE/2);
                particles.spawn(centerX, centerY, '#00ff00'); 
            }

            lastTickTime += SPEED;
            timeSinceTick -= SPEED;
        }

        if (screenShake > 0) {
            screenShake *= 0.9; 
            if (screenShake < 0.5) screenShake = 0;
        }

        particles.update();
        const progress = Math.min(timeSinceTick / SPEED, 1.0);
        render(progress, timestamp);
    } 
    else {
        render(1.0, timestamp);
    }

    requestAnimationFrame(gameLoop);
}

function render(progress, timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    
    if (screenShake > 0 && currentState === STATE.RUNNING) {
        const jitterX = (Math.random() - 0.5) * screenShake;
        const jitterY = (Math.random() - 0.5) * screenShake;
        ctx.translate(jitterX, jitterY);
    }

    grid.draw();
    food.draw(timestamp); 
    snake.draw(progress);
    particles.draw();
    
    ctx.restore();
}

requestAnimationFrame(gameLoop);