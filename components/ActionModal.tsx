
import React from 'react';
import { Card as CardType, Position } from '../types';
import { CardDisplay } from './CardDisplay';
import { SFX } from '../utils/SoundManager';

interface ActionModalProps {
  cardInfo: { card: CardType; position: Position };
  onMove: () => void;
  onUseAbility: () => void;
  onCancel: () => void;
  isExtraTurn: boolean;
}

const abilityDescriptions: Record<string, string> = {
    Thief: "Take another turn after completing this one.",
    Assassin: "Teleport to any empty tile on the board.",
    Guard: "Your pieces cannot be captured on your opponent's next turn.",
    Knight: "Charge up to 3 spaces, capturing all enemies in your path.",
    Archer: "Capture an enemy exactly 2 squares away.",
    Mage: "Capture an enemy up to 3 squares away diagonally.",
    Healer: "Return a captured ally to an adjacent empty square."
};

export const ActionModal: React.FC<ActionModalProps> = ({ cardInfo, onMove, onUseAbility, onCancel, isExtraTurn }) => {
  const { card } = cardInfo;
  
  const isThiefInExtraTurn = card.className === 'Thief' && isExtraTurn;
  const canUseAbility = !card.abilityUsed && !isThiefInExtraTurn;
  
  const getAbilityDisabledTooltip = () => {
    if (card.abilityUsed) return "Ability already used this match.";
    if (isThiefInExtraTurn) return "Cannot use Steal Time during an extra turn.";
    return abilityDescriptions[card.className] || "This card has no special ability.";
  };

  const handleAbilityClick = () => {
    if (!canUseAbility) return;
    SFX.buttonClick();
    onUseAbility();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onCancel}
    >
      <div
        className="relative transform transition-transform duration-300 animate-slide-up bg-gray-900 border-2 border-amber-700 rounded-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <CardDisplay card={card} isModal={true} />

        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={() => { SFX.buttonClick(); onMove(); }}
            className="w-full px-6 py-3 bg-amber-600 text-black font-bold text-lg rounded-lg hover:bg-amber-500 transition-colors duration-300 shadow-md"
          >
            Move
          </button>
          <button
            onClick={handleAbilityClick}
            disabled={!canUseAbility}
            title={getAbilityDisabledTooltip()}
            className="w-full px-6 py-3 bg-cyan-600 text-white font-bold text-lg rounded-lg hover:bg-cyan-500 transition-colors duration-300 shadow-md disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use Ability
          </button>
          <button
            onClick={() => { SFX.buttonClick(); onCancel(); }}
            className="w-full mt-2 px-6 py-2 bg-gray-700 text-white font-bold text-md rounded-lg hover:bg-gray-600 transition-colors duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        
        @keyframes slide-up {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
