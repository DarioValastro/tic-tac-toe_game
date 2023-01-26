import React from 'react';

function ReturnHomeButton() {

function handleClick() {
    window.location.href ="/home"
  }
return (
    <button className="start-game-button" onClick={handleClick}>Return Home</button>
  );
}

export default ReturnHomeButton;
