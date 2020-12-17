const { _pickCountry } = require('../models/Countries');
const { _generateClue } = require('../models/Clues');

module.exports = class GameState {
    constructor () {
        this.target = _pickCountry();
        this.clues = [_generateClue(this.target, [])];
        this.startTime = Date.now();
    }
}