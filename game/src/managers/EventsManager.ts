import {Player} from "../persons/Player.ts";
import {MapManager, PhysicalMapValue} from "./MapManager.ts";
import {SoundManager} from "./SoundManager.ts";

export enum EventState {
	playing,
	dead,
	win
}
export class EventsManager {
	player: Player;
	mapManager: MapManager;
	soundManager: SoundManager;
	
	eventState: EventState = EventState.playing;
	
	constructor(mapManager: MapManager, soundManager: SoundManager) {
		this.mapManager = mapManager;
		this.soundManager = soundManager;
		this.player = this.mapManager.getPlayerInstanceFromMap();
	}
	
	checkForCoin() {
		const {x, y} = this.player.getCurrentPosition();
		
		const physicalMap = this.mapManager.getPhysicalMap();
		
		if (physicalMap[y][x] === PhysicalMapValue.coin || physicalMap[y][x] === PhysicalMapValue.coin + PhysicalMapValue.pacman) {
			const previousPlayerPos = this.player.getPreviousPlayerPos();
			
			if (previousPlayerPos)
				physicalMap[previousPlayerPos.y][previousPlayerPos.x] = PhysicalMapValue.empty
			
			physicalMap[y][x] = PhysicalMapValue.pacman;
			this.soundManager.playCoinSound();
			this.player.increaseCoins();
			
			const coinsPar = document.querySelector('.collected-coins p');
			
			if(coinsPar) {
				coinsPar.innerHTML = this.player.getCollectedCoins().toString()
			}
			
			if (this.player.getCollectedCoins() === this.mapManager.getCoinsForWin()) {
				this.eventState = EventState.win;
				this.soundManager.playWinSound();
			}
			
		} else if (physicalMap[y][x] < 9 && physicalMap[y][x] >= 5) {
			this.eventState = EventState.dead;
			this.soundManager.playDeathSound();
		}
	}
	
	getEventManagerState() {
		return this.eventState;
	}
	
	setEventState(newState: EventState) {
		this.eventState = newState;
	}
	
	handleInput(keyCode: KeyboardEvent): void {
		const {x, y} = this.player.getCurrentPosition();
		const physicalMap = this.mapManager.getPhysicalMap();
		
		switch (keyCode.code) {
			case 'ArrowLeft':
				if (physicalMap[y][x - 1] === PhysicalMapValue.wall) {
					return
				}
				
				this.player.move(-1, 0);
				this.checkForCoin();
				break;
			case 'ArrowUp':
				if (physicalMap[y - 1][x] === PhysicalMapValue.wall) {
					return
				}
				
				this.player.move(0, -1);
				this.checkForCoin();
				
				break;
			case 'ArrowRight':
				if (physicalMap[y][x + 1] === PhysicalMapValue.wall) {
					return
				}
				
				this.player.move(1, 0);
				this.checkForCoin();
				
				break;
			case 'ArrowDown':
				if (physicalMap[y + 1][x] === PhysicalMapValue.wall) {
					return
				}
				
				this.player.move(0, 1);
				this.checkForCoin();
				
				break;
		}
	}
}