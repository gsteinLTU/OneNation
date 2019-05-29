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

    // Some have peak listed wrong
    if (Object.keys(data['countries'][key]['data']['geography']).indexOf('elevation') === -1) {
        return false;
    }

    if (Object.keys(data['countries'][key]['data']['geography']['elevation']).indexOf('highest_point') === -1) {
        return false;
    }

    // Some territories that probably shouldn't be included
    if (Object.keys(data['countries'][key]['data']['government']).indexOf('capital') === -1) {
        return false;
    }

    // Excluding some very small nations
    if (Number.parseInt(data['countries'][key]['data']['people']['population']['total']) < 10000) {
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

            if (name.indexOf('/') !== -1 || name.indexOf(' or ') !== -1) {
                tempNames = name.split(/(\/| or )/g).filter(s => s !== ' or ');
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

        minData[c]['population'] = countryData['people']['population']['total'];
        minData[c]['region'] = countryData['geography']['map_references'];
        minData[c]['landlocked'] = countryData['geography']['coastline']['value'] == 0;

        if (countryData['geography']['area']['land'] !== undefined) {
            minData[c]['land_area'] = countryData['geography']['area']['land']['value'];
        } else {
            // Sudan/South Sudan had incorrect formatting, but it should be accurate enough
            minData[c]['land_area'] = countryData['geography']['area']['total']['value'];
        }

        if (countryData['geography']['elevation']['highest_point'] instanceof Object) {
            minData[c]['peak_elevation'] = countryData['geography']['elevation']['highest_point']['elevation']['value'];
        } else {
            // Data for Ecuador is formatted wrong
            minData[c]['peak_elevation'] = Number.parseInt(countryData['geography']['elevation']['highest_point'].split(' ')[1].replace(',', ''));
        }

        let capital = countryData['government']['capital']['name'];

        if (capital === undefined) {
            capital = countryData['government']['capital']['capital'];
        }


        if (capital === undefined) {
            delete minData[c];
            continue;
        }

        // Clean up names
        if (capital.indexOf(';') !== -1) {
            capital = capital.substr(0, capital.indexOf(';'));
        }

        capital = capital.replace(/ \(.+?\)/g, '');
        capital = capital.replace(',', '');

        minData[c]['capital'] = capital;
    }
}

fs.writeFileSync('./data/factbook-min.json', JSON.stringify(minData, null, 2));

console.log(`Wrote ${Object.keys(minData).length} countries to file.`);