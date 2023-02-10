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

const player = {
  'w': -1,
  'b': 1,
};

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
  'n': [[1, 2], [2, 1], [1, -2], [-1, -2], [-1, 2], [2, -1], [-2, 1], [-2, -1]],
  'p': function(turn) {
    // pawns advance across the board
    const fwd = 1 * turn;
    const fwdR = [fwd, 1];
    const fwdL = [fwd, -1];
    return [[fwd, 0], fwdR, fwdL, [fwd * 2, 0]];
  },
};
movements['k'] = movements['r'].concat(movements['b']);
movements['q'] = movements['k'];

const menaces = movements['q'].concat(movements['n']);

const destination = {
  'p': checkPawnDestination,
  'n': checkKnightDestination,
  'r': checkDestination,
  'b': checkDestination,
  'q': checkDestination,
  'k': checkDestination,
}

function Square(props) {
  const img = props.square ? props.square.slice(0, 2) : '';
  return (
  <button
    className={`square ${props.color} ${props.selected}`}
    id={props.notation}
    style={{backgroundColor: props.color}}
  >
    <div
      className={`piece`}
      style={{
        backgroundImage: `url(media/${img}.svg`,
      }}
      onClick={props.onSquareClick}
    >
    </div>
  </button>
  );
}

export default function Board() {
  const [history, setHistory] = useState([{squares: getBoard(), move: {}}]);
  const ct = history[history.length - 1];
  const squares = ct.squares;
  // const selected = ct.move.start ? ct.move.start : undefined;
  const [selected, setSelected] = useState(undefined);

  function handleClick(row, col) {
    const turn = history.length % 2 === 0 ? 1 : -1;
    const sq = squares[row][col];
    console.log(`
      START PHASE ${selected ? '2' : '1'} -
      ${turn === 1 ? 'BLACK' : 'WHITE'}'S TURN
      ${turn}
      Turns so far: ${history.length}
      According to selected, a piece ${selected ? 'is' : 'is not'} selected.
      ${selected}
    `);
    console.log(`This is the record of the moves:`);
    console.log(history);
    console.log(`Clicked on ${row}, ${col}.`);
    if (!selected && !checkTurn(sq, turn)) return;
    if (
      !selected && checkTurn(sq, turn)
    ) {
      const canMove = checkMovementPossibility(row, col, history);
      if (!canMove) {
        clogger('falsy canMove');
        return;
      }
      console.log(`${row + ', ' + col} can move`)
      ct.move = {
        piece: ct.squares[row][col],
        start: [row, col],
      };
      setHistory([...history.slice(0, -1), ct]);
      setSelected(ct.move.start);
    } else if (
      selected && !checkTurn(sq, turn)
    ) {
      const type = ct.move.piece[0];
      const move = destination[type](row, col, history);
      console.log(move);
      if (!move) return;
      const lm = ct.move.start;
      // const ep = move['ep'] ? move['ep'] : []; // store coordinates of piece captured in en passant
      const nextSquares = squares.slice();
      const [ox, oy, nx, ny, piece] = [
        lm[0], lm[1], row, col, ct.move.piece
      ];
      if (move.length) nextSquares[move[0]][move[1]] = undefined;
      nextSquares[ox][oy] = undefined;
      nextSquares[nx][ny] = piece;
      ct.move.end = [row, col];
      const nextturn = {
        squares: ct.squares.slice(),
        move: {},
      }
      nextturn.squares[lm[0]][lm[1]] = undefined;
      nextturn.squares[row][col] = ct.move.piece;
      setHistory([...history.slice(0, -1), ct, nextturn]);
      setSelected(undefined);
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
          // if ([row, col].join('') === sq)

          return <Square
            selected={
              selected && sq && selected.join('') === [row,col].join('') ?
              'selected' : ''
            }
            notation={notation}
            // calculate color of square
            color={getColor(row, col)}
            // 'setup' piece; value is undefined if no piece is on the square
            square={sq} // change to sq.id
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
      const square = onSquare ? onSquare + i + j : onSquare; 
      row.push(square); // add square to row
    }
    board.push(row); // add row to board
  }
  return board;
}

function checkKnightDestination(nx, ny, history) {
  const turn = history.length % 2 === 0 ? 1 : -1;
  const ct = history[history.length - 1];
  const squares = ct.squares;
  const dest = squares[nx][ny];
  if (checkTurn(dest, turn)) return; /// return if selecting one of the player's other pieces
  const start = ct.move.start;
  const [ox, oy] = [start[0], start[1]];
  const type = squares[ox][oy][0];
  for (let step = 0; step < movements[type].length; step++) {
    const mstr = diff(nx, ox) + ',' + diff(ny, oy);
    const arrstr = movements[type][step].join(',');
    if (arrstr === mstr) {
      return [];
    }
  }
}

function checkMovementPossibility(x, y, history) {
  clogger('checkMovePossibility');
  const turn = history.length % 2 === 0 ? 1 : -1;
  const ct = history[history.length - 1];
  const squares = ct.squares;
  const type = squares[x][y][0];
  const moves = type === 'p' ? movements[type](turn) : movements[type];
  for (let i = 0; i < moves.length; i++) {
    const [nx, ny] = [x + moves[i][0], y + moves[i][1]];
    if (
      nx < 8 && nx > -1 && ny < 8 && ny > -1 &&
      (
        !checkTurn(squares[nx][ny], turn) && type !== 'p' || 
        checkPawnDestination(nx, ny, history, x, y)
      )
    ) {
      return {};
    }
  }
  return false;
}

function checkDestination(nx, ny, history) {
  const ct = history[history.length - 1];
  const type = ct.move.piece[0];
  if (type === 'p') return checkPawnDestination(nx, ny, history);
  if (type === 'n') return checkKnightDestination(nx, ny, history);
  const slope = getSlope(nx, ny, history);
  if (!slope.length) {
    console.log('invalid move');
    return;
  }
  console.log(`checking destination`);
  const turn = history.length % 2 === 0 ? 1 : -1;
  const squares = ct.squares;
  const start = ct.move.start;
  const [ox, oy] = [start[0], start[1]];
  if (type !== 'k') {

  }
  const [dx, dy] = [slope[0], slope[1]];
  let [cx, cy] = [ox, oy];
  console.log(`
  charting course
  ox, oy: ${ox + ', ' + oy}
  dx, dy: ${dx + ', ' + dy}
  nx, ny: ${nx + ', ' + ny}
  ox + dx, oy + dy: ${(ox + dx) + ',' + (oy + dy)}
  `);
  if (type === 'k' && (ox + dx) === nx && (oy + dy) === ny) {
    return [nx, ny];
  }
  if (type !== 'k') {
    return pathfinder([nx, ny], start, slope, squares);
  }
}

function checkKingDestination(nx, ny, history) {
}

function checkPawnDestination(nx, ny, history, x, y) {
  console.log(`hitting pawn destination checker`)
  const t = history.length % 2 === 0 ? 1 : -1;
  const ct = history[history.length - 1]; // access state for current turn
  const start = ct.move.start;
  const [ox, oy] = start ? [start[0], start[1]] : [x, y];
  const d = diff(diff(nx, ox), diff(ny, oy));
  const [dx, dy] = [diff(nx, ox), diff(ny, oy)];

  console.log(`
    starting point: ${ox + ', ' + oy}
    destination: ${nx + ', ' + ny}
    "d": ${d}
    t: ${t}
  `)
  if (d > 2) return;
  const pm = history.length > 1 ? history[history.length - 2].move : undefined; // access state for previous move
  const squares = ct.squares;
  const dest = squares[nx][ny];
  if (
    ( // conditions for advanncing two squares
      clogger(dest) &&
      nx === (ox + 2 * t) && dy === 0 &&
      !dest && !squares[ox + t][ny] &&
      clogger(`advance 2`) &&
      (ox === 1 || ox === 6) &&
      clogger(`advance onward`)
    ) ||
    (
      nx === (ox + t) && dy === 0 && !dest // advance 1
    ) ||
    (
      nx === (ox + t) && dy === 1 && dest && !checkTurn(dest, t) // advance one diagonally and capture enemy
    )
  ) {
    return [];
  } else if (// conditions for en passant
      d === 0 && !dest &&
      diff(pm.start[0], pm.end[0]) === 2 &&
      diff(pm.end[1], ny) === d &&
      diff(pm.start[0], nx) === 1 
  ) {
    return pm.end;
  }
}

function clogger(string) {
  console.log(string);
  return true;
}

function checkTurn(square, turn) {
  clogger('check turn');
  if (!square) {
    clogger('square is empty');
    return;
  }

  const pl = square[1];
  const isTurn = player[pl] === turn ? true : false;
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
  return greater - lesser;
}

function getRank(x) {
  return dims - x;
}

function getSlope(nx, ny, history) {
  const ct = history[history.length - 1]; // access current turn
  const type = ct.move.piece[0];          // access piece type
  const squares = ct.squares;
  const start = ct.move.start;            // access piece's starting point
  const [ox, oy] = [start[0], start[1]];
  console.log(nx - ox, ny -oy);
  // save sign of each coordinate of the slope
  const sign = [Math.sign(nx - ox), Math.sign(ny - oy)];
  const r = reduce(nx - ox, ny - oy); // simplify the fraction
  console.log(r);
  const [dx, dy] = [ // confirm that each reduced coordinate retains the
    Math.sign(r[0]) === sign[0] ? r[0] : r[0] * -1, // right sign
    Math.sign(r[1]) === sign[1] ? r[1] : r[1] * -1
  ];
  // store the simplified coordinates with the correct signs in an array
  const slope = [dx, dy];
  const slopestr = slope.join(','); // create a string to check against
  // strings  representing each possible move the piece can make
  for (let i = 0; i < movements[type].length; i++) {
    const move = movements[type][i];
    const movestr = move.join(',');
    if (slopestr === movestr) {
      return slope; // return the slope if valid
    }
  }
  return [];
}

function pathfinder(newcos, oldcos, slope, squares) {
  let [nx, ny, cx, cy, dx, dy] = [...newcos, ...oldcos, ...slope];
  let newstr = [cx, cy].join(',');
  const deststr = [nx, ny].join(',');
  const turn = player[squares[cx][cy][0]];
  while (newstr !== deststr) {
    cx += dx;
    cy += dy;
    newstr = [cx, cy].join(',');
    if (!checkTurn(squares[nx][ny]), turn) return;
  }
  return [nx, ny];
}

// source: https://www.geeksforgeeks.org/reduce-a-fraction-to-its-simplest-form-by-using-javascript/
function reduce(number, denomin) {
  var gcd = function gcd(a,b){
    return b ? gcd(b, a%b) : a;
  };
  gcd = gcd(number,denomin);
  return [number/gcd, denomin/gcd];
}