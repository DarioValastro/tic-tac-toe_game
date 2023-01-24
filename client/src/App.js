import React, { useState } from "react";
import './App.css'


function TicTacToe() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);

  const handleClick = (index) => {
    if (board[index] !== "" || winner) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    console.log("Arriva almeno qui")
    fetch("http://localhost:2999/api/check-winner", {
      method: "POST",
      body: JSON.stringify({ board: newBoard }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        if (data.winner) {
          setWinner(data.winner);
        } else {
          setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        }
      });
  };

  return (
    <div>
      {winner ? (
        <h1>{winner} wins!</h1>
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
        </>
      )}
    </div>
  );
}

export default TicTacToe;
