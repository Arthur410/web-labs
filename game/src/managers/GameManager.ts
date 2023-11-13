import {MapManager} from "./MapManager.ts";
import {EventsManager, EventState} from "./EventsManager.ts";
import {Player} from "../persons/Player.ts";
import {SoundManager} from "./SoundManager.ts";
import {Enemy} from "../persons/Enemy.ts";

export interface IRecordTable {
	playerName: string,
	timeInSeconds: number
}

export class GameManager {
	mapManager: MapManager;
	eventsManager: EventsManager;
	soundManager: SoundManager;
	
	winModal: HTMLElement | null;
	winModalTitle: HTMLElement | null;
	winModalButton: HTMLElement | null;
	deathModal: HTMLElement | null;
	deathModalButton: HTMLElement | null;
	
	restartLevelButton: HTMLElement | null;
	currentLevel: number = 1;
	
	recordTableForLevel1HTML: HTMLElement | null = null;
	recordTableForLevel1: IRecordTable[] = [];
	recordTableForLevel2HTML: HTMLElement | null = null;
	recordTableForLevel2: IRecordTable[] = [];
	
	startPlaying: Date;
	endPlaying: Date | null = null;
	
	player: Player;
	enemies: Enemy[];
	playerName: string | null;
	
	isFirstGame = true;
	constructor(mapManager: MapManager, eventsManager: EventsManager, soundManager: SoundManager) {
		this.mapManager = mapManager;
		this.eventsManager = eventsManager;
		this.soundManager = soundManager;
		this.playerName = localStorage.getItem('playerName');
		
		this.winModal = document.querySelector('.win-modal');
		this.winModalButton = document.querySelector('.next-level-button');
		this.winModalTitle = document.querySelector('.win-modal span');
		this.deathModal = document.querySelector('.death-modal');
		this.deathModalButton = document.querySelector('.restart-button');
		
		this.restartLevelButton = document.querySelector('.restart-level-button')
		
		this.recordTableForLevel1HTML = document.querySelector('.records-table__players_level1')
		this.recordTableForLevel2HTML = document.querySelector('.records-table__players_level2')
		
		this.recordTableForLevel1 = localStorage.getItem('recordTableForLevel1') ? JSON.parse(localStorage.getItem('recordTableForLevel1') as string) : [];
		this.recordTableForLevel2 = localStorage.getItem('recordTableForLevel2') ? JSON.parse(localStorage.getItem('recordTableForLevel2') as string) : [];
		this.setListenerToDeathModalButton();
		this.setListenerToWinModalButton();
		this.setListenerToKeyInputs();
		this.setListenerToRestartLevelButton();
		this.startPlaying = new Date;
		
		this.updateRecordsTable();
		
		this.player = this.mapManager.getPlayerInstanceFromMap();
		this.enemies = this.mapManager.getEnemiesInstance();
		
		const storedLevel = localStorage.getItem('currentLevel');
		if (storedLevel) {
			this.currentLevel = parseInt(storedLevel, 10);
			this.mapManager.changeLevel(this.currentLevel);
		}
	}
	
	sendGhostsToChasing() {
		this.enemies.forEach(enemy => {
			enemy.startChasing(this.mapManager)
		})
	}
	
	ghostsStopChasing() {
		this.enemies.forEach(enemy => {
			enemy.endChasing()
		})
	}
	
	setListenerToDeathModalButton() {
		this.deathModalButton?.addEventListener('click', () => {
			this.ghostsStopChasing();
			this.startNewGame();
			
			if (this.deathModal)
				this.deathModal.style.display = 'none';
			
			localStorage.setItem('currentLevel', this.currentLevel.toString());
			location.reload();
		})
	}
	
	setListenerToRestartLevelButton() {
		this.restartLevelButton?.addEventListener('click', () => {
			const differenceInMilliseconds = Number(this.endPlaying) - Number(this.startPlaying);
			const result = {
				playerName: this.playerName ? this.playerName : 'гость',
				timeInSeconds: differenceInMilliseconds / 1000
			}
			
			if (this.currentLevel === 1) {
				this.recordTableForLevel1.push(result)
				
				localStorage.setItem('recordTableForLevel1', JSON.stringify(this.recordTableForLevel1));
			} else if (this.currentLevel === 2) {
				this.recordTableForLevel2.push(result)
				
				localStorage.setItem('recordTableForLevel2', JSON.stringify(this.recordTableForLevel2));
			}
			
			this.updateRecordsTable();
			
			if (this.winModal)
				this.winModal.style.display = 'none';
			
			localStorage.setItem('currentLevel', this.currentLevel.toString());
			location.reload();
		})
	}
	
	updateRecordsTable() {
		// Сортируем записи по времени в порядке возрастания
		this.recordTableForLevel1.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
		this.recordTableForLevel2.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
		
		if (this.recordTableForLevel1HTML && this.recordTableForLevel1?.length > 0) {
			this.recordTableForLevel1HTML.innerHTML = '';
			
			this.recordTableForLevel1.forEach((record) => {
				const elem = document.createElement('li');
				elem.textContent = `${record.playerName}: ${record.timeInSeconds} сек.`;
				
				this.recordTableForLevel1HTML?.appendChild(elem);
			});
		}
		
		if (this.recordTableForLevel2HTML && this.recordTableForLevel2?.length > 0) {
			this.recordTableForLevel2HTML.innerHTML = '';
			
			this.recordTableForLevel2.forEach((record) => {
				const elem = document.createElement('li');
				elem.textContent = `${record.playerName}: ${record.timeInSeconds} сек.`;
				
				this.recordTableForLevel2HTML?.appendChild(elem);
			});
		}
	}
	
	setListenerToWinModalButton() {
		this.winModalButton?.addEventListener('click', () => {
			if (this.currentLevel === 1) {
				const differenceInMilliseconds = Number(this.endPlaying) - Number(this.startPlaying);
				this.recordTableForLevel1.push({
					playerName: this.playerName ? this.playerName : 'гость',
					timeInSeconds: differenceInMilliseconds / 1000
				})
				
				localStorage.setItem('recordTableForLevel1', JSON.stringify(this.recordTableForLevel1));
				this.updateRecordsTable();
				
				this.currentLevel = 2;
				localStorage.setItem('currentLevel', this.currentLevel.toString());
				location.reload();
				
				this.winModal!.style.display = 'none';
			} else if (this.currentLevel === 2) {
				const differenceInMilliseconds = Number(this.endPlaying) - Number(this.startPlaying);
				this.recordTableForLevel2.push({
					playerName: this.playerName ? this.playerName : 'гость',
					timeInSeconds: differenceInMilliseconds / 1000
				})
				
				localStorage.setItem('recordTableForLevel2', JSON.stringify(this.recordTableForLevel2));
				this.updateRecordsTable();
				
				this.currentLevel = 1;
				
				localStorage.setItem('currentLevel', this.currentLevel.toString());
				location.reload();
				this.winModal!.style.display = 'none';
			}
		})
	}
	
	setListenerToKeyInputs() {
		document.addEventListener('keydown', (key) => {
			this.eventsManager.handleInput(key)
		})
	}
	
	checkEnemyStates() {
		this.enemies.forEach(enemy => {
			if (enemy.hasKilledPacman) {
				this.enemies.forEach(enemy => {
					enemy.hasKilledPacman = true;
				})
				
				this.eventsManager.setEventState(EventState.dead);
				this.ghostsStopChasing();
			}
		});
	}
	
	updateGameMap() {
		this.mapManager.draw();
		this.checkEnemyStates();
	}
	
	async startNewGame() {
		await this.mapManager.reset();
		this.startPlaying = new Date();
		this.eventsManager.setEventState(EventState.playing);
		
		if (this.currentLevel === 1) {
			this.soundManager.playBackgroundMusicForLevel1();
		} else if (this.currentLevel === 2) {
			this.soundManager.playBackgroundMusicForLevel2();
		}
		
		this.enemies = this.mapManager.getEnemiesInstance();
		this.sendGhostsToChasing();
		setInterval(() => {
			this.updateGameMap();
			
			switch(this.eventsManager.getEventManagerState()) {
				case EventState.playing:
					break;
				case EventState.dead:
					this.soundManager.playDeathSound();
					this.soundManager.turnOffAudio();
					
					if (this.deathModal)
						this.deathModal.style.display = 'flex';
					
					break;
				case EventState.win:
					if (this.winModal) {
						this.endPlaying = new Date();
						
						this.winModal.style.display = 'flex';
						
						if (this.currentLevel === 1) {
							this.winModalTitle!.textContent = 'Вы прошли 1 уровень!'
							this.winModalButton!.textContent = 'На 2 уровень';
						}
						
						if (this.currentLevel === 2) {
							this.winModalTitle!.textContent = 'Вы прошли все уровни!';
							this.winModalButton!.textContent = 'На 1 уровень';
						}
					}
					
					return;
			}
		}, 50)
	}
	
}
