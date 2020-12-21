var clues = [];
var remaining = [];
var timerTimeout;

// Updates the clues list on the page
function updateCluesList() {
    var tempClues = document.createElement('ul');

    for (var i = 0; i < clues.length; i++) {
        var tempRow = document.createElement('li');
        var tempText = document.createElement('h4');
        tempText.innerHTML = clueToString(clues[i]);
        tempRow.appendChild(tempText);
        tempClues.appendChild(tempRow);
    }

    $('#clues').html(tempClues.innerHTML);
    $('#remaining').text(remaining);
}

function increaseTimer() {
    var temp = $('#timer').text().split(':');

    if (temp[1] == '59') {
        temp[0]++;
        temp[1] = 0;
    } else {
        temp[1]++;
    }

    $('#timer').text(temp[0] + ':' + (temp[1] < 10 ? '0' : '') + temp[1]);
}

$(function () {
    $('#guess').val('');

    // Get initial clues
    startGame();

    $('#giveup').click(function () {
        endGame();
        $.post('/play', {action: 'giveup', _csrf:_csrf}, function (data) {
            endGame(false, JSON.parse(data).answer);
        });
    });
});

function startGame() {
    $.post('/play', { action: 'clues', _csrf:_csrf }, function (data) {
        const parsed = JSON.parse(data);
        // TODO: handle error cases
        clues = parsed.clues;
        remaining = parsed.remaining;
        updateCluesList();
        startTime = Math.round((Date.now() - parsed.startTime) / 1000);
        seconds = startTime % 60;
        $('#timer').text(`${Math.floor(startTime / 60)}:${seconds < 10? "0" : ""}${seconds}`)
        timerTimeout = setInterval(increaseTimer, 1000);

        $('#guess').change(function () {
            var guess = $('#guess').val();

            if (guess.length < 2) {
                return;
            }

            $.post('/play', { action: 'guess', guess: guess, _csrf:_csrf }, function (data) {
                // TODO: handle error cases
                var parsed = JSON.parse(data);
                console.log(parsed);
                if (parsed.correct) {
                    clues = parsed.clues;
                    remaining = parsed.remaining;
                    updateCluesList();
                    $('#guess').val('');

                    if(parsed.winner){
                        endGame(parsed.winner, parsed.answer);
                    }
                }

                if(parsed.matching == undefined) {
                    parsed.matching = clues.map(() => parsed.correct);
                }

                // Display right/wrong answers
                for (var i = 0; i < parsed.matching.length; i++) {
                    if (!parsed.correct && !parsed.matching[i]) {
                        $($('#clues li')[i]).css('color', 'red');
                    } else {
                        $($('#clues li')[i]).css('color', 'green');
                    }

                    setTimeout(function () {
                        $('#clues li').each(function (i) { $(this).css('color', 'inherit'); });
                    }, 1000);
                }
            });
        });
    });
}
function endGame(winner, answer) {
    clearTimeout(timerTimeout);
    $('#guess').prop("disabled", true);
    $('#giveup').addClass("disabled");
    
    if(answer != null){
        $('#answerfield').text(answer);
        if(winner){
            $('#winnertext').show();
        } else {
            $('#losertext').show();
        }

        $('#answer').show();
    }
}

