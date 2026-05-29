const data = require('../data/countries.json');
const { _countriesList } = require('./Countries.cjs');

const _clueTypes = [
    'name',
    'capitalname',
    'population',
    'landlocked',
    'region',
    'subregion',
    'land_area',
    'borders',
    'car_side',
];

function _testStringClue(string, clue) {
    switch (clue.constraint.type) {
        case 'startsWith':  return string.toLowerCase().startsWith(clue.constraint.value.toLowerCase());
        case 'endsWith':    return string.toLowerCase().endsWith(clue.constraint.value.toLowerCase());
        case 'contains':    return string.toLowerCase().includes(clue.constraint.value.toLowerCase());
        case 'nocontains':  return !string.toLowerCase().includes(clue.constraint.value.toLowerCase());
        case 'length':      return string.length === clue.constraint.value;
        default:            return false;
    }
}

function _testNumericClue(value, clue) {
    return clue.constraint.type === '>' ? value >= clue.constraint.value : value <= clue.constraint.value;
}

exports._matchClue = (country, clue) => {
    const countryData = data[country];
    if (!countryData) return false;

    switch (clue.type) {
        case 'name':        return _testStringClue(countryData.names[0], clue);
        case 'capitalname': return _testStringClue(countryData.capital, clue);
        case 'population':  return _testNumericClue(countryData.population, clue);
        case 'landlocked':  return countryData.landlocked === clue.constraint;
        case 'region':      return clue.constraint.includes(countryData.region);
        case 'subregion':   return clue.constraint.includes(countryData.subregion);
        case 'land_area':   return _testNumericClue(countryData.land_area, clue);
        case 'borders':     return _testNumericClue(countryData.borders, clue);
        case 'car_side':    return countryData.car_side === clue.constraint;
        default:            return false;
    }
};

exports._matchesClues = (country, clues) => clues.every(clue => exports._matchClue(country, clue));

exports._getRemaingCountries = (existingClues) => {
    return _countriesList.filter(c => exports._matchesClues(c, existingClues));
};

function _addNumericClues(possibleClues, countryData, type) {
    const val = countryData[type];
    if (val <= 0) {
        // e.g. island nations with 0 borders — only meaningful clue is "< 1"
        possibleClues.push({ type, constraint: { type: '<', value: 1 } });
        return;
    }
    const base = Math.pow(10, Math.floor(Math.log10(val)));
    possibleClues.push({
        type,
        constraint: { type: '<', value: base * Math.ceil((val * (Math.random() + 1.05)) / base) }
    });
    possibleClues.push({
        type,
        constraint: { type: '>', value: base * Math.floor((val * (Math.random() / 2.0 + 0.25)) / base) }
    });
}

function _addStringClues(possibleClues, value, type) {
    possibleClues.push({ type, constraint: { type: 'startsWith', value: value[0] } });
    possibleClues.push({ type, constraint: { type: 'endsWith', value: value[value.length - 1] } });

    for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
        const letter = String.fromCharCode(i);
        possibleClues.push({
            type,
            constraint: {
                type: value.toUpperCase().includes(letter) ? 'contains' : 'nocontains',
                value: letter,
            }
        });
    }

    possibleClues.push({ type, constraint: { type: 'length', value: value.length } });
}

exports._selectBestClue = (candidates, existingClues, remainingCountries) => {
    const scores = candidates.map(clue =>
        Math.abs(exports._getRemaingCountries([...existingClues, clue]).length - remainingCountries.length / 2)
    );
    return candidates[scores.indexOf(Math.min(...scores))];
};

exports._generateClue = (country, existingClues) => {
    const countryData = data[country];
    const remainingTypes = _clueTypes.filter(type => !existingClues.find(c => c.type === type));

    if (remainingTypes.length === 0) remainingTypes.push('name');

    const remainingCountries = exports._getRemaingCountries(existingClues);
    const candidates = [];

    if (remainingTypes.includes('name'))        _addStringClues(candidates, countryData.names[0], 'name');
    if (remainingTypes.includes('capitalname')) _addStringClues(candidates, countryData.capital, 'capitalname');
    if (remainingTypes.includes('landlocked'))  candidates.push({ type: 'landlocked', constraint: countryData.landlocked });
    if (remainingTypes.includes('car_side'))    candidates.push({ type: 'car_side', constraint: countryData.car_side });
    if (remainingTypes.includes('region'))      candidates.push({ type: 'region', constraint: [countryData.region] });
    if (remainingTypes.includes('subregion'))   candidates.push({ type: 'subregion', constraint: [countryData.subregion] });

    for (const type of ['population', 'land_area', 'borders']) {
        if (remainingTypes.includes(type)) _addNumericClues(candidates, countryData, type);
    }

    return exports._selectBestClue(candidates, existingClues, remainingCountries);
};
