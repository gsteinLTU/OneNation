export interface CountryData {
	names: string[];
	population: number;
	region: string;
	subregion: string;
	landlocked: boolean;
	land_area: number;
	capital: string;
	borders: number;
	car_side: 'left' | 'right';
}

export type CountryId = string;

// ── Clue constraint shapes ────────────────────────────────────────────────────

export interface StringConstraint {
	type: 'startsWith' | 'endsWith' | 'contains' | 'nocontains';
	value: string;
}

export interface LengthConstraint {
	type: 'length';
	value: number;
}

export interface NumericConstraint {
	type: '>' | '<';
	value: number;
}

// ── Clue variants (discriminated on `type`) ───────────────────────────────────

export interface StringClue {
	type: 'name' | 'capitalname';
	constraint: StringConstraint | LengthConstraint;
}

export interface NumericClue {
	type: 'population' | 'land_area' | 'borders';
	constraint: NumericConstraint;
}

export interface LandlockedClue {
	type: 'landlocked';
	constraint: boolean;
}

export interface CarSideClue {
	type: 'car_side';
	constraint: 'left' | 'right';
}

export interface CategoricalClue {
	type: 'region' | 'subregion';
	constraint: string[];
}

export type Clue = StringClue | NumericClue | LandlockedClue | CarSideClue | CategoricalClue;

export type ClueType = Clue['type'];

export type StringClueType = StringClue['type'];
export type NumericClueType = NumericClue['type'];
