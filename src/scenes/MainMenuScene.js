import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 40, 'SA PARKOUR', {
      fontSize: '48px',
      fill: '#f5a623',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    const playBtn = this.add.text(width / 2, height / 2 + 40, '[ PLAY ]', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerover', () => playBtn.setFill('#f5a623'));
    playBtn.on('pointerout',  () => playBtn.setFill('#ffffff'));
    playBtn.on('pointerdown', () => this.scene.start('GameScene'));
  }
}