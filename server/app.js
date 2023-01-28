const {isWinning,isNotPlayerTurn,isDraw,numberOfMoves} = require('./utils')
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const uuid = require('uuid');
const helmet = require('helmet')



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
  dateStartGame: mongoose.Schema.Types.Date,
  isMultiplayer: Boolean,
  firstMoveTime: mongoose.Schema.Types.Date
});
//Function to see if lower or higher than parameter secondsLimit
gameSchema.methods.compareDates = function(secondsLimit=3) {
  console.log(this.firstMoveTime)
  const date1 = this.firstMoveTime;
  const date2 = new Date(Date.now());
  const difference = Math.abs(date2 - date1); // difference in milliseconds
  const secondsDifference = difference / 1000;
  console.log(secondsDifference)
  if (secondsDifference > secondsLimit) {
      console.log(`Difference between dates is greater than ${secondsLimit} seconds. Therefore, it can be multiplayer.`);
      return false;
  } else {
      console.log(`Difference between dates is less than or equal to ${secondsLimit} seconds. Therefore, it could be without multiplayer.`);
      return true;
  }
};
// Create a model from the schema
const Game = mongoose.model('Game', gameSchema,'mygame');




const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(helmet())

//The port of process
const port = process.env.PORT || 2999;

//CORS (Cross-Origin Resource Sharing) middleware
const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:3000','http://localhost:3001', 'http://localhost:3002'], // allowed origins that are allowed to make cross-origin requests
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
    const { id, status, dateStartGame,isMultiplayer,firstMoveTime} = req.body;
    // Check if id is the same (almost impossible with this long id)
    let existingGame=true
    while(existingGame){
      existingGame = await Game.findOne({ id });
      if (existingGame) {
        id=uuid.v4()
      }
    }
    const game = new Game({ id, status, dateStartGame,isMultiplayer,firstMoveTime});
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


app.post("/api/join-game", (req, res) => {
  
  const {gameId} = req.body;
  
  Game.find({ id: gameId }, function (err, game) {
    if(err) {
        console.log("Error")
        return
    }
    //console.log(game)
    if(game.length === 0) {
        const isFoundGame = false ;
        res.json({ isFoundGame });
        return;
    }else{
      const isFoundGame = true;
      const board = game[0].status;
      let isMultiplayer = true; 
      if(game[0].isMultiplayer==false){
        isMultiplayer= false;
      }
      res.json({ isFoundGame,board,isMultiplayer });
    }
  });
});

app.post("/api/join-game-update-board", (req, res) => {
  try{
    const {gameId} = req.body;
    
    Game.find({ id: gameId }, function (err, game) {
      if(err) {
          console.log("Error")
          return
      }
      //console.log(game)
      const board = game[0].status;
      //Check if winner
      let winner = isWinning(board); 
      //Check if Draw
      if(winner===null){
        if(isDraw(board)){
          winner = "Nobody"
        }
      }
      res.json({ winner, board });
    });
  }catch (error) {
      console.error(error);
    }
  });



  //Check winner and move
  app.post("/api/move-and-check-winner", (req, res) => {
      try{
          const { board,gameId, player, position} = req.body;
          
          //Add move in the board
          board[position]=player 

          //Is turn of Player X or Player O ? //TODO: this doesn't work because we are calling players as X or O, instead we need to name it as 1 or 2 
          if(isNotPlayerTurn(board,player)===true){
            console.log("It's not your turn in multiplayer")
            return ;
          }

          //Is multiplayer or from single client
          let numberMoves = numberOfMoves(board)
          if(numberMoves===1){
            Game.findOneAndUpdate({ id: gameId }, { $set: { firstMoveTime: new Date(Date.now())  } }, function (err, game) {
              if (err) return handleError(err);
            });
          }
          if(numberMoves===2){
            //CHECK IF LESS THAN 3 SECONDS
            Game.findOne({ id: gameId }, function (err, game) {
              if (err) return handleError(err);
              const SECONDS_LIMIT = 3;
              if(game.compareDates(SECONDS_LIMIT)){
                
                //IF LESS --> MULTIPLAYER FLASE
                Game.findOneAndUpdate({ id: gameId }, { $set: { isMultiplayer: false } }, function (err, game) {
                  if (err) return handleError(err);
                });
              }else{
                //IF GREATER --> MULTIPLAYER CAN BE TRUE
              }
            });
          }

          //Update database 
          Game.findOneAndUpdate({ id: gameId }, { $set: { status: board } }, function (err, game) {
            if (err) return handleError(err);
          });

          //Check if winner
          let winner = isWinning(board); 
          //Check if Draw
          if(winner===null && isDraw(board)){
            winner = "Nobody"
          }
          
          //If no winner, variable winner is Null
          res.json({ winner,board });
        }catch(e){
          console.log(e)
        }
  });




  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;