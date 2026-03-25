import Phaser from 'phaser';
import mainMenuBgImg from '../assets/mainmenu-bg.png';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    // Load the background image imported by Vite
    this.load.image('mainmenu-bg', mainMenuBgImg);
  }

  create() {
    const { width, height } = this.scale;

    // Add background image, fallback to center if not loaded smoothly
    const bg = this.add.image(width / 2, height / 2, 'mainmenu-bg');

    // Scale image to cover the screen
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Title text with a stroke to stand out against the background
    this.add.text(width / 2, height / 2 - 80, 'MZANSI CHRONICLES', {
      fontSize: '56px',
      fill: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 4, stroke: true, fill: true }
    }).setOrigin(0.5);

    // Play Button (transparent floating option)
    const playBtnContainer = this.add.container(width / 2, height / 2 + 60);

    // Transparent background for button, floating effect
    const btnBg = this.add.rectangle(0, 0, 200, 60, 0x000000, 0.4)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true });

    const playText = this.add.text(0, 0, 'PLAY', {
      fontSize: '28px',
      fill: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    playBtnContainer.add([btnBg, playText]);

    // Hover effects
    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0xffffff, 0.2);
      playText.setFill('#f5a623');
    });

    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x000000, 0.4);
      playText.setFill('#ffffff');
    });

    btnBg.on('pointerdown', () => {
      // Small feedback before starting
      btnBg.setFillStyle(0xffffff, 0.5);
      this.time.delayedCall(100, () => {
        this.scene.start('GameScene');
      });
    });
  }
}