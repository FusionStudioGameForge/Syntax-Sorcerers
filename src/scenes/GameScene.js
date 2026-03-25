import Phaser from 'phaser';
<<<<<<< HEAD
import { joburgLevel1 } from '../maps/joburg-level1.js';

=======
// ─── ADD: backend imports ─────────────────────────────────────────────────────
import { BLOCK_REGISTRY, BLOCK_TYPES, calcDamage } from '../blocks/BlockRegistry.js';
import { DamageNumbers }                            from '../ui/DamageNumbers.js';
import { CutsceneManager }                          from '../cutscenes/CutsceneManager.js';
// ─────────────────────────────────────────────────────────────────────────────
 
>>>>>>> e929a694b9600e81487e56a4a014d35792556c77
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

<<<<<<< HEAD
=======
     // ─── ADD: win state + input lock ────────────────────────────────────────
    this.hasWon      = false;   // mirrors isDead, prevents double-trigger on finish
    this._inputLocked = true;   // locked until intro cutscene finishes
    // ────────────────────────────────────────────────────────────────────────
 
    // ─── ADD: breakable blocks (south-theme debris on platforms) ────────────
    // Player stomps or punches them — they crack and break using BlockRegistry HP/damage.
    this.breakableBlocks = this.physics.add.staticGroup();
    const breakableData = [
      { x: 640,  y: 386, blockId: BLOCK_TYPES.IRON_SHEET  },
      { x: 1000, y: 306, blockId: BLOCK_TYPES.WOOD_PLANK  },
      { x: 1300, y: 336, blockId: BLOCK_TYPES.BRICK       },
      { x: 1600, y: 286, blockId: BLOCK_TYPES.SCRAP_METAL },
    ];
    breakableData.forEach(bd => {
      const def  = BLOCK_REGISTRY[bd.blockId];
      const rect = this.add.rectangle(bd.x, bd.y, 32, 32, def.colour).setOrigin(0);
      this.physics.add.existing(rect, true);
      rect.setData('blockId', bd.blockId);
      rect.setData('hp',      def.maxHp);
      rect.setData('maxHp',   def.maxHp);
      this.breakableBlocks.add(rect);
    });
    // ────────────────────────────────────────────────────────────────────────
 
    // ─── ADD: finish line at world end ──────────────────────────────────────
    this.finishZone = this.add.rectangle(2570, 420, 24, 60, 0xffd700).setOrigin(0);
    this.physics.add.existing(this.finishZone, true);
    // ────────────────────────────────────────────────────────────────────────
 

    // --- Colliders ---
    this.physics.add.collider(this.player, this.platforms, () => {
      this.jumpCount = 0; // reset jumps on landing
    });
>>>>>>> e929a694b9600e81487e56a4a014d35792556c77

    // Collisions
    this.physics.add.collider(
      this.player,
      this.platforms,
      () => this.jumpCount = 0
    );

<<<<<<< HEAD

    this.physics.add.overlap(
      this.player,
      this.obstacles,
      () => this.handleDeath()
    );


    // Controls
=======
    // ─── ADD: stomp breakable blocks ────────────────────────────────────────
    this.physics.add.collider(this.player, this.breakableBlocks, (player, block) => {
      if (player.body.velocity.y > 60) {   // only on downward stomp
        this.damageBlock(block, 25, 'blunt');
      }
      this.jumpCount = 0;
    });
    // ────────────────────────────────────────────────────────────────────────
 
    // ─── ADD: finish line overlap ────────────────────────────────────────────
    this.physics.add.overlap(this.player, this.finishZone, () => {
      this.handleWin();
    });
    // ────────────────────────────────────────────────────────────────────────


    // --- Input ---
>>>>>>> e929a694b9600e81487e56a4a014d35792556c77
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

<<<<<<< HEAD
=======
    // ─── ADD: punch key — breaks block immediately to player's right ────────
    this.input.keyboard.on('keydown-F', () => this.doPunch());
    this.input.keyboard.on('keydown-Z', () => this.doPunch());
    // ────────────────────────────────────────────────────────────────────────
 

    // --- Camera ---
    this.cameras.main.setBounds(0, 0, 2600, 500);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
>>>>>>> e929a694b9600e81487e56a4a014d35792556c77

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
<<<<<<< HEAD
    this.goalX = this.level.goalX;

=======
    // ─── ADD: damage numbers + cutscene manager + UIScene launch ────────────
    this.damageNumbers = new DamageNumbers(this);
    this.cutsceneMan   = new CutsceneManager(this);

    // Launch UIScene as a parallel HUD (runs on top without pausing this scene)
    this.scene.launch('UIScene');
 
    // Play intro cutscene — unlocks input when done
    this.cutsceneMan.play('intro_level1', () => {
      this._inputLocked = false;
    });
    // ────────────────────────────────────────────────────────────────────────
>>>>>>> e929a694b9600e81487e56a4a014d35792556c77
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
<<<<<<< HEAD


=======
// ─── ADD: win handler ────────────────────────────────────────────────────
  handleWin() {
    if (this.hasWon || this.isDead) return;
    this.hasWon = true;
    this.cutsceneMan.play('level_complete', () => {
      this.scene.stop('UIScene');
      this.scene.start('LevelEndScene', {
        score: Math.floor((this.player.x - this.startX) / 10),
        win: true
      });
    });
  }
  // ─────────────────────────────────────────────────────────────────────────
 
  // ─── ADD: block damage ───────────────────────────────────────────────────
  // Reduces a breakable block's HP, changes its tint to show cracks, destroys at 0.
  damageBlock(blockRect, rawDamage, damageType = 'blunt') {
    const blockId = blockRect.getData('blockId');
    const def     = BLOCK_REGISTRY[blockId];
    if (!def || def.indestructible) return;
 
    const finalDmg = calcDamage(rawDamage, damageType, blockId);
    if (finalDmg <= 0) return;
 
    const newHp = blockRect.getData('hp') - finalDmg;
    blockRect.setData('hp', newHp);
 
    // Floating damage number at block centre
    this.damageNumbers.spawn(blockRect.x + 16, blockRect.y, finalDmg, damageType);
 
    // Tint shift: intact colour → orange crack → red about-to-break
    const ratio = newHp / blockRect.getData('maxHp');
    if      (ratio > 0.66) blockRect.setFillStyle(def.colour);
    else if (ratio > 0.33) blockRect.setFillStyle(0xff9900);
    else                   blockRect.setFillStyle(0xff3300);
 
    // Tell UIScene to show a toast
    this.events.emit('block_hit', def.name, finalDmg);
 
    if (newHp <= 0) {
      this.breakableBlocks.remove(blockRect, true, true);
      this.cameras.main.shake(100, 0.004);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────
 
  // ─── ADD: punch action ───────────────────────────────────────────────────
  // Finds the nearest breakable block within arm's reach to the right of the player.
  doPunch() {
    if (this.isDead || this._inputLocked) return;
    const px = this.player.x;
    const py = this.player.y;
    let closest = null;
    let closestDist = Infinity;
 
    this.breakableBlocks.getChildren().forEach(b => {
      const dx = (b.x + 16) - px;
      const dy = Math.abs((b.y + 16) - py);
      if (dx > 0 && dx < 64 && dy < 32 && dx < closestDist) {
        closestDist = dx;
        closest = b;
      }
    });
 
    if (closest) this.damageBlock(closest, 20, 'blunt');
  }
  // ─────────────────────────────────────────────────────────────────────────
>>>>>>> e929a694b9600e81487e56a4a014d35792556c77
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

<<<<<<< HEAD

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

=======
    // Score
    const dist = Math.max(0, Math.floor((this.player.x - this.startX) / 10));
    this.scoreText.setText('Distance: ' + dist + 'm');

     // ADD: tick damage number animations
    this.damageNumbers.update(this.game.loop.delta);
>>>>>>> e929a694b9600e81487e56a4a014d35792556c77
  }

}