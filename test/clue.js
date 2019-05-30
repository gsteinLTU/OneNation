const { _matchClue, _matchesClues, _getRemaingCountries, _countriesList } = require('../controllers/game');
const { expect } = require('chai');

describe('clue matching tests', () => {

    it('should match Uganda for starts with U clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'name', constraint: {
                type: 'startsWith', value: 'U'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.true;
    });

    it('should not match Uganda for starts with E clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'name', constraint: {
                type: 'startsWith', value: 'E'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.false;
    });

    it('should match Uganda for ends with A clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'name', constraint: {
                type: 'endsWith', value: 'A'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.true;
    });

    it('should not match Uganda for ends with E clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'name', constraint: {
                type: 'endsWith', value: 'E'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.false;
    });


    it('should match Uganda for contains G clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'name', constraint: {
                type: 'contains', value: 'G'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.true;
    });

    it('should not match Uganda for contains J clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'name', constraint: {
                type: 'contains', value: 'J'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.false;
    });

    it('should match Uganda for length of 6 clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'name', constraint: {
                type: 'length', value: 6
            }
        };

        expect(_matchClue(testCountry, testClue)).is.true;
    });

    it('should not match Uganda for other length clues', () => {
        const testCountry = 'uganda';

        for (let i = 0; i < 10; i++) {
            if (i === 6) {
                continue;
            }

            const testClue = {
                type: 'name', constraint: {
                    type: 'length',
                    value: i
                }
            };

            expect(_matchClue(testCountry, testClue)).is.false;
        }
    });

    it('should match Uganda for capital starts with K clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'capitalname', constraint: {
                type: 'startsWith', value: 'K'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.true;
    });

    it('should not match Uganda for capital starts with E clue', () => {
        const testCountry = 'uganda';
        const testClue = {
            type: 'capitalname', constraint: {
                type: 'startsWith', value: 'E'
            }
        };

        expect(_matchClue(testCountry, testClue)).is.false;
    });

    it('should match landlocked clues', () => {
        const testCountry = 'chad';
        const testCountry2 = 'panama';
        const testClue = {
            type: 'landlocked', constraint: true
        };

        const testClue2 = {
            type: 'landlocked', constraint: false
        };


        expect(_matchClue(testCountry, testClue)).is.true;
        expect(_matchClue(testCountry, testClue2)).is.false;
        expect(_matchClue(testCountry2, testClue)).is.false;
        expect(_matchClue(testCountry2, testClue2)).is.true;
    });

    it('should match population clues', () => {
        const testCountry = 'chad'; // Population 15,833,116
        const testCountry2 = 'panama';// Population 3,800,644

        const testClue = {
            type: 'population', constraint: { type: '>', value: 10000000 }
        };

        const testClue2 = {
            type: 'population', constraint: { type: '<', value: 10000000 }
        };


        expect(_matchClue(testCountry, testClue)).is.true;
        expect(_matchClue(testCountry2, testClue)).is.false;
        expect(_matchClue(testCountry, testClue2)).is.false;
        expect(_matchClue(testCountry2, testClue2)).is.true;
    });

    it('should match area clues', () => {
        const testCountry = 'chad'; // Area 1,259,200
        const testCountry2 = 'panama';// Area 74,340

        const testClue = {
            type: 'land_area', constraint: { type: '>', value: 100000 }
        };

        const testClue2 = {
            type: 'land_area', constraint: { type: '<', value: 100000 }
        };


        expect(_matchClue(testCountry, testClue)).is.true;
        expect(_matchClue(testCountry2, testClue)).is.false;
        expect(_matchClue(testCountry, testClue2)).is.false;
        expect(_matchClue(testCountry2, testClue2)).is.true;
    });


    it('should match region clues', () => {
        const testCountry = 'chad'; // Area 1,259,200
        const testCountry2 = 'panama';// Area 74,340

        const testClue = {
            type: 'region', constraint: ['Africa', 'Middle East']
        };

        const testClue2 = {
            type: 'region', constraint: ['Asia', 'Central America and the Caribbean']
        };


        expect(_matchClue(testCountry, testClue)).is.true;
        expect(_matchClue(testCountry, testClue2)).is.false;
        expect(_matchClue(testCountry, testClue2)).is.false;
        expect(_matchClue(testCountry2, testClue2)).is.true;
    });


});

describe('remaining countries tests', () => {
    it('should return all countries remaining with no clues', () => {
        expect(_getRemaingCountries([]).length).equals(_countriesList.length);
    });

    it('should return no countries remaining with impossible clues', () => {
        expect(_getRemaingCountries([{
            type: 'landlocked',
            constraint: true
        },
        {
            type: 'landlocked',
            constraint: false
        }
        ]).length).equals(0);
    });

    it('should return correct number of countries remaining with one clue', () => {
        expect(_getRemaingCountries([{
            type: 'landlocked',
            constraint: true
        }]).length).equals(44);
    });

    it('should return correct matching countries with one clue', () => {
        expect(_matchesClues('uganda', [{
            type: 'landlocked',
            constraint: true
        }])).is.true;

        expect(_matchesClues('united_states', [{
            type: 'landlocked',
            constraint: true
        }])).is.false;
    });

    it('should return correct result remaining with list of clues', () => {
        const testResult = _getRemaingCountries(
            [
                {
                    type: 'name',
                    constraint: {
                        type: 'nocontains',
                        value: ' '
                    }
                },
                {
                    type: 'region',
                    constraint: ['Europe', 'Asia', 'Middle East']
                },
                {
                    type: 'population',
                    constraint: {
                        type: '<',
                        value: 10000000
                    }
                },
                {
                    type: 'capitalname',
                    constraint: {
                        type: 'length',
                        value: 6
                    }
                },
                {
                    type: 'land_area',
                    constraint: {
                        type: '>',
                        value: 200000
                    }
                }
            ]
        );

        expect(testResult.length).equals(1);
        expect(testResult[0]).equals('oman');
    });


    it('should return correct result matching with list of clues', () => {
        const testClues = [
            {
                type: 'name',
                constraint: {
                    type: 'nocontains',
                    value: ' '
                }
            },
            {
                type: 'region',
                constraint: ['Europe', 'Asia', 'Middle East']
            },
            {
                type: 'population',
                constraint: {
                    type: '<',
                    value: 10000000
                }
            },
            {
                type: 'capitalname',
                constraint: {
                    type: 'length',
                    value: 6
                }
            },
            {
                type: 'land_area',
                constraint: {
                    type: '>',
                    value: 200000
                }
            }
        ];

        expect(_matchesClues('oman', testClues)).is.true;
        expect(_matchesClues('saudi_arabia', testClues)).is.false;
    });
})
