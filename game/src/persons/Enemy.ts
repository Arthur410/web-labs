import {SpriteManager, SpriteType} from '../managers/SpriteManager';
import {MapManager, PhysicalMapValue} from "../managers/MapManager.ts";

export class Enemy {
	private spriteManager: SpriteManager;
	
	x: number;
	startX: number;
	y: number;
	startY: number;
	spriteType: SpriteType;
	hasKilledPacman ;
	chasing = false;
	
	constructor(spriteManager: SpriteManager, x: number, y: number, spriteType: SpriteType) {
		this.spriteManager = spriteManager;
		this.x = x;
		this.startX = x;
		this.y = y;
		this.startY = y;
		this.spriteType = spriteType;
		this.hasKilledPacman = false;
	}
	
	getCurrentPos() {
		return {x: this.x, y: this.y}
	}
	
	async startChasing(mapManager: MapManager) {
		this.chasing = true;
		
		const target = JSON.parse(JSON.stringify(mapManager.getPlayerInstanceFromMap()));
		const startNode = { x: this.x, y: this.y, g: 0, h: 0, f: 0 };
		const endNode = { x: target.x, y: target.y };
		
		const path = await this.findPath(mapManager, startNode, endNode);
		
		if (path && path.length > 0) {
			
			for (let i = 1; i < path.length; i++) {
				if (!this.chasing) {
					break;
				}
				
				const checkPlayer = mapManager.getPlayerInstanceFromMap();
				
				if (JSON.stringify(checkPlayer) !== JSON.stringify(target)) {
					await this.startChasing(mapManager);
				}
				
				const nextNode = path[i];
				this.moveTo(nextNode.x, nextNode.y, mapManager);
				await this.delay(1000);
			}
		}
	}
	
	private updatePhysicalMap(x: number, y: number, entering: boolean, mapManager: MapManager) {
		const physicalMap = mapManager.getPhysicalMap();
		
		if (physicalMap && physicalMap[y] && physicalMap[y][x] !== undefined) {
			const valueToAdd = entering ? PhysicalMapValue.ghost : -PhysicalMapValue.ghost;
			
			// Update the value based on entering or leaving
			physicalMap[y][x] += valueToAdd;
		}
	}
	
	endChasing() {
		this.chasing = false; // Set the chasing flag to false
	}
	
	async findPath(mapManager: MapManager, startNode: any, endNode: any): Promise<any[] | null> {
		const openList: any[] = [];
		const closedList: any[] = [];
		
		openList.push(startNode);
		
		while (openList.length > 0) {
			let currentNode = openList[0];
			let currentIndex = 0;
			
			for (let i = 1; i < openList.length; i++) {
				if (openList[i].f < currentNode.f) {
					currentNode = openList[i];
					currentIndex = i;
				}
			}
			
			openList.splice(currentIndex, 1);
			closedList.push(currentNode);
			
			if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
				const path: any[] = [];
				let current = currentNode;
				while (current) {
					path.push({ x: current.x, y: current.y });
					current = current.parent;
				}
				return path.reverse();
			}
			
			const neighbors = this.getNeighbors(mapManager, currentNode);
			
			for (const neighbor of neighbors) {
				
				const physicalMap = mapManager.getPhysicalMap();
				
				if (
					closedList.find((node) => node.x === neighbor.x && node.y === neighbor.y) ||
					physicalMap[neighbor.y][neighbor.x] === PhysicalMapValue.wall
				) {
					continue;
				}
				
				const gScore = currentNode.g + 1;
				let gScoreIsBest = false;
				
				if (!openList.find((node) => node.x === neighbor.x && node.y === neighbor.y)) {
					openList.push(neighbor);
					gScoreIsBest = true;
				} else if (gScore < neighbor.g) {
					gScoreIsBest = true;
				}
				
				if (gScoreIsBest) {
					neighbor.parent = currentNode;
					neighbor.g = gScore;
					neighbor.h = this.heuristic(neighbor, endNode);
					neighbor.f = neighbor.g + neighbor.h;
				}
			}
		}
		
		return null;
	}
	
	getNeighbors(mapManager: MapManager, node: any): any[] {
		const neighbors = [];
		const { x, y } = node;
		
		if (x > 0) neighbors.push({ x: x - 1, y, parent: null, g: 0, h: 0, f: 0 });
		if (y > 0) neighbors.push({ x, y: y - 1, parent: null, g: 0, h: 0, f: 0 });
		if (x < mapManager.widthInTiles - 1) neighbors.push({ x: x + 1, y, parent: null, g: 0, h: 0, f: 0 });
		if (y < mapManager.heightInTiles - 1) neighbors.push({ x, y: y + 1, parent: null, g: 0, h: 0, f: 0 });
		
		return neighbors;
	}
	
	heuristic(node: any, target: any): number {
		// Простое евклидово расстояние
		return Math.sqrt(Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2));
	}
	
	toStart(mapManager: MapManager) {
		this.updatePhysicalMap(this.x, this.y, false, mapManager);
		
		this.x = this.startX;
		this.y = this.startY;
		
		this.updatePhysicalMap(this.x, this.y, true, mapManager);
		
		this.hasKilledPacman = false;
	}
	
	moveTo(x: number, y: number, mapManager: MapManager) {
		if (this.hasKilledPacman) {
			return;
		}
		
		this.updatePhysicalMap(this.x, this.y, false, mapManager);
		
		this.updatePhysicalMap(x, y, true, mapManager);
		
		this.x = x;
		this.y = y;
		
		if (mapManager.getPlayerInstanceFromMap().getCurrentPosition().x === x
			&& mapManager.getPlayerInstanceFromMap().getCurrentPosition().y === y) {
			this.hasKilledPacman = true;
		}
	}
	
	delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	
	drawIn(context: CanvasRenderingContext2D): void {
		this.spriteManager.drawSprite(context, this.spriteType, this.x * 16, this.y * 16);
	}
}
