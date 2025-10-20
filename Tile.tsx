
// Fix: Creating the Tile component for the game board.
import React from 'react';
import { Card as CardType, Player, Position } from './types';
import { Card } from './components/Card';
import { CaptureIcon, GuardIcon, StealIcon } from './icons';

interface TileProps {
  card: CardType | null;
  isEven: boolean;
  isValidMove: boolean;
  isSelected: boolean;
  currentPlayer: Player;
  isGuarded: boolean;
  abilityIntent: CardType | null;
  onClick: () => void;
}

export const Tile: React.FC<TileProps> = ({
  card,
  isEven,
  isValidMove,
  isSelected,
  currentPlayer,
  isGuarded,
  abilityIntent,
  onClick,
}) => {
  const bgColor = isEven ? 'bg-[#DAAB2D]' : 'bg-[#262626]';
  const isOpponentCard = card && card.player !== currentPlayer;

  const tileStyle = `w-full h-full flex items-center justify-center transition-colors duration-300 relative ${bgColor}`;

  const cardContainerStyle = `w-full h-full group cursor-pointer transition-all duration-200 rounded-md`;
  const selectedStyle = isSelected ? 'ring-4 ring-yellow-300 shadow-lg shadow-yellow-400/50' : '';
  const displayName = card ? `${card.className}: ${card.name} (Stage ${card.activeStage + 1})` : '';

  return (
    <div
      className={tileStyle}
      onClick={onClick}
    >
      {card && (
        <div
          className={`${cardContainerStyle} ${selectedStyle}`}
          title={displayName}
        >
          <Card card={card} currentPlayer={currentPlayer} />
          {isGuarded && (
            <div className="absolute top-1 left-1 w-5 h-5 text-sky-300 pointer-events-none z-20" title="Guarded">
              <GuardIcon className="w-full h-full drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
            </div>
          )}
        </div>
      )}

      {/* Overlay for valid moves, with a capture icon if an opponent is present */}
      {isValidMove && (
        <div className="absolute inset-0 bg-white/40 pointer-events-none flex items-center justify-center z-10">
           {abilityIntent?.className === 'Thief' && isOpponentCard && (
             <StealIcon className="w-10 h-10 text-violet-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" />
          )}
          {abilityIntent?.className !== 'Thief' && isOpponentCard && (
            <CaptureIcon className="w-10 h-10 text-red-700 drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" />
          )}
        </div>
      )}
    </div>
  );
};