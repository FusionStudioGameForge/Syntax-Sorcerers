import Phaser from 'phaser';
import MainMenuScene from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';
import LevelEndScene from './scenes/LevelEndScene.js';
import { UIScenes } from './scenes/UIScenes.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [MainMenuScene, GameScene, PauseScene, LevelEndScene, UIScenes],
};

new Phaser.Game(config);
