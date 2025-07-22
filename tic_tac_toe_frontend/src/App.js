import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// PUBLIC_INTERFACE
/**
 * Root App component for web-based Tic Tac Toe Game.
 * Implements: centered responsive board, player turn indicator, win/draw notification, restart button, full color theming.
 */
function App() {
  // Game state: 'X' or 'O' for each cell, and whose turn
  const emptyBoard = Array(9).fill(null);
  const [board, setBoard] = useState(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);

  // For accessibility and keyboard navigation
  const [lastPlayed, setLastPlayed] = useState(null);

  // For light/dark theme toggle (retained from template for demonstration)
  const [theme, setTheme] = useState('light');

  // CSS variables for color scheme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--primary', '#1976D2');
    document.documentElement.style.setProperty('--secondary', '#43A047');
    document.documentElement.style.setProperty('--accent', '#D32F2F');
    document.documentElement.style.setProperty('--white', '#fff');
  }, [theme]);

  // Game effect: check for win/draw after every move
  useEffect(() => {
    const outcome = calculateWinner(board);
    if (outcome) {
      setWinner(outcome);
      setDraw(false);
    } else if (board.every(Boolean)) {
      setWinner(null);
      setDraw(true);
    } else {
      setWinner(null);
      setDraw(false);
    }
  }, [board]);

  // PUBLIC_INTERFACE
  /**
   * Handles board cell click, only if move is legal and game isn't over.
   * @param {number} idx - Board array index (0-8).
   */
  const handleCellClick = (idx) => {
    if (board[idx] || winner || draw) return;
    const nextBoard = [...board];
    nextBoard[idx] = currentPlayer;
    setBoard(nextBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    setLastPlayed(idx);
  };

  // PUBLIC_INTERFACE
  /**
   * Resets board to initial state.
   */
  const restartGame = () => {
    setBoard(emptyBoard);
    setCurrentPlayer('X');
    setWinner(null);
    setDraw(false);
    setLastPlayed(null);
  };

  // Helper for rendering winning line cells differently
  const winLine = winner ? findWinningLine(board) : [];

  return (
    <div className="ttt-app">
      <main className="ttt-main-container">
        <section className="ttt-header">
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <p className="ttt-description">A modern, minimalistic implementation for two players</p>
        </section>
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          disabled={Boolean(winner) || draw}
          winLine={winLine}
          lastPlayed={lastPlayed}
        />
        <GameInfo
          currentPlayer={currentPlayer}
          winner={winner}
          draw={draw}
        />
        <ActionBar restartGame={restartGame} />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </main>
      <footer className="ttt-footer">
        <span>
          <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a> • Minimal UI • 
          By Kavia
        </span>
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Game board UI. 3x3 grid. Highlights winning cells.
 */
function GameBoard({ board, onCellClick, disabled, winLine, lastPlayed }) {
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe game board">
      {board.map((val, idx) => {
        const isWinner = winLine && winLine.includes(idx);
        const cellClass = [
          "ttt-cell",
          isWinner ? "ttt-cell-winner" : "",
          lastPlayed === idx ? "ttt-cell-last" : ""
        ].join(" ");
        return (
          <button
            key={idx}
            className={cellClass}
            onClick={() => onCellClick(idx)}
            disabled={Boolean(val) || disabled}
            tabIndex={0}
            aria-label={val ? `Cell ${idx + 1}: ${val}` : `Cell ${idx + 1}: empty`}
          >
            <span className={`ttt-cell-value${val === 'O' ? " ttt-o" : ""}${val === 'X' ? " ttt-x" : ""}`}>
              {val}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Displays whose turn, win, or draw status.
 */
function GameInfo({ currentPlayer, winner, draw }) {
  return (
    <div className="ttt-info">
      {!winner && !draw && (
        <div className="ttt-turn">
          <span>Turn:</span>
          <span
            className={`ttt-turn-player ttt-${currentPlayer.toLowerCase()}`}
            aria-label={`Current player: ${currentPlayer}`}
          >
            {currentPlayer}
          </span>
        </div>
      )}
      {winner && (
        <div className="ttt-outcome" role="alert">
          <span className="ttt-victory-text">🎉 Player {winner} wins!</span>
        </div>
      )}
      {!winner && draw && (
        <div className="ttt-outcome" role="alert">
          <span className="ttt-draw-text">🤝 It's a draw!</span>
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Action bar with Restart button and animated 3D/shiny effects.
 */
function ActionBar({ restartGame }) {
  // States/refs to handle animation classes & shine
  const [bounce, setBounce] = useState(false);
  const [shine, setShine] = useState(false);
  const btnRef = useRef(null);

  // Handler for animated tactile + shine effect
  const handleRestart = () => {
    // Trigger 3D bounce
    setBounce(true);
    setShine(true);
    // Actually restart the game
    restartGame();
  };

  // Remove animation class after bounce completes
  useEffect(() => {
    if (bounce) {
      const timeout = setTimeout(() => setBounce(false), 290); // match keyframes duration
      return () => clearTimeout(timeout);
    }
  }, [bounce]);
  // Remove shine overlay after animation
  useEffect(() => {
    if (shine) {
      const timeout = setTimeout(() => setShine(false), 870); // match shine keyframes duration
      return () => clearTimeout(timeout);
    }
  }, [shine]);

  return (
    <div className="ttt-actions">
      <button
        ref={btnRef}
        className={
          "ttt-btn ttt-btn-restart" +
          (bounce ? " animate-bounce" : "")
        }
        onClick={handleRestart}
        type="button"
        tabIndex={0}
        aria-label="Restart game"
      >
        Restart
        {shine && <span className="ttt-btn-shine" />}
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
/**
 * Toggle between light and dark mode (optional, demo feature retained).
 */
function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      type="button"
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

// Tic Tac Toe win logic
function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diags
  ];
  for (let [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}
function findWinningLine(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return line;
    }
  }
  return [];
}

export default App;
