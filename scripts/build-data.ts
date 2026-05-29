import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const API_URL =
  'https://restcountries.com/v3.1/all' +
  '?fields=cca3,name,capital,population,area,landlocked,region,subregion,borders,car';

interface RawCountry {
  cca3: string;
  name: { common: string; official: string };
  capital: string[];
  population: number;
  area: number;
  landlocked: boolean;
  region: string;
  subregion: string;
  borders: string[];
  car: { side: 'left' | 'right' };
}

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

const REQUIRED_FIELDS: (keyof RawCountry)[] = [
  'cca3', 'name', 'capital', 'population', 'area',
  'landlocked', 'region', 'borders', 'car',
];

function assertStructure(entry: RawCountry, index: number): void {
  for (const field of REQUIRED_FIELDS) {
    if (entry[field] === undefined || entry[field] === null) {
      throw new Error(
        `Structural change at index ${index} (${entry.name?.common ?? '?'}): ` +
        `field "${field}" is missing. RestCountries API format may have changed.`
      );
    }
  }
  if (!entry.car?.side) {
    throw new Error(
      `Structural change at index ${index}: car.side is missing. ` +
      `RestCountries API format may have changed.`
    );
  }
}

function buildNames(raw: RawCountry): string[] {
  const candidates: string[] = [raw.name.common];

  if (raw.name.official !== raw.name.common) {
    candidates.push(raw.name.official);
  }

  // "The Bahamas" → also accept "Bahamas"
  for (const name of [...candidates]) {
    if (name.startsWith('The ')) {
      candidates.push(name.slice(4));
    }
  }

  return [...new Set(candidates)];
}

async function main(): Promise<void> {
  console.log('Fetching country data from RestCountries...');

  let response: Response;
  try {
    response = await fetch(API_URL);
  } catch (err) {
    throw new Error(`Network error contacting RestCountries: ${(err as Error).message}`);
  }

  if (!response.ok) {
    throw new Error(`RestCountries returned HTTP ${response.status} ${response.statusText}`);
  }

  const raw: RawCountry[] = await response.json();

  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('Response is not a non-empty array — API format may have changed');
  }

  // Structural spot-check on first 3 entries before processing everything
  for (let i = 0; i < Math.min(3, raw.length); i++) {
    assertStructure(raw[i], i);
  }

  console.log(`Received ${raw.length} raw entries`);

  const result: Record<string, CountryData> = {};
  const skipped: string[] = [];

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    const label = c.name?.common ?? c.cca3 ?? `index ${i}`;

    if (!c.cca3)               { skipped.push(`${label} — no cca3`);       continue; }
    if (!c.name?.common)       { skipped.push(`${label} — no name`);       continue; }
    if (!c.capital?.[0])       { skipped.push(`${label} — no capital`);    continue; }
    if (!c.region)             { skipped.push(`${label} — no region`);     continue; }
    if (!c.area || c.area <= 0){ skipped.push(`${label} — no area`);       continue; }
    if (!c.population)         { skipped.push(`${label} — no population`); continue; }
    if (!c.car?.side)          { skipped.push(`${label} — no car.side`);   continue; }

    if (result[c.cca3]) {
      throw new Error(`Duplicate cca3 key "${c.cca3}" — this should never happen.`);
    }

    result[c.cca3] = {
      names:      buildNames(c),
      population: c.population,
      region:     c.region,
      subregion:  c.subregion ?? '',
      landlocked: c.landlocked,
      land_area:  c.area,
      capital:    c.capital[0],
      borders:    c.borders?.length ?? 0,
      car_side:   c.car.side,
    };
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} entries:`);
    for (const s of skipped) console.log(`  ${s}`);
  }

  const count = Object.keys(result).length;

  if (count < 150) {
    throw new Error(
      `Only ${count} valid countries after filtering — expected ≥150. ` +
      `The API response may be truncated or the format has changed.`
    );
  }

  console.log(`\nBuilt data for ${count} countries`);

  const json = JSON.stringify(result, null, 2);
  const paths = [
    join(process.cwd(), 'data', 'countries.json'),
    join(process.cwd(), 'src', 'lib', 'data', 'countries.json'),
  ];
  for (const outPath of paths) {
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, json);
    console.log(`Written to ${outPath}`);
  }
}

main().catch((err: Error) => {
  console.error(`\nFATAL: ${err.message}`);
  process.exit(1);
});
