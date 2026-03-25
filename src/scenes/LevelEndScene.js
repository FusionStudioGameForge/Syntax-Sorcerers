import Phaser from 'phaser';

export default class LevelEndScene extends Phaser.Scene {
  constructor() { super({ key: 'LevelEndScene' }); }

  init(data) { 
    this.score = data.score || 0; 
    // ADD: receive win flag sent by GameScene.handleDeath / handleWin
    this.win   = data.win   ?? false;
  }

  create() {
    // ─── ADD: high score persistence ─────────────────────────────────────────
    // Read previous best from localStorage, update if this run beats it.
    const prevBest  = parseInt(localStorage.getItem('sa_parkour_best') || '0', 10);
    const newBest   = Math.max(prevBest, this.score);
    const gotNewBest = this.score > prevBest;
    localStorage.setItem('sa_parkour_best', String(newBest));
    // ─────────────────────────────────────────────────────────────────────────
 
    // ─── ADD: win / lose header ───────────────────────────────────────────────
    // His original only showed 'GAME OVER'. Now win:true shows a different header.
    const headerLabel = this.win ? 'YOU MADE IT!' : 'GAME OVER';
    const headerColor = this.win ? '#f5a623'      : '#e94560';
 
    this.add.text(width / 2, height / 2 - 80, headerLabel, {
      fontSize: '40px', fill: headerColor, fontFamily: 'monospace'
    }).setOrigin(0.5);
    // ─────────────────────────────────────────────────────────────────────────
 
    this.add.text(width / 2, height / 2 - 20, 'Distance: ' + this.score + 'm', {
      fontSize: '24px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);
 
    // ─── ADD: best distance line ──────────────────────────────────────────────
    const bestLabel = gotNewBest
      ? '★ NEW BEST: ' + newBest + 'm'
      : 'Best: '       + newBest + 'm';
    this.add.text(width / 2, height / 2 + 20, bestLabel, {
      fontSize: '16px',
      fill: gotNewBest ? '#ffd700' : '#888888',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    // ─────────────────────────────────────────────────────────────────────────
 
    const { width, height } = this.scale;
    this.add.text(width/2, height/2 - 60, 'GAME OVER', {
      fontSize: '40px', fill: '#e94560', fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.add.text(width/2, height/2, 'Distance: ' + this.score + 'm', {
      fontSize: '24px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);
    const retry = this.add.text(width/2, height/2 + 60, '[ TRY AGAIN ]', {
      fontSize: '22px', fill: '#f5a623', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.start('GameScene'));
  
    // ─── ADD: main menu button ────────────────────────────────────────────────
    // His original had no way back to the menu from here.
    const menu = this.add.text(width / 2 + 100, height / 2 + 80, '[ MENU ]', {
      fontSize: '22px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerover',  () => menu.setFill('#f5a623'));
    menu.on('pointerout',   () => menu.setFill('#ffffff'));
    menu.on('pointerdown',  () => this.scene.start('MainMenuScene'));
    // ─────────────────────────────────────────────────────────────────────────
 
  
  }
}