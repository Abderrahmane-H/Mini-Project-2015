var player = function(name, score, packPos){
    //Atributs
    this.name = name;  //player name
    this.score = score;//score
    this.hand = null;  //hand
    this.packPos = {
        x : packPos.x,
        y : packPos.y
    };

    this.eatCards = function(idEater)
    {
        ///Search
        var eater = cards[idEater];
        var victims = inTable(idEater);
       
        var ind;
        if(currentPlayer === player1)
            ind = 0;
        else
            ind = 1;

        if(currentPlayer.score === 0)
        {
            var card = document.createElement("div");
            card.style="top:"+posCardsPack[ind].y+";left:"+posCardsPack[ind].x+";height:90px;width:59px; background-image: url('http://localhost:3000/images/cards/back.png');";
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

};