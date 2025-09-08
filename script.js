const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let gamePaused = false;
let gameOver = false;
let gameStarted = false;

// GAME SCREEN TO REPLACE PAUSE, GAME OVER & START
let overlayScreen;

// Initialize overlay screen
const initOverlay = () => {
    overlayScreen = document.createElement("div");
    overlayScreen.className = "game-overlay";
    overlayScreen.innerHTML = `
        <div class="overlay-content">
            <div class="game-title">SNAKE GAME</div>
            <div class="game-status"></div>
            <div class="game-instructions">
                <h3>How to Play:</h3>
                <div class="instruction-group">
                    <div class="control-item">
                        <span class="control-key">↑ ↓ ← →</span>
                        <span class="control-desc">Move snake</span>
                    </div>
                    <div class="control-item">
                        <span class="control-key">SPACE</span>
                        <span class="control-desc">Pause/Resume</span>
                    </div>
                </div>
                <p class="game-rules">Eat the red food to grow and increase your score. Don't hit the walls or your own tail!</p>
            </div>
            <div class="score-display"></div>
            <button class="game-button" onclick="handleGameAction()">START GAME</button>
        </div>
    `;
    document.body.appendChild(overlayScreen);
    showStartScreen();
};

const showStartScreen = () => {
    const statusElement = overlayScreen.querySelector(".game-status");  // GAME START, PAUSED OR OVER
    const scoreDisplay = overlayScreen.querySelector(".score-display");
    const gameButton = overlayScreen.querySelector(".game-button");
    
    statusElement.innerHTML = "Ready to Play?";
    statusElement.className = "game-status start";
    scoreDisplay.innerHTML = `<div class="high-score-display">High Score: ${highScore}</div>`;  // ONLY SHOW HIGH SCORE ON START SCREEN
    gameButton.textContent = "START GAME";
    gameButton.onclick = startGame;
    overlayScreen.style.display = "flex";
};

const showPauseScreen = () => {
    const statusElement = overlayScreen.querySelector(".game-status");  // GAME START, PAUSED OR OVER
    const scoreDisplay = overlayScreen.querySelector(".score-display");
    const gameButton = overlayScreen.querySelector(".game-button");
    
    statusElement.innerHTML = "Game Paused";
    statusElement.className = "game-status pause";
    scoreDisplay.innerHTML = `
        <div class="current-score">Current Score: ${score}</div>
        <div class="high-score-display">High Score: ${highScore}</div>
    `;
    gameButton.textContent = "RESUME";
    gameButton.onclick = resumeGame;
    overlayScreen.style.display = "flex";
};

const showGameOverScreen = () => {
    const statusElement = overlayScreen.querySelector(".game-status");  // GAME START, PAUSED OR OVER
    const scoreDisplay = overlayScreen.querySelector(".score-display");
    const gameButton = overlayScreen.querySelector(".game-button");
    
    statusElement.innerHTML = "Game Over!";
    statusElement.className = "game-status game-over";
    scoreDisplay.innerHTML = `
        <div class="final-score">Final Score: ${score}</div>
        <div class="high-score-display">High Score: ${highScore}</div>
    `;
    gameButton.textContent = "PLAY AGAIN";
    gameButton.onclick = restartGame;
    overlayScreen.style.display = "flex";
};

const startGame = () => {
    gameStarted = true;
    overlayScreen.style.display = "none";
    updateFoodPosition();
    setIntervalId = setInterval(initGame, 100);
};

const resumeGame = () => {
    gamePaused = false;
    overlayScreen.style.display = "none";
};

const pauseGame = () => {
    gamePaused = true;
    showPauseScreen();
};

const restartGame = () => {
    // Reset game state
    gameOver = false;
    gameStarted = false;
    gamePaused = false;
    score = 0;
    snakeX = 5;
    snakeY = 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    
    // Clear interval
    clearInterval(setIntervalId);
    
    // Update UI
    scoreElement.innerText = `Score: ${score}`;
    
    // Show start screen
    showStartScreen();
};

// Handle spacebar for pause/resume
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && gameStarted && !gameOver) {
        e.preventDefault();
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
});

// Getting high score from the local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const updateFoodPosition = () => {
    // Passing a random 1 - 30 value as food position
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

// GAME OVER HANDLER
const handleGameOver = () => {
    gameOver = true;
    clearInterval(setIntervalId);
    showGameOverScreen();
};

const changeDirection = e => {
    //PREVENT CHANGE DIRECTION ON PAUSE SCREEN
    if (gamePaused || gameOver) return;

    // Changing velocity value based on key press
    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}
// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const initGame = () => {
    // PREVENTS TRIGGERING GAME OVER WHEN PAUSED
    if (gamePaused) return;

    // Handle game over separately
    if (gameOver) return handleGameOver();

    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // Checking if the snake hit the food
    if(snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Pushing food position to snake body array
        score++; // increment score by 1
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }
    // Updating the snake's head position based on the current velocity
    snakeX += velocityX;
    snakeY += velocityY;
    
    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        // Adding a div for each part of the snake's body
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = html;

}

// Global function for button onclick
window.handleGameAction = () => {
    if (!gameStarted) {
        startGame();
    } else if (gamePaused) {
        resumeGame();
    } else if (gameOver) {
        restartGame();
    }
};

// Initialize the game
document.addEventListener("DOMContentLoaded", () => {
    initOverlay();
});

document.addEventListener("keyup", changeDirection);