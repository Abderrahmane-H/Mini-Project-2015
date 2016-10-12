////THis project brought to you by the trinomial SIDKI|HILALI|IRAQI
//Player Class
var Player = function(name, score, packPos, order)
{
    //Atributs
    this.name = name;
    this.score = score;
    this.hand = null;
    this.order = null;
    this.packPos = {
        x : packPos.x,
        y : packPos.y
    }
}

var Card = function(type, number, div, id)
{
    //Atributs
    this.type = type; /// F : FLOUSS
                      /// J : JBABNE
                      /// Z : ZRRAWET
                      /// S : SYOUF
    this.number = number;/// 1, 2, 3, 4, 5, 6, 7, 10, 11, 12
    this.div = div;
    this.owner = null; //owner is either player 1 : 1,
                      //or player 2 : 2
    this.id = id;
}



/***
 * @param targetId is the stage I don't know what is this so ask AYOUB SIDKI :p
 * @param player1 the player one instance of player clas
 * @param player2 the player 2 instance of player class
 * @param cards the cards that the players are going to play with; there are 40 cards
 */

