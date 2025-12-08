import { Animate } from "./animate.js";
import { Draw, ResetStates } from "./render.js";
import { gameState } from "./gameState.js";
import { setupInput } from "./inputManager.js";
import { CreateBricks } from "./brickManager.js";
import { SoundManager } from "./soundManager.js";
import { resetPowerUps } from "./powerUpManager.js";

// @ts-nocheck
export const pingPongCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("pingPongCanvas")
);
export const pingPongCtx = pingPongCanvas.getContext("2d");

const restartBtn = document.getElementById("restartBtn");
const quitBtn = document.getElementById("quitBtn");
const startPanel = document.getElementById("startPanel");
const startBtn = document.getElementById("startBtn");
const gameOverPanel = document.getElementById("gameOverPanel");
const restartFromOverBtn = document.getElementById("restartFromOverBtn");
const quitFromOverBtn = document.getElementById("quitFromOverBtn");
const nextLevelFromOverBtn = document.getElementById("nextLevelFromOverBtn");
const finalScoreValue = document.getElementById("finalScoreValue");
const highScoreValue = document.getElementById("highScoreValue");
const gameOverTitle = document.getElementById("gameOverTitle");

// Responsive canvas setup with proper device pixel ratio
const resizeCanvas = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  
  // Set canvas internal resolution (logical size) - use actual pixel dimensions for crisp rendering
  pingPongCanvas.width = width * dpr;
  pingPongCanvas.height = height * dpr;
  
  // Set canvas display size (CSS size) - use CSS pixels
  pingPongCanvas.style.width = width + "px";
  pingPongCanvas.style.height = height + "px";
  
  // Scale context to handle device pixel ratio - work in CSS pixels
  pingPongCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform first
  pingPongCtx.scale(dpr, dpr);
  
  // Use viewport-based scaling for consistent sizing across devices
  // Normalize to base resolution (500x400), use average scaling for balance
  const widthScale = Math.min(width / 500, 1.2); // Cap at 1.2x for very wide screens
  const heightScale = Math.min(height / 400, 1.2); // Cap at 1.2x for very tall screens
  const viewportScale = (widthScale + heightScale) / 2; // Average for balanced scaling
  
  // Update responsive paddle dimensions (in CSS pixels) - maintain consistent aspect ratio
  // Paddle should be about 5:1 width to height ratio
  const basePaddleHeight = 16 * viewportScale; // Base height of 16px at 500px width
  const paddleHeight = Math.max(12, Math.min(basePaddleHeight, 22));
  let paddleWidth = paddleHeight * 5; // 5:1 aspect ratio
  
  // Scale paddle width 1.5× on PC
  const isPC = width > 768;
  if (isPC) {
    paddleWidth = paddleWidth * 1.5;
  }
  
  gameState.paddleWidth = Math.max(60, Math.min(paddleWidth, width * 0.3));
  gameState.paddleHeight = paddleHeight;
  gameState.paddleTopPos = height - gameState.paddleHeight - 10;
  
  // Update responsive ball size (in CSS pixels) - consistent relative to viewport
  const baseBallSize = 10 * viewportScale; // Base size of 10px at 500px width
  gameState.circleSize = Math.max(7, Math.min(baseBallSize, 12));
  
  // Recreate bricks with new dimensions
  if (gameState.bricksArray.length > 0) {
    CreateBricks();
  }
  
  // Reset paddle position if needed
  if (gameState.paddleLeftPos + gameState.paddleWidth > width) {
    gameState.paddleLeftPos = width - gameState.paddleWidth;
  }
  
  // Ensure ball stays within bounds
  if (gameState.circleX > width) {
    gameState.circleX = width - gameState.circleSize;
  }
  if (gameState.circleY > height) {
    gameState.circleY = height - gameState.circleSize;
  }
  
  // Update paddle position on resize
  gameState.paddleLeftPos = Math.max(0, Math.min(gameState.paddleLeftPos, width - gameState.paddleWidth));
};

// Initial resize
resizeCanvas();

// Clear canvas initially after resize
const initialClear = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  pingPongCtx.fillStyle = "#2a2a2a";
  pingPongCtx.fillRect(0, 0, width, height);
};
initialClear();

// Handle window resize
window.addEventListener("resize", () => {
  resizeCanvas();
  if (!gameStarted) {
    initialClear();
  }
});
window.addEventListener("orientationchange", () => {
  setTimeout(() => {
    resizeCanvas();
    if (!gameStarted) {
      initialClear();
    }
  }, 100);
});

// Fullscreen functionality
const enterFullscreen = () => {
  const container = pingPongCanvas.parentElement;
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  }
};

// Auto-enter fullscreen on first interaction (but not on button clicks)
let fullscreenRequested = false;
const requestFullscreenOnInteraction = (e) => {
  // Don't trigger fullscreen if clicking on buttons or panels
  if (e.target.tagName === 'BUTTON' || e.target.closest('.game-panel')) {
    return;
  }
  if (!fullscreenRequested) {
    fullscreenRequested = true;
    enterFullscreen();
    document.removeEventListener("click", requestFullscreenOnInteraction);
    document.removeEventListener("touchstart", requestFullscreenOnInteraction);
  }
};

// Request fullscreen on user interaction (required by browsers)
document.addEventListener("click", requestFullscreenOnInteraction);
document.addEventListener("touchstart", requestFullscreenOnInteraction);

setupInput(pingPongCanvas);
SoundManager.init();

// Game state
let gameStarted = false;

// update call
const Update = (dt) => {
  if (gameStarted && !gameState.gameOver) {
    Animate(dt);
    Draw(dt);
  }
};

const RestartGame = () => {
  gameStarted = true;
  gameState.gameOver = false;
  gameState.score = 0;
  gameState.bricksArray = [];
  gameState.bricksRow = 1;
  gameState.currentLevel = 1;
  gameState.ballLife = 3;
  resetPowerUps(); // Reset power-ups
  CreateBricks();
  ResetStates(); 

  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  pingPongCtx.clearRect(0, 0, width, height);
  DisableUi();
  gameOverPanel.style.display = "none";
  lastTime = performance.now();
};

// starting of the game loop
let lastTime = 0;
const frames = 60;
const targetFps = 1000 / frames; // 1000 ms = 1 sec

function loop(currentTime) {
  const deltaTime = currentTime - lastTime;

  if (deltaTime >= targetFps) {
    Update(deltaTime);
    lastTime = currentTime;
  }

  requestAnimationFrame(loop);
}

export const EnableUi = (isLevelComplete = false) => {
  gameState.gameOver = true;
  gameStarted = false;
  UpdateHightScore();
  
  // Show game over panel with high score
  finalScoreValue.textContent = gameState.score;
  highScoreValue.textContent = gameState.highScore;
  
  // Update title based on context
  if (isLevelComplete) {
    gameOverTitle.textContent = "Level Complete!";
  } else {
    gameOverTitle.textContent = "Game Over";
  }
  
  // Show/hide next level button based on context
  if (isLevelComplete) {
    nextLevelFromOverBtn.style.display = "inline-block";
  } else {
    nextLevelFromOverBtn.style.display = "none";
  }
  
  gameOverPanel.style.display = "block";
  
  restartBtn.style.display = "none";
  quitBtn.style.display = "none";
};

const DisableUi = () => {
  restartBtn.style.display = "none";
  quitBtn.style.display = "none";
  gameOverPanel.style.display = "none";
  nextLevelFromOverBtn.style.display = "none";
};

// Show start panel initially
startPanel.style.display = "block";

// Start game function
const StartGame = () => {
  gameStarted = true;
  gameState.gameOver = false;
  startPanel.style.display = "none";
  gameOverPanel.style.display = "none";
  CreateBricks();
  ResetStates();
  DisableUi();
  lastTime = performance.now();
};

DisableUi(); 

restartBtn.addEventListener("click", () => {
  RestartGame();
});

quitBtn.addEventListener("click", () => {
  alert("Coward!!!");
});

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  StartGame();
  // Request fullscreen when starting game
  if (!fullscreenRequested) {
    fullscreenRequested = true;
    enterFullscreen();
  }
});

restartFromOverBtn.addEventListener("click", () => {
  RestartGame();
});

quitFromOverBtn.addEventListener("click", () => {
  alert("Thanks for playing!");
});

nextLevelFromOverBtn.addEventListener("click", () => {
  ProceedToNextLevel();
});
// start the loop
requestAnimationFrame((time) => {
  lastTime = time;
  requestAnimationFrame(loop);
});

export const CheckLevelComplete = () => {
  for (let i = 0; i < gameState.bricksArray.length; i++) {
    for (let j = 0; j < gameState.bricksArray[i].length; j++) {
      if (gameState.bricksArray[i][j].alive) {
        console.log("Still bricks Avaiable");
        return;
      }
    }
  }
  LevelComplete();
};
const LevelComplete = () => {
  SoundManager.play("levelComplete");
  // EnableUi();
  EnableLevelWinUI();
};

const EnableLevelWinUI = () => {
  EnableUi(true); // Pass true to indicate level complete
};

const ProceedToNextLevel = () => {
  gameStarted = true;
  gameState.gameOver = false;
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  pingPongCtx.clearRect(0, 0, width, height);
  gameState.score = 0;
  gameState.currentLevel++;
  gameState.bricksRow++;
  UpdateHightScore();
  resetPowerUps(); // Reset power-ups on level change

  gameState.bricksArray = [];
  CreateBricks();
  ResetStates(); 

  DisableUi();
  lastTime = performance.now();
};

const UpdateHightScore = () => {
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
  }
};


