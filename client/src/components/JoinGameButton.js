import React, { useState } from 'react';
import './JoinGameButton.css';

function JoinGameButton(props) {
  const [showPopup, setShowPopup] = useState(false);
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState(null);


  function handleClick() {
    setShowPopup(true);
    setError("")
  }

  async function handleSubmit(event) {
    event.preventDefault(); //to prevent the default behavior of an event from occurring

    const inputDataRequest = {gameId}
    console.log(inputDataRequest)
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
        if (data.isMultiplayer===false){
          setError("ATTENZIONE: il codice inserito appartiene ad una partita Non multiplayer!");
          setShowPopup(false);
        }else{
          //Move to page game updated with board
          window.location.href = "/game/".concat(gameId);
        }
      } else{
        setError("ATTENZIONE: il codice inserito non appartiene a nessuna partita!");
        setShowPopup(false);
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