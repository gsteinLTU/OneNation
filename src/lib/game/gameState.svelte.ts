import { findId, nameFromId, pickCountry } from './countries.js';
import { generateClue, getRemainingCountries, matchClue, matchesClues } from './clues.js';
import type { Clue, CountryId } from './types.js';

export class GameState {
	target: CountryId = $state(pickCountry());
	clues: Clue[] = $state([]);
	startTime: number = $state(Date.now());
	gameOver: boolean = $state(false);
	won: boolean = $state(false);
	answer: string | null = $state(null);
	remaining: number = $derived(getRemainingCountries(this.clues).length);

	constructor() {
		this.clues = [generateClue(this.target, [])];
	}

	guess(name: string): { correct: boolean; matching?: boolean[] } {
		if (this.gameOver) return { correct: false };

		const id = findId(name);
		if (!id) return { correct: false };

		if (!matchesClues(id, this.clues)) {
			return { correct: false, matching: this.clues.map((c) => matchClue(id, c)) };
		}

		if (this.remaining === 1) {
			this.gameOver = true;
			this.won = true;
			this.answer = nameFromId(this.target);
		} else {
			this.clues = [...this.clues, generateClue(this.target, this.clues)];
		}

		return { correct: true };
	}

	giveUp(): void {
		if (this.gameOver) return;
		this.gameOver = true;
		this.won = false;
		this.answer = nameFromId(this.target);
	}

	newGame(): void {
		this.target = pickCountry();
		this.clues = [generateClue(this.target, [])];
		this.startTime = Date.now();
		this.gameOver = false;
		this.won = false;
		this.answer = null;
	}
}

export const game = new GameState();
