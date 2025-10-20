import React, { useRef } from 'react';
import { SFX } from '../utils/SoundManager';

interface StartMenuProps {
  onPlay: () => void;
  onDeckBuilder: () => void;
  onGacha: () => void;
  onCodex: () => void;
  onCreator: () => void;
  onRules: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInstall: () => void;
  canInstall: boolean;
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

export const StartMenu: React.FC<StartMenuProps> = ({ onPlay, onDeckBuilder, onGacha, onCodex, onCreator, onRules, onSave, onLoad, onInstall, canInstall }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    SFX.buttonClick();
    fileInputRef.current?.click();
  };
  
  return (
    <div className="relative z-10 flex flex-col items-center">
      <style>{`
        @keyframes typing-cycle {
          0% {
            width: 0;
          }
          60% {
            width: 100%;
          }
          80% {
            width: 100%;
          }
          100% {
            width: 0;
          }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #fbbf24; /* yellow-400 */ }
        }

        .typewriter-h1 {
            overflow: hidden;
            border-right: .1em solid #fbbf24;
            white-space: nowrap;
            /* Total 10s: 6s typing, 2s pause, 2s deleting */
            animation:
                typing-cycle 10s steps(13) infinite,
                blink-caret .75s step-end infinite;
        }
      `}</style>
      <div className="text-center mb-8">
        <h1 className="inline-block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] typewriter-h1">
          Otaku's Gambit
        </h1>
      </div>
      <div className="flex flex-col items-center">
        <Button onClick={onPlay}>Play</Button>
        <Button onClick={onDeckBuilder}>Deck Builder</Button>
        <Button onClick={onGacha}>Card Draw</Button>
        <Button onClick={onCodex}>Codex</Button>
        <Button onClick={onCreator}>Create Card</Button>
        <Button onClick={onRules}>Game Rules</Button>
        {canInstall && (
          <button
              onClick={() => { SFX.buttonClick(); onInstall(); }}
              className="w-64 px-8 py-4 my-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xl rounded-lg 
                        hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-md hover:shadow-lg 
                        focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-75 transform hover:-translate-y-1"
          >
              Install App
          </button>
        )}
        <div className="w-64 my-2 border-t border-amber-800/50"></div>
        
        <div className="flex w-64 gap-2 my-2">
            <button
                onClick={() => { SFX.buttonClick(); onSave(); }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-lg rounded-lg hover:from-amber-500 hover:to-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-opacity-75 transform hover:-translate-y-1"
            >
                Save Game
            </button>
            <button
                onClick={handleLoadClick}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-lg rounded-lg hover:from-amber-500 hover:to-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-opacity-75 transform hover:-translate-y-1"
            >
                Load Game
            </button>
        </div>

        <input 
          type="file" 
          // Fix: Corrected typo in ref name from fileInputref to fileInputRef.
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={onLoad} 
          accept=".json,application/json"
        />
      </div>
    </div>
  );
};
