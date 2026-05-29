const { expect } = require('chai');
const data = require('../data/countries.json');

const entries = Object.entries(data);
const keys = Object.keys(data);

describe('countries.json structure', () => {
    it('should contain at least 150 countries', () => {
        expect(keys.length).to.be.at.least(150);
    });

    it('should use cca3 keys (3 uppercase letters)', () => {
        for (const key of keys) {
            expect(key).to.match(/^[A-Z]{3}$/, `key "${key}" is not a valid cca3 code`);
        }
    });

    it('should have all required fields on every entry', () => {
        const required = ['names', 'population', 'region', 'subregion', 'landlocked', 'land_area', 'capital', 'borders', 'car_side'];
        for (const [key, country] of entries) {
            for (const field of required) {
                expect(country, `${key} missing field "${field}"`).to.have.property(field);
            }
        }
    });

    it('should have correct types on every entry', () => {
        for (const [key, c] of entries) {
            expect(Array.isArray(c.names),       `${key}.names should be an array`).to.be.true;
            expect(typeof c.population,          `${key}.population`).to.equal('number');
            expect(typeof c.region,              `${key}.region`).to.equal('string');
            expect(typeof c.subregion,           `${key}.subregion`).to.equal('string');
            expect(typeof c.landlocked,          `${key}.landlocked`).to.equal('boolean');
            expect(typeof c.land_area,           `${key}.land_area`).to.equal('number');
            expect(typeof c.capital,             `${key}.capital`).to.equal('string');
            expect(typeof c.borders,             `${key}.borders`).to.equal('number');
            expect(typeof c.car_side,            `${key}.car_side`).to.equal('string');
        }
    });

    it('should have at least one non-empty name per entry', () => {
        for (const [key, c] of entries) {
            expect(c.names.length, `${key} has empty names array`).to.be.at.least(1);
            expect(c.names[0].length, `${key} primary name is empty`).to.be.at.least(1);
        }
    });

    it('should have car_side of only "left" or "right"', () => {
        for (const [key, c] of entries) {
            expect(['left', 'right'], `${key}.car_side "${c.car_side}" is invalid`).to.include(c.car_side);
        }
    });

    it('should have positive population and land_area', () => {
        for (const [key, c] of entries) {
            expect(c.population, `${key}.population`).to.be.above(0);
            expect(c.land_area,  `${key}.land_area`).to.be.above(0);
        }
    });

    it('should have non-negative border count', () => {
        for (const [key, c] of entries) {
            expect(c.borders, `${key}.borders`).to.be.at.least(0);
        }
    });

    it('should have non-empty capital on every entry', () => {
        for (const [key, c] of entries) {
            expect(c.capital.length, `${key}.capital is empty`).to.be.at.least(1);
        }
    });
});

describe('countries.json coverage', () => {
    it('should have both landlocked and coastal countries', () => {
        const landlocked = entries.filter(([, c]) => c.landlocked);
        const coastal    = entries.filter(([, c]) => !c.landlocked);
        expect(landlocked.length).to.be.at.least(10);
        expect(coastal.length).to.be.at.least(10);
    });

    it('should have both left- and right-hand traffic countries', () => {
        const left  = entries.filter(([, c]) => c.car_side === 'left');
        const right = entries.filter(([, c]) => c.car_side === 'right');
        expect(left.length).to.be.at.least(20);
        expect(right.length).to.be.at.least(20);
    });

    it('should have all five inhabited regions', () => {
        const regions = new Set(entries.map(([, c]) => c.region));
        for (const r of ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania']) {
            expect(regions.has(r), `region "${r}" is missing`).to.be.true;
        }
    });

    it('should have at least 10 distinct subregions', () => {
        const subregions = new Set(entries.map(([, c]) => c.subregion).filter(Boolean));
        expect(subregions.size).to.be.at.least(10);
    });

    it('should have enough countries with population > 100,000 to play', () => {
        const playable = entries.filter(([, c]) => c.population > 100000);
        expect(playable.length).to.be.at.least(100);
    });

    it('should have a range of border counts including 0 and >5', () => {
        const island    = entries.filter(([, c]) => c.borders === 0);
        const wellConnected = entries.filter(([, c]) => c.borders > 5);
        expect(island.length).to.be.at.least(10);
        expect(wellConnected.length).to.be.at.least(5);
    });
});

describe('countries.json spot checks', () => {
    it('USA: Americas, not landlocked, right-hand traffic, 2 borders', () => {
        const usa = data['USA'];
        expect(usa).to.exist;
        expect(usa.region).to.equal('Americas');
        expect(usa.landlocked).to.be.false;
        expect(usa.car_side).to.equal('right');
        expect(usa.borders).to.equal(2);
        expect(usa.capital).to.equal('Washington, D.C.');
    });

    it('Japan: not landlocked, left-hand traffic, 0 borders', () => {
        const jpn = data['JPN'];
        expect(jpn).to.exist;
        expect(jpn.landlocked).to.be.false;
        expect(jpn.car_side).to.equal('left');
        expect(jpn.borders).to.equal(0);
    });

    it('UK: Europe, left-hand traffic', () => {
        const gbr = data['GBR'];
        expect(gbr).to.exist;
        expect(gbr.region).to.equal('Europe');
        expect(gbr.car_side).to.equal('left');
    });

    it('Chad: Africa, landlocked', () => {
        const tcd = data['TCD'];
        expect(tcd).to.exist;
        expect(tcd.region).to.equal('Africa');
        expect(tcd.landlocked).to.be.true;
    });

    it('Afghanistan: Asia, landlocked', () => {
        const afg = data['AFG'];
        expect(afg).to.exist;
        expect(afg.region).to.equal('Asia');
        expect(afg.landlocked).to.be.true;
    });

    it('Bahamas: names include both "Bahamas" and "Commonwealth of the Bahamas"', () => {
        const bhs = data['BHS'];
        expect(bhs).to.exist;
        expect(bhs.names).to.include('Bahamas');
        expect(bhs.names).to.include('Commonwealth of the Bahamas');
    });
});
