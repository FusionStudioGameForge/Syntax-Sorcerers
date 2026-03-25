import Phaser from 'phaser';
import { PLAYER_SPEED, JUMP_FORCE, EXTRA_GRAVITY, MAX_HEALTH } from '../constants.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.05);
    this.sprite.setGravityY(EXTRA_GRAVITY - scene.physics.world.gravity.y);

    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;
    this.score = 0;
    this.alive = true;
    this.invincible = false;
    this.jumpCount = 0;
    this.maxJumps = 2;

    scene.events.emit('healthChanged', this.health);
    scene.events.emit('scoreChanged', this.score);
  }

  update(keys) {
    if (!this.alive) return;

    if (this.sprite.body.blocked.down) {
      this.jumpCount = 0;
    }

    let vx = 0;
    if (keys.left.isDown || keys.a.isDown) vx -= PLAYER_SPEED;
    if (keys.right.isDown || keys.d.isDown) vx += PLAYER_SPEED;
    this.sprite.setVelocityX(vx);

    if (Phaser.Input.Keyboard.JustDown(keys.up) || Phaser.Input.Keyboard.JustDown(keys.w) || Phaser.Input.Keyboard.JustDown(keys.space)) {
      this.tryJump();
    }
  }

  tryJump() {
    if (!this.alive) return;
    if (this.jumpCount < this.maxJumps) {
      this.sprite.setVelocityY(JUMP_FORCE);
      this.jumpCount += 1;
    }
  }

  bounceFromStomp() {
    this.sprite.setVelocityY(JUMP_FORCE * 0.75);
  }

  addScore(amount) {
    this.score += amount;
    this.scene.events.emit('scoreChanged', this.score);
  }

  takeDamage(sourceX) {
    if (!this.alive || this.invincible) return false;

    this.health = Math.max(0, this.health - 1);
    this.scene.events.emit('healthChanged', this.health);

    if (this.health <= 0) {
      this.die();
      return true;
    }

    this.invincible = true;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      yoyo: true,
      repeat: 5,
      duration: 90,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.invincible = false;
      },
    });

    const knockDir = this.sprite.x < sourceX ? -1 : 1;
    this.sprite.setVelocity(knockDir * 260, -220);
    return false;
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.sprite.setTint(0xff4444);
    this.sprite.setVelocity(0, -240);
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  get velocityY() {
    return this.sprite.body.velocity.y;
  }
}
