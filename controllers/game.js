const GameState = require('../models/GameState');
const { _findID, _nameFromID } = require('../models/Countries');
const { _matchClue, _matchesClues, _getRemaingCountries, _generateClue } = require('../models/Clues');

/**
 * Display the page showing the overview of the game
 */
exports.getGameIndex = (req, res, next) => {
    res.render('game/index.ejs', { pageTitle: 'OneNation' });
};

/**
 * Display game interface
 */
exports.getGame = (req, res, next) => {
    if (req.session.gamestate == undefined){
        req.session.gamestate = new GameState();
    }

    res.render('game/game.ejs', { pageTitle: 'Play - OneNation', csrfToken: req.csrfToken() });
};

/**
 * Handle some game API requests
 */
exports.postGame = (req, res, next) => {

    if (req.session.gamestate == undefined){
        req.session.gamestate = new GameState();
    }

    // Initial clue request
    if (req.body.action === 'clues') {
        res.send(JSON.stringify({
            clues: req.session.gamestate.clues,
            remaining: _getRemaingCountries(req.session.gamestate.clues).length,
            startTime: req.session.gamestate.startTime
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
            answer: _nameFromID(req.session.gamestate.target)
        }));

        // Reset session's gamestate to prevent cheating
        req.session.gamestate = undefined;
        req.session.save();
        return;
    }
};

function handleGuess(req, res) {
    let country = _findID(req.body.guess);
    if (_matchesClues(country, req.session.gamestate.clues)) {
        const remaining = _getRemaingCountries(req.session.gamestate.clues).length;

        // If we need a new clue, add it
        if (remaining !== 1) {
            req.session.gamestate.clues = [...req.session.gamestate.clues, _generateClue(req.session.gamestate.target, req.session.gamestate.clues)];
        } 

        // Send state
        res.send(JSON.stringify({
            correct: true,
            clues: req.session.gamestate.clues,
            remaining: remaining,
            winner: remaining === 1,
        }));


    } else {
        res.send(JSON.stringify({
            correct: false,
            matching: req.session.gamestate.clues.map(clue => _matchClue(country, clue)),
        }));
    }
}
