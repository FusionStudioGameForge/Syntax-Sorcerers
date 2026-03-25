import Phaser from 'phaser';
import { joburgLevel1 } from '../maps/joburg-level1.js';

export default class GameScene extends Phaser.Scene {

  constructor() {
    super({ key: 'GameScene' });
  }


  create(data) {

    this.level = data?.level || joburgLevel1;

    const { width, height } = this.scale;

    // Sky background
    this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x1a1a2e
    );


    // Decorative skyline
    this.level.buildings.forEach(b => {

      this.add.rectangle(
        b.x,
        b.y,
        b.w,
        b.h,
        0x16213e
      ).setOrigin(0);

    });


    // Platforms
    this.platforms = this.physics.add.staticGroup();

    this.level.platforms.forEach(p => {

      const plat = this.add.rectangle(
        p.x,
        p.y,
        p.w,
        p.h,
        0xe94560
      ).setOrigin(0);

      this.physics.add.existing(plat, true);
      this.platforms.add(plat);

    });


    // Obstacles
    this.obstacles = this.physics.add.staticGroup();

    this.level.obstacles.forEach(o => {

      const obs = this.add.rectangle(
        o.x,
        o.y,
        o.w,
        o.h,
        0xff0000
      ).setOrigin(0);

      this.physics.add.existing(obs, true);
      this.obstacles.add(obs);

    });


    // Player
    const playerGraphic = this.add.rectangle(
      0,
      0,
      32,
      32,
      0xf5a623
    );

    this.player = this.physics.add.existing(playerGraphic);

    this.player.setPosition(
      this.level.playerStart.x,
      this.level.playerStart.y
    );


    // Movement system
    this.runSpeed = 0;
    this.maxRunSpeed = 260;
    this.speedIncreaseRate = 0.08;


    // Jump system
    this.jumpCount = 0;
    this.maxJumps = 2;

    this.isDead = false;


    // Collisions
    this.physics.add.collider(
      this.player,
      this.platforms,
      () => this.jumpCount = 0
    );


    this.physics.add.overlap(
      this.player,
      this.obstacles,
      () => this.handleDeath()
    );


    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();

    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });


    this.input.keyboard.on('keydown-UP', () => this.doJump());
    this.input.keyboard.on('keydown-W', () => this.doJump());
    this.input.keyboard.on('keydown-SPACE', () => this.doJump());


    // Pause support
    this.input.keyboard.on('keydown-ESC', () => {

      this.scene.pause();
      this.scene.launch('PauseScene');

    });


    // Camera
    this.cameras.main.setBounds(
      0,
      0,
      this.level.worldWidth,
      this.level.worldHeight
    );


    this.cameras.main.startFollow(
      this.player,
      true,
      0.08,
      0.08
    );


    // UI
    this.scoreText = this.add.text(
      16,
      16,
      'Distance: 0m',
      {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'monospace'
      }
    ).setScrollFactor(0);


    this.startX = this.player.x;
    this.goalX = this.level.goalX;

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

      this.scene.start(
        'LevelEndScene',
        {
          score: Math.floor(
            (this.player.x - this.startX) / 10
          ),
          win: false
        }
      );

    });

  }


  update() {

    if (this.isDead) return;


    const onGround =
      this.player.body.blocked.down;


    if (onGround)
      this.jumpCount = 0;


    // Smooth autorun acceleration
    if (this.runSpeed < this.maxRunSpeed) {

      this.runSpeed +=
        this.speedIncreaseRate;

    }


    this.player.body.setVelocityX(
      this.runSpeed
    );


    // Air steering
    if (!onGround) {

      if (
        this.cursors.left.isDown ||
        this.wasd.left.isDown
      ) {

        this.player.body.setVelocityX(
          this.runSpeed - 120
        );

      }


      if (
        this.cursors.right.isDown ||
        this.wasd.right.isDown
      ) {

        this.player.body.setVelocityX(
          this.runSpeed + 120
        );

      }

    }


    // Fell off level
    if (this.player.y > 600)
      this.handleDeath();


    // Win condition
    if (this.player.x >= this.goalX) {

      this.scene.start(
        'LevelEndScene',
        {
          score: Math.floor(
            (this.player.x - this.startX) / 10
          ),
          win: true
        }
      );

    }


    // Distance counter
    const dist =
      Math.max(
        0,
        Math.floor(
          (this.player.x - this.startX) / 10
        )
      );


    this.scoreText.setText(
      'Distance: ' + dist + 'm'
    );

  }

}