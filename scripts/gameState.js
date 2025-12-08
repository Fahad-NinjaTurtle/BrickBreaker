export const gameState = {
  currentLevel: 1,
  bricksRow: 1,
  bricksColumn: 8,
  highScore: 0,
  // ball
  circleX: 30,
  circleY: 30,
  circleSize: 10,
  ballLife: 3,
  circleXUpdate: 200, // pixels per second
  circleYUpdate: 200,

  // paddle
  paddleLeftPos: 200,
  paddleWidth: 100,
  paddleHeight: 20,
  paddleTopPos: 0,

  // game status
  score: 0,
  gameOver: false,

  // input flags
  moveLeft: false,
  moveRight: false,

  bricksArray: [],
};
