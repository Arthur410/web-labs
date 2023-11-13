import './style.css'
import {MapManager} from "./managers/MapManager.ts";
import {Player} from "./persons/Player.ts";
import {SpriteManager, SpriteType} from "./managers/SpriteManager.ts";
import {GameManager} from "./managers/GameManager.ts";
import {EventsManager} from "./managers/EventsManager.ts";
import {SoundManager} from "./managers/SoundManager.ts";

window.addEventListener("load", () => {
	const layer: HTMLCanvasElement | null = document.getElementById('layer') as HTMLCanvasElement;
	const spriteManager = new SpriteManager();
	
	const player = new Player(spriteManager, 1, 1, SpriteType.PacManRight);

	const soundManager = new SoundManager();
	
	const mapManager = new MapManager(
		layer,
		spriteManager,
		player
	);
	
	const eventsManager = new EventsManager(mapManager, soundManager);
	
	const gameManager = new GameManager(mapManager, eventsManager, soundManager);
	
	gameManager.startNewGame();
});

