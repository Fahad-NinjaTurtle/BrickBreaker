import { gameState } from "./gameState.js";
import { pingPongCanvas, EnableUi } from "./gameManager.js";
import { SoundManager } from "./soundManager.js";
export const CheckCollision = () => {
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
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  
  if (gameState.circleY + gameState.circleSize >= height) {
    if (gameState.ballLife > 0) {
      gameState.ballLife--;
      Bounce();
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
  const hitPosition = (ballCenterX - g.paddleLeftPos) / g.paddleWidth;
  
  // Map hit position to angle: left edge = -60°, center = 0°, right edge = +60°
  // This creates a range from -60° to +60° based on where ball hits paddle
  const angle = (hitPosition - 0.5) * 120; // -60° to +60°
  
  // Get current speed magnitude
  const currentSpeed = Math.sqrt(g.circleXUpdate ** 2 + g.circleYUpdate ** 2);
  
  // Set new velocity based on angle
  setVelocityFromAngle(angle, currentSpeed, 60);
  
  // Ensure ball is above paddle
  g.circleY = g.paddleTopPos - g.circleSize;
  SoundManager.play("bounce");
};
