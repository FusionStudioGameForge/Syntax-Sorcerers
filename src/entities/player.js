//  Wraps the Phaser sprite + all player-specific logic.
//  GameScene creates one instance and calls update() each frame.

import { PLAYER_SPEED, JUMP_FORCE, EXTRA_GRAVITY, MAX_HEALTH } from '../constants.js';

export class player {
  /**
   * @param {Phaser.Scene} scene  - the scene that owns this player
   * @param {number}       x, y  - spawn position
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.autoRun = false;

    // Phaser sprite (arcade physics)
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.1);
    // adds extra gravity on top of the worlds existing gravity so jumps feel snappy
    this.sprite.setGravityY(EXTRA_GRAVITY - scene.physics.world.gravity.y);

    // the camera/screen follows the player, keeping them centered
    this.cameras.main.startFollow(player.sprite);

    // State 
    this.health     = MAX_HEALTH;
    this.score      = 0;
    this.invincible = false;  // true for ~1 s after taking a hit
    this.alive      = true;
  }

  // Called every frame from GameScene.update() 
  update(keys) {
    if (!this.alive) return;

    const onGround = this.sprite.body.blocked.down;


    // activates the auto-run on space press 
    if (Phaser.Input.Keyboard.JustDown(keys.space)) {
        this.autoRun = true;
    }

    // Horizontal movement 
    if (this.autoRun) {
      this.sprite.setVelocityX(-PLAYER_SPEED);
      this.sprite.setFlipX(false);           // face right when auto-running
    } else if (keys.left.isDown || keys.a.isDown) {
      this.sprite.setVelocityX(-PLAYER_SPEED);
      this.sprite.setFlipX(true);
    } else {
      // friction to gradually slow the player to a stop
      this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.8);
    }

    // Jump 
    if ((keys.up.isDown || keys.w.isDown || keys.jump.isDown) && onGround) {
      this.sprite.setVelocityY(JUMP_FORCE);
    }
  }

  // Collect a coin 
  addScore(amount) {
    this.score += amount;
    this.scene.events.emit('scoreChanged', this.score);
  }

  // Take a hit — returns true if player just died
  takeDamage(enemyX) {
    if (this.invincible || !this.alive) return false;

    this.health--;
    this.scene.events.emit('healthChanged', this.health);

    if (this.health <= 0) {
      this.die();
      return true;
    }

    // Brief invincibility window after a hit
    this.invincible = true;
    this.scene.tweens.add({
      targets:  this.sprite,
      alpha:    0.2,
      yoyo:     true,
      repeat:   5,
      duration: 150,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.invincible = false;
      },
    });

    // Knockback
    const dir = this.sprite.x < enemyX ? -1 : 1;
    this.sprite.setVelocity(dir * 300, -200);
    return false;
  }

  // Kill immediately (pit, etc.) 
  die() {
    if (!this.alive) return;
    this.alive = false;
    this.sprite.setTint(0xff0000);
    this.sprite.setVelocityY(-300);
  }

  // Convenience getters 
  get x()           { return this.sprite.x; }
  get y()           { return this.sprite.y; }
  get velocityY()   { return this.sprite.body.velocity.y; }
}
