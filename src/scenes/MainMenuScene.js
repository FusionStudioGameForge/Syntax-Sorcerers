import Phaser from 'phaser';
import mainMenuBgImg from '../assets/mainmenu-bg.png';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    console.log('MainMenuScene preload');
    this.load.image('mainmenu-bg', mainMenuBgImg);
  }

  create() {
    const { width, height } = this.scale;
    console.log('MainMenuScene create');

    // Add background image
    if (this.textures.exists('mainmenu-bg')) {
      const bg = this.add.image(width / 2, height / 2, 'mainmenu-bg');
      const scaleX = width / bg.width;
      const scaleY = height / bg.height;
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale).setScrollFactor(0);
    } else {
      // Fallback background
      this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);
    }

    // Title text
    const title = this.add.text(width / 2, height / 2 - 100, 'MZANSI CHRONICLES', {
      fontSize: '58px',
      fill: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'monospace',
      stroke: '#f5a623',
      strokeThickness: 4,
      shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 6, stroke: true, fill: true }
    }).setOrigin(0.5);
    title.setDepth(1);

    // Subtitle
    this.add.text(width / 2, height / 2 - 40, 'Infinite Runner', {
      fontSize: '24px',
      fill: '#f5a623',
      fontFamily: 'monospace',
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(1);

    // START BUTTON - FORCED WORKING VERSION
    const startBtn = this.add.text(width / 2, height / 2 + 40, '▶ START GAME ◀', {
      fontSize: '36px',
      fill: '#f5a623',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      backgroundColor: '#000000',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    startBtn.setDepth(2);
    
    // Hover effects
    startBtn.on('pointerover', () => {
      console.log('START GAME hover');
      startBtn.setStyle({ fill: '#ffffff', backgroundColor: '#f5a623' });
    });
    
    startBtn.on('pointerout', () => {
      startBtn.setStyle({ fill: '#f5a623', backgroundColor: '#000000' });
    });
    
    // Force start when clicked
    startBtn.on('pointerdown', () => {
      console.log('START GAME CLICKED - FORCING START');
      startBtn.setStyle({ fill: '#00ff00' });
      
      // Visual feedback animation
      this.tweens.add({
        targets: startBtn,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Force stop any existing game scene
          if (this.scene.isActive('GameScene')) {
            console.log('Stopping existing GameScene');
            this.scene.stop('GameScene');
          }
          
          // Small delay to ensure cleanup
          this.time.delayedCall(50, () => {
            console.log('Starting fresh GameScene');
            this.scene.start('GameScene');
          });
        }
      });
    });

    // Controls info
    const controlsText = this.add.text(width / 2, height / 2 + 130, 'Controls: ← → ↑ or A D W | SPACE to jump', {
      fontSize: '14px',
      fill: '#cccccc',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    controlsText.setDepth(1);
    
    // Instructions
    const instructionText = this.add.text(width / 2, height - 40, 'Click START GAME to begin your adventure!', {
      fontSize: '16px',
      fill: '#f5a623',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    instructionText.setDepth(1);
    
    // Add a pulsing animation to the start button
    this.tweens.add({
      targets: startBtn,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}