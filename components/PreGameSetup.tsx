import React, { useState } from 'react';
import { DeckArray, SavedDecks } from '../types';
import { SFX } from '../utils/SoundManager';

interface PreGameSetupProps {
  savedDecks: SavedDecks;
  isBotMatch: boolean;
  onStartMatch: (
    goldPlayer: { name: string; deck: DeckArray },
    blackPlayer: { name:string; deck: DeckArray }
  ) => void;
  onBack: () => void;
}

const PlayerSetup: React.FC<{
    playerLabel: string;
    playerName: string;
    setPlayerName: (name: string) => void;
    deckName: string;
    setDeckName: (name: string) => void;
    borderColor: string;
    textColor: string;
    deckOptions: string[];
    isNameDisabled?: boolean;
}> = ({ playerLabel, playerName, setPlayerName, deckName, setDeckName, borderColor, textColor, deckOptions, isNameDisabled }) => (
    <div className={`flex-1 bg-black/30 p-6 rounded-lg border-2 ${borderColor}`}>
        <h2 className={`text-3xl font-bold mb-4 text-center ${textColor}`}>{playerLabel}</h2>
        <div className="space-y-4">
            <div>
                <label htmlFor={`${playerLabel}-name`} className="block text-sm font-medium text-gray-300 mb-1">Player Name</label>
                <input
                    type="text"
                    id={`${playerLabel}-name`}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white disabled:bg-gray-700"
                    placeholder="Enter Name"
                    disabled={isNameDisabled}
                />
            </div>
            <div>
                <label htmlFor={`${playerLabel}-deck`} className="block text-sm font-medium text-gray-300 mb-1">Select Deck</label>
                <select
                    id={`${playerLabel}-deck`}
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                >
                    <option value="">-- Choose a deck --</option>
                    {deckOptions.length > 0 ? (
                        deckOptions.map(name => <option key={name} value={name}>{name}</option>)
                    ) : (
                        <option value="" disabled>No saved decks</option>
                    )}
                </select>
            </div>
        </div>
    </div>
);

export const PreGameSetup: React.FC<PreGameSetupProps> = ({ savedDecks, isBotMatch, onStartMatch, onBack }) => {
    const [p1Name, setP1Name] = useState('Player 1');
    const [p2Name, setP2Name] = useState(isBotMatch ? 'Bot' : 'Player 2');
    const [p1DeckName, setP1DeckName] = useState('');
    const [p2DeckName, setP2DeckName] = useState('');

    const deckOptions = Object.keys(savedDecks);
    const canStart = p1Name.trim() && p2Name.trim() && p1DeckName && p2DeckName && savedDecks[p1DeckName] && savedDecks[p2DeckName];

    const handleStart = () => {
        if (!canStart) return;
        onStartMatch(
            { name: p1Name, deck: savedDecks[p1DeckName] },
            { name: p2Name, deck: savedDecks[p2DeckName] }
        );
    };

    return (
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in">
             <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-md">
                Match Setup
            </h1>
            <div className="w-full flex flex-col md:flex-row gap-8 mb-8">
               <PlayerSetup 
                 playerLabel="Player 1 (Gold)"
                 playerName={p1Name}
                 setPlayerName={setP1Name}
                 deckName={p1DeckName}
                 setDeckName={setP1DeckName}
                 borderColor="border-yellow-400"
                 textColor="text-yellow-400"
                 deckOptions={deckOptions}
               />
               <PlayerSetup 
                 playerLabel={isBotMatch ? 'Bot (Black)' : 'Player 2 (Black)'}
                 playerName={p2Name}
                 setPlayerName={isBotMatch ? ()=>{} : setP2Name}
                 isNameDisabled={isBotMatch}
                 deckName={p2DeckName}
                 setDeckName={setP2DeckName}
                 borderColor="border-gray-400"
                 textColor="text-gray-300"
                 deckOptions={deckOptions}
               />
            </div>
            <div className="flex space-x-4">
                <button onClick={() => { SFX.buttonClick(); onBack(); }} className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md">
                  Back
                </button>
                <button
                    onClick={() => { if (!canStart) return; SFX.buttonClick(); handleStart(); }}
                    disabled={!canStart}
                    className="w-64 px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-xl rounded-lg 
                               hover:from-amber-500 hover:to-yellow-400 transition-all duration-300 shadow-md hover:shadow-lg 
                               focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-opacity-75 transform hover:-translate-y-1
                               disabled:from-gray-600 disabled:to-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    title={!canStart ? "Both players must select a valid deck" : "Start the match!"}
                >
                    Start Match
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
}
