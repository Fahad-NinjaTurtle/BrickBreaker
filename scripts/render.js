import { pingPongCanvas, pingPongCtx } from "./gameManager.js";
import { gameState } from "./gameState.js";
import { DrawBricks } from "./brickManager.js";
import { drawPowerUps, drawExtraBalls } from "./powerUpManager.js";

export const Draw = (dt) => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);

  pingPongCtx.fillStyle = "#2a2a2a";
  pingPongCtx.fillRect(0, 0, width, height);

  DrawBall();
  DrawPaddle();
  DrawBricks();
  drawPowerUps();
  drawExtraBalls();
  DrawScore();
  DrawHighScore();
  DrawLevel();
  DrawBallLife();
};

// Responsive text sizing - better for mobile
const getFontSize = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  const isMobile = width <= 768;
  
  // Use smaller font on mobile, scale better
  if (isMobile) {
    return Math.max(8, Math.min(width / 35, 12));
  }
  return Math.max(10, Math.min(width / 28, 18));
};

const getTextTop = () => {
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);
  const isMobile = pingPongCanvas.width / (window.devicePixelRatio || 1) <= 768;
  
  // More space on mobile to prevent overlap
  if (isMobile) {
    return Math.max(15, Math.min(height / 18, 25));
  }
  return Math.max(18, Math.min(height / 16, 32));
};

// Unified retro text renderer
const drawRetroText = (text, x, y, align = "left") => {
  const fontSize = getFontSize();

  pingPongCtx.font = `${fontSize}px 'Press Start 2P', monospace`;
  pingPongCtx.textAlign = align;
  pingPongCtx.fillStyle = "#fff";
  pingPongCtx.strokeStyle = "#000";
  pingPongCtx.lineWidth = Math.max(1, fontSize / 8); // Thinner stroke on mobile

  pingPongCtx.strokeText(text, x, y);
  pingPongCtx.fillText(text, x, y);
};

// === UI DRAW FUNCTIONS ===

const DrawScore = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const isMobile = width <= 768;
  const padding = isMobile ? 8 : 20;
  drawRetroText("Score: " + gameState.score, padding, getTextTop(), "left");
};

const DrawHighScore = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const isMobile = width <= 768;
  
  if (isMobile) {
    // On mobile, use a second row with full text
    const fontSize = getFontSize();
    const lineHeight = fontSize * 1.5;
    const secondRowY = getTextTop() + lineHeight;
    
    // Use full text on mobile
    drawRetroText("High: " + gameState.highScore, 8, secondRowY, "left");
  } else {
    drawRetroText("High: " + gameState.highScore, width * 0.25, getTextTop(), "center");
  }
};

const DrawLevel = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const isMobile = width <= 768;
  
  if (isMobile) {
    // On mobile, position Level above Life (on first row, right side)
    const fontSize = getFontSize();
    pingPongCtx.font = `${fontSize}px 'Press Start 2P', monospace`;
    const levelText = "Level: " + gameState.currentLevel;
    const levelWidth = pingPongCtx.measureText(levelText).width;
    const padding = 8;
    const x = width - levelWidth - padding;
    drawRetroText("Level: " + gameState.currentLevel, x, getTextTop(), "left");
  } else {
    drawRetroText("Level: " + gameState.currentLevel, width * 0.5, getTextTop(), "center");
  }
};

const DrawBallLife = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const isMobile = width <= 768;
  const padding = isMobile ? 8 : 20;
  
  if (isMobile) {
    // On mobile, position Life below Level (on second row, right side)
    const fontSize = getFontSize();
    const lineHeight = fontSize * 1.5;
    const secondRowY = getTextTop() + lineHeight;
    
    pingPongCtx.font = `${fontSize}px 'Press Start 2P', monospace`;
    const lifeText = "Life: " + gameState.ballLife;
    const lifeWidth = pingPongCtx.measureText(lifeText).width;
    const x = width - lifeWidth - padding;
    drawRetroText("Life: " + gameState.ballLife, x, secondRowY, "left");
  } else {
    drawRetroText("Life: " + gameState.ballLife, width - padding, getTextTop(), "right");
  }
};

// === BALL ===
const DrawBall = () => {
  // Draw ball trail
  const trail = gameState.ballTrail;
  if (trail.length > 1) {
    for (let i = 0; i < trail.length; i++) {
      const point = trail[i];
      const alpha = (i + 1) / trail.length * 0.5; // Fade from 50% to 0%
      const size = gameState.circleSize * (0.3 + (i / trail.length) * 0.7); // Scale from 30% to 100%
      
      pingPongCtx.beginPath();
      pingPongCtx.arc(point.x, point.y, size, 0, Math.PI * 2);
      pingPongCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      pingPongCtx.fill();
    }
  }
  
  // Draw main ball
  pingPongCtx.beginPath();
  pingPongCtx.arc(
    gameState.circleX,
    gameState.circleY,
    gameState.circleSize,
    0,
    Math.PI * 2
  );
  pingPongCtx.fillStyle = "#fff";
  pingPongCtx.strokeStyle = "#000";
  pingPongCtx.lineWidth = 1;
  pingPongCtx.fill();
  pingPongCtx.stroke();
};

// === PADDLE ===
const DrawPaddle = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);

  if (gameState.paddleLeftPos < 0) {
    gameState.paddleLeftPos = 0;
  } else if (gameState.paddleLeftPos + gameState.paddleWidth > width) {
    gameState.paddleLeftPos = width - gameState.paddleWidth;
  }

  pingPongCtx.fillStyle = "#fff";
  pingPongCtx.strokeStyle = "#000";
  pingPongCtx.lineWidth = 2;

  pingPongCtx.fillRect(
    gameState.paddleLeftPos,
    gameState.paddleTopPos,
    gameState.paddleWidth,
    gameState.paddleHeight
  );

  pingPongCtx.strokeRect(
    gameState.paddleLeftPos,
    gameState.paddleTopPos,
    gameState.paddleWidth,
    gameState.paddleHeight
  );
};

export const ResetStates = () => {
  const width = pingPongCanvas.width / (window.devicePixelRatio || 1);
  const height = pingPongCanvas.height / (window.devicePixelRatio || 1);

  // Position paddle in center
  gameState.paddleLeftPos = (width - gameState.paddleWidth) / 2;
  
  // Stick ball to paddle (will be released when player moves)
  gameState.ballStuckToPaddle = true;
  
  // Position ball on top of paddle, centered
  gameState.circleX = gameState.paddleLeftPos + gameState.paddleWidth / 2;
  gameState.circleY = gameState.paddleTopPos - gameState.circleSize;
  
  // Calculate base speed with level progression
  // Speed increases per level (slightly faster overall for snappier feel)
  const isMobile = width <= 768;
  const isPortrait = height > width;
  // Slight global speed buff
  let baseSpeed;
  if (isMobile && isPortrait) {
    // On mobile portrait, make the ball much faster (2.5x of previous base)
    baseSpeed = 230 * 1.8;
  } else if (isMobile) {
    baseSpeed = 230;
  } else {
    baseSpeed = Math.min(width / 2.5, 400);
  }
  const levelMultiplier = Math.min(1 + (gameState.currentLevel - 1) * 0.12, 2.2); // a bit more aggressive
  const finalSpeed = baseSpeed * levelMultiplier;
  
  // Stop ball movement (will start when released with calculated speed)
  gameState.circleXUpdate = 0;
  gameState.circleYUpdate = 0;
  
  // Store speed for when ball is released
  gameState.baseBallSpeed = finalSpeed;
  
  // Clear trail
  gameState.ballTrail = [];
};
