function isWinning(board) {

    //Check if winning
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
        ];
        let winner = null;

        winningCombinations.forEach((combination) => {
        const [a, b, c] = combination;
        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            winner = board[a];
        }
        });

    return winner;

}

function isDraw(board) {
    let count = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "X" || board[i] === "O"){
            count++;
        }
    }
    if (count===9){
        return true;
    } else{
        return false;
    }
}

function isNotPlayerTurn(board, player) {
    let xCount = 0;
    let oCount = 0;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "X") {
        xCount++;
      } else if (board[i] === "O") {
        oCount++;
      }
    }
    if (player === "X") {
      return xCount === oCount;
    } else if (player === "O") {
      return xCount === oCount + 1;
    }
  }
  


module.exports = {isWinning,isNotPlayerTurn,isDraw}