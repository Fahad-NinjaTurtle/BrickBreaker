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
  
  // Normalize ball speed - consistent across devices
  // Use a fixed base speed that feels good on all screen sizes
  // Scale slightly with screen size but keep it reasonable
  const isMobile = width <= 768;
  const baseSpeed = isMobile ? 180 : Math.min(width / 3, 350); // Slower on mobile, capped on PC

  gameState.circleX = Math.random() * width / 2 + width / 4;
  gameState.circleY = height / 2;

  gameState.circleXUpdate = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
  gameState.circleYUpdate = baseSpeed;

  gameState.paddleLeftPos = (width - gameState.paddleWidth) / 2;
};
