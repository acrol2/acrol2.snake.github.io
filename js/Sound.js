class Sound {
    constructor() {
        this.eatSound = new Audio('Sounds/Eat.wav');
        this.dieSound = new Audio('Sounds/Die.wav');
        this.turnSound = new Audio('Sounds/Turn.wav'); // NEW
        
        this.eatSound.volume = 0.4;
        this.dieSound.volume = 0.5;
        this.turnSound.volume = 0.2; // Subtle click
    }

    playEat() {
        const sound = this.eatSound.cloneNode();
        sound.play().catch(e => { });
    }

    playDie() {
        this.dieSound.play().catch(e => { });
    }

    playTurn() {
        const sound = this.turnSound.cloneNode();
        sound.play().catch(e => { });
    }
}