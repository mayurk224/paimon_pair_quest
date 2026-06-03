const tilesContainer = document.getElementById('tiles-container');
const musicBtn = document.getElementById('music-btn');
const restartBtn = document.getElementById('restart-btn');
const timerDisplay = document.querySelector('.nav-timer');
const msDisplay = document.querySelector('.ms');
const prevTimerDisplay = document.querySelector('.prev-timer');
const prevMsDisplay = document.querySelector('.prev-ms');

const bgMusic = new Audio('assets/sounds/music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.6;
const clickSound = new Audio('assets/sounds/click.mp3');
const matchSound = new Audio('assets/sounds/match.mp3');
const notMatchSound = new Audio('assets/sounds/not-match.mp3');
const buttonSound = new Audio('assets/sounds/button.mp3');

let cards = [];
let flippedCards = [];
let matchedCount = 0;
let isLocked = false;
let isMusicPlaying = false;

let startTime;
let timerInterval;
let bestTime = localStorage.getItem('matchIqBestTime');

if (bestTime) {
    displayBestTime(bestTime);
}

function initGame() {
    tilesContainer.innerHTML = '';
    flippedCards = [];
    matchedCount = 0;
    isLocked = false;
    clearInterval(timerInterval);
    timerDisplay.textContent = '00:00';
    msDisplay.textContent = '.00';
    startTime = null;
    musicBtn.style.opacity = isMusicPlaying ? '1' : '0.5';

    const stickers = [];
    for (let i = 1; i <= 8; i++) {
        stickers.push(`sticker_${i}.png`);
        stickers.push(`sticker_${i}.png`);
    }

    stickers.sort(() => Math.random() - 0.5);

    stickers.forEach((sticker) => {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.sticker = sticker.split('').map(char => char.charCodeAt(0)).join('-');

        tile.innerHTML = `
            <div class="tile-inner">
                <div class="tile-front"></div>
                <div class="tile-back">
                    <img src="assets/icons/${sticker}" alt="Sticker">
                </div>
            </div>
        `;

        tile.addEventListener('click', onTileClick);
        tilesContainer.appendChild(tile);
    });
}

function onTileClick(e) {
    if (isLocked) return;

    const tile = e.currentTarget;
    if (tile.classList.contains('flipped') || tile.classList.contains('matched')) return;

    if (!startTime) {
        startTimer();
    }

    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log(e));

    tile.classList.add('flipped');
    flippedCards.push(tile);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    isLocked = true;
    const [card1, card2] = flippedCards;

    if (card1.dataset.sticker === card2.dataset.sticker) {
        setTimeout(() => {
            matchSound.currentTime = 0;
            matchSound.play().catch(e => console.log(e));
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            matchedCount += 2;
            isLocked = false;

            if (matchedCount === 16) {
                endGame();
            }
        }, 200);
    } else {
        setTimeout(() => {
            notMatchSound.currentTime = 0;
            notMatchSound.play().catch(e => console.log(e));
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isLocked = false;
        }, 1000);
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        updateTimerDisplay(elapsedTime, timerDisplay, msDisplay);
    }, 10);
}

function updateTimerDisplay(time, secElement, msElement) {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((time % 1000) / 10);

    secElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    msElement.textContent = `.${milliseconds.toString().padStart(2, '0')}`;
}

function displayBestTime(time) {
    updateTimerDisplay(parseInt(time, 10), prevTimerDisplay, prevMsDisplay);
}

function endGame() {
    clearInterval(timerInterval);
    const elapsedTime = Date.now() - startTime;

    if (!bestTime || elapsedTime < parseInt(bestTime, 10)) {
        bestTime = elapsedTime;
        localStorage.setItem('matchIqBestTime', bestTime);
        displayBestTime(bestTime);
    }
}

musicBtn.addEventListener('click', () => {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(e => console.log(e));

    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
        musicBtn.style.opacity = '0.5';
    } else {
        bgMusic.play().catch(e => console.log("Audio play failed:", e));
        isMusicPlaying = true;
        musicBtn.style.opacity = '1';
    }
});

restartBtn.addEventListener('click', () => {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(e => console.log(e));
    initGame();
});

initGame();
