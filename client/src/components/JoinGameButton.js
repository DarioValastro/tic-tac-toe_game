import React, { useState } from 'react';
import './JoinGameButton.css';

function StartGameButton() {
  //const [gameId, setGameId] = useState(null);
  function handleClick() {
    console.log("Click button JOIN");
  }
  return (
    <button className="join-game-button" onClick={handleClick}>Join Game</button>
  );
}

export default StartGameButton;