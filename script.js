const container = document.getElementById("gameContainer");
const basket = document.getElementById("basket");
const scoreText = document.getElementById("score");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

let score = 0;
let basketX = 160;
let gameActive = false;
let fallSpeedBoost = 0;

// Move basket helper
function moveBasket(amount) {
    basketX += amount;
    if (basketX < 0) basketX = 0;
    if (basketX > container.offsetWidth - basket.offsetWidth)
        basketX = container.offsetWidth - basket.offsetWidth;
    basket.style.left = basketX + "px";
}

// Desktop keyboard
document.body.addEventListener("keydown", (e) => {
    if (!gameActive) return;
    if (e.key === "ArrowLeft") moveBasket(-20);
    if (e.key === "ArrowRight") moveBasket(20);
});

// Mobile buttons
document.getElementById("leftBtn").addEventListener("touchstart", () => moveBasket(-20));
document.getElementById("rightBtn").addEventListener("touchstart", () => moveBasket(20));

// Touch drag anywhere on container
container.addEventListener("touchmove", (e) => {
    if (!gameActive) return;
    const touchX = e.touches[0].clientX - container.getBoundingClientRect().left;
    basketX = touchX - basket.offsetWidth / 2;

    if (basketX < 0) basketX = 0;
    if (basketX > container.offsetWidth - basket.offsetWidth)
        basketX = container.offsetWidth - basket.offsetWidth;

    basket.style.left = basketX + "px";
});

// Start/Reset
startBtn.onclick = startGame;
playAgainBtn.onclick = startGame;

function resetGameSession() {
    score = 0;
    fallSpeedBoost = 0;
    basketX = 160;
    basket.style.left = "160px";
    gameActive = false;
    document.querySelectorAll('.fruit, .bomb').forEach(f => f.remove());
    startScreen.style.display = "flex";
    gameOverScreen.style.display = "none";
    scoreText.textContent = score;
}

function startGame() {
    score = 0;
    fallSpeedBoost = 0;
    gameActive = true;
    scoreText.textContent = 0;
    basketX = 160;
    basket.style.left = "160px";
    document.querySelectorAll('.fruit, .bomb').forEach(f => f.remove());
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";
}

// Spawn fruits and bombs
function spawnObject() {
    if (!gameActive) return;

    const drop = document.createElement("img");
    const isBomb = Math.random() < 0.12;

    if (isBomb) {
        drop.src = "images/bomb.webp";
        drop.classList.add("bomb");
        drop.dataset.points = -999;
    } else {
        const types = [
            { img: "images/banana.webp", points: 4 },
            { img: "images/mango.webp", points: 6 },
            { img: "images/apple.webp", points: 2 },
            { img: "images/watermelon.webp", points: 8 }
        ];
        const chosen = types[Math.floor(Math.random() * types.length)];
        drop.src = chosen.img;
        drop.classList.add("fruit");
        drop.dataset.points = chosen.points;
    }

    drop.style.width = "30px";
    drop.style.height = "30px";
    drop.style.position = "absolute";
    drop.style.top = "-40px";
    drop.style.left = Math.random() * 360 + "px";
    container.appendChild(drop);

    let fallSpeed = 1.5 + fallSpeedBoost;

    const fall = setInterval(() => {
        if (!gameActive) { clearInterval(fall); drop.remove(); return; }

        drop.style.top = drop.offsetTop + fallSpeed + "px";

        // Collision detection
        const basketTop = basket.offsetTop;
        const basketBottom = basket.offsetTop + basket.offsetHeight;
        const basketLeft = basketX;
        const basketRight = basketX + basket.offsetWidth;

        const dropTop = drop.offsetTop;
        const dropBottom = drop.offsetTop + drop.offsetHeight;
        const dropLeft = drop.offsetLeft;
        const dropRight = drop.offsetLeft + drop.offsetWidth;

        if (
            dropBottom >= basketTop &&
            dropTop <= basketBottom &&
            dropRight >= basketLeft &&
            dropLeft <= basketRight
        ) {
            if (drop.classList.contains("bomb")) {
                endGame();
            } else {
                score += parseInt(drop.dataset.points);
                scoreText.textContent = score;
            }
            drop.remove();
            clearInterval(fall);
        }

        if (drop.offsetTop > 600) { drop.remove(); clearInterval(fall); }
    }, 20);
}

function endGame() {
    gameActive = false;
    document.getElementById("finalScore").textContent = "Score: " + score;
    gameOverScreen.style.display = "flex";
}

// Increase fall speed
setInterval(() => { if (gameActive) fallSpeedBoost += 0.05; }, 1500);
setInterval(spawnObject, 1000);

// Reset game when leaving page
window.addEventListener('beforeunload', resetGameSession);
