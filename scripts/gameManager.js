import { Animate } from "./animate.js";
import { Draw, ResetStates } from "./render.js";
import { gameState } from "./gameState.js";
import { setupInput } from "./inputManager.js";
import { CreateBricks } from "./brickManager.js";
import { SoundManager } from "./soundManager.js";

// @ts-nocheck
export const pingPongCanvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("pingPongCanvas")
);
export const pingPongCtx = pingPongCanvas.getContext("2d");

const restartBtn = document.getElementById("restartBtn");
const quitBtn = document.getElementById("quitBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const winText = document.getElementById("winText");

gameState.paddleTopPos = pingPongCanvas.height - gameState.paddleHeight;

setupInput(pingPongCanvas);
CreateBricks();
SoundManager.init();
// CheckLevelComplete();

// update call
const Update = (dt) => {
  if (!gameState.gameOver) {
    Animate(dt);
    Draw(dt);
  }
};

const RestartGame = () => {
  gameState.gameOver = false;
  gameState.score = 0;
  gameState.bricksArray = [];
  gameState.bricksRow = 1;
  gameState.currentLevel = 1;
  gameState.ballLife = 3;
  CreateBricks();
  ResetStates(); 

  pingPongCtx.clearRect(0, 0, pingPongCanvas.width, pingPongCanvas.height);
  DisableUi();
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

export const EnableUi = () => {
  gameState.gameOver = true;
  restartBtn.style.display = "block";
  quitBtn.style.display = "block";
  UpdateHightScore();
};

const DisableUi = () => {
  restartBtn.style.display = "none";
  quitBtn.style.display = "none";
  nextLevelBtn.style.display = "none";
  winText.style.display = "none";
};

DisableUi();
ResetStates(); 

restartBtn.addEventListener("click", () => {
  RestartGame();
});

quitBtn.addEventListener("click", () => {
  alert("Coward!!!");
});

nextLevelBtn.addEventListener("click", () => {
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
  nextLevelBtn.style = "block";
  winText.style = "block";

  EnableUi();
};

const ProceedToNextLevel = () => {
  pingPongCtx.clearRect(0, 0, pingPongCanvas.width, pingPongCanvas.height);
    gameState.gameOver = false;
  gameState.score = 0;
  gameState.currentLevel++;
  gameState.bricksRow++;
  UpdateHightScore();

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


