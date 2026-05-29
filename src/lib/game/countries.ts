import rawData from '../../../data/countries.json';
import type { CountryData, CountryId } from './types.js';

export const countries = rawData as Record<CountryId, CountryData>;

export const countriesList: CountryId[] = Object.keys(countries);

export function pickCountry(): CountryId {
	const playable = countriesList.filter((id) => countries[id].population > 100_000);
	return playable[Math.floor(Math.random() * playable.length)];
}

export function findId(name: string): CountryId | null {
	const lower = name.toLowerCase();
	return (
		countriesList.find((id) => countries[id].names.some((n) => n.toLowerCase() === lower)) ?? null
	);
}

export function nameFromId(id: CountryId): string {
	return countries[id].names[0];
}
