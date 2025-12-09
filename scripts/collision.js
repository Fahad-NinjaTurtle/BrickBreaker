import { gameState } from "./gameState.js";
import { pingPongCanvas, EnableUi } from "./gameManager.js";
import { SoundManager } from "./soundManager.js";
export const CheckCollision = () => {
  // Don't check collision if ball is stuck to paddle
  if (gameState.ballStuckToPaddle) return;
  
  const g = gameState;

  if (
    g.circleX + g.circleSize > g.paddleLeftPos &&
    g.circleX - g.circleSize < g.paddleLeftPos + g.paddleWidth &&
    g.circleY + g.circleSize > g.paddleTopPos &&
    g.circleY - g.circleSize < g.paddleTopPos + g.paddleHeight
  ) {
    Bounce();
  }
};

export const BallGroundCheck = () => {
  // Don't check if ball is stuck to paddle
  if (gameState.ballStuckToPaddle) return;
  
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  
  if (gameState.circleY + gameState.circleSize >= height) {
    if (gameState.ballLife > 0) {
      gameState.ballLife--;
      // Stick ball back to paddle after losing a life
      gameState.ballStuckToPaddle = true;
      gameState.circleX = gameState.paddleLeftPos + gameState.paddleWidth / 2;
      gameState.circleY = gameState.paddleTopPos - gameState.circleSize;
      gameState.circleXUpdate = 0;
      gameState.circleYUpdate = 0;
      return;
    } else {
      gameState.gameOver = true;
      EnableUi();
      SoundManager.play("gameOver");
    }
  }
};

// Helper function to set ball velocity from an angle (in degrees)
// Angle: 0° = straight up, positive = right, negative = left
// Limited to range between -maxAngle and +maxAngle
const setVelocityFromAngle = (angleDegrees, speed, maxAngle = 60) => {
  // Clamp angle to limited range
  const clampedAngle = Math.max(-maxAngle, Math.min(angleDegrees, maxAngle));
  
  // Convert to radians
  const angleRad = (clampedAngle * Math.PI) / 180;
  
  // Calculate velocity components
  // Negative Y because we want upward movement
  gameState.circleXUpdate = Math.sin(angleRad) * speed;
  gameState.circleYUpdate = -Math.cos(angleRad) * speed;
};

const Bounce = () => {
  const g = gameState;
  const paddleCenterX = g.paddleLeftPos + g.paddleWidth / 2;
  const ballCenterX = g.circleX;
  
  // Calculate where ball hit on paddle (0 = left edge, 1 = right edge)
  // Clamp hit position to valid range
  let hitPosition = (ballCenterX - g.paddleLeftPos) / g.paddleWidth;
  hitPosition = Math.max(0, Math.min(1, hitPosition));
  
  // Improved angle calculation with better distribution
  // Use a more responsive curve: edges get more extreme angles
  // Map hit position to angle with better physics
  // Center (0.5) = 0°, edges get more extreme angles
  let angle;
  
  if (hitPosition < 0.5) {
    // Left side: map 0.0-0.5 to -75° to 0°
    // Use quadratic curve for better feel
    const normalized = hitPosition * 2; // 0 to 1
    angle = -75 * (1 - normalized * normalized); // Quadratic curve
  } else {
    // Right side: map 0.5-1.0 to 0° to +75°
    const normalized = (hitPosition - 0.5) * 2; // 0 to 1
    angle = 75 * normalized * normalized; // Quadratic curve
  }
  
  // Add slight randomness for more dynamic gameplay (±5°)
  const randomVariation = (Math.random() - 0.5) * 10;
  angle += randomVariation;
  
  // Get current speed magnitude (preserve level-based speed)
  let currentSpeed = Math.sqrt(g.circleXUpdate ** 2 + g.circleYUpdate ** 2);
  
  // If speed is 0 or very low, use base speed from gameState
  if (currentSpeed < 50) {
    currentSpeed = g.baseBallSpeed || 200;
  }
  
  // Add slight speed boost based on hit position (edges get more speed)
  const speedMultiplier = 1 + Math.abs(hitPosition - 0.5) * 0.1; // Up to 5% speed boost
  const finalSpeed = currentSpeed * speedMultiplier;
  
  // Set new velocity based on angle
  setVelocityFromAngle(angle, finalSpeed, 75); // Increased max angle to 75°
  
  // Ensure ball is above paddle
  g.circleY = g.paddleTopPos - g.circleSize;
  SoundManager.play("bounce");
};
