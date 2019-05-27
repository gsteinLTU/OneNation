const data = require('../data/factbook-min.json');

const countriesList = Object.keys(data);

/**
 * Get a random country key for non-tiny countries
 */
exports._pickCountry = () => {
    const possible = countriesList.filter(c => data[c].population > 100000);
    return possible[Math.floor(Math.random() * possible.length)];
}

_testStringClue = (string, clue) => {
    if (clue.constraint.type === 'startsWith') {
        return string.toLowerCase().startsWith(clue.constraint.value.toLowerCase());
    }

    if (clue.constraint.type === 'endsWith') {
        return string.toLowerCase().endsWith(clue.constraint.value.toLowerCase());
    }

    if (clue.constraint.type === 'contains') {
        return string.toLowerCase().indexOf(clue.constraint.value.toLowerCase()) !== -1;
    }

    return false;
}

_testNumericClue = (value, clue) => {
    if (clue.constraint.type === '>') {
        return value >= clue.constraint.value;
    } else {
        return value <= clue.constraint.value;
    }
}
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
 * Generate the next clue in the sequence
 */
exports._generateClue = (country, existingClues) => {
    const countryData = data[country];

    const newClue = {};



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

