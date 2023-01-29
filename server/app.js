const {isWinning,isDraw,numberOfMoves,isTheTurnOfPlayer} = require('./utils')
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const uuid = require('uuid');
const helmet = require('helmet');

/**
 * DATABSE Mongo DB 
 * 
 * id: String
 * status: array - It represent the board game
 * dateStartGame: Date 
 * isMultiplayer: Boolean
 * player1Id: String,
 * player2Id: String,
 * firstMoveTime: Date
 *  
 */
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
  player1Id: String,
  player2Id: String,
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

// Middleware functions 
app.use(logger('dev')); //log information about incoming requests to the console in a development environment.
app.use(express.json()); //parses JSON request bodies
app.use(express.urlencoded({ extended: false })); //parses the URL-encoded data submitted in the request body
app.use(cookieParser()); //parses cookies sent in the headers of the request
app.use(express.static(path.join(__dirname, 'public'))); //serves static files from the "public" directory
app.use(bodyParser.json()); //parse the JSON in the body
app.use(helmet()) //sets up various HTTP headers to help secure the application from some well-known web vulnerabilities by setting HTTP headers appropriately

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

/**
 * To start the game
 */
app.post('/api/start-game', async (req, res) => {
  try {
    const { id, status, dateStartGame,isMultiplayer,player1Id,player2Id,firstMoveTime} = req.body;
    // Check if id is the same (almost impossible with this long id)
    let existingGame=true
    while(existingGame){
      existingGame = await Game.findOne({ id });
      if (existingGame) {
        id=uuid.v4()
      }
    }
    const game = new Game({ id, status, dateStartGame,isMultiplayer,player1Id,player2Id,firstMoveTime});
    await game.save();
    res.status(201).json({ message: 'Game added successfully',id: id });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * To join a game
 */
app.post("/api/join-game", (req, res) => {
  //TODO: add filter to see if the game is finished and if it was open more than X time (e.g., 7 days)
  try{
    const {gameId} = req.body;
  
    Game.findOne({ id: gameId },function (err, game) {
      if(err) {
          console.log("Error")
          return
      }
      if(game===null){
        const isFoundGame = false ;
        res.json({ isFoundGame });
        return;
      }else{
        if(game.length === 0) {
          const isFoundGame = false ;
          res.json({ isFoundGame });
          return;
        }else{
          const isFoundGame = true;
          const board = game.status;
          let isMultiplayer = true; 
          if(game.isMultiplayer==false){
            isMultiplayer= false;
          }else{
            Game.findOneAndUpdate({ id: gameId },{ $set: { player2Id: uuid.v4()  } },function (err, game) {})
          }
          res.json({ isFoundGame,board,isMultiplayer });
        }
       }
    });
  
  }catch(error){
    console.log(error)
  }
});


/**
 * To update game of a joined game
 */
app.post("/api/join-game-update-board", (req, res) => {
  try{
    const {gameId,player} = req.body;
    // Finding the game in the database that matches the provided gameId
    Game.findOne({ id: gameId }, function (err, game) {
      if(err) {
          console.log("Error")
          return;
      }
      // Retrieving the current state of the game board
      const board = game.status;
      // Checking if there is a winner by calling the isWinning function
      let winner = isWinning(board); 
      // Checking if the game is a draw by calling the isDraw function
      if(winner===null){
        if(isDraw(board)){
          winner = "Nobody"
        }
      }
      // Retrieving the player1Id and player2Id from the game object
      player1Id=game.player1Id;
      player2Id=game.player2Id;
      // Sending a JSON response containing the winner, board, player1Id, and player2Id
      res.json({ winner, board,player1Id,player2Id });
    });
  }catch (error) {
      console.error(error);
    }
  });

/**
 * To update the board with users' move and check if match is finischer
 */
 app.post("/api/move-and-check-winner", (req, res) => {
      try{
          const { board,gameId, player, position,playerId} = req.body;
          let player1Id = "";
          let player2Id = "";
          // Finding the game in the database that matches the provided gameId
          Game.findOne({ id: gameId }, function (err, game) {
            if (err) return handleError(err);
            player1Id=game.player1Id;
            player2Id=game.player2Id;
            if(player1Id!==player2Id){
              if(player1Id===playerId && player==="X"){
                board[position]=player ;
              }
              if(player2Id===playerId && player==="O"){
                board[position]=player ;
              }
            }else{
              board[position]=player ;
            }

          let numberMoves = numberOfMoves(board)
          //If is firt move, I add always the move in the board
          if(numberMoves===0){
            board[position]=player 
          }else if(numberMoves===1){
            Game.findOneAndUpdate({ id: gameId }, { $set: { firstMoveTime: new Date(Date.now())  } }, function (err, game) {
              if (err) return handleError(err);
            });
          } else if(numberMoves===2){
            //Check if less than SECONDS_LIMIT since first move
            Game.findOne({ id: gameId }, function (err, game) {
              if (err) return handleError(err);
              const SECONDS_LIMIT = 3; 
              if(game.compareDates(SECONDS_LIMIT)){
                //If less than SECONDS_LIMIT --> isMultiplayer FALSE
                Game.findOneAndUpdate({ id: gameId }, { $set: { isMultiplayer: false } }, function (err, game) {
                  if (err) return handleError(err);
                });
              }else{
                //If greater than SECONDS_LIMIT --> isMultiplayer remains TRUE
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
          //If no winner --> var winner is Null
          res.json({ winner,board,player1Id,player2Id});
          });
        }catch(e){
          console.log(e)
        }
  });

//The port of process
const port = process.env.PORT || 2999;  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;