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
  return (
  <button
    className={`square ${props.color}`}
    id={props.notation}
    style={{backgroundColor: props.color}}
  >
    <div
      className="piece"
      style={{
        backgroundImage: `url(media/${props.piece}.svg`,
      }}
      onClick={props.onSquareClick}
    >
    </div>
  </button>
  );
}

export default function Board() {
  const [squares, setSquares] = useState(createBoard());

  function handleClick(x, y) {
    const nextSquares = squares.slice();
    nextSquares[x][y] = 'X';
    setSquares(nextSquares);
    console.log(nextSquares);
  }  

  const board = squares.map((arr, row) => {
    // find row number ('rank') by counting backward from second player's side
    const rank = dims - row;
    return <div className="rank" id={'rank-' + rank} key={'rank-' + rank}>
      {
        arr.map((sq, col) => {
          // initialize notation to square's location on the grid
          const notation = files[col] + rank;
          return <Square
            notation={notation}
            // calculate color of square
            color={getColor(row, col)}
            // 'setup' piece; value is undefined if no piece is on the square
            piece={sq}
            onSquareClick={() => handleClick(row, col)}
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
function createBoard() {
  // chess board consists of 64 squares arranged in 8x8 grid
  // initialize array to contain the board
  let arr = [];
  for (let i = 0; i < dims; i++) {
    // initialize eight subarrays to act as rows in grid
    let subarr = [];
    for (let j = 0; j < dims; j++) {
      // get square's notation by finding its position in the grid
      const notation = getNotation(i, j);
      // look up if a piece is on the square at game start
      const piece = start[notation];
      subarr.push(piece);
    }
    arr.push(subarr);
  }
  return arr;
}

function getNotation(x, y) {
  const rank = dims - x;
  const file = files[y];
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
    // tiles are green so that the second player's pieces are more visible
    color = 'green';
  }
  return color;
}