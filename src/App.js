import React, { useState } from 'react';
import './App.css';

// name columns. rows will be named based on operations performed on this array
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
// shortcut to dimensions of the board (an 8x8 grid)
const dims = files.length;
// key-value pairs for piece abbreviations
const names = {
  'k': 'king',
  'q': 'queen',
  'r': 'rook',
  'b': 'bishop',
  'n': 'knight',
  'p': 'pawn',
};
// key-value pairs for square and piece at game start

const standard = {
  '-1': 'w',
  '1': 'b',
}

const start = {
  'a8': 'rb',
  'b8': 'nb',
  'c8': 'bb',
  'e8': 'kb',
  'f8': 'bb',
  'g8': 'nb',
  'h8': 'rb',
  'a7': 'pb',
  'b7': 'pb',
  'd8': 'qb',
  'c7': 'pb',
  'd7': 'pb',
  'e7': 'pb',
  'f7': 'pb',
  'g7': 'pb',
  'h7': 'pb',
  'a2': 'pw',
  'b2': 'pw',
  'c2': 'pw',
  'd2': 'pw',
  'e2': 'pw',
  'f2': 'pw',
  'g2': 'pw',
  'h2': 'pw',
  'a1': 'rw',
  'b1': 'nw',
  'c1': 'bw',
  'd1': 'qw',
  'e1': 'kw',
  'f1': 'bw',
  'g1': 'nw',
  'h1': 'rw',
};

// list of possible movements
const m = {
  // down the board
  's': [1, 0],
  // up
  'n': [-1, 0],
  // to the right
  'e': [0, 1],
  // to the left
  'w': [0, -1],
  // up and to the right
  'ne': [-1, 1],
  // down and to the right
  'se': [1, 1],
  // down and to the left
  'sw': [1, -1],
  // up and to the left
  'nw': [-1, -1],
};
// set movement patterns for all pieces
const movements = {
  'r': [m['s'], m['n'], m['e'], m['w']],
  'b': [m['ne'], m['se'], m['sw'], m['nw']],
  'n': [[1, 2], [1, -2], [-1, -2], [-1, 2], [2, 1], [2, -1], [-2, 1], [-2, -1]],
  'p': function(integer, x, y, board) {
    // pawns advance across the board
    const fwd = 1 * integer;
    const fwdR = [fwd, 1];
    const fwdL = [fwd, -1];
    const moves = [[fwd, 0], fwdR, fwdL, [fwd * 2, 0]];
    // right diagonal and left diagonal, if enemy is in space OR
    // en passant if enemy is in neighbouring square (same row) and square behind enemy
    // (same column as enemy's piece, minus one row)

    let canMove = false;
    for (let i = 0; i < moves.length; i++){
      const cm = moves[i]; // shortcut to current possible move
      const nx = cm[0] + x; // new x value
      const ny = cm[0] + y; // new y value
      if (cm[0] === 1 && cm[1] === 0 && typeof(board[nx][ny]) === 'undefined') {
        console.log(`pawn can move to ${nx}, [${ny}`)
        canMove = !canMove;
        return canMove;
      }
    }
    return canMove;
    // if (board[fwd + x][fwd + y]) {
      
    // }
    // const pawnMovements = [[fwd, 0]];

    // return pawnMovements;
    // const pawnMovements = [[1, 0]];
    // if (board[0] + coordinates[0])
  },
};
movements['k'] = movements['r'].concat(movements['b']);
movements['q'] = movements['k'];

function Square(props) {
  let filename, selected = ['', ''];
  if (props.piece){
    // add 'selected' class if piece string ends with 's'
    selected = props.piece.isSelected ? 'selected' : '';
    // filename must not include the 's' representing the selected piece
    filename = props.piece.id;
  }
  return (
  <button
    className={`square ${props.color} ${selected}`}
    id={props.notation}
    style={{backgroundColor: props.color}}
  >
    <div
      className={`piece`}
      style={{
        backgroundImage: `url(media/${filename}.svg`,
      }}
      onClick={props.onSquareClick}
    >
    </div>
  </button>
  );
}

export default function Board() {
  const [squares, setSquares] = useState(getBoard());
  const [moveHistory, setMoveHistory] = useState([]);
  const [selected, setSelected] = useState(false);
  const [turn, setTurn] = useState(-1);
  const [log, setLog] = useState([]);

  function handleClick(row, col, sq) {
    console.log(`does 0,1 contain a piece belonging to the current player?`);
    console.log(`The current turn is ${turn}. The player is ${standard[turn]}.`);
    console.log(`Looking up the contents of square ${row}, ${col}.`);
    console.log(`it is ${standard[turn]}'s turn`);
    console.log(moveHistory);
    console.log(moveHistory.length);
    console.log(`A piece ${selected ? 'is' : 'is not'} selected`);
    // selectPiece(sq, turn, setSelected, selected, x, y, squares);
    if (
      selected === false &&
      checkTurn(sq, turn) === false
    ) {
      return;
    } else if (
      selected === false &&
      checkPawnMovement(turn, row, col, null, squares)
      // checkPawnMovement(turn, row, col, moveHistory, squares)
      ) {
      console.log(`hitting select condition`);
      const nextSquares = squares.slice();
      setMoveHistory([...moveHistory, [squares[row][col], [row, col]]]);
      nextSquares[row][col].isSelected = true;
      setSquares(nextSquares);
      console.log(nextSquares);
      setSelected(true);
    } else if (
      selected === true &&
      checkTurn(sq, turn) === false &&
      checkPawnMovement(turn, row, col, moveHistory, squares) // &&
      // pathfinder(moveHistory, row, col)
    ) {
      console.log('FINDING DESTINATION');
      console.log(checkPawnMovement(turn, row, col, moveHistory, squares))
      const nextSquares = squares.slice();
      setMoveHistory([moveHistory[moveHistory.length - 1].concat([[row, col]])]);
      const lastMove = moveHistory[moveHistory.length - 1];
      console.log(moveHistory);
      pathfinder(moveHistory, row, col, squares);
      const ox = lastMove[1][0];
      const oy = lastMove[1][1];
      const nx = row;
      const ny = col;
      const piece = lastMove[0];
      nextSquares[ox][oy] = undefined;
      nextSquares[nx][ny] = piece;
      piece.isSelected = false;
      setSquares(nextSquares);
      setSelected(false);
      console.log(`selectDestination`);
      console.log(moveHistory);
      setTurn(turn * -1);
    } else {
      return;
    }
  }  

  const board = squares.map((arr, row) => {
    // find row number ('rank') by counting backward from second player's side
    const rank = dims - row;
    return <div className="rank" id={'rank-' + rank} key={'rank-' + rank}>
      {
        arr.map((sq, col) => {
          // initialize notation to square's location on the grid
          // const notation = files[col] + rank;
          const notation = getNotation(row, col);
          return <Square
            notation={notation}
            // calculate color of square
            color={getColor(row, col)}
            // 'setup' piece; value is undefined if no piece is on the square
            piece={sq ? sq : sq} // change to sq.id
            onSquareClick={() => handleClick(row, col, sq)}
            key={'square-' + notation}
          />
        })
      }
    </div>
  })

  return (
    <div className="game">
      {board}
    </div>
  );
}

// helper functions
function getBoard() {
  // chess board consists of 64 squares arranged in 8x8 grid
  // initialize array to contain the board
  const board = [];
  for (let i = 0; i < dims; i++) {
    const row = [];
    for (let j = 0; j < dims; j++) {
      // get square's notation by finding its position in the grid
      const notation = getNotation(i, j);
      const onSquare = start[notation] ? start[notation] : undefined;
      const square = onSquare ? { // initialize square as a piece or
      // as an empty square according to start position
        id: onSquare, //img filename
        [onSquare[1] === 'w' ? '-1' : '1']: onSquare[1] === 'w' ? -1 : 1, // lookup
        hasMoved: false,
        isSelected: false,
      } : onSquare; 
      row.push(square); // add square to row
    }
    board.push(row); // add row to board
  }
  return board;
}

function checkPawnMovement(turn, row, col, moveHistory, squares) {
  const pm = {
    '1,0': 'fwd', // move one square forward
    '2,0': '2xfwd', // move two squares forward (only on first move)
    '1,1': 'dia', // move diagonally
  }
  if (moveHistory) {
    const lastMove = moveHistory[moveHistory.length -1][1];
    const [oldX, oldY, newX, newY] = [lastMove[0], lastMove[1], row, col];
    const dest = squares[newX][newY];
    const q = `${diff(oldX, newX)},${diff(oldY, newY)}` // set key to access obj
    if (
      !dest &&
      
        pm[q] === 'fwd' ||
        (
          pm[q] === '2xfwd' &&
          !squares[newX + (turn * -1)][newY] &&
          (oldX === 1 || oldX === 6)
        )
        // add condition for en passant later
      || pm[q] === 'dia' && dest &&
      dest.id[1] === standard[turn * -1]
    ) {
      return true;
    } else {
      return false;
    }
    return `${q} moves the pawn ${pm[q]}`;
  } else {
    if (
      !squares[row + turn][col] ||
      !squares[row + turn][col] &&
      !squares[row + (turn * 2)][col] &&
      !squares[row][col].hasMoved ||
      squares[row + turn][col + turn] &&
      squares[row + turn][col + turn][turn] !== turn ||
      squares[row + turn][col + turn] &&
      squares[row + turn][col - turn][turn] !== turn
    ) {
      console.log(squares[row + turn][col]);
      console.log(`returning true`);
      return true;
    } else {
      console.log(`returning false`);
      return false;
    }
  } 
}

function clogger(name) {
  console.log(`hitting ${name}`);
  return true;
}

function checkTurn(square, turn) {
  const isTurn = square && square[turn] ? true : false;
console.log(`turn is ${isTurn}`);
  return isTurn;
}

function getNotation(x, y) {
  const file = files[y];
  const notation = file + getRank(x);
  return notation;
}

function getColor(rowIdx, sqIdx) {
  let color = '';
  if (
    rowIdx % 2 === 0 && sqIdx % 2 === 0 ||
    rowIdx % 2 !== 0 && sqIdx % 2 !== 0
  ) {
    color = 'white';
  }
  if (
    rowIdx % 2 !== 0 && sqIdx % 2 === 0 ||
    rowIdx % 2 === 0 && sqIdx % 2 !== 0
  ) {
    // tiles are green so that the second player's pieces are more visible
    color = 'green';
  }
  return color;
}

function diff(n1, n2) { // finds the difference between two numbers
  const greater = n1 > n2 ? n1 : n2;
  const lesser = n2 < n1 ? n2 : n1;
  console.log(greater, lesser);
  return greater - lesser;
}

function getRank(x) {
  return dims - x;
}

function pathfinder(moveHistory, row, col, board) {
  const mr = moveHistory[moveHistory.length - 1]; // most recent move
  console.log([row, col]);
  const pi = board[row][col]; // the piece's initial
  const ox = mr[0]; // represents piece's old row
  const oy = mr[1]; // represents piece's old column
  console.log(mr);
}