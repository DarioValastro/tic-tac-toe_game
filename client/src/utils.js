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

export default isTheTurnOfPlayer;