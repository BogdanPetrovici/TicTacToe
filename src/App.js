import { useState } from 'react';

class SquareInfo {
  #value;
  #isWinningSquare;

  constructor(value, isWinningSquare) {
    this.#value = value;
    this.#isWinningSquare = isWinningSquare;
  }

  setValue(value) {
    this.#value = value;
  }

  setIsWinningSquare(isWinningSquare) {
    this.#isWinningSquare = isWinningSquare;
  }

  getValue() {
    return this.#value;
  }

  getIsWinning() {
    return this.#isWinningSquare;
  }
}

function Square({ squareInfo, onSquareClick }) {
  return <button className={squareInfo.getIsWinning() ? "square red" : "square"} onClick={onSquareClick}>{squareInfo.getValue()}</button>
}

function Row({ rowIndex, squares, onSquareClick }) {
  let squareElements = [];
  for (let colIterator = 0; colIterator < 3; colIterator++) {
    let squareIndex = rowIndex * 3 + colIterator;
    squareElements.push(<Square key={squareIndex} squareInfo={squares[squareIndex]} onSquareClick={() => onSquareClick(squareIndex)} />);
  };

  return <div key={rowIndex} className="board-row">{squareElements}</div>;
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    // Square is already marked or there's already a winner
    if (squares[i].getValue() || calculateWinner(squares)) { return; }
    const nextSquares = squares.map(squareInfo => new SquareInfo(squareInfo.getValue(), squareInfo.getIsWinning()));
    if (xIsNext) {
      nextSquares[i].setValue("X");
    } else {
      nextSquares[i].setValue("O");
    }

    onPlay(nextSquares);
  }

  const winningSquares = calculateWinner(squares);
  const isGameFinished = !hasMovesLeft(squares);
  let status;
  if (winningSquares) {
    status = "Winner: " + squares[winningSquares[0]].getValue();
  } else if (isGameFinished) {
    status = "It's a draw";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  let rows = [];
  for (let rowIterator = 0; rowIterator < 3; rowIterator++) {
    rows.push(<Row key={rowIterator} rowIndex={rowIterator} squares={squares} onSquareClick={handleClick} />);
  }

  return (<>
    <div className="status">{status}</div>
    {rows}
  </>);
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(new SquareInfo(null, false))]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;
  const [moveListIsAscending, setMoveListIsAscending] = useState(true);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }

    if (move < history.length - 1) {
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    } else {
      return (
        <li key={move}>
          You are at move #{move}
        </li>
      )
    }

  });

  const orderedMoves = moveListIsAscending ? moves : moves.reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={() => setMoveListIsAscending(!moveListIsAscending)}>{moveListIsAscending ? "Sort descending" : "Sort ascending"}</button>
        <ol>{orderedMoves}</ol>
      </div>
    </div>
  );
}

function hasMovesLeft(squares) {
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i].getValue()) { return true; }
  }

  return false;
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    const firstSquareValue = squares[a].getValue();
    const secondSquareValue = squares[b].getValue();
    const thirdSquareValue = squares[c].getValue();
    if (firstSquareValue && firstSquareValue === secondSquareValue && firstSquareValue === thirdSquareValue) {
      squares[a].setIsWinningSquare(true);
      squares[b].setIsWinningSquare(true);
      squares[c].setIsWinningSquare(true);
      return lines[i];
    }
  }
  return null;
}