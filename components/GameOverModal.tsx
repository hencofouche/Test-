import React from 'react';
import { Player } from '../types';
import { SFX } from '../utils/SoundManager';

interface GameOverModalProps {
  winner: Player | null;
  onRestart: () => void;
  playerNames: { Gold: string; Black: string };
  winReason?: 'surrender' | 'capture';
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onRestart, playerNames, winReason = 'capture' }) => {
  if (!winner) return null;

  const winnerColor = winner === 'Gold' ? 'text-yellow-400' : 'text-gray-300';
  const winnerName = playerNames[winner];
  
  const getWinMessage = () => {
    // You could add more custom messages for surrender if needed
    return `${winnerName} Wins!`;
  };


  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-900 border-4 border-amber-600 rounded-xl shadow-2xl p-8 text-center transform scale-95 transition-transform duration-300 animate-slide-up">
        <h2 className="text-4xl font-serif mb-4">Game Over</h2>
        <p className={`text-3xl font-bold mb-6 ${winnerColor}`}>{getWinMessage()}</p>
        <button
          onClick={() => { SFX.buttonClick(); onRestart(); }}
          className="px-8 py-3 bg-amber-600 text-black font-bold text-lg rounded-lg hover:bg-amber-500 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75"
        >
          Main Menu
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        
        @keyframes slide-up {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards 0.2s; }
      `}</style>
    </div>
  );
};
