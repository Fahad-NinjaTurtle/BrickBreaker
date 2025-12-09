import { gameState } from "./gameState.js";
import { releaseBallFromPaddle } from "./animate.js";

export const setupInput = (pingPongCanvas) => {
  const AddListnersForKeyboard = () => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") gameState.moveLeft = true;
      if (e.key === "ArrowRight") gameState.moveRight = true;
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft") gameState.moveLeft = false;
      if (e.key === "ArrowRight") gameState.moveRight = false;
    });
  };

  const PaddleMovementWithMouseDrag = () => {
    let isDragging = false;
    let dragOffsetX = 0;

    pingPongCanvas.addEventListener("mousedown", (e) => {
      const rect = pingPongCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const canvasHeight = pingPongCanvas.height / (window.devicePixelRatio || 1);
      
      // Check if click is in bottom 25% of screen
      const bottom25Percent = canvasHeight * 0.75;
      const isInBottomArea = mouseY >= bottom25Percent;
      
      // Also allow dragging from paddle itself
      const isOnPaddle = (
        mouseX >= gameState.paddleLeftPos &&
        mouseX <= gameState.paddleLeftPos + gameState.paddleWidth &&
        mouseY >= gameState.paddleTopPos &&
        mouseY <= gameState.paddleTopPos + gameState.paddleHeight
      );

      if (isInBottomArea || isOnPaddle) {
        isDragging = true;
        // Calculate offset from paddle center for better control
        dragOffsetX = mouseX - (gameState.paddleLeftPos + gameState.paddleWidth / 2);
      }
    });

    pingPongCanvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = pingPongCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const canvasWidth = pingPongCanvas.width / (window.devicePixelRatio || 1);
      const oldPos = gameState.paddleLeftPos;
      
      // Move paddle center to mouse position (minus offset)
      const newPaddleCenterX = mouseX - dragOffsetX;
      gameState.paddleLeftPos = Math.max(0, Math.min(newPaddleCenterX - gameState.paddleWidth / 2, canvasWidth - gameState.paddleWidth));
      
      // Release ball if paddle moved
      if (gameState.ballStuckToPaddle && Math.abs(gameState.paddleLeftPos - oldPos) > 0.1) {
        releaseBallFromPaddle();
      }
    });

    pingPongCanvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    pingPongCanvas.addEventListener("mouseleave", () => {
      isDragging = false;
    });
  };

  const PaddleMovementWithTouchDrag = () => {
    let isDragging = false;
    let dragOffsetX = 0;

    pingPongCanvas.addEventListener("touchstart", (e) => {
      const rect = pingPongCanvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const touchY = e.touches[0].clientY - rect.top;
      const canvasHeight = pingPongCanvas.height / (window.devicePixelRatio || 1);
      
      // Check if touch is in bottom 25% of screen
      const bottom25Percent = canvasHeight * 0.75;
      const isInBottomArea = touchY >= bottom25Percent;
      
      // Also allow dragging from paddle itself
      const isOnPaddle = (
        touchX >= gameState.paddleLeftPos &&
        touchX <= gameState.paddleLeftPos + gameState.paddleWidth &&
        touchY >= gameState.paddleTopPos &&
        touchY <= gameState.paddleTopPos + gameState.paddleHeight
      );

      if (isInBottomArea || isOnPaddle) {
        isDragging = true;
        e.preventDefault(); // Prevent scrolling
        // Calculate offset from paddle center for better control
        dragOffsetX = touchX - (gameState.paddleLeftPos + gameState.paddleWidth / 2);
      }
    });

    pingPongCanvas.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      e.preventDefault(); // prevents page scrolling
      const rect = pingPongCanvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const canvasWidth = pingPongCanvas.width / (window.devicePixelRatio || 1);
      const oldPos = gameState.paddleLeftPos;
      
      // Move paddle center to touch position (minus offset)
      const newPaddleCenterX = touchX - dragOffsetX;
      gameState.paddleLeftPos = Math.max(0, Math.min(newPaddleCenterX - gameState.paddleWidth / 2, canvasWidth - gameState.paddleWidth));
      
      // Release ball if paddle moved
      if (gameState.ballStuckToPaddle && Math.abs(gameState.paddleLeftPos - oldPos) > 0.1) {
        releaseBallFromPaddle();
      }
    });

    pingPongCanvas.addEventListener("touchend", () => {
      isDragging = false;
    });

    pingPongCanvas.addEventListener("touchcancel", () => {
      isDragging = false;
    });
  };

  AddListnersForKeyboard();
  PaddleMovementWithMouseDrag();
  PaddleMovementWithTouchDrag();
};
