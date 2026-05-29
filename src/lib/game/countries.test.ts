import { describe, it, expect } from 'vitest';
import { countries, countriesList, findId, nameFromId, pickCountry } from './countries.js';

describe('countriesList', () => {
	it('contains at least 150 entries', () => {
		expect(countriesList.length).toBeGreaterThanOrEqual(150);
	});

	it('uses cca3 keys', () => {
		for (const id of countriesList) {
			expect(id).toMatch(/^[A-Z]{3}$/);
		}
	});
});

describe('pickCountry', () => {
	it('returns a valid cca3 key', () => {
		const id = pickCountry();
		expect(countriesList).toContain(id);
	});

	it('always returns a country with population > 100,000', () => {
		for (let i = 0; i < 20; i++) {
			const id = pickCountry();
			expect(countries[id].population).toBeGreaterThan(100_000);
		}
	});
});

describe('findId', () => {
	it('finds a country by its common name (case-insensitive)', () => {
		expect(findId('Germany')).toBe('DEU');
		expect(findId('germany')).toBe('DEU');
		expect(findId('GERMANY')).toBe('DEU');
	});

	it('finds a country by its official name', () => {
		expect(findId('Federal Republic of Germany')).toBe('DEU');
	});

	it('returns null for unknown names', () => {
		expect(findId('Wakanda')).toBeNull();
		expect(findId('')).toBeNull();
	});

	it('finds the Bahamas with and without "The"', () => {
		expect(findId('Bahamas')).toBe('BHS');
		expect(findId('Commonwealth of the Bahamas')).toBe('BHS');
	});
});

describe('nameFromId', () => {
	it('returns the common name', () => {
		expect(nameFromId('DEU')).toBe('Germany');
		expect(nameFromId('USA')).toBe('United States');
		expect(nameFromId('JPN')).toBe('Japan');
	});
});
