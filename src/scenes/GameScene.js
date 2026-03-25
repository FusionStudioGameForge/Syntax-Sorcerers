import Phaser from 'phaser';
import { WORLD_W, WORLD_H, COIN_SCORE } from '../constants.js';
import { Player } from '../entities/player.js';
import { CoinGroup } from '../entities/coinGroup.js';
import { EnemyGroup } from '../entities/enemyGroup.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.createRuntimeTextures();
  }

  create() {
    this.isDead = false;
    this.hasWon = false;

    this.buildBackground();
    this.buildPlatforms();
    this.buildHazards();

    this.player = new Player(this, 100, 380);
    this.physics.add.collider(this.player.sprite, this.platforms);

    this.coins = new CoinGroup(this, [
      [260, 410], [500, 350], [530, 350], [560, 350], [780, 310],
      [1040, 270], [1070, 270], [1400, 300], [1730, 250], [2000, 410],
    ]);

    this.enemies = new EnemyGroup(this, [
      { x: 620, y: 390, minX: 520, maxX: 760 },
      { x: 1240, y: 340, minX: 1170, maxX: 1370 },
      { x: 1860, y: 340, minX: 1790, maxX: 1930 },
    ]);

    this.physics.add.collider(this.enemies.physicsGroup, this.platforms);

    this.physics.add.overlap(this.player.sprite, this.coins.physicsGroup, (_playerSprite, coin) => {
      this.coins.collectCoin(_playerSprite, coin, this.player, COIN_SCORE);
    });

    this.physics.add.collider(this.player.sprite, this.enemies.physicsGroup, (_playerSprite, enemy) => {
      this.enemies.handlePlayerCollision(this.player, enemy, () => this.handleDeath());
    });

    this.physics.add.overlap(this.player.sprite, this.hazards, () => {
      this.handleDeath();
    });

    this.finishZone = this.add.rectangle(WORLD_W - 30, 390, 20, 70, 0xf3c614).setOrigin(0);
    this.physics.add.existing(this.finishZone, true);
    this.physics.add.overlap(this.player.sprite, this.finishZone, () => {
      this.handleWin();
    });

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.launch('PauseScene');
      this.scene.pause();
    });

    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.scene.launch('UIScene');

    this.events.emit('distanceChanged', 0);
    this.events.emit('entitiesChanged', {
      coinsLeft: this.coins.getRemainingCount(),
      enemiesLeft: this.enemies.getRemainingCount(),
    });
  }

  update() {
    if (this.isDead || this.hasWon) return;

    this.player.update(this.keys);
    this.enemies.update();

    if (this.player.y > WORLD_H + 120) {
      this.handleDeath();
      return;
    }

    const distance = Math.max(0, Math.floor((this.player.x - 100) / 10));
    this.events.emit('distanceChanged', distance);
    this.events.emit('entitiesChanged', {
      coinsLeft: this.coins.getRemainingCount(),
      enemiesLeft: this.enemies.getRemainingCount(),
    });
  }

  handleDeath() {
    if (this.isDead || this.hasWon) return;

    this.isDead = true;
    this.player.die();
    this.cameras.main.shake(250, 0.008);

    this.time.delayedCall(700, () => {
      this.scene.stop('UIScene');
      this.scene.start('LevelEndScene', {
        score: this.player.score,
        distance: Math.max(0, Math.floor((this.player.x - 100) / 10)),
        win: false,
      });
    });
  }

  handleWin() {
    if (this.isDead || this.hasWon) return;

    this.hasWon = true;
    this.player.sprite.setVelocity(0, this.player.sprite.body.velocity.y);

    this.time.delayedCall(250, () => {
      this.scene.stop('UIScene');
      this.scene.start('LevelEndScene', {
        score: this.player.score,
        distance: Math.max(0, Math.floor((this.player.x - 100) / 10)),
        win: true,
      });
    });
  }

  buildBackground() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e).setScrollFactor(0);

    const skyline = this.add.group();
    const blocks = [
      [80, 310, 80, 150], [200, 260, 90, 200], [340, 220, 120, 240],
      [520, 300, 100, 160], [680, 260, 120, 200], [860, 210, 130, 250],
      [1060, 280, 100, 180], [1220, 240, 90, 220], [1380, 260, 130, 200],
      [1560, 230, 110, 230], [1730, 280, 95, 180], [1880, 250, 140, 210],
      [2080, 220, 120, 240], [2280, 300, 100, 160], [2440, 260, 150, 200],
    ];

    blocks.forEach(([x, y, w, h]) => {
      skyline.add(this.add.rectangle(x, y, w, h, 0x16213e).setOrigin(0));
    });
  }

  buildPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    const platformData = [
      [0, 460, 400, 20],
      [450, 420, 220, 20],
      [730, 380, 210, 20],
      [1000, 340, 240, 20],
      [1300, 370, 230, 20],
      [1600, 320, 260, 20],
      [1920, 360, 230, 20],
      [2200, 420, 400, 20],
    ];

    platformData.forEach(([x, y, w, h]) => {
      const platform = this.add.rectangle(x, y, w, h, 0xe94560).setOrigin(0);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });
  }

  buildHazards() {
    this.hazards = this.physics.add.staticGroup();

    const hazardData = [
      [690, 400, 20, 20],
      [950, 360, 20, 20],
      [1270, 320, 20, 20],
      [1870, 340, 20, 20],
    ];

    hazardData.forEach(([x, y, w, h]) => {
      const spike = this.add.rectangle(x, y, w, h, 0xff3b3b).setOrigin(0);
      this.physics.add.existing(spike, true);
      this.hazards.add(spike);
    });
  }

  createRuntimeTextures() {
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xf5a623, 1);
      g.fillRoundedRect(0, 0, 32, 32, 8);
      g.generateTexture('player', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('coin')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffd166, 1);
      g.fillCircle(10, 10, 10);
      g.lineStyle(2, 0xfff4b8, 1);
      g.strokeCircle(10, 10, 7);
      g.generateTexture('coin', 20, 20);
      g.destroy();
    }

    if (!this.textures.exists('enemy')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x34c759, 1);
      g.fillRoundedRect(0, 0, 28, 28, 6);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(9, 11, 3);
      g.fillCircle(19, 11, 3);
      g.generateTexture('enemy', 28, 28);
      g.destroy();
    }
  }
}