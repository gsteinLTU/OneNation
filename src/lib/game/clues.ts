import { countries, countriesList } from './countries.js';
import type {
	Clue,
	ClueType,
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
	return clue.type === '>' ? value >= clue.value : value <= clue.value;
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
	candidates.push({
		type,
		constraint: { type: '>', value: base * Math.floor((value * (Math.random() / 2.0 + 0.25)) / base) }
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

export function generateClue(countryId: CountryId, existingClues: Clue[]): Clue {
	const country = countries[countryId];
	const usedTypes = new Set(existingClues.map((c) => c.type));
	const remainingTypes = CLUE_TYPES.filter((t) => !usedTypes.has(t));

	if (remainingTypes.length === 0) remainingTypes.push('name');

	// Pick a random type so the first clue isn't always a name letter-check
	// (which would otherwise always score best across 243 countries).
	const chosenType = remainingTypes[Math.floor(Math.random() * remainingTypes.length)];

	const remaining = getRemainingCountries(existingClues);
	const candidates: Clue[] = [];

	if (chosenType === 'name')        addStringClues(candidates, country.names[0], 'name');
	if (chosenType === 'capitalname') addStringClues(candidates, country.capital, 'capitalname');
	if (chosenType === 'landlocked')  candidates.push({ type: 'landlocked', constraint: country.landlocked });
	if (chosenType === 'car_side')    candidates.push({ type: 'car_side',   constraint: country.car_side });
	if (chosenType === 'region')      candidates.push({ type: 'region',     constraint: [country.region] });
	if (chosenType === 'subregion')   candidates.push({ type: 'subregion',  constraint: [country.subregion] });

	for (const type of NUMERIC_CLUE_TYPES) {
		if (type === chosenType) addNumericClues(candidates, country[type], type);
	}

	return selectBestClue(candidates, existingClues, remaining.length);
}
