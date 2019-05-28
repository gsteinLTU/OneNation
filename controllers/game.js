const data = require('../data/factbook-min.json');

const _countriesList = Object.keys(data);
exports._countriesList = _countriesList;

/**
 * Get a random country key for non-tiny countries
 */
exports._pickCountry = () => {
    const possible = _countriesList.filter(c => data[c].population > 100000);
    return possible[Math.floor(Math.random() * possible.length)];
}

/**
 * Tests if a string matches a clue
 * @param {String} string String to test 
 * @param {Object} clue Clue to match
 */
function _testStringClue(string, clue) {
    if (clue.constraint.type === 'startsWith') {
        return string.toLowerCase().startsWith(clue.constraint.value.toLowerCase());
    }

    if (clue.constraint.type === 'endsWith') {
        return string.toLowerCase().endsWith(clue.constraint.value.toLowerCase());
    }

    if (clue.constraint.type === 'contains') {
        return string.toLowerCase().indexOf(clue.constraint.value.toLowerCase()) !== -1;
    }

    if (clue.constraint.type === 'nocontains') {
        return string.toLowerCase().indexOf(clue.constraint.value.toLowerCase()) === -1;
    }

    if (clue.constraint.type === 'length') {
        return string.length === clue.constraint.value;
    }

    return false;
}

/**
 * Test if a value matches a clue
 * @param {Number} value Number to compare to clue value
 * @param {Object} clue Clue to match
 */
function _testNumericClue(value, clue) {
    if (clue.constraint.type === '>') {
        return value >= clue.constraint.value;
    } else {
        return value <= clue.constraint.value;
    }
}

/**
 * List of clue types
 */
const _clueTypes = ['name',
    'capitalname',
    'population',
    'landlocked',
    'region',
    'peak_elevation',
    'land_area',
];

/**
 * Determine if a country matches a clue
 */
exports._matchClue = (country, clue) => {
    const countryData = data[country];

    switch (clue.type) {
        case 'name':
            return _testStringClue(countryData.names[0], clue);
        case 'capitalname':
            return _testStringClue(countryData.capital, clue);
        case 'population':
            return _testNumericClue(countryData.population, clue);
        case 'landlocked':
            return countryData.landlocked === clue.constraint;
        case 'region':
            return clue.constraint.indexOf(countryData.region) !== -1;
        case 'peak_elevation':
            return _testNumericClue(countryData.peak_elevation, clue);
        case 'land_area':
            return _testNumericClue(countryData.land_area, clue);
    }

    return false;
}

/**
 * Get countries remaining with clues
 * @param {Array} existingClues 
 */
exports._getRemaingCountries = (existingClues) => {
    return _countriesList.filter(c => existingClues.every(clue => exports._matchClue(c, clue)));
};

/**
 * Generate the next clue in the sequence
 */
exports._generateClue = (country, existingClues) => {
    const countryData = data[country];

    const newClue = {};

    // Get clue types that weren't used yet
    const remainingTypes = _clueTypes.filter(type => existingClues.find(clue => clue.type === type) === undefined);

    // Find countries that match all existing clues



    return newClue;
};

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

