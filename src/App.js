import React from 'react';
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

// set movement patterns for all piece
const movements = {
  'k': '',
  'q': '',
  'r': '',
  'b': '',
  'n': '',
  'p': '',
};

function Square(props) {
  return <button className={`square ${props.color}`} id={props.notation}>
    <div className="piece">{props.piece}</div>
  </button>;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board: createBoard(),
    }
  }

  renderSquare(notation, color, piece) {
    return <Square
      notation={notation}
      color={color}
      key={'square' + notation}
      piece={piece}
    />;
  }

  render() {
    const board = this.state.board.map((row, index) => {
      const rank = row.length - index;
      return <div className={`rank-${rank}`} key={'rank-' + {rank}}>
        {
          row.map((square, idx) => {
            const file = files[idx];
            const piece = this.state.board[index][idx];
            console.log(piece);
            return this.renderSquare((file + rank), getColor(index, idx), piece);
          })
        }
      </div>
    })
    console.log(board);

    return (
      <div className="game">
        {board}
      </div>
    )
 } 
}

export default Game;

// helper functions
function createBoard() {
  let arr = [];
  for (let i = 0; i < dims; i++) {
    let subarr = [];
    for (let j = 0; j < dims; j++) {
      const notation = getNotation(i, j, dims);
      const piece = start[notation];
      subarr.push(piece);
    }
    arr.push(subarr);
  }
  return arr;
}

function getNotation(x, y, len) {
  const file = files[y];
  const rank = len - x;
  const notation = file + rank;
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
    color = 'black';
  }
  return color;
}