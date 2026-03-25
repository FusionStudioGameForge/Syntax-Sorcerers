import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import PauseScene from './scenes/PauseScene.js';
import LevelEndScene from './scenes/LevelEndScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#1a1a2e',
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: true }
  },
  scene: [MainMenuScene, GameScene, PauseScene, LevelEndScene]
};

new Phaser.Game(config);
