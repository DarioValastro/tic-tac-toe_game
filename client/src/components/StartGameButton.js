import React, { useState } from 'react';
import './StartGameButton.css';
const uuid = require('uuid');

function StartGameButton() {
  const [gameId, setGameId] = useState(null);

  async function handleClick() {
    try {
      
      const gameData = {
        id: uuid.v4(),
        name: 'Super Mario Bros',
        releaseDate: '1985-09-13',
        publisher: 'Nintendo'
      };
      const res = await fetch('http://localhost:2999/api/start-game', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });
      const data = await res.json();
      console.log(data);
      setGameId(gameId);
      // Navigate to the game page
      //window.location.href = `/game/${gameId}`;
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <button className="start-game-button" onClick={handleClick}>Start Game</button>
  );
}

export default StartGameButton;
