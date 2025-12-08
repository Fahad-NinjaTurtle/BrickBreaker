// scripts/animate.js
import { gameState } from "./gameState.js";
import { BallGroundCheck, CheckCollision } from "./collision.js";
import { pingPongCanvas } from "./gameManager.js";
import { checkBrickCollision } from "./brickManager.js";
import { SoundManager } from "./soundManager.js";
import { updatePowerUps } from "./powerUpManager.js";

export const Animate = (dt) => {
  AnimateBall(dt);
  AnimatePaddle(dt);
  updatePowerUps(dt);
};

const AnimateBall = (dt) => {
  // Get CSS pixel dimensions
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  
  // move ball
  if (gameState.circleX < gameState.circleSize) {
    gameState.circleX = gameState.circleSize;
  }
  gameState.circleX += gameState.circleXUpdate * (dt / 1000);
  gameState.circleY += gameState.circleYUpdate * (dt / 1000);
  
  // bounce off left/right walls
  if (
    gameState.circleX + gameState.circleSize > width ||
    gameState.circleX - gameState.circleSize < 0
  ) {
    gameState.circleXUpdate = -gameState.circleXUpdate;
    SoundManager.play("bounce")
  }

  // bounce off top
  if (gameState.circleY - gameState.circleSize < 0) {
    gameState.circleYUpdate = -gameState.circleYUpdate;
    SoundManager.play("bounce")
  }
  BallGroundCheck();
  CheckCollision();
  checkBrickCollision();
};

// Responsive paddle movement speed (using CSS pixels)
const getPaddleMovementSpeed = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  return Math.max(300, Math.min(width / 1.5, 600)); // pixels per second
};

const AnimatePaddle = (dt) => {
  const speed = getPaddleMovementSpeed() * (dt / 1000);

  if (gameState.moveLeft) gameState.paddleLeftPos -= speed;
  if (gameState.moveRight) gameState.paddleLeftPos += speed;
};
