const GameState = require('../models/GameState');
const { _countriesList } = require('../models/Countries');
const { _matchClue } = require('../models/Clues');

const { expect } = require('chai');

describe('game state tests', () => {
    
    it('start time should be close to current time', () => {
        let state = new GameState();
        let delta = Math.abs(state.startTime - Date.now());
        expect(delta).is.lessThan(10);
    });

    it('should pick valid country', () => {
        let state = new GameState();
        expect(_countriesList.includes(state.target)).is.true;
    });

    it('should have one, valid clue', () => {
        let state = new GameState();
        expect(state.clues.length).equals(1);
        expect(_matchClue(state.target, state.clues[0])).is.true;
    });
});