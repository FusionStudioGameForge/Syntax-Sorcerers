import Phaser from 'phaser';

export class UIScenes extends Phaser.Scene {
	constructor() {
		super({ key: 'UIScene' });
	}

	create() {
		this.distance = 0;
		this.score = 0;
		this.health = 3;
		this.coinsLeft = 0;
		this.enemiesLeft = 0;

		const style = {
			fontSize: '16px',
			fill: '#ffffff',
			fontFamily: 'monospace',
		};

		this.scoreText = this.add.text(16, 12, 'Score: 0', style).setScrollFactor(0);
		this.distanceText = this.add.text(16, 34, 'Distance: 0m', style).setScrollFactor(0);
		this.healthText = this.add.text(16, 56, 'Health: 3', style).setScrollFactor(0);
		this.entityText = this.add.text(16, 78, 'Coins: 0 | Enemies: 0', style).setScrollFactor(0);

		const gameScene = this.scene.get('GameScene');
		gameScene.events.on('scoreChanged', this.onScoreChanged, this);
		gameScene.events.on('distanceChanged', this.onDistanceChanged, this);
		gameScene.events.on('healthChanged', this.onHealthChanged, this);
		gameScene.events.on('entitiesChanged', this.onEntitiesChanged, this);

		this.events.once('shutdown', () => {
			gameScene.events.off('scoreChanged', this.onScoreChanged, this);
			gameScene.events.off('distanceChanged', this.onDistanceChanged, this);
			gameScene.events.off('healthChanged', this.onHealthChanged, this);
			gameScene.events.off('entitiesChanged', this.onEntitiesChanged, this);
		});
	}

	onScoreChanged(score) {
		this.score = score;
		this.scoreText.setText('Score: ' + score);
	}

	onDistanceChanged(distance) {
		this.distance = distance;
		this.distanceText.setText('Distance: ' + distance + 'm');
	}

	onHealthChanged(health) {
		this.health = health;
		this.healthText.setText('Health: ' + health);
	}

	onEntitiesChanged({ coinsLeft, enemiesLeft }) {
		this.coinsLeft = coinsLeft;
		this.enemiesLeft = enemiesLeft;
		this.entityText.setText('Coins: ' + coinsLeft + ' | Enemies: ' + enemiesLeft);
	}
}
