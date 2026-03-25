//  Manages all collectible coins in the level.

export class coinGroup {
  /**
   * @param {Phaser.Scene} scene
   * @param {Array<[number,number]>} positions - [[x,y], ...]
   */
  constructor(scene, positions) {
    // staticGroup = coins don't move, more efficient
    this.physicsGroup = scene.physics.add.staticGroup();

    positions.forEach(([x, y]) => {
      this.physicsGroup.create(x, y, 'coin');
    });
  }
}