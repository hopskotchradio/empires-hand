import React from 'react';
import ReactDOM from 'react-dom/client';
import { Board } from './components/Board';
import { createGame, createPlayer } from './game/engine';
import { greeks, norse } from './game/cards';

// Create a demo game
const player1 = createPlayer('p1', greeks);
const player2 = createPlayer('p2', norse);
const gameState = createGame([player1, player2]);

const App = () => (
  <Board gameState={gameState} currentPlayerId="p1" />
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
