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
  
  // If ball is stuck to paddle, make it follow the paddle
  if (gameState.ballStuckToPaddle) {
    // Position ball on top of paddle, centered
    gameState.circleX = gameState.paddleLeftPos + gameState.paddleWidth / 2;
    gameState.circleY = gameState.paddleTopPos - gameState.circleSize;
    
    // Stop ball movement
    gameState.circleXUpdate = 0;
    gameState.circleYUpdate = 0;
    
    // Clear trail when stuck
    gameState.ballTrail = [];
    
    // Don't check collisions when stuck
    return;
  }
  
  // Update ball trail (store last 8 positions)
  gameState.ballTrail.push({ x: gameState.circleX, y: gameState.circleY });
  if (gameState.ballTrail.length > 8) {
    gameState.ballTrail.shift(); // Remove oldest position
  }
  
  // move ball
  gameState.circleX += gameState.circleXUpdate * (dt / 1000);
  gameState.circleY += gameState.circleYUpdate * (dt / 1000);
  
  // --- Robust wall collisions to avoid "sticking" on boundaries ---
  // bounce off right wall
  if (gameState.circleX + gameState.circleSize > width) {
    gameState.circleX = width - gameState.circleSize;
    gameState.circleXUpdate = -Math.abs(gameState.circleXUpdate);
    SoundManager.play("bounce");
  }

  // bounce off left wall
  if (gameState.circleX - gameState.circleSize < 0) {
    gameState.circleX = gameState.circleSize;
    gameState.circleXUpdate = Math.abs(gameState.circleXUpdate);
    SoundManager.play("bounce");
  }

  // bounce off top
  if (gameState.circleY - gameState.circleSize < 0) {
    gameState.circleY = gameState.circleSize;
    gameState.circleYUpdate = Math.abs(gameState.circleYUpdate);
    SoundManager.play("bounce");
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
  let paddleMoved = false;

  if (gameState.moveLeft) {
    gameState.paddleLeftPos -= speed;
    paddleMoved = true;
  }
  if (gameState.moveRight) {
    gameState.paddleLeftPos += speed;
    paddleMoved = true;
  }
  
  // Release ball from paddle when player moves
  if (gameState.ballStuckToPaddle && paddleMoved) {
    releaseBallFromPaddle();
  }
};

// Release ball from paddle and start it moving
export const releaseBallFromPaddle = () => {
  if (!gameState.ballStuckToPaddle) return;
  
  gameState.ballStuckToPaddle = false;
  
  // Use stored base speed (includes level multiplier)
  const baseSpeed = gameState.baseBallSpeed || 200;
  
  // Determine initial direction based on paddle movement
  let angle = 0; // Start straight up
  if (gameState.moveLeft) {
    angle = -30; // Slight left angle
  } else if (gameState.moveRight) {
    angle = 30; // Slight right angle
  } else {
    // Random slight angle if no movement direction
    angle = (Math.random() - 0.5) * 40; // -20° to +20°
  }
  
  // Set ball velocity
  const angleRad = (angle * Math.PI) / 180;
  gameState.circleXUpdate = Math.sin(angleRad) * baseSpeed;
  gameState.circleYUpdate = -Math.cos(angleRad) * baseSpeed;
};
