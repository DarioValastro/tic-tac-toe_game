# Tic-Tac-Toe Game

A multiplayer Tic-Tac-Toe game built with ReactJS and NodeJS/Express.

## How to Play

Join the game using a unique ID assigned by the uuid library. 
If two moves are made in less than 3 seconds, the game won't allow new users to join.

## Requirements
- NodeJS and npm
- MongoDB

## Running the Game
1. Clone the repository
2. Install all the required packages 
3. Start backend with `npm start` in server directory
4. Start frontend with `npm start --port 3001` in client directory. If you want to try multiplayer, start with `npm start --port 3002`
5. Access the game at `http://localhost:3001` and/or `http://localhost:3002`

## Note
- MongoDB must be running in 'localhost:27017' with Database called 'mygame' and collection called 'mygame'
- [This video](https://www.loom.com/share/5fd9663f643844638183d873134d7e0d) shows functionalities
