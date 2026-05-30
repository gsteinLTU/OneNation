import { describe, it, expect } from 'vitest';
import {
	generateClue,
	getRemainingCountries,
	matchClue,
	matchesClues,
	selectBestClue
} from './clues.js';
import { countriesList } from './countries.js';
import type { Clue } from './types.js';

// ── matchClue ─────────────────────────────────────────────────────────────────

describe('matchClue — string (name)', () => {
	it('startsWith', () => {
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'startsWith', value: 'U' } })).toBe(true);
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'startsWith', value: 'E' } })).toBe(false);
	});

	it('endsWith', () => {
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'endsWith', value: 'a' } })).toBe(true);
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'endsWith', value: 'e' } })).toBe(false);
	});

	it('contains / nocontains', () => {
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'contains',   value: 'G' } })).toBe(true);
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'nocontains', value: 'G' } })).toBe(false);
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'contains',   value: 'J' } })).toBe(false);
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'nocontains', value: 'J' } })).toBe(true);
	});

	it('length', () => {
		// "Uganda" = 6 chars
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'length', value: 6 } })).toBe(true);
		expect(matchClue('UGA', { type: 'name', constraint: { type: 'length', value: 5 } })).toBe(false);
	});
});

describe('matchClue — string (capitalname)', () => {
	it('startsWith capital', () => {
		// Uganda capital: Kampala
		expect(matchClue('UGA', { type: 'capitalname', constraint: { type: 'startsWith', value: 'K' } })).toBe(true);
		expect(matchClue('UGA', { type: 'capitalname', constraint: { type: 'startsWith', value: 'Z' } })).toBe(false);
	});
});

describe('matchClue — landlocked', () => {
	it('matches correctly for landlocked and coastal countries', () => {
		// TCD (Chad) is landlocked; PAN (Panama) is not
		expect(matchClue('TCD', { type: 'landlocked', constraint: true  })).toBe(true);
		expect(matchClue('TCD', { type: 'landlocked', constraint: false })).toBe(false);
		expect(matchClue('PAN', { type: 'landlocked', constraint: false })).toBe(true);
		expect(matchClue('PAN', { type: 'landlocked', constraint: true  })).toBe(false);
	});
});

describe('matchClue — car_side', () => {
	it('matches left and right traffic correctly', () => {
		// GBR: left, DEU: right
		expect(matchClue('GBR', { type: 'car_side', constraint: 'left'  })).toBe(true);
		expect(matchClue('GBR', { type: 'car_side', constraint: 'right' })).toBe(false);
		expect(matchClue('DEU', { type: 'car_side', constraint: 'right' })).toBe(true);
		expect(matchClue('DEU', { type: 'car_side', constraint: 'left'  })).toBe(false);
	});
});

describe('matchClue — numeric (population)', () => {
	it('matches population thresholds', () => {
		// TCD ~19.3M; PAN ~4.1M
		const above = { type: 'population', constraint: { type: '>', value: 10_000_000 } } as const;
		const below = { type: 'population', constraint: { type: '<', value: 10_000_000 } } as const;
		expect(matchClue('TCD', above)).toBe(true);
		expect(matchClue('TCD', below)).toBe(false);
		expect(matchClue('PAN', above)).toBe(false);
		expect(matchClue('PAN', below)).toBe(true);
	});
});

describe('matchClue — numeric (land_area)', () => {
	it('matches area thresholds', () => {
		// TCD ~1,284,000 km²; PAN ~75,417 km²
		const above = { type: 'land_area', constraint: { type: '>', value: 100_000 } } as const;
		const below = { type: 'land_area', constraint: { type: '<', value: 100_000 } } as const;
		expect(matchClue('TCD', above)).toBe(true);
		expect(matchClue('TCD', below)).toBe(false);
		expect(matchClue('PAN', above)).toBe(false);
		expect(matchClue('PAN', below)).toBe(true);
	});
});

describe('matchClue — numeric (borders)', () => {
	it('matches border count thresholds', () => {
		// DEU: 9 borders; JPN: 0
		const above = { type: 'borders', constraint: { type: '>', value: 5 } } as const;
		const below = { type: 'borders', constraint: { type: '<', value: 5 } } as const;
		expect(matchClue('DEU', above)).toBe(true);
		expect(matchClue('DEU', below)).toBe(false);
		expect(matchClue('JPN', above)).toBe(false);
		expect(matchClue('JPN', below)).toBe(true);
	});
});

describe('matchClue — region', () => {
	it('matches region inclusion list', () => {
		// TCD: Africa; PAN: Americas
		expect(matchClue('TCD', { type: 'region', constraint: ['Africa', 'Asia']    })).toBe(true);
		expect(matchClue('TCD', { type: 'region', constraint: ['Europe', 'Americas'] })).toBe(false);
		expect(matchClue('PAN', { type: 'region', constraint: ['Europe', 'Americas'] })).toBe(true);
		expect(matchClue('PAN', { type: 'region', constraint: ['Africa', 'Asia']    })).toBe(false);
	});
});

describe('matchClue — subregion', () => {
	it('matches subregion inclusion list', () => {
		// PAN: Central America; DEU: Western Europe
		expect(matchClue('PAN', { type: 'subregion', constraint: ['Central America'] })).toBe(true);
		expect(matchClue('PAN', { type: 'subregion', constraint: ['Western Europe']  })).toBe(false);
		expect(matchClue('DEU', { type: 'subregion', constraint: ['Western Europe']  })).toBe(true);
		expect(matchClue('DEU', { type: 'subregion', constraint: ['Central America'] })).toBe(false);
	});
});

describe('matchClue — unknown country', () => {
	it('returns false for unknown country id', () => {
		expect(matchClue('ZZZ', { type: 'landlocked', constraint: true })).toBe(false);
	});
});

// ── getRemainingCountries ─────────────────────────────────────────────────────

describe('getRemainingCountries', () => {
	it('returns all countries with no clues', () => {
		expect(getRemainingCountries([]).length).toBe(countriesList.length);
	});

	it('returns 0 with contradictory clues', () => {
		expect(getRemainingCountries([
			{ type: 'landlocked', constraint: true },
			{ type: 'landlocked', constraint: false }
		]).length).toBe(0);
	});

	it('returns 45 landlocked countries', () => {
		expect(getRemainingCountries([{ type: 'landlocked', constraint: true }]).length).toBe(45);
	});

	it('narrows to a single country with multiple clues', () => {
		const clues: Clue[] = [
			{ type: 'name',        constraint: { type: 'nocontains', value: ' ' } },
			{ type: 'region',      constraint: ['Asia', 'Europe'] },
			{ type: 'population',  constraint: { type: '<', value: 10_000_000 } },
			{ type: 'capitalname', constraint: { type: 'length', value: 6 } },
			{ type: 'land_area',   constraint: { type: '>', value: 200_000 } }
		];
		const result = getRemainingCountries(clues);
		expect(result).toHaveLength(1);
		expect(result[0]).toBe('OMN');
	});
});

describe('matchesClues', () => {
	it('returns true when all clues match', () => {
		expect(matchesClues('OMN', [
			{ type: 'landlocked', constraint: false },
			{ type: 'region',     constraint: ['Asia'] }
		])).toBe(true);
	});

	it('returns false when any clue fails', () => {
		expect(matchesClues('OMN', [
			{ type: 'landlocked', constraint: true }  // Oman is not landlocked
		])).toBe(false);
	});
});

// ── selectBestClue ────────────────────────────────────────────────────────────

describe('selectBestClue', () => {
	it('picks the candidate closest to splitting remaining in half', () => {
		const remaining = getRemainingCountries([]);
		// matchesAll passes every country (~243); landlocked passes ~45
		const matchesAll: Clue = { type: 'population', constraint: { type: '<', value: 9_999_999_999 } };
		const goodSplit: Clue  = { type: 'landlocked',  constraint: true };
		const best = selectBestClue([matchesAll, goodSplit], [], remaining.length);
		expect(best).toEqual(goodSplit);
	});

	it('among two region clues picks the one closer to half', () => {
		const remaining = getRemainingCountries([]);
		const africaClue: Clue  = { type: 'region', constraint: ['Africa'] };
		const europeClue: Clue  = { type: 'region', constraint: ['Europe'] };
		const half = remaining.length / 2;
		const africaCount = getRemainingCountries([africaClue]).length;
		const europeCount = getRemainingCountries([europeClue]).length;
		const best = selectBestClue([africaClue, europeClue], [], remaining.length);
		const bestCount = getRemainingCountries([best]).length;
		const otherCount = best === africaClue ? europeCount : africaCount;
		expect(Math.abs(bestCount - half)).toBeLessThanOrEqual(Math.abs(otherCount - half));
	});
});

// ── generateClue ──────────────────────────────────────────────────────────────

describe('generateClue', () => {
	it('always matches the target (50 iterations for random coverage)', () => {
		for (let i = 0; i < 50; i++) {
			const clue = generateClue('DEU', []);
			expect(matchClue('DEU', clue)).toBe(true);
		}
	});

	it('reduces the remaining pool', () => {
		const total = getRemainingCountries([]).length;
		for (let i = 0; i < 20; i++) {
			const clue = generateClue('JPN', []);
			expect(getRemainingCountries([clue]).length).toBeLessThan(total);
		}
	});

	it('each successive clue still matches the target', () => {
		const country = 'BRA';
		const clues: Clue[] = [];
		for (let i = 0; i < 5; i++) {
			const clue = generateClue(country, clues);
			expect(matchClue(country, clue)).toBe(true);
			clues.push(clue);
		}
	});

	it('falls back to a name clue when all 9 types are exhausted', () => {
		// Construct one clue of each type that matches France, bypassing the
		// dynamic path (which may reuse string types via the late-game failsafe).
		const exhausted: Clue[] = [
			{ type: 'name',        constraint: { type: 'contains',  value: 'F' } },
			{ type: 'capitalname', constraint: { type: 'contains',  value: 'P' } },
			{ type: 'landlocked',  constraint: false },
			{ type: 'car_side',    constraint: 'right' },
			{ type: 'region',      constraint: ['Europe'] },
			{ type: 'subregion',   constraint: ['Western Europe'] },
			{ type: 'population',  constraint: { type: '>', value: 1_000_000 } },
			{ type: 'land_area',   constraint: { type: '>', value: 100_000 } },
			{ type: 'borders',     constraint: { type: '>', value: 1 } },
		];
		expect(generateClue('FRA', exhausted).type).toBe('name');
	});

	it('every generated clue narrows the remaining pool (invariant across 100 random calls)', () => {
		// This is the core quality guarantee of the new heuristic: no clue should
		// leave the pool unchanged regardless of pool size or clue history.
		const targets = ['DEU', 'JPN', 'BRA', 'USA', 'NGA', 'AUS', 'IND', 'FRA', 'MEX', 'ZAF'];
		for (const country of targets) {
			const clues: Clue[] = [];
			for (let i = 0; i < 7; i++) {
				const before = getRemainingCountries(clues).length;
				if (before <= 1) break;
				const clue = generateClue(country, clues);
				const after = getRemainingCountries([...clues, clue]).length;
				expect(after, `${country} clue ${i} (${clue.type}) should narrow pool`).toBeLessThan(before);
				clues.push(clue);
			}
		}
	});

	it('produces a discriminating clue when exactly two countries remain', () => {
		// Andorra / North Macedonia scenario: 6 clues used (borders uses > 1 so both
		// pass — AND has 2, MKD has 5), three unused types remain (population,
		// subregion, car_side). The next clue must eliminate one of the two.
		const cluesUsed: Clue[] = [
			{ type: 'borders',     constraint: { type: '>', value: 1 } },
			{ type: 'capitalname', constraint: { type: 'nocontains', value: 'I' } },
			{ type: 'land_area',   constraint: { type: '<', value: 50_000 } },
			{ type: 'region',      constraint: ['Europe'] },
			{ type: 'landlocked',  constraint: true },
			{ type: 'name',        constraint: { type: 'endsWith', value: 'a' } },
		];
		// Confirm the setup: both AND and MKD match all 6 clues.
		expect(matchesClues('AND', cluesUsed)).toBe(true);
		expect(matchesClues('MKD', cluesUsed)).toBe(true);
		const poolBefore = getRemainingCountries(cluesUsed).length;

		// Run many times to cover random numeric candidate generation.
		for (let i = 0; i < 30; i++) {
			const next = generateClue('MKD', cluesUsed);
			const after = getRemainingCountries([...cluesUsed, next]).length;
			expect(after, `iteration ${i}: clue "${next.type}" should narrow the pool`).toBeLessThan(poolBefore);
		}
	});
});
