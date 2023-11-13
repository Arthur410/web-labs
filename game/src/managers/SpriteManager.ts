import pacmanRightImage from '../assets/tiles/PacManRight.png';
import pacmanLeftImage from '../assets/tiles/PacManLeft.png';
import pacmanDownImage from '../assets/tiles/PacManDown.png';
import pacmanUpImage from '../assets/tiles/PacManUp.png'

import greenGhostImage from '../assets/tiles/greenGhost.png';
import orangeGhostImage from '../assets/tiles/orangeGhost.png';
import redGhostImage from '../assets/tiles/redGhost.png';
import coinImage from '../assets/tiles/Coin.png'

export enum SpriteType {
	PacManRight,
	PacManUp,
	PacManDown,
	PacManLeft,
	
	RedGhost,
	GreenGhost,
	OrangeGhost,
	Coin
}

export class SpriteManager {
	private static readonly frameWidth = 16;
	private static readonly frameHeight = 16;
	
	private pacManRightImage: HTMLImageElement = new Image();
	private pacManLeftImage: HTMLImageElement = new Image();
	private pacManUpImage: HTMLImageElement = new Image();
	private pacManDownImage: HTMLImageElement = new Image();
	
	private redGhostImage: HTMLImageElement = new Image();
	private greenGhostImage: HTMLImageElement = new Image();
	private orangeGhostImage: HTMLImageElement = new Image();
	private coinImage: HTMLImageElement = new Image();
	
	constructor() {
		this.coinImage.src = coinImage;
		
		this.pacManRightImage.src = pacmanRightImage;
		this.pacManLeftImage.src = pacmanLeftImage;
		this.pacManUpImage.src = pacmanUpImage;
		this.pacManDownImage.src = pacmanDownImage;
		
		this.redGhostImage.src = redGhostImage;
		this.greenGhostImage.src = greenGhostImage;
		this.orangeGhostImage.src = orangeGhostImage;
	}
	
	loadSprites(): Promise<void[]> {
		return Promise.all([
			this.loadImage(this.pacManRightImage),
			this.loadImage(this.pacManUpImage),
			this.loadImage(this.pacManDownImage),
			this.loadImage(this.pacManLeftImage),
			
			this.loadImage(this.redGhostImage),
			this.loadImage(this.greenGhostImage),
			this.loadImage(this.coinImage),
			this.loadImage(this.orangeGhostImage),
		]);
	}
	
	private loadImage(image: HTMLImageElement): Promise<void> {
		return new Promise<void>((resolve) => {
			image.onload = () => resolve();
		});
	}
	
	drawSprite(
		context: CanvasRenderingContext2D,
		spriteType: SpriteType,
		x: number,
		y: number
	): void {
		const image = this.getImageBySpriteType(spriteType);
		const frameIndex = (Math.floor(Date.now() / 100) % 8);
		
		context.drawImage(
			image,
			(frameIndex % 8) * 16,
			0,
			SpriteManager.frameWidth,
			SpriteManager.frameHeight,
			x,
			y,
			SpriteManager.frameWidth,
			SpriteManager.frameHeight
		);
	}
	
	private getImageBySpriteType(spriteType: SpriteType): HTMLImageElement {
		switch (spriteType) {
			case SpriteType.Coin:
				return this.coinImage
			
			case SpriteType.PacManRight:
				return this.pacManRightImage;
			case SpriteType.PacManDown:
				return this.pacManDownImage;
			case SpriteType.PacManLeft:
				return this.pacManLeftImage;
			case SpriteType.PacManUp:
				return this.pacManUpImage;
				
			case SpriteType.RedGhost:
				return this.redGhostImage;
			case SpriteType.GreenGhost:
				return this.greenGhostImage;
			case SpriteType.OrangeGhost:
				return this.orangeGhostImage;
			default:
				throw new Error(`Unsupported sprite type: ${spriteType}`);
		}
	}
}