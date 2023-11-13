import backgroundMusicSoundLevel1 from '../assets/sounds/backgroundMusicSound.mp3';
import backgroundMusicSoundLevel2 from '../assets/sounds/backgroundMusicLevel2Sound.mp3';
import coinSound from '../assets/sounds/coinSound.mp3';
import deathSound from '../assets/sounds/deathSound.mp3';
import winSound from '../assets/sounds/winSound.mp3';

import soundOffIcon from '../assets/icons/soundOff.svg';
import soundOnIcon from '../assets/icons/soundOn.svg';
export class SoundManager {
	private backgroundMusic: HTMLAudioElement;
	private deathSound: HTMLAudioElement;
	private winSound: HTMLAudioElement;
	
	private isAudioOn = true;
	
	private soundToggler: HTMLImageElement;
	private coinSounds: HTMLAudioElement[] = [];
	
	constructor() {
		this.backgroundMusic = new Audio();
		this.deathSound = new Audio(deathSound);
		this.winSound = new Audio(winSound);
		
		this.soundToggler = document.getElementById('soundToggler') as HTMLImageElement;
		
		if (this.soundToggler) {
			this.soundToggler.addEventListener('click', () => {
				this.toggleAudio();
			});
		}
		
		this.updateSoundIcon();
		
		for (let i = 0; i < 100; i++) {
			const coinSoundElem: HTMLAudioElement = new Audio(coinSound);
			this.coinSounds.push(coinSoundElem);
		}
	}
	
	private playBackgroundMusic(source: string): void {
		if (this.isAudioOn) {
			this.backgroundMusic.src = source;
			this.backgroundMusic.loop = true;
			this.backgroundMusic.volume = 0.1;
			this.backgroundMusic.play();
		}
	}
	
	toggleAudio(): void {
		this.isAudioOn = !this.isAudioOn;
		
		if (!this.isAudioOn) {
			this.stopBackgroundMusic();
		} else {
			this.backgroundMusic.loop = true;
			this.backgroundMusic.volume = 0.1;
			this.backgroundMusic.play();
		}
		
		this.updateSoundIcon();
	}
	
	turnOffAudio() {
		this.isAudioOn = false;
		this.stopBackgroundMusic();
	}
	
	private updateSoundIcon(): void {
		const iconPath = this.isAudioOn ? soundOnIcon : soundOffIcon;
		this.soundToggler.setAttribute('src', iconPath);
	}
	
	playBackgroundMusicForLevel1(): void {
		this.playBackgroundMusic(backgroundMusicSoundLevel1);
	}
	
	playBackgroundMusicForLevel2(): void {
		this.playBackgroundMusic(backgroundMusicSoundLevel2);
	}
	
	stopBackgroundMusic(): void {
		this.backgroundMusic.pause();
		this.backgroundMusic.currentTime = 0;
	}
	
	playCoinSound(): void {
		if (this.isAudioOn) {
			const coinSound = this.coinSounds.find(sound => sound.paused);
			if (coinSound) {
				coinSound.play();
			}
		}
	}
	
	playDeathSound(): void {
		if (this.isAudioOn) {
			this.deathSound.play();
		}
	}
	
	playWinSound(): void {
		if (this.isAudioOn) {
			this.winSound.play();
		}
	}
}
