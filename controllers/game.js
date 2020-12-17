const GameState = require('../models/GameState');
const { _findID, _nameFromID } = require('../models/Countries');
const { _matchClue, _matchesClues, _getRemaingCountries, _generateClue } = require('../models/Clues');

/**
 * Display the page showing the overview of the game
 */
exports.getGameIndex = (req, res, next) => {
    res.render('game/index.ejs', { pageTitle: 'OneNation' });
};

let state = new GameState();

/**
 * Display game interface
 */
exports.getGame = (req, res, next) => {
    res.render('game/game.ejs', { pageTitle: 'Play - OneNation' });
};

/**
 * Handle some game API requests
 */
exports.postGame = (req, res, next) => {
    // Initial clue request
    if (req.body.action === 'clues') {
        res.send(JSON.stringify({
            clues: state.clues,
            remaining: _getRemaingCountries(state.clues).length,
            startTime: state.startTime
        }));
        return;
    }

    // Player is making a guess
    if (req.body.action === 'guess') {
        handleGuess(req, res);
        return;
    }

    // If player gives up, send answer
    if (req.body.action === 'giveup') {
        res.send(JSON.stringify({
            answer: _nameFromID(state.target)
        }));
        return;
    }
};

function handleGuess(req, res) {
    let country = _findID(req.body.guess);
    if (_matchesClues(country, state.clues)) {
        const remaining = _getRemaingCountries(state.clues).length;

        if (remaining !== 1) {
            state.clues = [...state.clues, _generateClue(state.target, state.clues)];
        } 

        res.send(JSON.stringify({
            correct: true,
            clues: state.clues,
            remaining: remaining,
            winner: remaining === 1,
        }));


    } else {
        res.send(JSON.stringify({
            correct: false,
            matching: state.clues.map(clue => _matchClue(country, clue)),
        }));
    }
}
