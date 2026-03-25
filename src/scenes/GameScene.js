import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { EnemyGroup } from '../entities/enemyGroup.js';
import { CoinGroup } from '../entities/coinGroup.js';
import { PLAYER_SPEED, JUMP_FORCE, ENEMY_SPEED, STOMP_SCORE, COIN_SCORE } from '../constants.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Create runtime textures for player, enemy, coin, platform
    this.createRuntimeTextures();
  }

  createRuntimeTextures() {
    // 32x32 yellow player square
    const playerGraphics = this.make.graphics({ x: 0, y: 0, create: true });
    playerGraphics.fillStyle(0xf5a623, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 24x24 red enemy square
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, create: true });
    enemyGraphics.fillStyle(0xff6b6b, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 12x12 gold coin circle
    const coinGraphics = this.make.graphics({ x: 0, y: 0, create: true });
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(6, 6, 6);
    coinGraphics.generateTexture('coin', 12, 12);
    coinGraphics.destroy();
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Joburg skyline
    const buildings = [
      { x: 100, y: 300, w: 60, h: 160 },
      { x: 200, y: 260, w: 80, h: 200 },
      { x: 320, y: 220, w: 50, h: 240 },
      { x: 420, y: 280, w: 90, h: 180 },
      { x: 560, y: 240, w: 70, h: 220 },
      { x: 680, y: 200, w: 55, h: 260 },
      { x: 780, y: 270, w: 100, h: 190 },
      { x: 930, y: 230, w: 65, h: 230 },
      { x: 1050, y: 250, w: 80, h: 210 },
      { x: 1180, y: 210, w: 60, h: 250 },
    ];
    buildings.forEach((b) => {
      this.add.rectangle(b.x, b.y, b.w, b.h, 0x16213e).setOrigin(0);
    });

    // Platforms
    const platformData = [
      { x: 0, y: 460, w: 400, h: 20 },
      { x: 450, y: 420, w: 200, h: 20 },
      { x: 700, y: 380, w: 180, h: 20 },
      { x: 930, y: 340, w: 220, h: 20 },
      { x: 1200, y: 370, w: 200, h: 20 },
      { x: 1460, y: 320, w: 250, h: 20 },
      { x: 1760, y: 360, w: 200, h: 20 },
      { x: 2000, y: 460, w: 600, h: 20 },
    ];
    this.platforms = this.physics.add.staticGroup();
    platformData.forEach((p) => {
      const plat = this.add.rectangle(p.x, p.y, p.w, p.h, 0xe94560).setOrigin(0);
      this.physics.add.existing(plat, true);
      this.platforms.add(plat);
    });

    // Obstacles (instant death on touch)
    const obstacleData = [
      { x: 600, y: 400, w: 20, h: 40 },
      { x: 850, y: 360, w: 20, h: 40 },
      { x: 1100, y: 320, w: 20, h: 40 },
    ];
    this.obstacles = this.physics.add.staticGroup();
    obstacleData.forEach((o) => {
      const obs = this.add.rectangle(o.x, o.y, o.w, o.h, 0xff0000).setOrigin(0);
      this.physics.add.existing(obs, true);
      this.obstacles.add(obs);
    });

    // Player
    this.player = new Player(this, 80, 400);

    // Enemies
    const enemySpecs = [
      { x: 520, y: 380, minX: 480, maxX: 650 },
      { x: 800, y: 340, minX: 750, maxX: 900 },
      { x: 1280, y: 300, minX: 1200, maxX: 1400 },
    ];
    this.enemies = new EnemyGroup(this, enemySpecs);

    // Coins
    const coinPositions = [
      [180, 420],
      [300, 380],
      [520, 360],
      [650, 320],
      [860, 300],
      [1120, 260],
      [1350, 290],
      [1650, 240],
      [1900, 400],
      [2200, 420],
    ];
    this.coins = new CoinGroup(this, coinPositions);

    // Finish zone
    this.finishZone = this.add.rectangle(2550, 420, 40, 60, 0xffd700).setOrigin(0);
    this.physics.add.existing(this.finishZone, true);

    // Setup input
    this.keys = {
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });

    // Colliders
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.enemies.physicsGroup, this.platforms);

    this.physics.add.overlap(this.player.sprite, this.coins.physicsGroup, (playerSprite, coin) => {
      this.coins.collectCoin(playerSprite, coin, this.player, COIN_SCORE);
    });

    this.physics.add.overlap(this.player.sprite, this.enemies.physicsGroup, (playerSprite, enemy) => {
      this.enemies.handlePlayerCollision(this.player, enemy, () => this.handleDeath());
    });

    this.physics.add.overlap(this.player.sprite, this.obstacles, () => {
      this.handleDeath();
    });

    this.physics.add.overlap(this.player.sprite, this.finishZone, () => {
      this.handleWin();
    });

    // Physics world bounds must match level size — default is only canvas size (800×500),
    // which would trap the player at x=800 mid-level, right where enemies patrol.
    // Height 700 lets the player fall past y=600 to trigger the death check.
    this.physics.world.setBounds(0, 0, 2800, 700);

    // Camera
    this.cameras.main.setBounds(0, 0, 2800, 500);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    // HUD
    this.scoreDisplay = this.add.text(16, 16, 'Score: 0', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setScrollFactor(0);

    this.healthDisplay = this.add.text(16, 40, 'Health: 3', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'monospace',
    }).setScrollFactor(0);

    this.events.on('scoreChanged', (score) => {
      this.scoreDisplay.setText('Score: ' + score);
    });

    this.events.on('healthChanged', (health) => {
      this.healthDisplay.setText('Health: ' + health);
    });

    this.startX = this.player.x;
    this.gameOver = false;
  }

  handleDeath() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.player.die();
    this.cameras.main.shake(300, 0.01);

    this.time.delayedCall(1000, () => {
      this.scene.start('LevelEndScene', {
        score: this.player.score,
        distance: Math.max(0, Math.floor((this.player.x - this.startX) / 10)),
        win: false,
      });
    });
  }

  handleWin() {
    if (this.gameOver) return;
    this.gameOver = true;

    this.time.delayedCall(500, () => {
      this.scene.start('LevelEndScene', {
        score: this.player.score,
        distance: Math.max(0, Math.floor((this.player.x - this.startX) / 10)),
        win: true,
      });
    });
  }

  update() {
    if (this.gameOver) return;

    this.player.update(this.keys);
    this.enemies.update();

    // Death by falling
    if (this.player.y > 600) {
      this.handleDeath();
    }
  }
}