import React, { useState,useEffect } from 'react';
import './JoinGameButton.css';

function JoinGameButton() {
  const [showPopup, setShowPopup] = useState(false);
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');

  useState(() => {
    //change the route after the gameId is set
    if (gameId!=='') {
      window.location.href = `/game/`.concat(gameId);
    }
  }, [gameId]);

  function handleClick() {
    setShowPopup(true);
    setError("")
  }

  async function handleSubmit(event) {
    event.preventDefault(); //to prevent the default behavior of an event from occurring
    

    const inputDataRequest = {gameId}
    //Post call to join a game
    const res = await fetch('http://localhost:2999/api/join-game', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputDataRequest)
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      //TODO
      if (data.isFoundGame){ 
        setError("ATTENZIONE: il codice inserito non appartiene a nessuna partita!");
        setShowPopup(false);
      }
      else{
        setGameId({gameId});
      }
    })
    .catch(error => {
      console.error(error);
    });;

  }

  return (
    <>
      <button className="join-game-button" onClick={handleClick}>Join Game</button>
      {error ? <div className="error">{error}</div> : null}
      {showPopup && (
        <div className="popup">
          <form onSubmit={handleSubmit}>
            <p>Add Game Id to join</p>
            <input type="text" placeholder="Enter Game Id" value={gameId} onChange={event => setGameId(event.target.value)} />
            <button type="submit">Join</button>
            <button type="reset" onClick={() => setShowPopup(false)}>Cancel</button>
          </form>
        </div>
      )}
    </>
  );
}

export default JoinGameButton;