const data = require('../data/factbook-min.json');

const countriesList = Object.keys(data);

/**
 * Get a random country key for non-tiny countries
 */
exports._pickCountry = () => {
    const possible = countriesList.filter(c => data[c].population > 100000);
    return possible[Math.floor(Math.random() * possible.length)];
}

/**
 * Determine if a country matches a clue
 */
exports._matchClue = (country, clue) => {
    const countryData = data[country];

    switch (clue.type) {
        case 'name':
            if (clue.constraint.type === 'startsWith') {
                return countryData.names[0].toLowerCase().startsWith(clue.constraint.value.toLowerCase());
            }

            if (clue.constraint.type === 'endsWith') {
                return countryData.names[0].toLowerCase().endsWith(clue.constraint.value.toLowerCase());
            }

            if (clue.constraint.type === 'contains') {
                return countryData.names[0].toLowerCase().indexOf(clue.constraint.value.toLowerCase()) !== -1;
            }
            break;
        case 'capitalname':
            if (clue.constraint.type === 'startsWith') {
                return countryData.capital.toLowerCase().startsWith(clue.constraint.value.toLowerCase());
            }

            if (clue.constraint.type === 'endsWith') {
                return countryData.capital.toLowerCase().endsWith(clue.constraint.value.toLowerCase());
            }

            if (clue.constraint.type === 'contains') {
                return countryData.capital.toLowerCase().indexOf(clue.constraint.value.toLowerCase()) !== -1;
            }
            break;
        case 'population':
            if (clue.constraint.type === '>') {
                return countryData.population >= clue.constraint.value;
            } else {
                return countryData.population <= clue.constraint.value;
            }
        case 'landlocked':
            return countryData.landlocked === clue.constraint;
        case 'region':
            return clue.constraint.indexOf(countryData.region) !== -1;
        case 'peak_elevation':
            if (clue.constraint.type === '>') {
                return countryData.peak_elevation >= clue.constraint.value;
            } else {
                return countryData.peak_elevation <= clue.constraint.value;
            }
        case 'land_area':
            if (clue.constraint.type === '>') {
                return countryData.land_area >= clue.constraint.value;
            } else {
                return countryData.land_area <= clue.constraint.value;
            }
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

