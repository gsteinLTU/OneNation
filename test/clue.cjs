const { _countriesList } = require('../models/Countries.cjs');
const { _matchClue, _matchesClues, _getRemaingCountries, _generateClue, _selectBestClue } = require('../models/Clues.cjs');
const { expect } = require('chai');

describe('clue matching — string (name)', () => {
    it('matches startsWith', () => {
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'startsWith', value: 'U' } })).is.true;
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'startsWith', value: 'E' } })).is.false;
    });

    it('matches endsWith', () => {
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'endsWith', value: 'A' } })).is.true;
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'endsWith', value: 'E' } })).is.false;
    });

    it('matches contains / nocontains', () => {
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'contains',   value: 'G' } })).is.true;
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'nocontains', value: 'G' } })).is.false;
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'contains',   value: 'J' } })).is.false;
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'nocontains', value: 'J' } })).is.true;
    });

    it('matches length', () => {
        // "Uganda" = 6 chars
        expect(_matchClue('UGA', { type: 'name', constraint: { type: 'length', value: 6 } })).is.true;
        for (let i = 0; i < 10; i++) {
            if (i === 6) continue;
            expect(_matchClue('UGA', { type: 'name', constraint: { type: 'length', value: i } })).is.false;
        }
    });
});

describe('clue matching — string (capitalname)', () => {
    it('matches capital startsWith', () => {
        // Uganda capital: Kampala
        expect(_matchClue('UGA', { type: 'capitalname', constraint: { type: 'startsWith', value: 'K' } })).is.true;
        expect(_matchClue('UGA', { type: 'capitalname', constraint: { type: 'startsWith', value: 'E' } })).is.false;
    });
});

describe('clue matching — boolean (landlocked)', () => {
    it('matches landlocked correctly for landlocked and coastal countries', () => {
        // TCD (Chad) is landlocked; PAN (Panama) is not
        expect(_matchClue('TCD', { type: 'landlocked', constraint: true  })).is.true;
        expect(_matchClue('TCD', { type: 'landlocked', constraint: false })).is.false;
        expect(_matchClue('PAN', { type: 'landlocked', constraint: true  })).is.false;
        expect(_matchClue('PAN', { type: 'landlocked', constraint: false })).is.true;
    });
});

describe('clue matching — boolean (car_side)', () => {
    it('matches car_side correctly for left- and right-hand traffic countries', () => {
        // GBR drives on the left; DEU drives on the right
        expect(_matchClue('GBR', { type: 'car_side', constraint: 'left'  })).is.true;
        expect(_matchClue('GBR', { type: 'car_side', constraint: 'right' })).is.false;
        expect(_matchClue('DEU', { type: 'car_side', constraint: 'right' })).is.true;
        expect(_matchClue('DEU', { type: 'car_side', constraint: 'left'  })).is.false;
    });
});

describe('clue matching — numeric (population)', () => {
    it('matches population thresholds', () => {
        // TCD population ~19.3M; PAN ~4.1M
        const above10M = { type: 'population', constraint: { type: '>', value: 10000000 } };
        const below10M = { type: 'population', constraint: { type: '<', value: 10000000 } };
        expect(_matchClue('TCD', above10M)).is.true;
        expect(_matchClue('TCD', below10M)).is.false;
        expect(_matchClue('PAN', above10M)).is.false;
        expect(_matchClue('PAN', below10M)).is.true;
    });
});

describe('clue matching — numeric (land_area)', () => {
    it('matches area thresholds', () => {
        // TCD area ~1,284,000 km²; PAN ~75,417 km²
        const above100K = { type: 'land_area', constraint: { type: '>', value: 100000 } };
        const below100K = { type: 'land_area', constraint: { type: '<', value: 100000 } };
        expect(_matchClue('TCD', above100K)).is.true;
        expect(_matchClue('TCD', below100K)).is.false;
        expect(_matchClue('PAN', above100K)).is.false;
        expect(_matchClue('PAN', below100K)).is.true;
    });
});

describe('clue matching — numeric (borders)', () => {
    it('matches border count thresholds', () => {
        // DEU has 9 land borders; JPN has 0
        const above5 = { type: 'borders', constraint: { type: '>', value: 5 } };
        const below5 = { type: 'borders', constraint: { type: '<', value: 5 } };
        expect(_matchClue('DEU', above5)).is.true;
        expect(_matchClue('DEU', below5)).is.false;
        expect(_matchClue('JPN', above5)).is.false;
        expect(_matchClue('JPN', below5)).is.true;
    });
});

describe('clue matching — categorical (region)', () => {
    it('matches region inclusion list', () => {
        // TCD is Africa; PAN is Americas
        const africaOrAsia   = { type: 'region', constraint: ['Africa', 'Asia'] };
        const europeOrAmericas = { type: 'region', constraint: ['Europe', 'Americas'] };
        expect(_matchClue('TCD', africaOrAsia)).is.true;
        expect(_matchClue('TCD', europeOrAmericas)).is.false;
        expect(_matchClue('PAN', africaOrAsia)).is.false;
        expect(_matchClue('PAN', europeOrAmericas)).is.true;
    });
});

describe('clue matching — categorical (subregion)', () => {
    it('matches subregion inclusion list', () => {
        // PAN subregion: Central America; DEU subregion: Western Europe
        const central = { type: 'subregion', constraint: ['Central America'] };
        const western = { type: 'subregion', constraint: ['Western Europe'] };
        expect(_matchClue('PAN', central)).is.true;
        expect(_matchClue('PAN', western)).is.false;
        expect(_matchClue('DEU', western)).is.true;
        expect(_matchClue('DEU', central)).is.false;
    });
});

describe('remaining countries', () => {
    it('returns all countries with no clues', () => {
        expect(_getRemaingCountries([]).length).equals(_countriesList.length);
    });

    it('returns 0 with impossible clues', () => {
        expect(_getRemaingCountries([
            { type: 'landlocked', constraint: true },
            { type: 'landlocked', constraint: false },
        ]).length).equals(0);
    });

    it('returns correct count for single landlocked clue', () => {
        expect(_getRemaingCountries([{ type: 'landlocked', constraint: true }]).length).equals(45);
    });

    it('returns correct matching with single clue', () => {
        const clue = { type: 'landlocked', constraint: true };
        expect(_matchesClues('UGA', [clue])).is.true;
        expect(_matchesClues('USA', [clue])).is.false;
    });

    it('narrows to a single country with multiple clues', () => {
        const clues = [
            { type: 'name',        constraint: { type: 'nocontains', value: ' ' } },
            { type: 'region',      constraint: ['Asia', 'Europe'] },
            { type: 'population',  constraint: { type: '<', value: 10000000 } },
            { type: 'capitalname', constraint: { type: 'length', value: 6 } },
            { type: 'land_area',   constraint: { type: '>', value: 200000 } },
        ];
        const result = _getRemaingCountries(clues);
        expect(result.length).equals(1);
        expect(result[0]).equals('OMN');
    });

    it('correctly matches and rejects with multiple clues', () => {
        const clues = [
            { type: 'name',        constraint: { type: 'nocontains', value: ' ' } },
            { type: 'region',      constraint: ['Asia', 'Europe'] },
            { type: 'population',  constraint: { type: '<', value: 10000000 } },
            { type: 'capitalname', constraint: { type: 'length', value: 6 } },
            { type: 'land_area',   constraint: { type: '>', value: 200000 } },
        ];
        expect(_matchesClues('OMN', clues)).is.true;
        expect(_matchesClues('SAU', clues)).is.false;
    });
});

describe('_selectBestClue', () => {
    it('picks the candidate that splits remaining closest to half', () => {
        // Start with all countries; pick between a clue matching ~half vs one matching almost all
        const remaining = _getRemaingCountries([]);
        const tooPermissive = { type: 'population', constraint: { type: '<', value: 9999999999 } }; // matches everyone
        const goodSplit     = { type: 'landlocked',  constraint: true };  // matches ~45/243 ≈ 19%
        const impossible    = { type: 'landlocked',  constraint: true, _and: false }; // won't match anything

        // goodSplit is closer to half (45) than tooPermissive (243)
        const best = _selectBestClue([tooPermissive, goodSplit], [], remaining);
        expect(best).to.deep.equal(goodSplit);
    });

    it('among two region clues, picks the one whose result is closer to half remaining', () => {
        const remaining = _getRemaingCountries([]);
        const half = remaining.length / 2;

        const africaClue  = { type: 'region', constraint: ['Africa'] };
        const europeClue  = { type: 'region', constraint: ['Europe'] };

        const africaCount = _getRemaingCountries([africaClue]).length;
        const europeCount = _getRemaingCountries([europeClue]).length;

        const best = _selectBestClue([africaClue, europeClue], [], remaining);
        const bestCount = _getRemaingCountries([best]).length;
        const otherCount = best === africaClue ? europeCount : africaCount;

        expect(Math.abs(bestCount - half)).to.be.at.most(Math.abs(otherCount - half));
    });
});

describe('_generateClue', () => {
    it('always returns a clue that matches the target country', () => {
        // Run many times to cover the random numeric bounds
        const country = 'DEU';
        for (let i = 0; i < 50; i++) {
            const clue = _generateClue(country, []);
            expect(_matchClue(country, clue), `iteration ${i}: clue ${JSON.stringify(clue)} should match DEU`).is.true;
        }
    });

    it('reduces the remaining pool', () => {
        const country = 'JPN';
        const total = _getRemaingCountries([]).length;
        for (let i = 0; i < 20; i++) {
            const clue = _generateClue(country, []);
            const after = _getRemaingCountries([clue]).length;
            expect(after).to.be.below(total);
        }
    });

    it('each successive clue matches the target', () => {
        const country = 'BRA';
        const clues = [];
        for (let i = 0; i < 5; i++) {
            const clue = _generateClue(country, clues);
            expect(_matchClue(country, clue), `clue ${i}: ${JSON.stringify(clue)}`).is.true;
            clues.push(clue);
        }
    });

    it('falls back to name clues when all types are exhausted', () => {
        // Generate one real clue per type in sequence until all 9 are used
        const country = 'FRA';
        const clues = [];
        for (let i = 0; i < 9; i++) {
            clues.push(_generateClue(country, clues));
        }
        // All 9 types should now be represented
        const usedTypes = new Set(clues.map(c => c.type));
        expect(usedTypes.size).to.equal(9);
        // Next call should fall back to name
        const extra = _generateClue(country, clues);
        expect(extra.type).to.equal('name');
    });
});
