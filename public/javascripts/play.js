
$(document).ready(function(){
    var socket = io.connect();


    socket.emit('player joined', username);


    socket.on('the room is full', function(){
        alert('sorry the room is full');
        return;
    })
    //the server tells that I am the first player
    socket.on('you are the first player', function(){
        $('#overlay').css("display", "flex");
        /*
        player1 = new Player(data, 0);
        playerReady = true;
        socket.emit('first player ready', player1);
        */
    });

    //server tells that the second player has just joined
    socket.on('fist player second player has joined', function(player2Name){
        $('#overlay').css("display", "none");
        $("#namePlayer2").text(player2Name);
    })


    //server tells that I am the second player, and send me the name of the first player
    socket.on('you are second player', function(player1Name){
        $("#namePlayer1").text(player1Name);
        $('#namePlayer2').text(username);
        //then we tell the server that the players are ready
        socket.emit('players are ready');
    })

    //after telling the server that players are ready, it send us initialisation data
    socket.on('initialize game', function(data){
        //we hide other player cards
        var game = new Game('stage', data);
        start();
    });

    //the first player distributed cards for the first time
    socket.on('first distribution', function(){
        // shuffle and deal cards
        dealCards(); //dealcards is the function wich distribute cards
        started = true; //then we set the started as true; cause the game has been started
    });

    //now the game has just been started, now we wait for click event on cards;
    socket.on('distribute cards', function(){
        dealCards();
    });

    //when the first player played
    socket.on('player 1 played', function(data){
        play(player1, data);
    });

    socket.on('player 2 played', function(data){
        play(player2, data);
    });






    var currentPlayer ;
    var lastPlayer = null;
    var cards ; //cards
    var cardsInTable;
    var posCardsPack = new Array(
        {x:0, y:350},///First user
        {x:0, y:100}///second player
    );
    var player1;
    var player2;
    var pack1;
    var pack2;
    var started = false;


    var posCardsInTable;

    var Game = function(targetId, data)
    {
        var initGame = function()
        {

            currentPlayer = data[0].currentplayer;
            lastPlayer = null;
            cards = data[0].cards; //cards
            cardsInTable = data[0].cardsInTable;
            ///init Players
            player1 = data[0].player1;
            player2 = data[0].player2;

            ///packs of cards
            pack1 = [];
            pack2 = [];

            posCardsInTable = data[0].posCardsInTable;
            ///Set div score off players
            document.getElementById("namePlayer1").innerText = player1.name;
            document.getElementById("namePlayer2").innerText = player2.name;
            document.getElementById("scorePlayer1").innerText = player1.score;
            document.getElementById("scorePlayer2").innerText = player2.score;

            ///Set The current player
            currentPlayer = data[0].player1;
            document.getElementById("leftPointer").innerText = "<";




            ///Init board
            var stage = document.getElementById(targetId);
            var felt = document.createElement("div");
            felt.id = "felt";
            stage.appendChild(felt);

            // template for card
            var card = document.createElement("div");
            card.style="height:90px;width:59px; background-image: url('../images/cards/back.png');";

            /// We began by 4 Cards in the table
            for(var i=0; i<4; i++)
            {
                var newCard = card.cloneNode(true);

                newCard.fromtop = posCardsInTable[cardsInTable.length].y;
                newCard.fromleft = posCardsInTable[cardsInTable.length].x;
                posCardsInTable[cardsInTable.length].free = false;
                cards[i].div = newCard;
                cards[i].div.style="height:90px;width:59px; background-image: url('../images/cards/back.png');";

                cardsInTable.push(cards[i]);

                (function(idx) {
                    newCard.addEventListener("click", function() { cardClick(idx); }, false);
                })(i);
                felt.appendChild(newCard);
            }

            /// Init cards for both players
            var count=0;
            for(var i=4; i<40; i++)
            {
                if(count == 6)
                    count=0;
                var newCard = card.cloneNode(true);

                newCard.fromtop = 71 + 303 * Math.floor(count/3);
                newCard.fromleft = 170 + 100 * (count%3);
                cards[i].div = newCard;

                (function(idx) {
                    newCard.addEventListener("click", function() { cardClick(idx); }, false);
                })(i);
                felt.appendChild(newCard);
                count++;
            }
        }


        initGame();
    }

    var playPC = function()
    {
        var cardsToPlay;
        for(var i=0; i<player2.hand.length; i++)
            if(player2.hand[i] != null)
                cardsToPlay = player2.hand[i];

        var idCardsToPlay = indexOfObject(cards, cardsToPlay);
        /*  var indPos = getTheFirstPlaceAvai();

         cardsToPlay.div.fromtop = posCardsInTable[indPos].y;
         cardsToPlay.div.fromleft = posCardsInTable[indPos].x;
         posCardsInTable[indPos].free = false;
         cardsInTable.push(cards[idCardsToPlay]);

         ///Remove cards from player2's hand (PC's hand)
         var indexToRemove = indexOfObject(player2.hand, cards[idCardsToPlay]);
         player2.hand[indexToRemove] = null;
         ///Delay PC
         setTimeout(function(){moveToPlace(idCardsToPlay, true);}, 1000);
         //changePlayer();*/
    /////
        if(currentPlayer === player2)
        {
            if(inHand(player2, idCardsToPlay))
            {
                ///Remove cards from player1's hand
                var indexToRemove = indexOfObject(player2.hand, cards[idCardsToPlay]);
                player2.hand[indexToRemove] = null;

                if(inTable(idCardsToPlay).length)
                    eatCards(idCardsToPlay);
                else
                {
                    //alert("Place it in the table at "+getTheFirstPlaceAvai());
                    var indPos = getTheFirstPlaceAvai();
                    cards[idCardsToPlay].div.fromtop = posCardsInTable[indPos].y;
                    cards[idCardsToPlay].div.fromleft = posCardsInTable[indPos].x;
                    posCardsInTable[indPos].free = false;
                    cardsInTable.push(cards[idCardsToPlay]);

                    setTimeout(function(){moveToPlace(idCardsToPlay, true);}, 0);
                }
                changePlayer();
            }
        }
    }

    var moveLastCards = function()
    {
        var pos;
        var id;
        if(lastPlayer === player1)
            pos = 0;
        else
            pos = 1;

        lastPlayer.score += cardsInTable.length;
        if(lastPlayer === player1)
            document.getElementById("scorePlayer1").innerText = lastPlayer.score;
        else
            document.getElementById("scorePlayer2").innerText = lastPlayer.score;

        for(var i=0; i<cardsInTable.length; i++)
        {
            id = indexOfObject(cards, cardsInTable[i]);
            cards[id].div.fromtop = posCardsPack[pos].y;
            cards[id].div.fromleft = posCardsPack[pos].x;
            moveToPack(id, true);
        }
    }

    var changePlayer = function(array)
    {
        if((player1.score + player2.score + cardsInTable.length) === 40)///Fin du match
        {
            moveLastCards();
            showWinner();
            return;
        }

        if(currentPlayer === player1)
        {
            currentPlayer = player2;
            document.getElementById("leftPointer").innerText = "";
            document.getElementById("rightPointer").innerText = ">";
            //setTimeout(function(){playPC();}, 1000);
        }
        else
        {
            currentPlayer = player1;
            document.getElementById("rightPointer").innerText = "";
            document.getElementById("leftPointer").innerText = "<";
        }
    }

    var validShuffle = function()
    {
        for(var i=0; i<3; i++)
            for(var y=i+1; y<4; y++)
                if(cards[i].number === cards[y].number)
                    return false;
        return true;
    }

    var shuffle = function(array)
    {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex)
        {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    var moveToPack = function(id, type) // deal card
    {
        if(type === true)
        {
            with(cards[id].div.style)
            {
                zIndex = "1000";
                top = cards[id].div.fromtop + "px";
                left = cards[id].div.fromleft + "px";
                transitionDuration ="1.5s";
                //WebkitTransform = MozTransform = OTransform = msTransform = "rotate(360deg)";
                zIndex = "0";
            }
        }
        else
        {
            style = "height:90px;width:59px; background-image: url('../images/cards/"+cards[id].number+cards[id].type+".png');";
            cards[id].div.style = style;
            with(cards[id].div.style)
            {
                zIndex = "1000";
                top = cards[id].div.fromtop + "px";
                left = cards[id].div.fromleft + "px";
                transitionDuration ="1.5s";
                WebkitTransform = MozTransform = OTransform = msTransform = "rotate(360deg)";
                zIndex = "0";
            }
        }
    };

    var moveToPlace = function(id, show) // deal card
    {
        if(show)
        {
            style = "height:90px;width:59px; background-image: url('../images/cards/"+cards[id].number+cards[id].type+".png');";
            cards[id].div.style = style;
        }
        with(cards[id].div.style)
        {
            zIndex = "1000";
            top = cards[id].div.fromtop + "px";
            left = cards[id].div.fromleft + "px";
            WebkitTransform = MozTransform = OTransform = msTransform = "rotate(360deg)";
            zIndex = "0";
        }
    };
    /*
     var moveToTable = function(id) // deal card
     {
     with(cards[id].div.style)
     {
     zIndex = "1000";
     top = cards[id].div.fromtop + "px";
     left = cards[id].div.fromleft + "px";
     //WebkitTransform = MozTransform = OTransform = msTransform = "rotate(360deg)";
     zIndex = "0";
     }
     };
     */
    var dealCards = function()
    {
        player1.hand = [];
        player2.hand = [];
        if(started)
        {
            //get the number of distributed cards
            var nbrCarte = cardsInTable.length + pack1.length + pack2.length;

            var count=0;
            for(var i=nbrCarte; i<nbrCarte+6; i++)
            {
                if(count<3)///Player 2
                {
                    player2.hand.push(cards[i]);
                    (function(idx) {
                        if(getPlayerOrder(username) == 2)
                            setTimeout(function() { moveToPlace(idx, true); }, idx * 50);
                        else if(getPlayerOrder(username) == 1)
                            setTimeout(function() { moveToPlace(idx, false); }, idx * 50);
                    })(i);
                }
                else ///Player 1
                {
                    player1.hand.push(cards[i]);
                    (function(idx) {
                        if(getPlayerOrder(username) == 1)
                            setTimeout(function() { moveToPlace(idx, true); }, idx * 50);
                        else if(getPlayerOrder(username) == 2)
                            setTimeout(function() { moveToPlace(idx, false); }, idx * 50);
                    })(i);
                }
                count++;
            }
        }//game has not been started yet
        else
        {
            for(var i=0; i<10; i++)
            {
                ///table cards
                if(i>=0 && i<=3)
                {
                    (function(idx) {
                        setTimeout(function() { moveToPlace(idx, true); }, idx * 100);
                    })(i);
                }
                else if(i>=4 && i<=6)///Player 2
                {
                    player2.hand.push(cards[i]);
                    (function(idx) {

                        if(getPlayerOrder(username) == 2)
                            setTimeout(function() { moveToPlace(idx, true); }, idx * 50);
                        else if(getPlayerOrder(username) == 1)
                            setTimeout(function() { moveToPlace(idx, false); }, idx * 50);
                    })(i);
                }
                else ///Player 1
                {
                    cards[i].div.className += 'player1cards';
                    player1.hand.push(cards[i]);
                    (function(idx) {
                        if(getPlayerOrder(username) == 2)
                            setTimeout(function() { moveToPlace(idx, false); }, idx * 50);
                        else if(getPlayerOrder(username) == 1)
                            setTimeout(function() { moveToPlace(idx, true); }, idx * 50);
                    })(i);
                }
            }
        }
    }// dealcards : distribute cards to each player hands

    var showCard = function(id)
    {
        for(var i=0; i<3; i++)
        {
            if(cards[id] == player1.hand[i] && getPlayerOrder(username) != 1)
            {
                alert("these are Player1 cards");
                return;
            }
            if(cards[id] == player2.hand[i] && getPlayerOrder(username) != 2)
            {
                alert("these are Player2 cards");
                return;
            }
        }
    };

    var inHand = function(player, id)
    {
        for(var i=0; i<3; i++)
            if(cards[id] == player.hand[i])
                return 1;
        return 0;
    };

    ///Check if there is any card has the same number as th one you clicked on "id"
    ///If not ---> null
    ///If yes ---> return first cards found (3 -> 4 -> 5)
    var inTable = function(id)
    {
        var cardsToEat = [];
        var nbrToEat = cards[id].number;

        for(var i=0; i<cardsInTable.length; i++)
        {
            if(cardsInTable[i].number === nbrToEat)
            {
                cardsToEat.push(cardsInTable[i]);
                if(nbrToEat === 7)
                    nbrToEat += 3;
                else
                    nbrToEat++;
                if(nbrToEat == 13)
                    break;
                i=-1;
            }
        }
        return cardsToEat;
    }

    var getTheFirstPlaceAvai = function()
    {
        for(var i=0; i<posCardsInTable.length; i++)
            if(posCardsInTable[i].free === true)
                return i;
        return -1;
    }

    var indexOfObject = function(myArray, object)
    {
        for(var i=0; i<myArray.length; i++)
            if(myArray[i] === object)
                return i;
        return -1;
    }

    var getPosCardInTable = function(id)
    {
        for(var i=0; i<posCardsInTable.length; i++)
        {
            if((posCardsInTable[i].y === cards[id].div.fromtop) &&
                (posCardsInTable[i].x === cards[id].div.fromleft))
                return i;
        }
        return -1;
    }



    var eatCards = function(idEater)
    {
        ///Search
        var eater = cards[idEater];
        var victims = inTable(idEater);
        /*
         cards[idEater].div.fromtop = cardsInTable[indexOfObject(cardsInTable ,victims[0])].div.fromtop;
         cards[idEater].div.fromleft = cardsInTable[indexOfObject(cardsInTable ,victims[0])].div.fromleft;
         moveToTable(idEater);*/

        var ind;
        if(currentPlayer === player1)
            ind = 0;
        else
            ind = 1;

        if(currentPlayer.score === 0)
        {
            var card = document.createElement("div");
            card.style="top:"+posCardsPack[ind].y+";left:"+posCardsPack[ind].x+";height:90px;width:59px; background-image: url('../images/cards/back.png');";
            felt.appendChild(card);
        }

        cards[idEater].div.fromtop = posCardsPack[ind].y;
        cards[idEater].div.fromleft = posCardsPack[ind].x;
        cards[idEater].div.zIndex = "1000";
        //setTimeout(function() { moveToPlace(idEater, true); }, 1000);
        if(currentPlayer == player1)
        {
            moveToPack(idEater, true);
            pack1.push(cards[idEater]);
            player1.score++;
        }
        else
        {
            moveToPack(idEater, false);
            pack2.push(cards[idEater]);
            player2.score++;
        }

        for(var i=0; i<victims.length; i++)
        {
            var indexToMove = indexOfObject(cards ,victims[i]);
            posCardsInTable[getPosCardInTable(indexToMove)].free = true;

            victims[i].div.fromtop = posCardsPack[ind].y;
            victims[i].div.fromleft = posCardsPack[ind].x;

            if(currentPlayer == player1)
                pack1.push(victims[i]);
            else
                pack2.push(victims[i]);

            var indexInCardsInTable = indexOfObject(cardsInTable ,victims[i]);
            ///Free cards pos from posCardsInTable
            cardsInTable.splice(indexInCardsInTable, 1);
            //moveToTable(indexToMove);
            (function(idx) {
                moveToPack(idx, true);
            })(indexToMove);
            if(currentPlayer == player1)
                player1.score++;
            else
                player2.score++;
        }
        if(currentPlayer === player1)
            document.getElementById("scorePlayer1").innerText = player1.score;
        else
            document.getElementById("scorePlayer2").innerText = player2.score;
        lastPlayer = currentPlayer;
    }


    //when a card is clicked
    var cardClick = function(id)
    {
        var cardid = id;
        //if the user is just a watcher , he can't play
        if(getPlayerOrder(username) === 3){
            alert('you are just a watcher you cannot play');
            return;
        }
        if(started)
        {///ICI
            //showCard(id);
            if(!player1.hand[0] && !player1.hand[1] && !player1.hand[0] &&
                !player2.hand[0] && !player2.hand[1] && !player2.hand[2])
            {
                //if the second player can't ditribute cards
                if(getPlayerOrder(username) === 2){
                    alert('wait for the first player to distribute cards');
                    return;
                }
                socket.emit('distribute cards');
                return;
            }
            if(currentPlayer === player1)
            {
                if(getPlayerOrder(username) != 1){
                    alert('it is player 1 turn ');
                    return;
                }
                socket.emit('player 1 action', cardid);

            }else if (currentPlayer === player2 ){
                if(getPlayerOrder(username) != 2){
                    alert('it is player 2 turn ');
                    return;
                }
                socket.emit('player 2 action', cardid);
            }

        }
        else
        {
            //if the second player can't ditribute cards
            if(getPlayerOrder(username) === 2){
                alert('wait for the first player to distribute cards');
                return;
            }
            socket.emit('first distribution');
            // shuffle and deal cards
        }
    };

    function play(player, cardid){
        if(inHand(player, cardid))
        {
            ///Remove cards from player1's hand
            var indexToRemove = indexOfObject(player.hand, cards[cardid]);
            player.hand[indexToRemove] = null;
            //if there a cards that is similar to the clicked one, so the player win them
            if(inTable(cardid).length)
            {
                eatCards(cardid);
            }
            //if there is no card to eat, we put the clicked card in a random place on the table
            else
            {

                var indPos = getTheFirstPlaceAvai();
                cards[cardid].div.fromtop = posCardsInTable[indPos].y;
                cards[cardid].div.fromleft = posCardsInTable[indPos].x;
                posCardsInTable[indPos].free = false;
                cardsInTable.push(cards[cardid]);

                moveToPlace(cardid, true);
            }
            changePlayer();
        }
    }

    function getPlayerOrder(username){
        if(username === player1.name) return 1;
        else if(username === player2.name)return 2;
        return 3;
    }
    
    var showWinner = function(){
       //document.getElementById('myModal').style.display ='block';
       //document.getElementById('myModal').style.width ='100%';
    }

});


