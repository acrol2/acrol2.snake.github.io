class UI {
    constructor() {
        this.scoreEl = document.getElementById('scoreBoard');
        this.startScreen = document.getElementById('startScreen');
        this.pauseScreen = document.getElementById('pauseScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.finalScoreEl = document.getElementById('finalScore');
    }

    updateScore(length) {
        this.scoreEl.innerText = length; 
    }

    showStart() {
        this.hideAll();
        this.startScreen.style.display = 'flex';
    }

    showPause() {
        this.hideAll();
        this.pauseScreen.style.display = 'flex';
    }

    showGameOver(length) {
        this.hideAll();
        this.finalScoreEl.innerText = "FINAL LENGTH: " + length;
        this.gameOverScreen.style.display = 'flex';
    }

    hideAll() {
        this.startScreen.style.display = 'none';
        this.pauseScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
    }
}