import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
  constructor() { super({ key: 'PauseScene' }); }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.6);
    this.add.text(width/2, height/2 - 30, 'PAUSED', {
      fontSize: '36px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);
    const resume = this.add.text(width/2, height/2 + 30, '[ RESUME ]', {
      fontSize: '22px', fill: '#f5a623', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resume.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }
}