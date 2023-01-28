import React, { useState,useEffect } from "react";
import './App.css'
import ReturnHomeButton from './components/ReturnHomeButton'
import isTheTurnOfPlayer from './utils';


function TicTacToe() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [winner, setWinner] = useState(null);
  
  function isTheTurnOfPlayer(board){
    let count = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "X" || board[i] === "O"){
            count++;
        }
    }
    if (count % 2 === 0){
        return "X"
    }else{
        return "O"
    }
}


  const getData = () => {
    //setCurrentPlayer(isTheTurnOfPlayer(board));
    const inputDataRequest = { 
      board: board,
      gameId: window.location.href.split("/").pop(), //GameId based on url 
      player: isTheTurnOfPlayer(board)
    };
    fetch("http://localhost:2999/api/join-game-update-board", {
      method: "POST",
      body: JSON.stringify(inputDataRequest),
      headers: { "Content-Type": "application/json" },
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      setBoard(data.board);
      setWinner(data.winner);
    });
  }

  
  useEffect(() => {
    
      const INTERVAL_TO_UPDATE = 250; //Milliseconds
      const intervalId = setInterval(() => {
        if(winner!=="Nobody"){
          getData();
        }
        
      }, INTERVAL_TO_UPDATE);
      return () => clearInterval(intervalId);
    
    
    
  }, []);


  const handleClick = (index) => {
    if (board[index] !== "" || winner) {
      return;
    }
    // Check the winner 
    const inputDataRequest = { 
      board: board,
      gameId: window.location.href.split("/").pop(), //GameId based on url 
      player:  isTheTurnOfPlayer(board), 
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
        }
      });
  };

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
          <h2>Current player: {isTheTurnOfPlayer(board)} </h2>
          <br></br>
          <h3>Game Id: </h3>
          <h4>{window.location.href.split("/").pop()}</h4>
        </>
      )}
    </div>
  );
}

export default TicTacToe;
