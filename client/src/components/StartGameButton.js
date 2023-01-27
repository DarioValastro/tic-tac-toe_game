import React, { useEffect, useState } from 'react';
import './StartGameButton.css';

const uuid = require('uuid');

function StartGameButton() {
  const [gameId, setGameId] = useState("");

  useEffect(() => {
    //change the route after the gameId is set
    if (gameId!=='') {
      window.location.href = `/game/`.concat(gameId);
    }
  }, [gameId]);

  async function handleClick() {
    try {
      
      const gameData = {
        id: uuid.v4(),
        status: ["", "", "", "", "", "", "", "", ""],
        dateStartGame: new Date(Date.now()),
        isMultiplayer: true,
        firstMoveTime: new Date(Date.now()), //Actually, this is not the actual first move time
        secondMoveTime: new Date(Date.now()) //Actually, this is not the actual second move time
      };
      const res = await fetch('http://localhost:2999/api/start-game', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });
      const data = await res.json();
      console.log(data);
      //console.log(typeof(data))
      setGameId(data.id);
      console.log(gameId)
      // Navigate to the game page
      //window.location.href = `/game/`.concat(gameId);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <button className="start-game-button" onClick={handleClick}>Start Game</button>
  );
}

export default StartGameButton;
