

import React from 'react';
import { Player, Card } from '../types';

interface GameStatusProps {
  currentPlayer: Player;
  capturedCards: { Gold: Card[]; Black: Card[] };
  playerNames: { Gold: string; Black: string };
}

export const GameStatus: React.FC<GameStatusProps> = ({ currentPlayer, capturedCards, playerNames }) => {
  const playerColor = currentPlayer === 'Gold' ? 'text-yellow-400' : 'text-gray-300';
  const playerGlow = currentPlayer === 'Gold' ? 'shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'shadow-[0_0_15px_rgba(209,213,219,0.8)]';

  return (
    <div className="w-full max-w-lg p-4 mb-4 text-center bg-gray-900/70 border-2 border-amber-700 rounded-lg shadow-lg backdrop-blur-sm">
      <h2 className={`text-3xl font-serif font-bold transition-all duration-500 ${playerColor} ${playerGlow}`}>
        {playerNames[currentPlayer]}'s Turn
      </h2>
      <div className="flex justify-around mt-3 text-lg">
        <div className="text-gray-300">
          <span className="font-semibold">{playerNames.Black} Captured: </span>
          <span className="text-red-500 font-bold">{capturedCards.Gold.length}</span>
        </div>
        <div className="text-yellow-400">
          <span className="font-semibold">{playerNames.Gold} Captured: </span>
          <span className="text-red-500 font-bold">{capturedCards.Black.length}</span>
        </div>
      </div>
    </div>
  );
};