
import React from 'react';
import { SFX } from '../utils/SoundManager';

const AbilityRule: React.FC<{ name: string, title: string, description: string }> = ({ name, title, description }) => (
  <li>
    <strong className="text-xl text-white">{name} &ndash; <em className="text-amber-300">{title}</em></strong>
    <p className="text-gray-300 pl-4">{description}</p>
  </li>
);

export const GameRules: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto px-4 animate-fade-in">
      <h1 className="text-5xl font-extrabold my-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 drop-shadow-md">
        Game Rules
      </h1>

      <div className="w-full bg-black/30 p-6 rounded-lg border-2 border-amber-800 text-gray-200 space-y-6 max-h-[70vh] overflow-y-auto">
        
        <section>
          <h2 className="text-3xl font-bold text-amber-400 mb-2">Objective</h2>
          <p>The goal is to capture all of your opponent's pieces. The last player with pieces on the board wins!</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-amber-400 mb-2">Basic Movement</h2>
          <p>
            On your turn, you can move one of your pieces. The standard move is one square in any direction (horizontally, vertically, or diagonally) to an empty tile.
          </p>
          <p className="mt-2">
            To capture an opponent's piece, move your piece onto the tile they occupy.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-amber-400 mb-2">Class Abilities</h2>
          <p className="mb-4">
            Each card has a unique, powerful ability based on its Class. An ability can only be used <strong className="text-white">once per card, per match</strong>. To use an ability, click on your card and select "Use Ability".
          </p>
          
          <ul className="space-y-4">
            <AbilityRule name="Thief" title="Steal Time" description="Activate this ability to be granted an extra turn after your current one ends. This uses the ability, but does not count as your move for the turn. Cannot be used during an extra turn." />
            <AbilityRule name="Assassin" title="Shadow Step" description="Teleport to any empty tile on the board." />
            <AbilityRule name="Guard" title="Full Guard" description="Activate to make all your pieces immune to capture for your opponent's entire turn cycle. This protection persists through extra turns (e.g., from a Thief). This action uses the ability and ends your turn immediately." />
            <AbilityRule name="Knight" title="Charge Line" description="Move up to 3 spaces in a straight line (forward or backward), capturing all enemy pieces in your path. You will land on the last tile in the line (empty or occupied)." />
            <AbilityRule name="Archer" title="Ranged Shot" description="Capture an enemy piece exactly 2 squares away in any direction (straight or diagonal). The Archer does not move." />
            <AbilityRule name="Mage" title="Arcane Bolt" description="Capture an enemy piece up to 3 squares away diagonally. The Mage does not move." />
            <AbilityRule name="Healer" title="Revive" description="Bring a previously captured friendly piece back to the board on an adjacent empty tile. This action replaces your move for the turn." />
          </ul>
        </section>

      </div>

      <button
        onClick={() => { SFX.buttonClick(); onBack(); }}
        className="my-8 px-8 py-3 bg-amber-600 text-black font-bold text-lg rounded-lg hover:bg-amber-500 transition-colors duration-300 shadow-md hover:shadow-lg"
      >
        Back to Menu
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
