import Phaser from 'phaser';

export default class LevelEndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelEndScene' });
  }

  init(data) {
    this.score = data.score || 0;
    this.distance = data.distance || 0;
    this.win = data.win ?? false;
  }

  create() {
    const { width, height } = this.scale;

    const previousBest = parseInt(localStorage.getItem('sa_parkour_best') || '0', 10);
    const bestDistance = Math.max(previousBest, this.distance);
    const isNewBest = this.distance > previousBest;
    localStorage.setItem('sa_parkour_best', String(bestDistance));

    const headerLabel = this.win ? 'LEVEL COMPLETE' : 'GAME OVER';
    const headerColor = this.win ? '#f5a623' : '#e94560';

    this.add.rectangle(width / 2, height / 2, width, height, 0x11111a);

    this.add.text(width / 2, height / 2 - 110, headerLabel, {
      fontSize: '42px',
      fill: headerColor,
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 35, 'Distance: ' + this.distance + 'm', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 5, 'Score: ' + this.score, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 45, (isNewBest ? 'NEW BEST: ' : 'Best: ') + bestDistance + 'm', {
      fontSize: '18px',
      fill: isNewBest ? '#ffd700' : '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const retry = this.add.text(width / 2, height / 2 + 100, '[ PLAY AGAIN ]', {
      fontSize: '22px',
      fill: '#f5a623',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retry.on('pointerover', () => retry.setFill('#ffffff'));
    retry.on('pointerout', () => retry.setFill('#f5a623'));
    retry.on('pointerdown', () => this.scene.start('GameScene'));

    const menu = this.add.text(width / 2, height / 2 + 138, '[ MAIN MENU ]', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menu.on('pointerover', () => menu.setFill('#f5a623'));
    menu.on('pointerout', () => menu.setFill('#ffffff'));
    menu.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
