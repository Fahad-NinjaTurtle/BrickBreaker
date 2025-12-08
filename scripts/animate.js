// scripts/animate.js
import { gameState } from "./gameState.js";
import { BallGroundCheck, CheckCollision } from "./collision.js";
import { pingPongCanvas } from "./gameManager.js";
import { checkBrickCollision } from "./brickManager.js";
import { SoundManager } from "./soundManager.js";

export const Animate = (dt) => {
  AnimateBall(dt);
  AnimatePaddle(dt);
};

const AnimateBall = (dt) => {
  // move ball
  if (gameState.circleX < gameState.circleSize) {
    gameState.circleX = gameState.circleSize;
  }
  gameState.circleX += gameState.circleXUpdate * (dt / 1000);
  gameState.circleY += gameState.circleYUpdate * (dt / 1000);
  console.log("circle x is ", gameState.circleX, " ", gameState.circleXUpdate);
  console.log("circle y is ", gameState.circleY, " ", gameState.circleYUpdate);
  // bounce off left/right walls
  if (
    gameState.circleX + gameState.circleSize > pingPongCanvas.width ||
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

const paddleMovementSpeed = 10;

const AnimatePaddle = (dt) => {
  const speed = paddleMovementSpeed * (dt / 50);

  if (gameState.moveLeft) gameState.paddleLeftPos -= speed;
  if (gameState.moveRight) gameState.paddleLeftPos += speed;
};
