# 🎮 Breakout Game

A modern, responsive Breakout-style game built with HTML5 Canvas and vanilla JavaScript. Break bricks, collect power-ups, and progress through increasingly challenging levels!

## 🚀 Live Demo

[Play the game here](https://fahad-ninjaturtle.github.io/BrickBreaker/) 


## ✨ Features

### 🎯 Core Gameplay
- **Classic Breakout Mechanics**: Break all bricks to complete levels
- **Progressive Difficulty**: Each level adds more rows of bricks
- **Lives System**: Start with 3 lives
- **Score Tracking**: Track your score and high score
- **Level Progression**: Advance through multiple levels

### 🎨 Visual Design
- **Pixel-Perfect Graphics**: Retro-style pixel art aesthetic
- **Rounded Bricks**: Smooth, rounded brick edges for modern look
- **Responsive Design**: Fully responsive for mobile, tablet, and desktop
- **Fullscreen Support**: Immersive fullscreen gameplay
- **Dark Theme**: Easy on the eyes with dark gray background

### 💪 Power-Up System
- **Slow Ball** (Green): Reduces ball speed by 50% for 5 seconds
- **Extra Ball** (Yellow): Adds an extra ball that can break bricks (destroyed if missed)
- **Wide Paddle** (Cyan): Increases paddle width by 1.5× for 10 seconds

### 🎮 Controls
- **Keyboard**: Use ← → Arrow keys to move paddle
- **Mouse**: Click and drag the paddle
- **Touch**: Drag paddle on mobile devices

### 📱 Responsive Features
- **Mobile Optimized**: Two-row UI layout for mobile screens
- **PC Enhanced**: Larger bricks (3× size) and wider paddle (1.5×) on desktop
- **Adaptive Sizing**: All game elements scale proportionally
- **Touch-Friendly**: Optimized for touch interactions

### 🎵 Audio
- **Sound Effects**: Bounce, brick hit, level complete, and game over sounds
- **Sound Pooling**: Prevents audio conflicts with multiple simultaneous sounds

## 🛠️ Technologies Used

- **HTML5**: Canvas API for rendering
- **JavaScript (ES6+)**: Modern JavaScript with modules
- **CSS3**: Responsive styling and animations
- **Canvas 2D API**: Game rendering and graphics

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Fahad-NinjaTurtle/BrickBreaker.git
   cd "HTML 5 Week 2"
   ```

2. **Install dependencies** (optional, for ESLint)
   ```bash
   npm install
   ```

3. **Open the game**
   - Simply open `index.html` in a modern web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

4. **Play!**
   - Navigate to `http://localhost:8000` in your browser
   - Click "Start Game" to begin

## 🎯 How to Play

1. **Start the Game**: Click the "Start Game" button
2. **Break Bricks**: Use the paddle to bounce the ball and break all bricks
3. **Collect Power-Ups**: Catch falling power-ups to gain advantages
4. **Complete Levels**: Clear all bricks to advance to the next level
5. **Avoid Missing**: Don't let the ball fall below the paddle (you lose a life)
6. **Win**: Complete all levels to win the game!

## 🎨 Game Mechanics

### Ball Physics
- **Angle-Based Bouncing**: Ball bounces at angles based on where it hits the paddle
- **Limited Angle Range**: Bounces are limited to ±60° for paddle, ±45° for bricks
- **Speed Normalization**: Consistent ball speed across all devices

### Brick System
- **Row-Based Colors**: 
  - Row 1: Blue
  - Row 2: Red
  - Row 3: Yellow
  - Row 4: Green
- **Consistent Sizing**: Bricks maintain 3:1 aspect ratio
- **PC Scaling**: Bricks are 3× larger on PC screens

### Power-Up Mechanics
- **Drop Rate**: 25% chance when a brick is destroyed
- **Collection**: Catch power-ups with your paddle
- **Duration**: Temporary effects expire automatically
- **Stacking**: Some effects can stack (wide paddle extends duration)

## 📂 Project Structure

```
HTML 5 Week 2/
├── index.html              # Main HTML file
├── scripts/
│   ├── gameManager.js     # Main game loop and state management
│   ├── gameState.js       # Game state object
│   ├── animate.js         # Animation and movement logic
│   ├── render.js          # Rendering functions
│   ├── collision.js       # Collision detection
│   ├── brickManager.js    # Brick creation and management
│   ├── inputManager.js    # Input handling (keyboard, mouse, touch)
│   ├── soundManager.js    # Audio management
│   └── powerUpManager.js  # Power-up system
├── sounds/                # Sound effects
│   ├── Bounce.mp3
│   ├── BrickHit.wav
│   ├── GameOver.wav
│   └── LevelComplete.wav
├── package.json           # Node.js dependencies
├── eslint.config.mjs      # ESLint configuration
└── README.md             # This file
```

## 🎮 Game States

- **Start Screen**: Initial game panel with instructions
- **Playing**: Active gameplay
- **Level Complete**: Panel shown when all bricks are destroyed
- **Game Over**: Panel shown when all lives are lost

## 🔧 Configuration

### Adjusting Difficulty
- Modify `gameState.ballLife` in `gameState.js` to change starting lives
- Adjust `gameState.bricksRow` to change initial brick rows
- Modify power-up drop rate in `powerUpManager.js` (currently 25%)

### Customizing Power-Ups
- Edit power-up types in `scripts/powerUpManager.js`
- Adjust effect durations (currently 5s for slow ball, 10s for wide paddle)
- Modify power-up colors and symbols

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created as part of HTML5 Week 2 project.

## 🙏 Acknowledgments

- Sound effects from various sources
- Inspired by classic Breakout/Arkanoid games
- Built with modern web technologies

## 📞 Support

If you encounter any issues or have suggestions, please open an issue on the repository.

---

**Enjoy playing! 🎮**

