import React from 'react';
import { SFX } from '../utils/SoundManager';

interface PlayMenuProps {
  onBot: () => void;
  onLocal: () => void;
  onBack: () => void;
}

const Button: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
  <button
    onClick={() => { SFX.buttonClick(); onClick(); }}
    className="w-64 px-8 py-4 my-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-xl rounded-lg 
               hover:from-amber-500 hover:to-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg 
               focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-opacity-75 transform hover:-translate-y-1"
  >
    {children}
  </button>
);

export const PlayMenu: React.FC<PlayMenuProps> = ({ onBot, onLocal, onBack }) => {
  return (
    <div className="relative z-10 flex flex-col items-center animate-fade-in">
      <h1 className="text-6xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
        Choose a Mode
      </h1>
      <div className="flex flex-col items-center">
        <Button onClick={onBot}>Practice vs. Bot</Button>
        <Button onClick={onLocal}>Pass & Play</Button>
        <div className="w-64 my-2 border-t border-amber-800/50"></div>
        <Button onClick={onBack}>Back to Menu</Button>
      </div>
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
