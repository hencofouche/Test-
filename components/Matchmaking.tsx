import React from 'react';
import { ConnectionStatus } from '../types';
import { SFX } from '../utils/SoundManager';

interface MatchmakingProps {
  elo: number;
  connectionStatus: ConnectionStatus;
  onCancel: () => void;
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ elo, connectionStatus, onCancel }) => {
  
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Connecting to server...';
      case 'connected':
        return 'Searching for an opponent...';
      case 'error':
        return 'Connection error.';
      case 'disconnected':
        return 'Disconnected.';
      default:
        return 'Please wait...';
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center animate-fade-in text-center">
      <h1 className="text-4xl font-bold text-amber-400">Searching for Opponent</h1>
      <p className="text-lg text-gray-300 my-4">Your Rank: <span className="font-bold">{elo}</span></p>
      
      {connectionStatus !== 'error' && (
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500 mx-auto my-8"></div>
      )}
      
      <p className="text-xl text-white my-4">{getStatusText()}</p>
      
      <button
        onClick={() => { SFX.buttonClick(); onCancel(); }}
        className="px-8 py-3 bg-red-800 text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md"
      >
        Cancel
      </button>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};
