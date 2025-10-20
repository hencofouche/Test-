
import React from 'react';
import { Card as CardType, Player, Position } from '../types';
import { BOARD_SIZE } from '../constants';
import { Tile } from '../Tile';

interface BoardProps {
  boardState: (CardType | null)[][];
  currentPlayer: Player;
  validMoves: Position[];
  selectedCardPosition: Position | null;
  onTileClick: (row: number, col: number) => void;
  guardActiveFor: Player | null;
  abilityIntent: CardType | null;
}

export const Board: React.FC<BoardProps> = ({ 
  boardState, 
  currentPlayer, 
  validMoves, 
  selectedCardPosition,
  onTileClick, 
  guardActiveFor,
  abilityIntent,
}) => {
  const isPositionValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="aspect-[2/3] w-full grid grid-cols-8 grid-rows-8 gap-0 bg-black border-4 border-amber-800 shadow-2xl rounded-lg">
        {boardState.map((row, rowIndex) =>
          row.map((card, colIndex) => {
            const isEven = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedCardPosition?.row === rowIndex && selectedCardPosition?.col === colIndex;
            return (
              <Tile
                key={`${rowIndex}-${colIndex}`}
                card={card}
                isEven={isEven}
                isValidMove={isPositionValidMove(rowIndex, colIndex)}
                isSelected={isSelected}
                currentPlayer={currentPlayer}
                isGuarded={!!(card && guardActiveFor === card.player)}
                abilityIntent={abilityIntent}
                onClick={() => onTileClick(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
