import level1 from '../assets/level_1.json';
import level2 from '../assets/level_2.json';

import tileset from '../assets/tiles/Tileset.png'

import {SpriteManager, SpriteType} from './SpriteManager';
import {Player} from "../persons/Player.ts";
import {Enemy} from '../persons/Enemy.ts';

export interface Tilemap {
	height: number;
	tileHeight: number;
	width: number;
	tileWidth: number;
	layers: Layer[];
	tileSets: Tileset[];
}

export interface Layer {
	data: number[];
	height: number;
	id: number;
	name: string;
	opacity: number;
	type: string;
	visible: boolean;
	width: number;
	x: number;
	y: number;
}

export interface Tileset {
	firstgid: number;
	source: string;
}

export  enum PhysicalMapValue {
	empty,
	coin,
	pacman,
	wall= 9,
	ghost = 4,
}

// coin - 1, pacman - 2, ghost - 4

export class MapManager {
	mapDataForLevel1: Tilemap;
	mapDataForLevel2: Tilemap;
	
	widthInTiles = 15;
	heightInTiles = 15;
	
	tileWidth = 16;
	tileHeight = 16;
	
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	
	currentLevel = 1;
	
	baseTileset: HTMLImageElement;
	
	physicalMap: PhysicalMapValue[][] = [];
	
	spriteManager: SpriteManager;
	
	player: Player;
	enemies: Enemy[];
	
	coinsInMap = -1;
	coinsInited = false;
	wallsInited = false;
	personsInited = false;
	
	constructor(canvas: HTMLCanvasElement, spriteManager: SpriteManager, player: Player) {
		this.canvas = canvas;
		this.canvas.width = this.tileWidth * this.widthInTiles;
		this.canvas.height = this.tileHeight * this.heightInTiles;
		this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		
		this.mapDataForLevel1 = level1;
		this.mapDataForLevel2 = level2;
		
		this.baseTileset = new Image();
		this.baseTileset.src = tileset;
		
		this.spriteManager = spriteManager;
		
		this.player = player;
		this.enemies =  [
			new Enemy(spriteManager, 13, 13, SpriteType.OrangeGhost),
			new Enemy(spriteManager, 1, 13, SpriteType.RedGhost),
		];
	}
	
	getSpriteManager() {
		return this.spriteManager;
	}
	
	drawLayer(layer: Layer) {
		let currentRow = 0;
		let currentCol = 0;
		
		for (let i = 0; i < layer.data.length; i++) {
			currentCol = i % 15;
			
			if (i % 15 === 0 && i !== 0) {
				currentRow += 1;
			}
			
			const gid = layer.data[i];
			let gidOffsetY, gidOffsetX;
			
			if (gid % 18 === 0) {
				gidOffsetY = Math.floor(gid / 18) - 1;
				gidOffsetX = 17;
			} else {
				gidOffsetY = Math.floor(gid / 18);
				gidOffsetX = gid - gidOffsetY * 18 - 1;
			}
			
			this.context.drawImage(
				this.baseTileset,
				gidOffsetX * 16,
				gidOffsetY * 16,
				this.tileWidth,
				this.tileHeight,
				currentCol * 16,
				currentRow * 16,
				this.tileWidth,
				this.tileHeight
			);
		}
	}
	
	drawBackgroundLayer() {
		let backgroundLayer ;
		
		if (this.currentLevel === 1) {
			backgroundLayer = this.mapDataForLevel1.layers[0];
		} else {
			backgroundLayer = this.mapDataForLevel2.layers[0];
		}
		
		this.drawLayer(backgroundLayer);
	}
	
	initWalls() {
		let wallLayer;
		if (this.currentLevel === 1) {
			wallLayer = this.mapDataForLevel1.layers[1];
		} else {
			wallLayer = this.mapDataForLevel2.layers[1];
		}
		
		this.physicalMap = [];
		
		for (let row = 0; row < wallLayer.height; row++) {
			this.physicalMap[row] = [];
			
			for (let col = 0; col < wallLayer.width; col++) {
				const i = row * wallLayer.width + col;
				
				this.physicalMap[row].push(wallLayer.data[i] !== 0 ? PhysicalMapValue.wall : PhysicalMapValue.empty);
			}
		}
		
		this.wallsInited = true;
	}
	
	drawWallLayer() {
		let wallLayer;
		
		if (this.currentLevel === 1) {
			wallLayer = this.mapDataForLevel1.layers[1];
		} else {
			wallLayer = this.mapDataForLevel2.layers[1];
		}
		
		if (!this.wallsInited) {
			this.initWalls()
		}
		
		this.drawLayer(wallLayer);
		
		if (!this.coinsInited) {
			this.initCoins();
		}
	}
	
	initCoins() {
		for (let row = 0; row < this.physicalMap.length; row++) {
			for (let col = 0; col < this.physicalMap[row].length; col++) {
				if (this.physicalMap[row][col] === PhysicalMapValue.empty || this.physicalMap[row][col] === PhysicalMapValue.ghost) {
					this.coinsInMap += 1;
					this.physicalMap[row][col] += PhysicalMapValue.coin;
				}
			}
		}
		
		this.coinsInited = true;
	}
	
	getCoinsForWin() {
		return this.coinsInMap;
	}
	
	drawCoinsLayer() {
		const coinSpriteType = SpriteType.Coin;
		
		for (let row = 0; row < this.physicalMap.length; row++) {
			for (let col = 0; col < this.physicalMap[row].length; col++) {
				if (this.physicalMap[row][col] === PhysicalMapValue.coin
					|| this.physicalMap[row][col] === (PhysicalMapValue.coin + PhysicalMapValue.pacman)
					|| this.physicalMap[row][col] === (PhysicalMapValue.coin + PhysicalMapValue.ghost)
				) {
					this.spriteManager.drawSprite(
						this.context,
						coinSpriteType,
						col * this.tileWidth,
						row * this.tileHeight
					);
				}
			}
		}
	}
	
	initPersons() {
		const {x, y} = this.player.getCurrentPosition();
		this.physicalMap[y][x] += PhysicalMapValue.pacman;
		
		this.enemies.forEach(enemy => {
			const {x, y} = enemy.getCurrentPos();
			this.physicalMap[y][x] += PhysicalMapValue.ghost;
		})
		
		this.personsInited = true;
	}
	
	drawPersonsLayer() {
		if (!this.personsInited) {
			this.initPersons()
		}
		
		// draw pacman
		this.player.drawIn(this.context)
		
		// draw all enemies
		this.enemies.forEach(enemy => {
			enemy.drawIn(this.context)
		})
	}
	
	getPhysicalMap() {
		return this.physicalMap;
	}
	
	async draw() {
		this.drawBackgroundLayer();
		this.drawWallLayer();
		this.drawCoinsLayer();
		this.drawPersonsLayer();
	}
	
	changeLevel(level: number) {
		if (level === 1) {
			this.enemies.length = 0;
			this.currentLevel = 1;
			
			this.enemies = [
				new Enemy(this.spriteManager, 13, 13, SpriteType.OrangeGhost),
				new Enemy(this.spriteManager, 1, 13, SpriteType.RedGhost),
			];
			
		} else if (level === 2) {
			this.enemies.length = 0;
			this.currentLevel = 2;
			
			this.enemies = [
				new Enemy(this.spriteManager, 13, 1, SpriteType.GreenGhost)
			];
		}
	}
	
	getPlayerInstanceFromMap() {
		return this.player;
	}
	
	getEnemiesInstance() {
		return this.enemies;
	}
	
	async reset(): Promise<void> {
		return new Promise((resolve) => {
			this.coinsInited = false;
			this.wallsInited = false;
			this.personsInited = false;
			
			this.enemies.forEach((enemy) => {
				enemy.toStart(this);
			});
			
			this.player.toStart();
			this.player.changeSpriteType(SpriteType.PacManRight);
			this.draw();
			
			resolve();
		});
	}
	
}
