import { ENEMY_SPEED, STOMP_SCORE } from '../constants.js';

export class EnemyGroup {
  constructor(scene, patrolSpecs = []) {
    this.scene = scene;
    this.physicsGroup = scene.physics.add.group({
      allowGravity: true,
      immovable: false,
    });

    patrolSpecs.forEach((spec) => {
      const enemy = this.physicsGroup.create(spec.x, spec.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      enemy.setData('minX', spec.minX);
      enemy.setData('maxX', spec.maxX);
      enemy.setData('dir', -1);
      enemy.setVelocityX(-ENEMY_SPEED);
    });
  }

  update() {
    this.physicsGroup.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const minX = enemy.getData('minX');
      const maxX = enemy.getData('maxX');
      let dir = enemy.getData('dir');

      if (enemy.x <= minX) dir = 1;
      if (enemy.x >= maxX) dir = -1;

      enemy.setData('dir', dir);
      enemy.setVelocityX(dir * ENEMY_SPEED);
      enemy.setFlipX(dir < 0);
    });
  }

  handlePlayerCollision(playerEntity, enemy, onPlayerDeath) {
    if (!enemy.active || !playerEntity.alive) return;

    const isStomp = playerEntity.velocityY > 140 && playerEntity.y < enemy.y - 8;
    if (isStomp) {
      enemy.disableBody(true, true);
      playerEntity.bounceFromStomp();
      playerEntity.addScore(STOMP_SCORE);
      return;
    }

    const died = playerEntity.takeDamage(enemy.x);
    if (died) onPlayerDeath();
  }

  getRemainingCount() {
    return this.physicsGroup.countActive(true);
  }
}
