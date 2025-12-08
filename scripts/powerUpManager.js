import { gameState } from "./gameState.js";
import { pingPongCanvas, pingPongCtx } from "./gameManager.js";
import { SoundManager } from "./soundManager.js";

// Power-up types
export const POWERUP_TYPES = {
  SLOW_BALL: "slowBall",
  EXTRA_BALL: "extraBall",
  WIDE_PADDLE: "widePaddle"
};

// Power-up colors
const POWERUP_COLORS = {
  [POWERUP_TYPES.SLOW_BALL]: "#00ff00", // Green
  [POWERUP_TYPES.EXTRA_BALL]: "#ffff00", // Yellow
  [POWERUP_TYPES.WIDE_PADDLE]: "#00ffff" // Cyan
};

// Power-up symbols/icons
const POWERUP_SYMBOLS = {
  [POWERUP_TYPES.SLOW_BALL]: "S",
  [POWERUP_TYPES.EXTRA_BALL]: "+",
  [POWERUP_TYPES.WIDE_PADDLE]: "W"
};

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 30;
    this.height = 20;
    this.speed = 100; // pixels per second
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    this.y += this.speed * (dt / 1000);
    
    // Remove if off screen
    const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
    if (this.y > height) {
      this.active = false;
    }
  }

  draw() {
    if (!this.active) return;
    
    const cornerRadius = 4;
    const ctx = pingPongCtx;
    
    // Draw rounded rectangle
    ctx.fillStyle = POWERUP_COLORS[this.type];
    ctx.beginPath();
    ctx.moveTo(this.x + cornerRadius, this.y);
    ctx.lineTo(this.x + this.width - cornerRadius, this.y);
    ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + cornerRadius);
    ctx.lineTo(this.x + this.width, this.y + this.height - cornerRadius);
    ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - cornerRadius, this.y + this.height);
    ctx.lineTo(this.x + cornerRadius, this.y + this.height);
    ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - cornerRadius);
    ctx.lineTo(this.x, this.y + cornerRadius);
    ctx.quadraticCurveTo(this.x, this.y, this.x + cornerRadius, this.y);
    ctx.closePath();
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw symbol
    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      POWERUP_SYMBOLS[this.type],
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }

  checkCollision(paddleX, paddleY, paddleWidth, paddleHeight) {
    if (!this.active) return false;
    
    return (
      this.x < paddleX + paddleWidth &&
      this.x + this.width > paddleX &&
      this.y < paddleY + paddleHeight &&
      this.y + this.height > paddleY
    );
  }
}

// Active power-ups array
let activePowerUps = [];

// Active effects
let activeEffects = {
  slowBall: { active: false, endTime: 0 },
  widePaddle: { active: false, endTime: 0, originalWidth: 0 }
};

// Extra balls array
let extraBalls = [];

// Create a power-up at brick position
export const createPowerUp = (brickX, brickY, brickWidth, brickHeight) => {
  // 25% chance to drop a power-up
  if (Math.random() > 0.25) return;
  
  // Random power-up type
  const types = Object.values(POWERUP_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  
  // Position at center of brick
  const x = brickX + brickWidth / 2 - 15;
  const y = brickY + brickHeight / 2;
  
  activePowerUps.push(new PowerUp(x, y, type));
};

// Update all power-ups
export const updatePowerUps = (dt) => {
  // Update falling power-ups
  activePowerUps.forEach(powerUp => powerUp.update(dt));
  activePowerUps = activePowerUps.filter(pu => pu.active);
  
  // Check collisions with paddle
  const g = gameState;
  activePowerUps.forEach((powerUp, index) => {
    if (powerUp.checkCollision(g.paddleLeftPos, g.paddleTopPos, g.paddleWidth, g.paddleHeight)) {
      collectPowerUp(powerUp.type);
      powerUp.active = false;
    }
  });
  
  // Update active effects
  const currentTime = Date.now();
  if (activeEffects.slowBall.active && currentTime > activeEffects.slowBall.endTime) {
    deactivateSlowBall();
  }
  if (activeEffects.widePaddle.active && currentTime > activeEffects.widePaddle.endTime) {
    deactivateWidePaddle();
  }
  
  // Update extra balls
  updateExtraBalls(dt);
};

// Collect power-up
const collectPowerUp = (type) => {
  SoundManager.play("bounce"); // Use bounce sound for now
  
  switch (type) {
    case POWERUP_TYPES.SLOW_BALL:
      activateSlowBall();
      break;
    case POWERUP_TYPES.EXTRA_BALL:
      activateExtraBall();
      break;
    case POWERUP_TYPES.WIDE_PADDLE:
      activateWidePaddle();
      break;
  }
};

// Activate slow ball effect (5 seconds)
const activateSlowBall = () => {
  activeEffects.slowBall.active = true;
  activeEffects.slowBall.endTime = Date.now() + 5000; // 5 seconds
  
  // Reduce ball speed by 50%
  gameState.circleXUpdate *= 0.5;
  gameState.circleYUpdate *= 0.5;
  
  // Also slow extra balls
  extraBalls.forEach(ball => {
    ball.xUpdate *= 0.5;
    ball.yUpdate *= 0.5;
  });
};

// Deactivate slow ball effect
const deactivateSlowBall = () => {
  if (!activeEffects.slowBall.active) return;
  activeEffects.slowBall.active = false;
  
  // Restore ball speed (double it back)
  gameState.circleXUpdate *= 2;
  gameState.circleYUpdate *= 2;
  
  // Restore extra balls speed
  extraBalls.forEach(ball => {
    ball.xUpdate *= 2;
    ball.yUpdate *= 2;
  });
};

// Activate extra ball
const activateExtraBall = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  
  // Create new ball at paddle position
  const baseSpeed = Math.sqrt(gameState.circleXUpdate ** 2 + gameState.circleYUpdate ** 2);
  extraBalls.push({
    x: gameState.paddleLeftPos + gameState.paddleWidth / 2,
    y: gameState.paddleTopPos - gameState.circleSize,
    size: gameState.circleSize,
    xUpdate: baseSpeed * (Math.random() > 0.5 ? 1 : -1),
    yUpdate: -baseSpeed,
    active: true
  });
};

// Update extra balls
const updateExtraBalls = (dt) => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  
  extraBalls.forEach((ball, index) => {
    if (!ball.active) return;
    
    // Move ball
    ball.x += ball.xUpdate * (dt / 1000);
    ball.y += ball.yUpdate * (dt / 1000);
    
    // Bounce off walls
    if (ball.x + ball.size > width || ball.x - ball.size < 0) {
      ball.xUpdate = -ball.xUpdate;
    }
    if (ball.y - ball.size < 0) {
      ball.yUpdate = -ball.yUpdate;
    }
    
    // Check if missed (hit ground)
    if (ball.y + ball.size >= height) {
      ball.active = false;
    }
    
    // Check collision with paddle
    if (
      ball.x + ball.size > gameState.paddleLeftPos &&
      ball.x - ball.size < gameState.paddleLeftPos + gameState.paddleWidth &&
      ball.y + ball.size > gameState.paddleTopPos &&
      ball.y - ball.size < gameState.paddleTopPos + gameState.paddleHeight
    ) {
      // Bounce off paddle
      const paddleCenterX = gameState.paddleLeftPos + gameState.paddleWidth / 2;
      const hitPosition = (ball.x - gameState.paddleLeftPos) / gameState.paddleWidth;
      const angle = (hitPosition - 0.5) * 120;
      const speed = Math.sqrt(ball.xUpdate ** 2 + ball.yUpdate ** 2);
      const angleRad = (angle * Math.PI) / 180;
      ball.xUpdate = Math.sin(angleRad) * speed;
      ball.yUpdate = -Math.cos(angleRad) * speed;
      ball.y = gameState.paddleTopPos - ball.size;
      SoundManager.play("bounce");
    }
    
    // Check collision with bricks
    checkExtraBallBrickCollision(ball);
  });
  
  // Remove inactive balls
  extraBalls = extraBalls.filter(ball => ball.active);
};

// Check extra ball collision with bricks
const checkExtraBallBrickCollision = (ball) => {
  const bricks = gameState.bricksArray;
  
  for (let row = 0; row < bricks.length; row++) {
    for (let col = 0; col < bricks[row].length; col++) {
      const brick = bricks[row][col];
      if (!brick.alive) continue;
      
      if (
        ball.x + ball.size > brick.x &&
        ball.x - ball.size < brick.x + brick.width &&
        ball.y + ball.size > brick.y &&
        ball.y - ball.size < brick.y + brick.height
      ) {
        brick.alive = false;
        gameState.score++;
        SoundManager.play("brickHit");
        
        // Reverse direction
        const dx = ball.x - (brick.x + brick.width / 2);
        const dy = ball.y - (brick.y + brick.height / 2);
        if (Math.abs(dx) > Math.abs(dy)) {
          ball.xUpdate = -ball.xUpdate;
        } else {
          ball.yUpdate = -ball.yUpdate;
        }
        
        return;
      }
    }
  }
};

// Activate wide paddle effect (10 seconds)
const activateWidePaddle = () => {
  if (activeEffects.widePaddle.active) {
    // Extend existing effect
    activeEffects.widePaddle.endTime = Date.now() + 10000;
    return;
  }
  
  activeEffects.widePaddle.active = true;
  activeEffects.widePaddle.endTime = Date.now() + 10000; // 10 seconds
  activeEffects.widePaddle.originalWidth = gameState.paddleWidth;
  
  // Increase paddle width by 1.5x
  gameState.paddleWidth *= 1.5;
  
  // Adjust position to keep centered
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  gameState.paddleLeftPos = Math.max(0, Math.min(gameState.paddleLeftPos, width - gameState.paddleWidth));
};

// Deactivate wide paddle effect
const deactivateWidePaddle = () => {
  if (!activeEffects.widePaddle.active) return;
  activeEffects.widePaddle.active = false;
  
  // Restore original width
  gameState.paddleWidth = activeEffects.widePaddle.originalWidth;
  
  // Adjust position
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  gameState.paddleLeftPos = Math.max(0, Math.min(gameState.paddleLeftPos, width - gameState.paddleWidth));
};

// Draw all power-ups
export const drawPowerUps = () => {
  activePowerUps.forEach(powerUp => powerUp.draw());
};

// Draw extra balls
export const drawExtraBalls = () => {
  extraBalls.forEach(ball => {
    if (!ball.active) return;
    
    pingPongCtx.beginPath();
    pingPongCtx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    pingPongCtx.fillStyle = "#ffff00"; // Yellow for extra balls
    pingPongCtx.strokeStyle = "#000";
    pingPongCtx.lineWidth = 1;
    pingPongCtx.fill();
    pingPongCtx.stroke();
  });
};

// Reset power-ups (on game restart)
export const resetPowerUps = () => {
  activePowerUps = [];
  extraBalls = [];
  activeEffects = {
    slowBall: { active: false, endTime: 0 },
    widePaddle: { active: false, endTime: 0, originalWidth: 0 }
  };
  
  // Deactivate any active effects
  if (activeEffects.slowBall.active) {
    deactivateSlowBall();
  }
  if (activeEffects.widePaddle.active) {
    deactivateWidePaddle();
  }
};

// Get extra balls for collision checking
export const getExtraBalls = () => extraBalls;

