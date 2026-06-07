import { countries, countriesList } from './countries.js';
import type {
	Clue,
	ClueType,
	CountryData,
	CountryId,
	LengthConstraint,
	NumericClue,
	NumericClueType,
	StringClue,
	StringClueType
} from './types.js';

const CLUE_TYPES: ClueType[] = [
	'name',
	'capitalname',
	'population',
	'landlocked',
	'region',
	'subregion',
	'land_area',
	'borders',
	'car_side'
];

const NUMERIC_CLUE_TYPES: NumericClueType[] = ['population', 'land_area', 'borders'];

// ── Matching ──────────────────────────────────────────────────────────────────

function testStringClue(value: string, clue: StringClue['constraint']): boolean {
	const v = value.toLowerCase();
	switch (clue.type) {
		case 'startsWith':  return v.startsWith(clue.value.toLowerCase());
		case 'endsWith':    return v.endsWith(clue.value.toLowerCase());
		case 'contains':    return v.includes(clue.value.toLowerCase());
		case 'nocontains':  return !v.includes(clue.value.toLowerCase());
		case 'length':      return value.length === clue.value;
	}
}

function testNumericClue(value: number, clue: NumericClue['constraint']): boolean {
	return clue.type === '>' ? value > clue.value : value < clue.value;
}

export function matchClue(countryId: CountryId, clue: Clue): boolean {
	const country = countries[countryId];
	if (!country) return false;

	switch (clue.type) {
		case 'name':        return testStringClue(country.names[0], clue.constraint);
		case 'capitalname': return testStringClue(country.capital, clue.constraint);
		case 'population':  return testNumericClue(country.population, clue.constraint);
		case 'land_area':   return testNumericClue(country.land_area, clue.constraint);
		case 'borders':     return testNumericClue(country.borders, clue.constraint);
		case 'landlocked':  return country.landlocked === clue.constraint;
		case 'car_side':    return country.car_side === clue.constraint;
		case 'region':      return clue.constraint.includes(country.region);
		case 'subregion':   return clue.constraint.includes(country.subregion);
	}
}

export function matchesClues(countryId: CountryId, clues: Clue[]): boolean {
	return clues.every((clue) => matchClue(countryId, clue));
}

export function getRemainingCountries(clues: Clue[]): CountryId[] {
	return countriesList.filter((id) => matchesClues(id, clues));
}

// ── Clue generation ───────────────────────────────────────────────────────────

function addStringClues(candidates: Clue[], value: string, type: StringClueType): void {
	candidates.push({ type, constraint: { type: 'startsWith', value: value[0] } });
	candidates.push({ type, constraint: { type: 'endsWith', value: value[value.length - 1] } });

	for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
		const letter = String.fromCharCode(i);
		const constraintType = value.toUpperCase().includes(letter) ? 'contains' : 'nocontains';
		candidates.push({ type, constraint: { type: constraintType, value: letter } });
	}

	candidates.push({ type, constraint: { type: 'length', value: value.length } as LengthConstraint });
}

function addNumericClues(candidates: Clue[], value: number, type: NumericClueType): void {
	if (value <= 0) {
		// Island nations / zero-border countries — only meaningful clue is "< 1"
		candidates.push({ type, constraint: { type: '<', value: 1 } });
		return;
	}
	const base = Math.pow(10, Math.floor(Math.log10(value)));
	candidates.push({
		type,
		constraint: { type: '<', value: base * Math.ceil((value * (Math.random() + 1.05)) / base) }
	});
	// Clamp to [0, value-1] so the target always satisfies its own `>` clue under strict semantics.
	// The raw formula gives 0 when value is exactly a power of 10; that's fine — "More than 0"
	// is trivially true but correct, and selectBestClue will prefer it only as a last resort.
	const rawBelow = base * Math.floor((value * (Math.random() / 2.0 + 0.25)) / base);
	candidates.push({
		type,
		constraint: { type: '>', value: Math.min(value - 1, Math.max(0, rawBelow)) }
	});
}

export function selectBestClue(
	candidates: Clue[],
	existingClues: Clue[],
	remainingCount: number
): Clue {
	const scores = candidates.map(
		(clue) =>
			Math.abs(getRemainingCountries([...existingClues, clue]).length - remainingCount / 2)
	);
	return candidates[scores.indexOf(Math.min(...scores))];
}

function buildCandidatesForType(candidates: Clue[], country: CountryData, type: ClueType): void {
	if (type === 'name')        { addStringClues(candidates, country.names[0], 'name'); return; }
	if (type === 'capitalname') { addStringClues(candidates, country.capital, 'capitalname'); return; }
	if (type === 'landlocked')  { candidates.push({ type: 'landlocked', constraint: country.landlocked }); return; }
	if (type === 'car_side')    { candidates.push({ type: 'car_side',   constraint: country.car_side }); return; }
	if (type === 'region')      { candidates.push({ type: 'region',     constraint: [country.region] }); return; }
	if (type === 'subregion')   { candidates.push({ type: 'subregion',  constraint: [country.subregion] }); return; }
	for (const nType of NUMERIC_CLUE_TYPES) {
		if (nType === type) addNumericClues(candidates, country[nType], nType);
	}
}

export function generateClue(countryId: CountryId, existingClues: Clue[]): Clue {
	const country = countries[countryId];
	const usedTypes = new Set(existingClues.map((c) => c.type));
	const remainingTypes = CLUE_TYPES.filter((t) => !usedTypes.has(t));
	const remaining = getRemainingCountries(existingClues);

	if (remainingTypes.length === 0) remainingTypes.push('name');

	// For each unused type, find its single best candidate (via selectBestClue), then
	// keep only the representatives that actually narrow the remaining pool.
	// This guarantees every generated clue makes progress, regardless of pool size.
	const reps: { clue: Clue; score: number }[] = [];
	for (const type of remainingTypes) {
		const candidates: Clue[] = [];
		buildCandidatesForType(candidates, country, type);
		const best = selectBestClue(candidates, existingClues, remaining.length);
		const after = getRemainingCountries([...existingClues, best]).length;
		if (after < remaining.length) {
			reps.push({ clue: best, score: Math.abs(after - remaining.length / 2) });
		}
	}

	// Failsafe: no unused type can narrow the pool — fall back to string letter variants
	// which have enough candidates to almost always find a discriminator between any two
	// countries (different names ⟹ different letter composition or length).
	if (reps.length === 0) {
		const fallback: Clue[] = [];
		buildCandidatesForType(fallback, country, 'name');
		buildCandidatesForType(fallback, country, 'capitalname');
		return selectBestClue(fallback, existingClues, remaining.length);
	}

	// Small pool (≤ 3): pick the type whose best clue is closest to an even split —
	// precision matters more than variety at this stage.
	// Large pool: pick uniformly at random among narrowing types for clue variety.
	if (remaining.length <= 3) {
		reps.sort((a, b) => a.score - b.score);
		return reps[0].clue;
	}
	return reps[Math.floor(Math.random() * reps.length)].clue;
}
