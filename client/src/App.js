import React, { useEffect, useState } from "react";
import './App.css'
import ReturnHomeButton from './components/ReturnHomeButton'


function TicTacToe() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);

  const handleClick = (index) => {
    if (board[index] !== "" || winner) {
      return;
    }
    // Check the winner 
    const inputDataRequest = { 
      board: board,
      gameId: window.location.href.split("/").pop(), //GameId based on url 
      player:  currentPlayer, 
      position: index  
    };

    fetch("http://localhost:2999/api/move-and-check-winner", {
      method: "POST",
      body: JSON.stringify(inputDataRequest),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)

        //const newBoard = [...board];
        //newBoard[index] = currentPlayer;
        setBoard(data.board);

        if (data.winner) {
          setWinner(data.winner);
        } else {
          setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        }
      });
  };

  
  //Check if already there is the game and if update the board 
  

  return (
    <div>
      {winner ? (
        <><h1>{winner} wins!</h1>
        <br></br>
        <ReturnHomeButton/>
        </>
      ) : (
        <>
          <h1>Tic Tac Toe</h1>
          <div className="board">
            {board.map((cell, index) => (
              <div
                key={index}
                className="cell"
                onClick={() => handleClick(index)}
              >
                {cell}
              </div>
            ))}
          </div>
          <h2>Current player: {currentPlayer}</h2>
          <br></br>
          <h3>Game Id: </h3>
          <h4>{window.location.href.split("/").pop()}</h4>
        </>
      )}
    </div>
  );
}

export default TicTacToe;
