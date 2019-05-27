const data = require('../data/factbook-min.json');

const countriesList = Object.keys(data);

/**
 * Get a random country key for non-tiny countries
 */
_pickCountry = () => {
    let possible = countriesList.filter(c => data[c].population > 100000);
    return possible[Math.floor(Math.random() * possible.length)];
}

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
    res.render('game/game.ejs', { pageTitle: 'Play - OneNation' });
};

/**
 * Handle some game API requests
 */
exports.postGame = (req, res, next) => {
    res.send('hi');
};

