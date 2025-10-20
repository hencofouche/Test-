import React, { useState } from 'react';
import { DeckArray, SavedDecks } from '../types';
import { SFX } from '../utils/SoundManager';

interface RankedDeckSelectProps {
  savedDecks: SavedDecks;
  onFindMatch: (deck: DeckArray) => void;
  onBack: () => void;
}

export const RankedDeckSelect: React.FC<RankedDeckSelectProps> = ({ savedDecks, onFindMatch, onBack }) => {
  const [selectedDeckName, setSelectedDeckName] = useState('');
  const deckOptions = Object.keys(savedDecks);

  const canStart = selectedDeckName && savedDecks[selectedDeckName];

  const handleFindMatch = () => {
    if (!canStart) return;
    onFindMatch(savedDecks[selectedDeckName]);
  };

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto animate-fade-in text-center">
      <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-md">
        Choose Your Deck
      </h1>
      <p className="text-gray-400 mb-8">Select the deck you want to use for the ranked match.</p>
      
      <div className="w-full bg-black/30 p-6 rounded-lg border-2 border-amber-800 mb-8">
        <label htmlFor="deck-select" className="block text-lg font-medium text-gray-300 mb-2">Your Saved Decks</label>
        <select
          id="deck-select"
          value={selectedDeckName}
          onChange={(e) => setSelectedDeckName(e.target.value)}
          className="w-full px-3 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white text-lg"
        >
          <option value="">-- Choose a deck --</option>
          {deckOptions.length > 0 ? (
            deckOptions.map(name => <option key={name} value={name}>{name}</option>)
          ) : (
            <option value="" disabled>No saved decks</option>
          )}
        </select>
      </div>

      <div className="flex space-x-4">
        <button onClick={() => { SFX.buttonClick(); onBack(); }} className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md">
          Back
        </button>
        <button
          onClick={() => { if (!canStart) return; SFX.buttonClick(); handleFindMatch(); }}
          disabled={!canStart}
          className="w-64 px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-xl rounded-lg 
                     hover:from-amber-500 hover:to-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg 
                     focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-opacity-75 transform hover:-translate-y-1
                     disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
          title={!canStart ? "You must select a deck" : "Find a match!"}
        >
          Find Match
        </button>
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
