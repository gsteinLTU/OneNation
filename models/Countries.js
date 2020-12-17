const data = require('../data/factbook-min.json');
exports._countriesList = Object.keys(data);

/**
 * Get a random country key for non-tiny countries
 */
exports._pickCountry = () => {
    const possible = exports._countriesList.filter(c => data[c].population > 100000);
    return possible[Math.floor(Math.random() * possible.length)];
}

/**
 * Find an id in the countries list for a name
 */
exports._findID = (name) => {
    let match = exports._countriesList.filter(id => {
        return data[id].names.map(name => name.toLowerCase()).indexOf(name.toLowerCase()) !== -1;
    });

    if (match.length > 0) {
        return match[0];
    } else {
        return null;
    }
}

/**
 * Get the printable name from an ID
 * @param {String} id 
 * @returns {String}
 */
exports._nameFromID = (id) => {
    return data[id].names[0];
}