import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import PauseScene from './scenes/PauseScene.js';
import LevelEndScene from './scenes/LevelEndScene.js';

//  main.js  —  Entry point
//  Vite loads this first (via index.html's <script> tag).
//  It imports all scenes and boots the Phaser game.

import { UIScenes }   from './scenes/UIScenes.js';

const config = {
  type: Phaser.AUTO,          // WebGL if available, else Canvas
  width:  800,
  height: 500,
  backgroundColor: '#1a1a2e',

  parent: 'game-container',   // optional: mount inside a specific <div>

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },   // global downward pull (px/s²)
      debug:   false,        // ← set true to see hitboxes while developing!
    },
  },

  scene: [MainMenuScene, GameScene, PauseScene, LevelEndScene, UIScenes],
};

new Phaser.Game(config);
