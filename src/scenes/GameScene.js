import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { EnemyGroup } from '../entities/enemyGroup.js';
import { COIN_SCORE, STOMP_SCORE } from '../constants.js';

// ── Obstacle blueprints ────────────────────────────────────────────────────
// Each type defines a label, color, and a factory function that returns
// one or more {dx, dy, w, h} rectangles relative to the platform surface.
//  dx  = x offset from obstacle's anchor point on the platform
//  dy  = distance above the platform top (positive = higher up)
//  w,h = dimensions in pixels
const OBSTACLE_TYPES = [
  {
    label: 'spike',
    color: 0xff3333,
    rects: () => [{ dx: 0, dy: 0, w: 16, h: 40 }],  // tall thin spike
  },
  {
    label: 'wall',
    color: 0xff6600,
    rects: () => [{ dx: 0, dy: 0, w: 28, h: 60 }],  // wide tall wall
  },
  {
    label: 'low-barrier',
    color: 0xcc00ff,
    rects: () => [{ dx: 0, dy: 0, w: 48, h: 22 }],  // wide low block
  },
  {
    label: 'double-spike',
    color: 0xff3333,
    // two thin spikes side by side with a small gap
    rects: () => [
      { dx: 0, dy: 0, w: 14, h: 44 },
      { dx: 22, dy: 0, w: 14, h: 44 },
    ],
  },
  {
    label: 'step',
    color: 0xff8800,
    // two stacked blocks forming a staircase you must jump onto or over
    rects: () => [
      { dx: 0, dy: 0, w: 24, h: 24 },
      { dx: 24, dy: 24, w: 24, h: 48 },
    ],
  },
];

// ── Chunk constants ────────────────────────────────────────────────────────
const CHUNK_W = 550;   // px width per chunk
const SPAWN_AHEAD = 1400;  // generate chunks this far ahead of the player
const DESPAWN_BEHIND = 900;   // destroy chunks this far behind the player
const PLATFORM_H = 20;
const SAFE_START_X = 600;   // first chunk with obstacles starts at this x

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ── Phaser lifecycle ──────────────────────────────────────────────────────

  preload() {
    this._buildTextures();
  }

  create() {
    const { width, height } = this.scale;

    // Infinite physics / camera world (very wide)
    this.physics.world.setBounds(0, 0, 999999, 700);
    this.cameras.main.setBounds(0, 0, 999999, 500);

    // Scrolling parallax sky gradient
    this._skyLayer = this.add.rectangle(0, 0, 999999, 500, 0x1a1a2e).setOrigin(0, 0);

    // Static group for platforms & obstacles (cheaper than dynamic for non-moving things)
    this.platforms = this.physics.add.staticGroup();
    this.obstacles = this.physics.add.staticGroup();

    // Coin physics group
    this.coinGroup = this.physics.add.staticGroup();

    // Track spawned chunks: each entry = { x, platformRect, obstacleRects[], coinObjects[], bgRects[] }
    this.chunks = [];
    this.nextChunkX = 0;
    this.chunksSeen = 0;   // used to ramp up difficulty

    // Seed the first few chunks so the player lands safely
    for (let i = 0; i < 4; i++) this._spawnChunk();

    // ── Player ──────────────────────────────────────────────────
    this.player = new Player(this, 80, 400);

    // ── Enemies (spawned per-chunk dynamically) ──────────────────
    this.enemies = new EnemyGroup(this, []);  // start empty

    // ── Colliders ────────────────────────────────────────────────
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.enemies.physicsGroup, this.platforms);

    this.physics.add.overlap(this.player.sprite, this.obstacles, () => {
      this._triggerDeath();
    });

    this.physics.add.overlap(this.player.sprite, this.coinGroup,
      (_, coin) => {
        if (!coin.active) return;
        coin.disableBody(true, true);
        this.player.addScore(COIN_SCORE);
        this._updateCoinDisplay();
      }
    );

    this.physics.add.overlap(
      this.player.sprite,
      this.enemies.physicsGroup,
      (_, enemy) => {
        this.enemies.handlePlayerCollision(this.player, enemy, () => this._triggerDeath());
      }
    );

    // ── Input ────────────────────────────────────────────────────
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

    // ── Camera ───────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    // ── HUD ──────────────────────────────────────────────────────
    const hudStyle = { fontSize: '18px', fill: '#ffffff', fontFamily: 'monospace' };
    this.distText = this.add.text(16, 16, 'Distance: 0m', hudStyle).setScrollFactor(0);
    this.scoreText = this.add.text(16, 40, 'Score: 0', hudStyle).setScrollFactor(0);
    this.healthText = this.add.text(16, 64, 'Health: ❤❤❤', hudStyle).setScrollFactor(0);
    this.coinText = this.add.text(16, 88, 'Coins: 0',
      { fontSize: '18px', fill: '#ffd700', fontFamily: 'monospace' }).setScrollFactor(0);

    this.events.on('scoreChanged', s => this.scoreText.setText('Score: ' + s));
    this.events.on('healthChanged', hp => {
      this.healthText.setText('Health: ' + '❤'.repeat(Math.max(0, hp)));
    });

    this.startX = this.player.x;
    this.gameOver = false;
    this.coinsCollected = 0;
  }

  update() {
    if (this.gameOver) return;

    this.player.update(this.keys);
    this.enemies.update();

    const px = this.player.x;

    // Distance HUD
    const dist = Math.max(0, Math.floor((px - this.startX) / 10));
    this.distText.setText(`Distance: ${dist}m`);

    // Procedural streaming 
    // spawns the chunks ahead of time and despawns the old ones 
    // to create an infinite runner feel without needing an infinitely large world
    while (this.nextChunkX < px + SPAWN_AHEAD) this._spawnChunk();

    // Despawn chunks far behind
    this.chunks = this.chunks.filter(chunk => {
      if (chunk.x + CHUNK_W < px - DESPAWN_BEHIND) {
        this._destroyChunk(chunk);
        return false;
      }
      return true;
    });

    // Death by falling
    if (this.player.y > 600) this._triggerDeath();
  }

  // ── Procedural chunk system 

  /**
   * spawns one chunk at `this.nextChunkX`.
   * A chunk contains:
   *   1. A horizontal platform segment (y varies gently)
   *   2. 0–3 random static obstacles placed on the platform
   *   3. A few floating coins above the platform
   *   4. Optionally a patrolling enemy (at higher difficulty)
   */
  _spawnChunk() {
    const x = this.nextChunkX;
    const isSafeZone = x < SAFE_START_X;

    // ── Platform ────────────────────────────────────────────────
    // Gently vary y so the world feels alive (clamped to sane range)
    const prevY = this.chunks.length > 0
      ? this.chunks[this.chunks.length - 1].platformY
      : 460;
    const deltaY = isSafeZone ? 0 : Phaser.Math.Between(-30, 30);
    const platformY = Phaser.Math.Clamp(prevY + deltaY, 300, 460);
    const platW = CHUNK_W;

    const platRect = this.add.rectangle(x, platformY, platW, PLATFORM_H, 0xe94560).setOrigin(0);
    this.physics.add.existing(platRect, true);
    this.platforms.add(platRect);

    // ── Skyline building behind platform (decoration) ────────────
    const bgRects = [];
    const numBuildings = Phaser.Math.Between(1, 3);
    for (let i = 0; i < numBuildings; i++) {
      const bx = x + Phaser.Math.Between(0, platW - 80);
      const bh = Phaser.Math.Between(80, platformY - 60);
      const bw = Phaser.Math.Between(40, 100);
      const by = platformY - bh;
      bgRects.push(
        this.add.rectangle(bx, by, bw, bh, 0x16213e).setOrigin(0).setDepth(-1)
      );
    }

    // ── Obstacles ────────────────────────────────────────────────
    const obstacleRects = [];
    if (!isSafeZone) {
      // Ramped difficulty: more obstacles the further you go
      const difficulty = Math.min(this.chunksSeen / 10, 1);  // 0 → 1 over 10 chunks
      const maxObs = Math.round(1 + difficulty * 2);      // 1–3
      const numObs = Phaser.Math.Between(0, maxObs);

      // Distribute obstacles across the chunk without clustering
      const sectionW = platW / (numObs + 1);
      for (let i = 0; i < numObs; i++) {
        const type = Phaser.Utils.Array.GetRandom(OBSTACLE_TYPES);
        // anchor point spread across sections with some jitter
        const anchorX = x + sectionW * (i + 1) + Phaser.Math.Between(-40, 40);

        type.rects().forEach(({ dx, dy, w, h }) => {
          const rx = anchorX + dx;
          const ry = platformY - h - dy;   // sit ON TOP of platform
          const obs = this.add.rectangle(rx, ry, w, h, type.color).setOrigin(0);
          this.physics.add.existing(obs, true);
          this.obstacles.add(obs);
          obstacleRects.push(obs);
        });
      }
    }

    // ── Coins ────────────────────────────────────────────────────
    const coinObjects = [];
    const numCoins = Phaser.Math.Between(2, 5);
    for (let i = 0; i < numCoins; i++) {
      const cx = x + Phaser.Math.Between(40, platW - 40);
      const cy = platformY - Phaser.Math.Between(50, 110);
      const coin = this.coinGroup.create(cx, cy, 'coin');
      coin.refreshBody();
      coinObjects.push(coin);
    }

    // ── Enemy (every few chunks at higher difficulty) ─────────────
    if (!isSafeZone && this.chunksSeen > 5 &&
      Phaser.Math.Between(0, 2) === 0) {
      const ex = x + platW * 0.5;
      const ey = platformY - 24;
      const minX = x + 20;
      const maxX = x + platW - 20;
      const spec = [{ x: ex, y: ey, minX, maxX }];
      // create enemy in the existing EnemyGroup
      const enemy = this.enemies.physicsGroup.create(ex, ey, 'enemy');
      enemy.setCollideWorldBounds(false);  // world is infinite, no bounds needed
      enemy.setBounce(0);
      enemy.setData('minX', minX);
      enemy.setData('maxX', maxX);
      enemy.setData('dir', -1);
      enemy.setVelocityX(-80);
    }

    // ── Register chunk ────────────────────────────────────────────
    this.chunks.push({
      x,
      platformY,
      platformRect: platRect,
      obstacleRects,
      coinObjects,
      bgRects,
    });

    this.nextChunkX += CHUNK_W;
    this.chunksSeen++;
  }

  /** Tear down every game object belonging to a chunk */
  _destroyChunk(chunk) {
    // Platform
    if (chunk.platformRect) {
      this.platforms.remove(chunk.platformRect, true, true);
    }

    // Obstacles
    chunk.obstacleRects.forEach(r => {
      this.obstacles.remove(r, true, true);
    });

    // Coins
    chunk.coinObjects.forEach(c => {
      if (c.active) this.coinGroup.remove(c, true, true);
    });

    // Background decorations
    chunk.bgRects.forEach(r => r.destroy());
  }

  // ── Death ─────────────────────────────────────────────────────────────────

  _triggerDeath() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.player.die();
    this.cameras.main.shake(300, 0.01);

    this.time.delayedCall(1100, () => {
      this.scene.start('LevelEndScene', {
        score: this.player.score,
        distance: Math.max(0, Math.floor((this.player.x - this.startX) / 10)),
        win: false,
      });
    });
  }

  // Add this method to your GameScene class
shutdown() {
  console.log('GameScene shutting down - cleaning up');
  // Clear all groups and references
  if (this.platforms) {
    this.platforms.clear(true, true);
  }
  if (this.obstacles) {
    this.obstacles.clear(true, true);
  }
  if (this.coinGroup) {
    this.coinGroup.clear(true, true);
  }
  if (this.enemies && this.enemies.physicsGroup) {
    this.enemies.physicsGroup.clear(true, true);
  }
  this.chunks = [];
  this.gameOver = false;
}

// Also add this method to handle scene restart
restart() {
  console.log('Restarting game');
  this.scene.restart();
}
  // ── HUD helpers ───────────────────────────────────────────────────────────

  _updateCoinDisplay() {
    this.coinsCollected++;
    this.coinText.setText(`Coins: ${this.coinsCollected}`);
  }

  // ── Asset creation ────────────────────────────────────────────────────────

  _buildTextures() {
    const make = (key, w, h, drawFn) => {
      if (this.textures.exists(key)) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      drawFn(g);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    make('player', 32, 32, g => {
      g.fillStyle(0xf5a623); g.fillRect(0, 0, 32, 32);
    });
    make('enemy', 24, 24, g => {
      g.fillStyle(0xff6b6b); g.fillRect(0, 0, 24, 24);
    });
    make('coin', 14, 14, g => {
      g.fillStyle(0xffd700); g.fillCircle(7, 7, 7);
    });
  }
}