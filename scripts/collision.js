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

  if (gameState.circleY + gameState.circleSize >= pingPongCanvas.height) {
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

const Bounce = () => {
  const g = gameState;
  g.circleY = g.paddleTopPos - g.circleSize;
  g.circleYUpdate = -Math.abs(g.circleYUpdate); 
  SoundManager.play("bounce");
};
