var clues = [];
var remaining = [];

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
var numericClueToString = function (clue) {
    return cluetexts[clue.type] + ' ' + clue.constraint.type + ' ' + Number(clue.constraint.value).toLocaleString() + ' ' + numericClueUnits[clue.type];
};

// Makes string type clues into text descriptions
var stringClueToString = function (clue) {
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
var clueToString = function (clue) {
    if (numericClueTypes.indexOf(clue.type) !== -1) {
        return numericClueToString(clue);
    }

    if (stringClueTypes.indexOf(clue.type) !== -1) {
        return stringClueToString(clue);
    }

    return cluetexts[clue.type];
};

// Updates the clues list on the page
var updateCluesList = function () {
    var tempClues = document.createElement('ul');

    for (var i = 0; i < clues.length; i++) {
        var tempRow = document.createElement('li');
        var tempText = document.createElement('h4');
        tempText.innerHTML = clueToString(clues[i]);
        tempRow.appendChild(tempText);
        tempClues.appendChild(tempRow);
    }

    $('#clues').replaceWith(tempClues);
    $('#remaining').text(remaining.length);
};

var increaseTimer = function () {
    var temp = $('#timer').text().split(':');

    if (temp[1] == '59') {
        temp[0]++;
        temp[1] = 0;
    } else {
        temp[1]++;
    }

    $('#timer').text(temp[0] + ':' + (temp[1] < 10 ? '0' : '') + temp[1]);
    setTimeout(increaseTimer, 1000);
};

$(function () {
    $('#guess').val('');

    // Get intiial clues
    $.post('/play', { action: 'clues' }, function (data, status) {
        // TODO: handle error cases

        clues = JSON.parse(data).clues;
        remaining = JSON.parse(data).remaining;
        updateCluesList();
        setTimeout(increaseTimer, 1000);
    });
});