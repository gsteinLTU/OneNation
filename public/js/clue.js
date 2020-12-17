var cluetexts = {
    'land_area': 'Land Area',
    'population': 'Population',
    'peak_elevation': 'Peak Elevation',
    'name': 'Name',
    'capitalname': 'Capital Name',
    'landlocked': 'Landlocked',
    'region': 'Region',
};

var numericClueTypes = [
    'population',
    'peak_elevation',
    'land_area',
];

var stringClueTypes = [
    'name',
    'capitalname',
];

var numericClueUnits = {
    'population': 'people',
    'peak_elevation': 'm',
    'land_area': 'km<sup>2</sup>',
};

// Makes numeric type clues into text descriptions
function numericClueToString(clue) {
    return cluetexts[clue.type] + ' ' + clue.constraint.type + ' ' + Number(clue.constraint.value).toLocaleString() + ' ' + numericClueUnits[clue.type];
};

// Makes string type clues into text descriptions
function stringClueToString(clue) {
    var output = cluetexts[clue.type] + ' ';

    if (clue.constraint.type === 'startsWith') {
        output += ' starts with ' + clue.constraint.value;
    }

    if (clue.constraint.type === 'endsWith') {
        output += ' ends with ' + clue.constraint.value;
    }

    if (clue.constraint.type === 'contains') {
        output += ' contains ' + clue.constraint.value;
    }

    if (clue.constraint.type === 'nocontains') {
        output += ' does not contain ' + clue.constraint.value;
    }

    if (clue.constraint.type === 'length') {
        output += ' is ' + clue.constraint.value + ' letters long';
    }

    return output;
};

// Turns a clue object into a text description
function clueToString(clue) {
    if (numericClueTypes.indexOf(clue.type) !== -1) {
        return numericClueToString(clue);
    }

    if (stringClueTypes.indexOf(clue.type) !== -1) {
        return stringClueToString(clue);
    }

    if (clue.type === 'landlocked') {
        return 'Is ' + (clue.constraint === true ? '' : 'not ') + 'landlocked';
    }

    if (clue.type === 'region') {
        return regionClueToString(clue);
    }

    return cluetexts[clue.type];
};

function regionClueToString(clue) {
    var temp = '';

    if (clue.constraint.length > 1) {
        for (var i = 0; i < clue.constraint.length - 1; i++) {
            temp += clue.constraint[i] + ', ';
        }

        temp += 'or ' + clue.constraint[clue.constraint.length - 1];

    } else {
        temp = clue.constraint[0];
    }

    return 'In ' + temp;
}