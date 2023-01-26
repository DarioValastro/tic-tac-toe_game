const {isWinning,isNotPlayerTurn,isDraw} = require('./utils')
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const uuid = require('uuid');



//DATABSE
mongoose.set('strictQuery', true); 
mongoose.connect('mongodb://localhost:27017/mygame', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
//TEST DB
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("We're connected on the DB!");
});
// Create a game schema
const gameSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  status: [],
  date: mongoose.Schema.Types.Date
});
// Create a model from the schema
const Game = mongoose.model('Game', gameSchema,'mygame');

const app = express();

//WEBSOCKET SERVER
const WebSocket = require('ws')
const http = require("http")
const server = http.createServer(app)
const wss = new WebSocket.Server({server})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter); //Default value
app.use('/users', usersRouter); //Default value
app.use(bodyParser.json());

//The port of process
const port = process.env.PORT || 2999;

//CORS (Cross-Origin Resource Sharing) middleware
const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002'], // allowed origins that are allowed to make cross-origin requests
    methods: ['GET', 'POST','PUT'],
  }))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true); //indicating whether or not the response to the request can be exposed when the credentials flag is true
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); //move on to the next middleware in the chain
    next(); //move on to the next middleware in the chain
});

// POST route to add a game
app.post('/api/start-game', async (req, res) => {
  try {
    const { id, status, date} = req.body;
    // Check if id is the same (almost impossible with this long id)
    let existingGame=true
    while(existingGame){
      existingGame = await Game.findOne({ id });
      if (existingGame) {
        id=uuid.v4()
      }
    }
    const game = new Game({ id, status, date});
    await game.save();
    res.status(201).json({ message: 'Game added successfully',id: id });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});


app.get('/api/game-status/:gameId', async (req, res) => {
  const game = await Game.findById(req.params.gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  // Return game status
});


//Chek winner and move
app.post("/api/move-and-check-winner", (req, res) => {
    
    const { board,gameId, player, position} = req.body;
    
    //Add move in the board
    board[position]=player 

    //Is turn of Player X or Player O ? 
    if(isNotPlayerTurn(board,player)===true){
      console.log("It's not your turn in multiplayer")
    }


    //Update database 
    Game.findOneAndUpdate({ id: gameId }, { $set: { status: board } }, function (err, game) {
      if (err) return handleError(err);
    });

    //Check if winner
    let winner = isWinning(board); 
    //Check if Draw
    if(winner===null){
      if(isDraw(board)){
        winner = "Nobody"
        res.json({ winner,board });
      }
    }
    
    //If no winner, variable winner is Null
    res.json({ winner,board });
    
    /*
    From assignment

    The response should include a data structure with the
    representation of the full board so that the UI can update itself with the latest data on
    the server. The response should also include a flag indicating whether someone has
    won the game or not and who that winner is if so.
    */
  });


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;