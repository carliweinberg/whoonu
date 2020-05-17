var username;
var hand;
var prevState;
var state;
var players = [];
var judgesPile = [];
var numberOfCards = 5;
var judgesOrderedPile = [];
var isStarted = false;
var isJudge = false;

var urlBase = "http://whoonu.carliweinberg.com";

function enterGame() {

    document.getElementById("pregame").style.display = "none";
    username = document.getElementById("username").value;
    fetch(urlBase + '/players', {
        method: 'post',
        body: username
    }).then(function (response) {
        return response.text();
    }).then(function (responseData) {
        createBoard();
        startGameLoop();
    });
}

function createBoard() {
    var buttonDiv = document.getElementById("myHandDiv");

    for (var i = 0; i < numberOfCards; i++) {
        var node = document.createElement("BUTTON");
        node.setAttribute("id", "button" + i);
        var textnode = document.createTextNode(i);
        node.appendChild(textnode);
        node.addEventListener("click", function () {
            cardSelected(this);
        });
        buttonDiv.appendChild(node);
    }
}

function startGame() {
    fetch(urlBase + '/game', {
        method: 'post',
        body: ""
    }).then(function (response) {
        return response.text();
    }).then(function (responseData) {
        // console.log(responseData);
    });
}

function startGameLoop() {
    window.setInterval(function () {
        getGameInfo();
    }, 1000);
}

function getGameInfo() {
    fetch(urlBase + '/game', {
        method: 'get'
    }).then(function (response) {
        return response.json();
    }).then(function (responseData) {

        players = [];
        for (var i = 0; i < responseData.players.length; i++) {
            if (responseData.players[i].username == username) {
                hand = responseData.players[i].hand;
                isJudge = responseData.players[i].isJudge
            }
            var player = {
                username: responseData.players[i].username,
                score: responseData.players[i].score,
                isJudge: responseData.players[i].isJudge
            }
            players.push(player);
        }
        prevState = state;
        state = responseData.state;
        isStarted = responseData.isStarted;
        judgesPile = responseData.judgesPileCards;

        if (state == "WAITING_FOR_RESPONSES") {
            judgesOrderedPile = responseData.judgesOrdered;

            ////clear cards submitted to judge


        }

        if (prevState == "WAITING_FOR_RESPONSES" && state == "WAITING_FOR_JUDGE") {
            var judgesOrderingList = document.getElementById("judgesOrdering");
            while (judgesOrderingList.hasChildNodes()) {
                judgesOrderingList.removeChild(judgesOrderingList.firstChild);
            }
            
            judgesOrderedPile = [];
        }
        
        ///
        
        ///

        createJudgesPileButtonsIfEmpty();

        updateGameView();
    });
}

function createJudgesPileButtonsIfEmpty() {
    var judgePileDiv = document.getElementById("judgePileDiv");

    if (judgePileDiv.childElementCount == players.length - 1) {
        return;
    }

    while (judgePileDiv.hasChildNodes()) {
        judgePileDiv.removeChild(judgePileDiv.firstChild);
    }

    for (var i = 0; i < players.length - 1; i++) {
        var node = document.createElement("BUTTON");
        node.setAttribute("id", "judgePileButton" + i);
        var textnode = document.createTextNode(i);
        node.appendChild(textnode);
        node.addEventListener("click", function () {
            /// judge selected card
            var judgesOrderingList = document.getElementById("judgesOrdering");
            var cardName = this.textContent;
            var node = document.createElement("LI");
            var textNode = document.createTextNode(cardName);
            node.appendChild(textNode);
            judgesOrderedPile.push(cardName);
            judgesOrderingList.appendChild(node);
            if (judgesOrderingList.childElementCount == players.length - 1) {
                judgeSubmitting();
            }
        });
        judgePileDiv.appendChild(node);
    }
}

function judgeSubmitting() {
    if (isJudge) {
        fetch(urlBase + '/judgeSubmit', {
            method: 'post',
            body: judgesOrderedPile
        }).then(function (response) {
            return response.text();
        }).then(function (responseData) {
            
        });
    }
}

function updateGameView() {
    if(isStarted){
        document.getElementById("startGameDiv").style.display = "none";
    }

    var playersUl = document.getElementById("playersList");
    while (playersUl.hasChildNodes()) {
        playersUl.removeChild(playersUl.firstChild);
    }

    for (var i = 0; i < players.length; i++) {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(players[i].username + ": " + players[i].score + (players[i].isJudge ? " (Judge)" : ""));
        node.appendChild(textnode);
        playersUl.appendChild(node);
    }

    for (var i = 0; i < numberOfCards; i++) {
        document.getElementById("button" + i).innerText = hand[i];
    }
    if (state == "WAITING_FOR_RESPONSES") {
        document.getElementById("gameState").innerText = "Waiting For Responses";
    } else {
        document.getElementById("gameState").innerText = "Waiting For Judging";
    }

    if (state == "WAITING_FOR_JUDGE") {
        for (var i = 0; i < judgesPile.length; i++) {
            document.getElementById("judgePileButton" + i).innerText = judgesPile[i];
        }
    } else {
        //for (var i = 0; i < judgesPile.length; i++) {
        for (var i = 0; i < players.length-1; i++) {
            document.getElementById("judgePileButton" + i).innerText = "";
        }
    }

    if (state == "WAITING_FOR_RESPONSES") {
        var judgesOrderingList = document.getElementById("judgesOrdering");

        while (judgesOrderingList.hasChildNodes()) {
            judgesOrderingList.removeChild(judgesOrderingList.firstChild);
        }

        for (var i = 0; i < judgesOrderedPile.length; i++) {
            var node = document.createElement("LI");
            var textNode = document.createTextNode(judgesOrderedPile[i]);
            node.appendChild(textNode);
            judgesOrderingList.appendChild(node);
        }
    }
}

function cardSelected(theButton) {
    fetch(urlBase + '/submitToJudge', {
        method: 'post',
        body: username + "," + theButton.textContent
    }).then(function (response) {
        return response.text();
    }).then(function (responseData) {

    });
}

function endGame(){
    fetch(urlBase + '/endGame', {
        method: 'post',
        body: ""
    }).then(function (response) {
        return response.text();
    }).then(function (responseData) {

    });
}