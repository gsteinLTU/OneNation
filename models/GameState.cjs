const { _pickCountry } = require('./Countries.cjs');
const { _generateClue } = require('./Clues.cjs');

module.exports = class GameState {
    constructor () {
        this.target = _pickCountry();
        this.clues = [_generateClue(this.target, [])];
        this.startTime = Date.now();
    }
}