let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
const bodyParser = require("body-parser");


let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(bodyParser.json());

//The port of process
const port = process.env.PORT || 2999;

//CORS (Cross-Origin Resource Sharing) middleware
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
  }))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post("/api/check-winner", (req, res) => {
    
    const { board } = req.body;
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let winner = null;
  
    winningCombinations.forEach((combination) => {
      const [a, b, c] = combination;
      if (
        board[a] &&
        board[a] === board[b] &&
        board[a] === board[c]
      ) {
        winner = board[a];
      }
    });

    res.json({ winner });
  });

module.exports = app;