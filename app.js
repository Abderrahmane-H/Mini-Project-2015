var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

// including player.js this file contains the class 'player'
eval(fs.readFileSync('./public/javascripts/css-animation2.js')+'');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
//var http = require('http').Server(app);

var io = require('socket.io')();
app.io = io;
app.set('view engine', "jade");


// view engine setup
app.set('views', path.join(__dirname, 'views'));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/game', routes);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//number of users
var numUsers = 0;
var numPlayers = 0;
var player1ID; //first player socket id
var player2ID; //second player socket id

var player1 = null; //the first player
var player2 = null; //second player
var currentPlayer = null; //the current player
var lastPlayer = null; //the last player
var cardsInTable = []; //cards on table
var posCardsPack = new Array(
    {x:0, y:350},///First user
    {x:0, y:100}///second player
);
var cards = []; //the cards : we have 40 cards
var posCardsInTable = new Array( //the positions where we put cards played by the players
    {x:100, y:170, free:true}, {x:173, y:170, free:true},
    {x:246, y:170, free:true}, {x:319, y:170, free:true},
    {x:392, y:170, free:true}, {x:465, y:170, free:true},
    {x:173, y:270, free:true}, {x:246, y:270, free:true},
    {x:319, y:270, free:true}, {x:392, y:270, free:true}
);
///packs of cards
pack1 = []; //first player's won cards
pack2 = []; //second player's won cards

//this array is sent to clients for the initialisation
var data = new Array({
    player1 : player1,
    player2 : player2,
    currentplayer : player1,
    lastplayer : null,
    cards : cards,
    cardsInTable : [], //cards on table
    posCardsPack : new Array(
        {x:0, y:350},///First user
        {x:0, y:100}///second player
    ),
    posCardsInTable : []
})

io.on('connection', function (socket) {

    /****the chat event********/
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    /*******play events******
     *
     *  controlling game play
     *
     * *********************/

    //player joined event is recieved when the client clicks on the go button
    //data contains the player username
    socket.on('player joined', function(data){
        //we have to stop the counter on 2
        if(numPlayers <= 3)
            ++numPlayers;

        console.log('numPlayers : ' + numPlayers);
        if(numPlayers == 1){
            player1ID = socket.id;
            player1 = new Player(data, 0, {x:0, y:350}, 1);
            console.log(player1);
            //this is the first player
            io.to(socket.id).emit('you are the first player');
        }

        else if(numPlayers == 2 ){
            player2ID = socket.id;
            player2 = new Player(data, 0, {x:0, y:100}, 2);

            //we tell the current player that he is the second player, and we send him the username of the first player
            io.to(socket.id).emit('you are second player', player1.name);
            //and then, we alert the first player and we send him
            //the username of the second player
            socket.broadcast.emit('fist player second player has joined', player2.name);
        }
        else if(numPlayers > 2){
            socket.emit('the room is full');
        }

    });//player joined

    //when the second player tells that players are both ready
    socket.on("players are ready", function(){

        //we initialize the cards and we send them to the users
        var cards = initializeCards();
        //then we shuffle them
        var valid = false;
        while(!valid)
        {
            cards = shuffle(cards);
            valid = validShuffle(cards);
        }

        //this array is sent to clients for the initialisation
        var data = new Array({
            player1 : player1,
            player2 : player2,
            currentplayer : player1,
            lastplayer : null,
            cards : cards,
            cardsInTable : [], //cards on table
            posCardsPack : new Array(
                {x:0, y:350},///First user
                {x:0, y:100}///second player
            ),
            posCardsInTable : shuffle(posCardsInTable)
        });
        io.emit('initialize game', data);
    });

    //the first distribution always done by the first player
    socket.on('first distribution', function(){
        io.sockets.emit('first distribution');
    })

    //whenfirst player want's to distribute cards,
    socket.on('distribute cards', function(){
        io.sockets.emit('distribute cards'); //send the distribute to all the clients
    });

    //when the first player played
    socket.on('player 1 action', function(cardid){
        //we send the id of the played card to clients
        io.sockets.emit('player 1 played', cardid);
    });

    //when the first player played
    socket.on('player 2 action', function(cardid){
        //we send the id of the played card to clients
        io.sockets.emit('player 2 played', cardid);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function (){
        if (addedUser) {
            --numUsers;
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

module.exports = app;

/*********play functions********/

/**
 * this function initializes the cards, so that both players will have the same cards order
 *
 * @returns {Array of cards }
 */
function initializeCards(){
    var cards = [];
    ///Initialisation of cards
    var arrayTypes = new Array("F", "S", "J", "Z");
    for(i=0; i<4; i++)
    {
        for (y=1; y<=10 ; y++)
        {
            if(y<=7)
                cards.push(new Card(arrayTypes[i], y, null, i));
            else
                cards.push(new Card(arrayTypes[i], y+2, null, i));
        }
    }

    return cards;
}

//teels if cards are shuffled in a way that we won't have 2 similar cards in 4 consecutive cards
var validShuffle = function(cards)
{
    for(var i=0; i<3; i++)
        for(var y=i+1; y<4; y++)
            if(cards[i].number === cards[y].number)
                return false;
    return true;
}

/***
 * shuffle cards in a way that we won't have similar cards, in 4 consecutive cards
 * @param array the cards array (initializeCards)
 * @returns {*}
 */
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


