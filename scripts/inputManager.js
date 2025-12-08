import { gameState } from "./gameState.js";

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

      if (
        mouseX >= gameState.paddleLeftPos &&
        mouseX <= gameState.paddleLeftPos + gameState.paddleWidth &&
        mouseY >= gameState.paddleTopPos &&
        mouseY <= gameState.paddleTopPos + gameState.paddleHeight
      ) {
        isDragging = true;
        dragOffsetX = mouseX - gameState.paddleLeftPos;
      }
    });

    pingPongCanvas.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = pingPongCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      gameState.paddleLeftPos = mouseX - dragOffsetX;
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

      if (
        touchX >= gameState.paddleLeftPos &&
        touchX <= gameState.paddleLeftPos + gameState.paddleWidth &&
        touchY >= gameState.paddleTopPos &&
        touchY <= gameState.paddleTopPos + gameState.paddleHeight
      ) {
        isDragging = true;
        dragOffsetX = touchX - gameState.paddleLeftPos;
      }
    });

    pingPongCanvas.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      e.preventDefault(); // prevents page scrolling
      const rect = pingPongCanvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      gameState.paddleLeftPos = touchX - dragOffsetX;
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
