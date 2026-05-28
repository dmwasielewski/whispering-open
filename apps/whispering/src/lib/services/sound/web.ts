import { Ok } from 'wellcrafted/result';
import type { PlaySoundService } from '.';
import { audioElements } from './assets';

export function createPlaySoundServiceWeb() {
	return {
		playSound: async (soundName) => {
			if (!document.hidden) {
				await audioElements[soundName].play();
				return Ok(undefined);
			}
			return Ok(undefined);
		},
	} satisfies PlaySoundService;
}
