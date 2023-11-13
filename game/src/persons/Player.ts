import {SpriteManager, SpriteType} from '../managers/SpriteManager.ts';

export class Player {
	private spriteManager: SpriteManager;
	
	x: number;
	startX: number;
	y: number;
	startY: number;
	spriteType: SpriteType;
	
	collectedCoins: number = 0;
	prevPos: {
		x: number,
		y: number
	} | undefined = undefined;
	
	constructor(spriteManager: SpriteManager, x: number, y: number, spriteType: SpriteType) {
		this.spriteManager = spriteManager;
		this.x = x;
		this.startX = x;
		this.y = y;
		this.startY = y;
		this.spriteType = spriteType;
	}
	
	getCurrentPosition() {
		return {x: this.x, y: this.y}
	}
	
	getPreviousPlayerPos() {
		return this.prevPos;
	}
	
	increaseCoins() {
		this.collectedCoins += 1;
	}
	
	getCollectedCoins() {
		return this.collectedCoins
	}
	
	toStart() {
		this.x = this.startX;
		this.y = this.startY;
		this.collectedCoins = 0;
		const coinsPar = document.querySelector('.collected-coins p');
		
		if(coinsPar) {
			coinsPar.innerHTML = String(0)
		}
	}
	
	changeSpriteType(newType: SpriteType) {
		this.spriteType = newType;
	}
	
	move(directionX: number, directionY: number): void {
		this.prevPos = {
			x: this.x,
			y: this.y
		}
		
		if (directionX === -1 && directionY === 0) {
			this.spriteType = SpriteType.PacManLeft
		} else if (directionX === 0 && directionY === 1) {
			this.spriteType = SpriteType.PacManDown
		} else if (directionX === 0 && directionY === -1) {
			this.spriteType = SpriteType.PacManUp
		} else {
			this.spriteType = SpriteType.PacManRight
		}
		
		this.x += directionX;
		this.y += directionY;
	}
	
	drawIn(context: CanvasRenderingContext2D): void {
		this.spriteManager.drawSprite(context, this.spriteType, this.x * 16, this.y * 16);
	}
}