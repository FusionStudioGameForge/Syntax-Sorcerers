import { WORLD_W, WORLD_H } from '../constants.js';

export class CoinGroup {
  /**
   * @param {Phaser.Scene} scene
   * @param {object}       options
   * @param {number}       options.count        - how many coins to spawn 
   * @param {Array}        options.platforms     - StaticGroup of platforms to land coins ON
   * @param {Array}        options.positions     - optional fixed [[x,y]] overrides (skips random)
   * @param {number}       options.marginX       - horizontal padding from world edges (default 80)
   * @param {number}       options.minY          - highest y coins can appear (default 100)
   * @param {number}       options.groundY       - lowest  y coins can appear (default WORLD_H - 80)
   */
    constructor(scene, options = {}) {
        this.scene = scene;
        this.physicsGroup = scene.physics.add.staticGroup();

        const {
        count     = 25,
        platforms = null,
        positions = null,
        marginX   = 80,
        minY      = 100,
        groundY   = WORLD_H - 80,
        } = options;

        // ── Fixed positions override (backwards compatible) 
        if (positions && positions.length > 0) {
        positions.forEach(([x, y]) => this._spawnCoin(x, y));
        return;
        }

        // Random placement 
        if (platforms) {
        // place coins just above existing platforms
        this._spawnOnPlatforms(count, platforms);
        } else {
        // Fallback: scatter randomly across the world
        this._spawnRandom(count, marginX, minY, groundY);
        }
    }

    //  PLACEMENT STRATEGIES
    /**
     * picks random platform tiles and float a coin above them. 
     * Guarantees that every coin is reachable.
     */
    _spawnOnPlatforms(count, platforms) {
        const tiles = platforms.getChildren();
        if (tiles.length === 0) return;

        // Shuffle a copy so we don't repeat tiles until we've cycled all
        const shuffled = Phaser.Utils.Array.Shuffle([...tiles]);

        for (let i = 0; i < count; i++) {
        const tile = shuffled[i % shuffled.length];
        const x = tile.x + Phaser.Math.Between(-20, 20); // slight x jitter
        const y = tile.y - Phaser.Math.Between(32, 80);  // float above tile
        this._spawnCoin(x, y);
        }
    }

    // pure random scatter across world bounds as a fallback
    _spawnRandom(count, marginX, minY, groundY) {
        for (let i = 0; i < count; i++) {
        const x = Phaser.Math.Between(marginX, WORLD_W - marginX);
        const y = Phaser.Math.Between(minY, groundY);
        this._spawnCoin(x, y);
        }
    }

    //  HELPERS

    _spawnCoin(x, y) {
        const coin = this.physicsGroup.create(x, y, 'coin');
        coin.setScale(1);
        coin.refreshBody();
    }

    collectCoin(playerSprite, coin, playerEntity, amount = 10) {
        if (!coin.active) return;
        coin.disableBody(true, true);
        playerEntity.addScore(amount);
    }

    getRemainingCount() {
        return this.physicsGroup.countActive(true);
    }

    getTotalCount() {
        // getLength() returns the total number of coins created, 
        // including the ones you've already collected and disabled.
        return this.physicsGroup.getLength();
    }
}