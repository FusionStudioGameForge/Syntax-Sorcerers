import Phaser from 'phaser';

export default class LevelEndScene extends Phaser.Scene {
  constructor() { super({ key: 'LevelEndScene' }); }

  init(data) { this.score = data.score || 0; }

  create() {
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
  }
}