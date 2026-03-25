import Phaser from 'phaser';
// ─── ADD: backend imports ─────────────────────────────────────────────────────
import { BLOCK_REGISTRY, BLOCK_TYPES, calcDamage } from '../blocks/BlockRegistry.js';
import { DamageNumbers }                            from '../ui/DamageNumbers.js';
import { CutsceneManager }                          from '../cutscenes/CutsceneManager.js';
// ─────────────────────────────────────────────────────────────────────────────
 
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

    this.physics.add.overlap(this.player, this.obstacles, () => {
      this.handleDeath();
    });

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

    // ─── ADD: punch key — breaks block immediately to player's right ────────
    this.input.keyboard.on('keydown-F', () => this.doPunch());
    this.input.keyboard.on('keydown-Z', () => this.doPunch());
    // ────────────────────────────────────────────────────────────────────────
 

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

     // ADD: tick damage number animations
    this.damageNumbers.update(this.game.loop.delta);
  }
}