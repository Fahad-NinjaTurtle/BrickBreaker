import { pingPongCtx, CheckLevelComplete, pingPongCanvas } from "./gameManager.js";
import { gameState } from "./gameState.js";
import { SoundManager } from "./soundManager.js";
import { createPowerUp } from "./powerUpManager.js";

const ROW_COLORS = ["#4169E1", "#DC143C", "#FFD700", "#32CD32"]; // blue, red, yellow, green

let bricks = gameState.bricksArray;

// Calculate responsive brick dimensions
export const getBrickDimensions = () => {
  const canvasWidth = pingPongCanvas.width / (window.devicePixelRatio || 1);
  
  // Detect if PC (screen width > 768px) or mobile
  const isPC = canvasWidth > 768;
  
  // Base dimensions for mobile (stay the same)
  const baseHeight = 16;
  const baseWidth = baseHeight * 3; // 3:1 aspect ratio
  
  let targetBrickHeight = baseHeight;
  let targetBrickWidth = baseWidth;
  
  // Scale 3× on PC only
  if (isPC) {
    targetBrickHeight = baseHeight * 3; // 48px on PC
    targetBrickWidth = baseWidth * 3; // 144px on PC (maintains 3:1 ratio)
  }
  
  const brickPadding = Math.max(1, Math.min(targetBrickHeight * 0.12, 3));

  const totalWidthNeeded =
    (targetBrickWidth * gameState.bricksColumn) +
    (brickPadding * (gameState.bricksColumn - 1));

  let finalBrickWidth = targetBrickWidth;
  let finalBrickHeight = targetBrickHeight;

  // Only scale down if bricks don't fit (shouldn't happen on PC with 3× scaling)
  if (totalWidthNeeded > canvasWidth) {
    const scale =
      (canvasWidth - brickPadding * (gameState.bricksColumn - 1)) /
      (targetBrickWidth * gameState.bricksColumn);

    finalBrickWidth *= scale;
    finalBrickHeight *= scale;
  }

  return {
    brickWidth: finalBrickWidth,
    brickHeight: finalBrickHeight,
    brickPadding
  };
};

export const getBrickOffsetTop = () => {
  const canvasHeight = pingPongCanvas.height / (window.devicePixelRatio || 1);
  return Math.max(50, Math.min(canvasHeight / 8, 80));
};

// ⭐ NEW — dynamic centering
const getCenteredOffsetLeft = (brickWidth, brickPadding) => {
  const canvasWidth = pingPongCanvas.width / (window.devicePixelRatio || 1);

  const totalWidth =
    (brickWidth * gameState.bricksColumn) +
    (brickPadding * (gameState.bricksColumn - 1));

  return (canvasWidth - totalWidth) / 2;
};

class Brick {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alive = true;
    this.color = color;
  }
}

const getRowColor = (row) => ROW_COLORS[row % ROW_COLORS.length];

export const CreateBricks = () => {
  bricks = [];
  const { brickWidth, brickHeight, brickPadding } = getBrickDimensions();
  const topOffset = getBrickOffsetTop();

  // NEW: compute offsetLeft inside creation
  const offsetLeft = getCenteredOffsetLeft(brickWidth, brickPadding);

  for (let row = 0; row < gameState.bricksRow; row++) {
    bricks[row] = [];
    const rowColor = getRowColor(row);

    for (let col = 0; col < gameState.bricksColumn; col++) {
      const x = offsetLeft + col * (brickWidth + brickPadding);
      const y = topOffset + row * (brickHeight + brickPadding);

      bricks[row][col] = new Brick(x, y, brickWidth, brickHeight, rowColor);
    }
  }

  gameState.bricksArray = bricks;
};

// Helper function to draw rounded rectangle
const drawRoundedRect = (x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2); // Ensure radius doesn't exceed half width/height
  pingPongCtx.beginPath();
  pingPongCtx.moveTo(x + r, y);
  pingPongCtx.lineTo(x + width - r, y);
  pingPongCtx.quadraticCurveTo(x + width, y, x + width, y + r);
  pingPongCtx.lineTo(x + width, y + height - r);
  pingPongCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  pingPongCtx.lineTo(x + r, y + height);
  pingPongCtx.quadraticCurveTo(x, y + height, x, y + height - r);
  pingPongCtx.lineTo(x, y + r);
  pingPongCtx.quadraticCurveTo(x, y, x + r, y);
  pingPongCtx.closePath();
};

export const DrawBricks = () => {
  const bricks = gameState.bricksArray;

  for (let row = 0; row < bricks.length; row++) {
    for (let col = 0; col < bricks[row].length; col++) {
      const brick = bricks[row][col];

      if (brick.alive) {
        // Calculate corner radius (proportional to brick size, but capped)
        const cornerRadius = Math.min(brick.height * 0.2, 6);
        
        // Draw rounded rectangle fill
        pingPongCtx.fillStyle = brick.color;
        drawRoundedRect(brick.x, brick.y, brick.width, brick.height, cornerRadius);
        pingPongCtx.fill();

        // Draw rounded rectangle border
        pingPongCtx.strokeStyle = "#000";
        pingPongCtx.lineWidth = 1;
        drawRoundedRect(brick.x, brick.y, brick.width, brick.height, cornerRadius);
        pingPongCtx.stroke();
      }
    }
  }
};

export function checkBrickCollision() {
  const ballLeft = gameState.circleX - gameState.circleSize;
  const ballRight = gameState.circleX + gameState.circleSize;
  const ballTop = gameState.circleY - gameState.circleSize;
  const ballBottom = gameState.circleY + gameState.circleSize;

  for (let row = 0; row < bricks.length; row++) {
    for (let col = 0; col < bricks[row].length; col++) {
      const brick = bricks[row][col];
      if (!brick.alive) continue;

      const brickLeft = brick.x;
      const brickRight = brick.x + brick.width;
      const brickTop = brick.y;
      const brickBottom = brick.y + brick.height;

      if (
        ballRight > brickLeft &&
        ballLeft < brickRight &&
        ballBottom > brickTop &&
        ballTop < brickBottom
      ) {
        brick.alive = false;
        gameState.score++;
        SoundManager.play("brickHit");
        
        // Create power-up when brick is destroyed
        createPowerUp(brick.x, brick.y, brick.width, brick.height);
        
        resolveBrickHitDirection(brick);
        CheckLevelComplete();
        return;
      }
    }
  }
}

// Helper function to set ball velocity from an angle (in degrees)
// Angle: 0° = straight up, positive = right, negative = left
// Limited to range between -maxAngle and +maxAngle
const setVelocityFromAngle = (angleDegrees, speed, maxAngle = 45, preserveYDirection = false) => {
  // Clamp angle to limited range
  const clampedAngle = Math.max(-maxAngle, Math.min(angleDegrees, maxAngle));
  
  // Convert to radians
  const angleRad = (clampedAngle * Math.PI) / 180;
  
  // Calculate velocity components
  gameState.circleXUpdate = Math.sin(angleRad) * speed;
  
  if (preserveYDirection) {
    // Preserve Y direction (for vertical bounces)
    const currentYSign = Math.sign(gameState.circleYUpdate);
    gameState.circleYUpdate = Math.abs(Math.cos(angleRad)) * speed * currentYSign;
  } else {
    // Standard bounce (upward)
    gameState.circleYUpdate = -Math.abs(Math.cos(angleRad)) * speed;
  }
};

function resolveBrickHitDirection(brick) {
  const ballCenterX = gameState.circleX;
  const ballCenterY = gameState.circleY;

  // Determine which side was hit (more horizontal or vertical overlap)
  const overlapX = Math.min(
    ballCenterX + gameState.circleSize - brick.x,
    brick.x + brick.width - (ballCenterX - gameState.circleSize)
  );
  const overlapY = Math.min(
    ballCenterY + gameState.circleSize - brick.y,
    brick.y + brick.height - (ballCenterY - gameState.circleSize)
  );

  // Get current speed magnitude
  const currentSpeed = Math.sqrt(
    gameState.circleXUpdate ** 2 + gameState.circleYUpdate ** 2
  );

  let angleDegrees;
  
  // If more horizontal overlap, bounce primarily on Y axis with slight X angle
  if (overlapX > overlapY) {
    // Calculate angle based on horizontal position on brick
    // Left side = -45°, center = 0°, right side = +45°
    const hitPosition = (ballCenterX - brick.x) / brick.width;
    angleDegrees = (hitPosition - 0.5) * 90; // -45° to +45°
    // Set velocity with Y bounce (upward)
    setVelocityFromAngle(angleDegrees, currentSpeed, 45, false);
  } else {
    // If more vertical overlap, bounce primarily on X axis with slight Y angle
    // Top = -45°, center = 0°, bottom = +45°
    const hitPosition = (ballCenterY - brick.y) / brick.height;
    angleDegrees = (hitPosition - 0.5) * 90; // -45° to +45°
    // Set velocity preserving Y direction (for side hits)
    const currentYSign = Math.sign(gameState.circleYUpdate);
    setVelocityFromAngle(angleDegrees, currentSpeed, 45, true);
    // Reverse X direction for side hits
    gameState.circleXUpdate = -gameState.circleXUpdate;
  }
}
