const fs = require('fs');

const data = require('./data/factbook.json');

// Determines if a country should be included
const validCountry = key => {

    // The entire planet/EU is not a country
    if (key === 'world' || key === 'european_union') {
        return false;
    }

    // Some, e.g. oceans are included but have no population
    if (Object.keys(data['countries'][key]['data']).indexOf('people') === -1) {
        return false;
    }

    if (Object.keys(data['countries'][key]['data']['people']).indexOf('population') === -1) {
        return false;
    }

    // Excluding some very small nations
    if (Number.parseInt(data['countries'][key]['data']['people']['population']['total']) < 25000) {
        return false;
    }

    return true;
};

const countries = Object.keys(data['countries']);

const minData = {};

for (let c of countries) {
    if (validCountry(c)) {
        let countryData = data['countries'][c]['data'];

        minData[c] = {};

        // Get all names used
        let names = [];
        names.push(countryData['name']);

        for (let nametype of Object.keys(countryData['government']['country_name'])) {
            if (nametype === 'etymology' || nametype === 'note' || nametype === 'former') {
                continue;
            }

            let name = countryData['government']['country_name'][nametype];

            // Ignore invalid names
            if (name === 'none') {
                continue;
            }

            // Clean up names
            if (name.indexOf(';') !== -1) {
                name = name.substr(0, name.indexOf(';'));
            }

            if (name.indexOf('(') !== -1) {
                name = name.replace(/\(.+\)/g, '');
            }

            // Separate multi-name strings
            let tempNames;

            if (name.indexOf('/') !== -1) {
                tempNames = name.split('/');
            }
            else {
                tempNames = [name];
            }

            for (let n of tempNames) {
                if (names.indexOf(n) === -1) {
                    names.push(n.trim());

                    if (n.startsWith('The ')) {
                        names.push(n.substr(4).trim());
                    }
                }
            }
        }

        if (c === 'burma') {
            names.push('Myanmar');
        }

        minData[c]['names'] = names;
    }
}


fs.writeFileSync('./data/factbook-min.json', JSON.stringify(minData, null, 2));