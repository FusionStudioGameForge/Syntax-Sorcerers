import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.scale;

    // --- Sky background ---
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // --- Joburg skyline placeholder (static rectangles) ---
    const buildings = [
      { x: 100,  y: 300, w: 60,  h: 160 },
      { x: 200,  y: 260, w: 80,  h: 200 },
      { x: 320,  y: 220, w: 50,  h: 240 },
      { x: 420,  y: 280, w: 90,  h: 180 },
      { x: 560,  y: 240, w: 70,  h: 220 },
      { x: 680,  y: 200, w: 55,  h: 260 },
      { x: 780,  y: 270, w: 100, h: 190 },
      { x: 930,  y: 230, w: 65,  h: 230 },
      { x: 1050, y: 250, w: 80,  h: 210 },
      { x: 1180, y: 210, w: 60,  h: 250 },
    ];
    buildings.forEach(b => {
      this.add.rectangle(b.x, b.y, b.w, b.h, 0x16213e).setOrigin(0);
    });

    // --- Static platforms (rooftops + ground) ---
    const platformData = [
      { x: 0,    y: 460, w: 400,  h: 20 }, // ground left
      { x: 450,  y: 420, w: 200,  h: 20 }, // rooftop 1
      { x: 700,  y: 380, w: 180,  h: 20 }, // rooftop 2
      { x: 930,  y: 340, w: 220,  h: 20 }, // rooftop 3
      { x: 1200, y: 370, w: 200,  h: 20 }, // rooftop 4
      { x: 1460, y: 320, w: 250,  h: 20 }, // rooftop 5
      { x: 1760, y: 360, w: 200,  h: 20 }, // rooftop 6
      { x: 2000, y: 460, w: 600,  h: 20 }, // ground right
    ];

    this.platforms = this.physics.add.staticGroup();
    platformData.forEach(p => {
      const plat = this.add.rectangle(p.x, p.y, p.w, p.h, 0xe94560).setOrigin(0);
      this.physics.add.existing(plat, true);
      this.platforms.add(plat);
    });

    // --- Obstacles (touch = death) ---
    const obstacleData = [
      { x: 600,  y: 400, w: 20, h: 40 },
      { x: 850,  y: 360, w: 20, h: 40 },
      { x: 1100, y: 320, w: 20, h: 40 },
    ];

    this.obstacles = this.physics.add.staticGroup();
    obstacleData.forEach(o => {
      const obs = this.add.rectangle(o.x, o.y, o.w, o.h, 0xff0000).setOrigin(0);
      this.physics.add.existing(obs, true);
      this.obstacles.add(obs);
    });

    // --- Player (yellow square) ---
    const playerGraphic = this.add.rectangle(0, 0, 32, 32, 0xf5a623);
    this.player = this.physics.add.existing(playerGraphic);
    this.player.body.setCollideWorldBounds(false);
    this.player.setPosition(80, 400);

    // Jump state
    this.jumpCount = 0;
    this.maxJumps = 2;
    this.isDead = false;

    // --- Colliders ---
    this.physics.add.collider(this.player, this.platforms, () => {
      this.jumpCount = 0; // reset jumps on landing
    });

    this.physics.add.overlap(this.player, this.obstacles, () => {
      this.handleDeath();
    });

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Jump on keydown (not held) for precise double jump
    this.input.keyboard.on('keydown-UP', () => this.doJump());
    this.input.keyboard.on('keydown-W',  () => this.doJump());
    this.input.keyboard.on('keydown-SPACE', () => this.doJump());

    // Pause
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseScene');
    });

    // --- Camera ---
    this.cameras.main.setBounds(0, 0, 2600, 500);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // --- Score text (fixed to camera) ---
    this.scoreText = this.add.text(16, 16, 'Distance: 0m', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'monospace'
    }).setScrollFactor(0);

    this.startX = this.player.x;
  }

  doJump() {
    if (this.isDead) return;
    if (this.jumpCount < this.maxJumps) {
      this.player.body.setVelocityY(-520);
      this.jumpCount++;
    }
  }

  handleDeath() {
    if (this.isDead) return;
    this.isDead = true;
    this.player.setFillStyle(0xff0000);
    this.cameras.main.shake(300, 0.01);
    this.time.delayedCall(800, () => {
      this.scene.start('LevelEndScene', {
        score: Math.floor((this.player.x - this.startX) / 10),
        win: false
      });
    });
  }

  update() {
    if (this.isDead) return;

    const { left, right } = this.cursors;
    const onGround = this.player.body.blocked.down;

    // Reset jump count when grounded
    if (onGround) this.jumpCount = 0;

    // Horizontal movement
    if (left.isDown || this.wasd.left.isDown) {
      this.player.body.setVelocityX(-300);
    } else if (right.isDown || this.wasd.right.isDown) {
      this.player.body.setVelocityX(300);
    } else {
      this.player.body.setVelocityX(0);
    }

    // Fall off screen = death
    if (this.player.y > 600) {
      this.handleDeath();
    }

    // Score
    const dist = Math.max(0, Math.floor((this.player.x - this.startX) / 10));
    this.scoreText.setText('Distance: ' + dist + 'm');
  }
}