export class CoinGroup {
  constructor(scene, positions = []) {
    this.scene = scene;
    this.physicsGroup = scene.physics.add.staticGroup();

    positions.forEach(([x, y]) => {
      const coin = this.physicsGroup.create(x, y, 'coin');
      coin.setScale(1);
      coin.refreshBody();
    });
  }

  collectCoin(playerSprite, coin, playerEntity, amount = 10) {
    if (!coin.active) return;
    coin.disableBody(true, true);
    playerEntity.addScore(amount);
  }

  getRemainingCount() {
    return this.physicsGroup.countActive(true);
  }
}

export class coinGroup extends CoinGroup {}