import React, { useState,useEffect,useRef  } from "react";
import './App.css'
import ReturnHomeButton from './components/ReturnHomeButton'
import isTheTurnOfPlayer from './utils';
import io from 'socket.io-client';




function TicTacToe() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [winner, setWinner] = useState(null);
  const playerId = useRef("");
  const player1Id = useRef("");
  const player2Id = useRef("");
  const [firstMoveDone,setFirstMoveDone] = useState(false);

  function setPlayer1Id(id){
    player1Id.current = id;
  }

  function setPlayer2Id(id){
    player2Id.current = id;
  }

  function setPlayerId(id){
    playerId.current = id;
  }


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
      //console.log(data)
      setBoard(data.board);
      //console.log(data.player1Id);
      setPlayer1Id(data.player1Id);
      //console.log(player1Id);
      setPlayer2Id(data.player2Id);
      setWinner(data.winner);
    });
  }

  
  useEffect(() => {
      if(isTheTurnOfPlayer(board)==="X"){
        setPlayerId(player1Id.current);
      }else if (isTheTurnOfPlayer(board)==="O"){
        setPlayerId(player2Id.current);
      }
      const INTERVAL_TO_UPDATE = 200; //Milliseconds
      const intervalId = setInterval(() => {
        //console.log(player1Id);
        //console.log(player2Id);
        if(winner!=="Nobody" || winner===null){
          getData();
          //console.log(board)

        }
        
      }, INTERVAL_TO_UPDATE);
      return () => clearInterval(intervalId);
    
    
    
  }, []);


  const handleClick = (index) => {

    if (board[index] !== "" || winner) {
      return;
    }

    let xCount = 0;
    let oCount = 0;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "X") {
        xCount++;
      } else if (board[i] === "O") {
        oCount++;
      }
    }
    if(xCount===0){
      if (firstMoveDone){
        return;
      }else{
        setPlayerId(player1Id.current);
        setFirstMoveDone(true)
      }
    } else if(oCount===0){
      if(firstMoveDone){
        return;
      }else{
        setPlayerId(player2Id.current);
        setFirstMoveDone(true)
      }
    }
    const inputDataRequest = { 
      board: board,
      gameId: window.location.href.split("/").pop(), //GameId based on url 
      player:  isTheTurnOfPlayer(board), 
      position: index,
      playerId: playerId.current,
    };

    fetch("http://localhost:2999/api/move-and-check-winner", {
      method: "POST",
      body: JSON.stringify(inputDataRequest),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log(data)
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
