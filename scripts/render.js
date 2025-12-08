import { pingPongCanvas, pingPongCtx } from "./gameManager.js";
import { gameState } from "./gameState.js";
import { DrawBricks } from "./brickManager.js";
export const Draw = (dt) => {
  pingPongCtx.clearRect(0, 0, pingPongCanvas.width, pingPongCanvas.height);
  DrawBall();
  DrawPaddle();
  DrawBricks();
  DrawFps(dt);
  DrawScore();
  DrawHighScore();
  DrawLevel();
  DrawBallLife();
};

const textLeft = 410;
const textTop = 20;
const textWidth = 100;

const DrawFps = (dt) => {
  const fps = 1000 / dt;
  pingPongCtx.font = "20px Arial";
  pingPongCtx.fillStyle = "black";
  pingPongCtx.fillText(
    "FPS : " + Math.round(fps),
    textLeft,
    textTop,
    textWidth
  );
};

const scoreTextLeft = 10;
const scoreTextTop = 20;
const scoreTextWidth = 100;

const DrawScore = () => {
  pingPongCtx.fillStyle = "black";
  pingPongCtx.fillText(
    "Score : " + gameState.score,
    scoreTextLeft,
    scoreTextTop,
    scoreTextWidth
  );
};
const DrawHighScore = () => {
  pingPongCtx.fillStyle = "black";
  pingPongCtx.fillText(
    "High Score : " + gameState.highScore,
    scoreTextLeft + 100,
    scoreTextTop,
    scoreTextWidth
  );
};

const DrawLevel = () => {
  pingPongCtx.fillStyle = "black";
  pingPongCtx.fillText(
    "Level : " + gameState.currentLevel,
    scoreTextLeft + 210,
    scoreTextTop,
    scoreTextWidth
  );
};
const DrawBallLife = () => {
  pingPongCtx.fillStyle = "black";
  pingPongCtx.fillText(
    "Life : " + gameState.ballLife,
    scoreTextLeft + 300,
    scoreTextTop,
    scoreTextWidth
  );
};

const DrawBall = () => {
  pingPongCtx.beginPath();
  pingPongCtx.arc(
    gameState.circleX,
    gameState.circleY,
    gameState.circleSize,
    0,
    Math.PI * 2
  );
  pingPongCtx.fillStyle = "black";
  pingPongCtx.fill();
};


const DrawPaddle = () => {
  
  if (gameState.paddleLeftPos < 0) {
    gameState.paddleLeftPos = 0;
  } else if (
    gameState.paddleLeftPos + gameState.paddleWidth >
    pingPongCanvas.width
  ) {
    gameState.paddleLeftPos = pingPongCanvas.width - gameState.paddleWidth;
  }

  pingPongCtx.fillStyle = "pink";
  pingPongCtx.fillRect(
    gameState.paddleLeftPos,
    gameState.paddleTopPos,
    gameState.paddleWidth,
    gameState.paddleHeight
  );
};

export const ResetStates = () => {
  
  gameState.circleX = Math.random() * pingPongCanvas.width / 2;
  gameState.circleY = (pingPongCanvas.height / 2);

  gameState.circleXUpdate = 200 * (Math.random() > 0.5 ? 1 : -1);
  gameState.circleYUpdate = 200;

  gameState.paddleLeftPos = (pingPongCanvas.width - gameState.paddleWidth) / 2;
};
