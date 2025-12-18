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
        
        // Resolve collision and immediately move ball away from brick
        resolveBrickHitDirection(brick);
        
        // IMPORTANT: Move ball away from brick to prevent hitting multiple bricks
        // This ensures the ball bounces back immediately after hitting one brick
        const ballCenterX = gameState.circleX;
        const ballCenterY = gameState.circleY;
        const brickCenterX = brick.x + brick.width / 2;
        const brickCenterY = brick.y + brick.height / 2;
        
        // Calculate overlap amounts
        const overlapX = Math.min(
          ballRight - brickLeft,
          brickRight - ballLeft
        );
        const overlapY = Math.min(
          ballBottom - brickTop,
          brickBottom - ballTop
        );
        
        // Move ball out of brick based on which overlap is smaller
        // This ensures ball is pushed away from the collision point
        if (overlapX < overlapY) {
          // Horizontal collision - move ball horizontally
          if (ballCenterX < brickCenterX) {
            // Ball hit from left side
            gameState.circleX = brickLeft - gameState.circleSize - 0.1;
          } else {
            // Ball hit from right side
            gameState.circleX = brickRight + gameState.circleSize + 0.1;
          }
        } else {
          // Vertical collision - move ball vertically
          if (ballCenterY < brickCenterY) {
            // Ball hit from top
            gameState.circleY = brickTop - gameState.circleSize - 0.1;
          } else {
            // Ball hit from bottom
            gameState.circleY = brickBottom + gameState.circleSize + 0.1;
          }
        }
        
        CheckLevelComplete();
        return; // Only process one collision per frame
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
  const brickCenterX = brick.x + brick.width / 2;
  const brickCenterY = brick.y + brick.height / 2;

  // Use current velocity to determine approach direction (more reliable than estimated previous position)
  const currentVelX = gameState.circleXUpdate;
  const currentVelY = gameState.circleYUpdate;
  
  // Determine which side was hit based on overlap
  const overlapX = Math.min(
    ballCenterX + gameState.circleSize - brick.x,
    brick.x + brick.width - (ballCenterX - gameState.circleSize)
  );
  const overlapY = Math.min(
    ballCenterY + gameState.circleSize - brick.y,
    brick.y + brick.height - (ballCenterY - gameState.circleSize)
  );

  // Get current speed magnitude
  const currentSpeed = Math.sqrt(currentVelX ** 2 + currentVelY ** 2);

  // Determine collision side based on velocity direction and overlap
  // If ball is moving upward (negative Y), it's hitting from below
  // If ball is moving downward (positive Y), it's hitting from above
  const hittingFromBottom = currentVelY > 0; // Ball moving down = hitting bottom of brick
  const hittingFromTop = currentVelY < 0; // Ball moving up = hitting top of brick
  const hittingFromLeft = currentVelX > 0; // Ball moving right = hitting left side of brick
  const hittingFromRight = currentVelX < 0; // Ball moving left = hitting right side of brick
  
  // Determine primary collision direction
  // If overlapX is significantly smaller, it's a side hit
  // If overlapY is significantly smaller, it's a top/bottom hit
  const isSideHit = overlapX < overlapY * 0.7; // Side hit if X overlap is much smaller
  const isTopBottomHit = overlapY < overlapX * 0.7; // Top/bottom hit if Y overlap is much smaller
  
  if (isSideHit) {
    // Side collision - reverse X direction, preserve Y direction
    // Preserve speed exactly - just reverse X direction
    gameState.circleXUpdate = -currentVelX; // Reverse X
    // Y direction stays the same (preserve speed)
    
  } else if (isTopBottomHit) {
    // Top or bottom collision - reverse Y direction, preserve X direction
    // Preserve speed exactly - just reverse Y direction
    gameState.circleYUpdate = -currentVelY; // Reverse Y
    // X direction stays the same (preserve speed)
    
  } else {
    // Corner/edge hit - determine based on velocity direction
    // If moving more horizontally, treat as side hit
    // If moving more vertically, treat as top/bottom hit
    if (Math.abs(currentVelX) > Math.abs(currentVelY)) {
      // More horizontal movement - side hit
      gameState.circleXUpdate = -currentVelX;
      // Keep Y direction but may reverse if hitting corner
      if (hittingFromBottom && ballCenterY > brickCenterY) {
        gameState.circleYUpdate = Math.abs(currentVelY); // Bounce down
      } else if (hittingFromTop && ballCenterY < brickCenterY) {
        gameState.circleYUpdate = -Math.abs(currentVelY); // Bounce up
      }
    } else {
      // More vertical movement - top/bottom hit
      gameState.circleYUpdate = -currentVelY;
      // Keep X direction but may reverse if hitting corner
      if (hittingFromLeft && ballCenterX < brickCenterX) {
        gameState.circleXUpdate = -Math.abs(currentVelX); // Bounce left
      } else if (hittingFromRight && ballCenterX > brickCenterX) {
        gameState.circleXUpdate = Math.abs(currentVelX); // Bounce right
      }
    }
  }
  
  // Ensure minimum speed to prevent ball from getting stuck
  const finalSpeed = Math.sqrt(
    gameState.circleXUpdate ** 2 + gameState.circleYUpdate ** 2
  );
  if (finalSpeed < currentSpeed * 0.5) {
    // If speed dropped too much, restore it
    const speedMultiplier = currentSpeed / finalSpeed;
    gameState.circleXUpdate *= speedMultiplier;
    gameState.circleYUpdate *= speedMultiplier;
  }
}
