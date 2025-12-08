export const SoundManager = {
  // sounds to load
  paths: {
    bounce: "./sounds/Bounce.mp3",
    brickHit: "./sounds/BrickHit.wav",
    gameOver: "./sounds/GameOver.wav",
    levelComplete: "./sounds/LevelComplete.wav",
  },

  pools: {},      // will store arrays of audio objects
  poolSize: 3,    // how many overlapping plays allowed

  init() {
    // create pools for each sound
    for (const key in this.paths) {
      this.pools[key] = [];
      for (let i = 0; i < this.poolSize; i++) {
        this.pools[key].push(new Audio(this.paths[key]));
      }
    }
  },

  play(name) {
    const pool = this.pools[name];
    if (!pool) return;

    // find a free audio channel
    for (const audio of pool) {
      if (audio.paused || audio.ended) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
    }

    // if all channels busy → do nothing (prevents lag & errors)
  }
};
