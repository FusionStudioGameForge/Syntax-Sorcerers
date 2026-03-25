import Phaser from 'phaser';

export default class LevelEndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelEndScene' });
  }

  init(data) {
    this.score = data.score || 0;
    this.distance = data.distance || 0;
    this.win = data.win ?? false;
    console.log('LevelEndScene init');
  }

  create() {
    const { width, height } = this.scale;
    console.log('LevelEndScene create');

    const previousBest = parseInt(localStorage.getItem('sa_parkour_best') || '0', 10);
    const bestDistance = Math.max(previousBest, this.distance);
    const isNewBest = this.distance > previousBest;
    localStorage.setItem('sa_parkour_best', String(bestDistance));

    const headerLabel = this.win ? 'LEVEL COMPLETE' : 'GAME OVER';
    const headerColor = this.win ? '#f5a623' : '#e94560';

    // Background overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setDepth(0);

    // Header text
    const headerText = this.add.text(width / 2, height / 2 - 110, headerLabel, {
      fontSize: '48px',
      fill: headerColor,
      fontFamily: 'monospace',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    headerText.setDepth(1);

    // Stats
    const distanceText = this.add.text(width / 2, height / 2 - 35, 'Distance: ' + this.distance + 'm', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    distanceText.setDepth(1);

    const scoreText = this.add.text(width / 2, height / 2 + 5, 'Score: ' + this.score, {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    scoreText.setDepth(1);

    const bestText = this.add.text(width / 2, height / 2 + 45, (isNewBest ? 'NEW BEST: ' : 'Best: ') + bestDistance + 'm', {
      fontSize: '20px',
      fill: isNewBest ? '#ffd700' : '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);
    bestText.setDepth(1);

    // PLAY AGAIN BUTTON - FORCED WORKING VERSION
    const playAgainX = width / 2;
    const playAgainY = height / 2 + 110;
    
    // Create a simple interactive text first
    const playAgainBtn = this.add.text(playAgainX, playAgainY, '▶ PLAY AGAIN ◀', {
      fontSize: '28px',
      fill: '#f5a623',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    playAgainBtn.setDepth(2);
    
    // Add hover effects
    playAgainBtn.on('pointerover', () => {
      console.log('PLAY AGAIN hover');
      playAgainBtn.setStyle({ fill: '#ffffff', backgroundColor: '#f5a623' });
    });
    
    playAgainBtn.on('pointerout', () => {
      playAgainBtn.setStyle({ fill: '#f5a623', backgroundColor: '#000000' });
    });
    
    // Force the restart when clicked
    playAgainBtn.on('pointerdown', () => {
      console.log('PLAY AGAIN CLICKED - FORCING RESTART');
      playAgainBtn.setStyle({ fill: '#00ff00' });
      
      // Method 1: Try to restart directly
      try {
        // Completely destroy the current game scene
        this.scene.stop('GameScene');
        
        // Small delay to ensure cleanup
        this.time.delayedCall(50, () => {
          // Restart the game scene fresh
          this.scene.start('GameScene');
          console.log('GameScene restarted');
        });
      } catch (error) {
        console.error('Error restarting:', error);
      }
    });

    // MAIN MENU BUTTON
    const mainMenuX = width / 2;
    const mainMenuY = height / 2 + 170;
    
    const mainMenuBtn = this.add.text(mainMenuX, mainMenuY, '◀ MAIN MENU ▶', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    mainMenuBtn.setDepth(2);
    
    mainMenuBtn.on('pointerover', () => {
      console.log('MAIN MENU hover');
      mainMenuBtn.setStyle({ fill: '#f5a623', backgroundColor: '#000000' });
    });
    
    mainMenuBtn.on('pointerout', () => {
      mainMenuBtn.setStyle({ fill: '#ffffff', backgroundColor: '#000000' });
    });
    
    mainMenuBtn.on('pointerdown', () => {
      console.log('MAIN MENU CLICKED');
      mainMenuBtn.setStyle({ fill: '#00ff00' });
      
      // Stop game and go to main menu
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    });
    
    // Also add keyboard support for R to restart
    this.input.keyboard.once('keydown-R', () => {
      console.log('R key pressed - restarting');
      this.scene.stop('GameScene');
      this.time.delayedCall(50, () => {
        this.scene.start('GameScene');
      });
    });
    
    // Add instruction text
    const instructionText = this.add.text(width / 2, height - 30, 'Press R to restart | Click buttons above', {
      fontSize: '12px',
      fill: '#888888',
      fontFamily: 'monospace'
    }).setOrigin(0.5);
    instructionText.setDepth(1);
  }
}