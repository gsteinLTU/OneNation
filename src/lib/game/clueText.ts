import type { Clue, StringClue } from './types.js';

function formatList(items: string[]): string {
	if (items.length === 1) return items[0];
	if (items.length === 2) return `${items[0]} or ${items[1]}`;
	return items.slice(0, -1).join(', ') + ', or ' + items.at(-1);
}

function formatStringConstraint(label: string, c: StringClue['constraint']): string {
	switch (c.type) {
		case 'startsWith': return `${label} starts with "${c.value}"`;
		case 'endsWith':   return `${label} ends with "${c.value}"`;
		case 'contains':   return `${label} contains "${c.value}"`;
		case 'nocontains': return `${label} does not contain "${c.value}"`;
		case 'length':     return `${label} is ${c.value} letters long`;
	}
}

export function clueToString(clue: Clue): string {
	switch (clue.type) {
		case 'name':
			return formatStringConstraint('Name', clue.constraint);
		case 'capitalname':
			return formatStringConstraint('Capital name', clue.constraint);
		case 'population': {
			const dir = clue.constraint.type === '>' ? 'more than' : 'fewer than';
			return `Population: ${dir} ${clue.constraint.value.toLocaleString()} people`;
		}
		case 'land_area': {
			const dir = clue.constraint.type === '>' ? 'more than' : 'less than';
			return `Land area: ${dir} ${clue.constraint.value.toLocaleString()} km²`;
		}
		case 'borders': {
			const { type, value } = clue.constraint;
			if (type === '<' && value === 1) return 'No land borders';
			const dir = type === '>' ? 'More than' : 'Fewer than';
			return `${dir} ${value} land border${value === 1 ? '' : 's'}`;
		}
		case 'landlocked':
			return clue.constraint ? 'Is landlocked' : 'Is not landlocked';
		case 'car_side':
			return `Drives on the ${clue.constraint}`;
		case 'region':
			return `In ${formatList(clue.constraint)}`;
		case 'subregion':
			return `Subregion: ${formatList(clue.constraint)}`;
	}
}
