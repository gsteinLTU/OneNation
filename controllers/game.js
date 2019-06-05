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

const _regions = [
    'Africa',
    'Asia',
    'Central America and the Caribbean',
    'Europe',
    'Middle East',
    'North America',
    'Oceania',
    'South America',
    'Southeast Asia'
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

exports._matchesClues = (country, clues) => {
    return clues.every(clue => exports._matchClue(country, clue));
}

/**
 * Get countries remaining with clues
 * @param {Array} existingClues 
 * @param {Array=} countries
 */
exports._getRemaingCountries = (existingClues, countries = null) => {
    if (countries === null) {
        countries = _countriesList;
    }

    return _countriesList.filter(c => exports._matchesClues(c, existingClues));
};

function _addNumericClues(possibleClues, countryData, type) {
    let base = Math.pow(10, Math.floor(Math.log10(countryData[type])));

    possibleClues.push({
        type: type,
        constraint: {
            type: '<',
            value: base * Math.ceil((countryData[type] * (Math.random() + 1.05)) / base)
        }
    });

    possibleClues.push({
        type: type,
        constraint: {
            type: '>',
            value: base * Math.floor((countryData[type] * (Math.random() / 2.0 + 0.25)) / base)
        }
    });
}


function _addStringClues(possibleClues, value, type) {
    possibleClues.push({
        type: type,
        constraint: {
            type: 'startswith',
            value: value[0]
        }
    });

    possibleClues.push({
        type: type,
        constraint: {
            type: 'endswith',
            value: value[value.length - 1]
        }
    });

    for (let i = 'A'; i <= 'Z'; i++) {
        if (value.toUpperCase().indexOf(i) !== -1) {
            possibleClues.push({
                type: type,
                constraint: {
                    type: 'contains',
                    value: i
                }
            });
        } else {
            possibleClues.push({
                type: type,
                constraint: {
                    type: 'nocontains',
                    value: i
                }
            });
        }
    }

    possibleClues.push({
        type: type,
        constraint: {
            type: 'length',
            value: value.length
        }
    });
}
/**
 * Generate the next clue in the sequence
 */
exports._generateClue = (country, existingClues) => {
    const countryData = data[country];

    // Get clue types that weren't used yet
    const remainingTypes = _clueTypes.filter(type => existingClues.find(clue => clue.type === type) === undefined);

    // Failsafe
    if (remainingTypes.length === 0) {
        remainingTypes.push('name');
    }

    // Find countries that match all existing clues
    const remainingCountries = exports._getRemaingCountries(existingClues);

    const possibleClues = [];

    if (remainingTypes.indexOf('name') !== -1) {
        _addStringClues(possibleClues, countryData.names[0], 'name');
    }

    if (remainingTypes.indexOf('capitalname') !== -1) {
        _addStringClues(possibleClues, countryData.capital, 'capitalname');
    }

    if (remainingTypes.indexOf('landlocked') !== -1) {
        possibleClues.push({
            type: 'landlocked',
            constraint: countryData.landlocked
        });
    }

    if (remainingTypes.indexOf('population') !== -1) {
        _addNumericClues(possibleClues, countryData, 'population');
    }

    if (remainingTypes.indexOf('peak_elevation') !== -1) {
        _addNumericClues(possibleClues, countryData, 'peak_elevation');
    }

    if (remainingTypes.indexOf('land_area') !== -1) {
        _addNumericClues(possibleClues, countryData, 'land_area');
    }

    if (remainingTypes.indexOf('region') !== -1) {
        possibleClues.push({
            type: 'region',
            constraint: _regions.filter(region => region === countryData.region || Math.random() > 0.8)
        });
    }

    // Find clue that gets closest to half remaining
    const scores = possibleClues.map(clue => Math.abs(exports._getRemaingCountries([...existingClues, clue], remainingCountries).length - remainingCountries.length / 2));

    return possibleClues[scores.indexOf(Math.min(...scores))];
};

/**
 * Display the page showing the overview of the game
 */
exports.getGameIndex = (req, res, next) => {
    res.render('game/index.ejs', { pageTitle: 'OneNation' });
};

let target = exports._pickCountry();
let clues = [exports._generateClue(target, [])];
/**
 * Display game interface
 */
exports.getGame = (req, res, next) => {
    let target = exports._pickCountry();
    let clues = [exports._generateClue(target, [])];
    res.render('game/game.ejs', { pageTitle: 'Play - OneNation' });
};

/**
 * Handle some game API requests
 */
exports.postGame = (req, res, next) => {
    if (req.body.action === 'clues') {
        res.send(JSON.stringify({
            clues: clues,
            remaining: exports._getRemaingCountries(clues)
        }));
    }

    if (req.body.action === 'guess') {
        res.send(JSON.stringify({
            correct: exports._matchesClues(req.body.guess, clues),
            clues: clues,
            remaining: exports._getRemaingCountries(clues)
        }));
    }
};