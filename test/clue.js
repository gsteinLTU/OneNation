const { _matchClue } = require('../controllers/game');
const { expect } = require('chai');

describe('clue tests', () => {

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