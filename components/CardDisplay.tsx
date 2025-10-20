import React from 'react';
import { CardDefinition, PlayerCollection } from '../types';
import { getCardImageUrl } from '../utils';
import { MediaDisplay } from './MediaDisplay';

interface CardDisplayProps {
  card: CardDefinition;
  collection?: PlayerCollection; // Make collection optional for previews
  isModal?: boolean;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card, collection = [], isModal = false }) => {
  const altText = `${card.className} - ${card.name}`;
  const styles = { borderColor: 'border-gray-500/60', shadow: 'shadow-[0_0_6px_rgba(156,163,175,0.6)]' };

  if (!isModal) {
    const mediaUrl = card.image || getCardImageUrl(card.className, card.name);
    return (
      <div className={`w-full h-full aspect-[2/3] bg-black rounded-lg border-2 ${styles.borderColor} ${styles.shadow} overflow-hidden flex flex-col items-center justify-center relative`}>
        {mediaUrl ? (
          <MediaDisplay 
            src={mediaUrl} 
            alt={altText} 
            className="w-full h-full object-cover pointer-events-none" 
            draggable={false} 
            onError={(e) => (e.currentTarget as HTMLElement).style.display = 'none'}
          />
        ) : (
          <div className="text-xs text-gray-400 text-center p-1">No Image</div>
        )}
      </div>
    );
  }

  // --- Modal View ---
  const mediaUrl = card.image || getCardImageUrl(card.className, card.name);
  const totalOwned = collection.filter(c => c.cardId === card.id).length;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Preview Card */}
      <div className="w-72 md:w-80 relative">
        <div className={`w-full aspect-[2/3] bg-black rounded-lg border-2 ${styles.borderColor} ${styles.shadow} flex flex-col overflow-hidden transition-all duration-300`}>
            <div className="flex-grow relative flex items-center justify-center bg-gray-900 text-gray-400">
                {mediaUrl ? (
                    <MediaDisplay
                      src={mediaUrl} 
                      alt={altText} 
                      className={`w-full h-full object-cover transition-all duration-300 pointer-events-none`} 
                      draggable={false}
                      onError={(e) => {
                          const target = e.currentTarget as HTMLElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.error-text')) {
                              const errorEl = document.createElement('p');
                              errorEl.className = 'error-text text-red-500';
                              errorEl.textContent = 'Media Not Found';
                              parent.appendChild(errorEl);
                          }
                      }}
                    />
                ) : (
                   <div className="p-4 text-center">
                     <p>No Image Available</p>
                   </div>
                )}
                {/* Class Name: Top Right */}
                <div className="absolute top-2 right-2 px-3 py-1 rounded-md border-2 bg-black/60 border-black/60 max-w-[calc(50%-1rem)]">
                    <span className="text-white/80 text-lg font-bold drop-shadow-md truncate">{card.className}</span>
                </div>
                {/* Card Name: Bottom Center */}
                <div className="absolute bottom-2 left-2 right-2 px-3 py-1 rounded-md border-2 bg-black/60 border-black/60 text-center">
                    <span className="text-white/80 text-lg font-bold truncate drop-shadow-md">{card.name}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Info Box (only shown in contexts like Codex where collection is provided) */}
      {collection.length > 0 && (
          <div className="w-72 md:w-80 text-center bg-gray-900/80 p-3 rounded-lg border border-gray-700">
            <p className="text-lg text-white">Total Owned: <span className="font-bold text-amber-400">{totalOwned}</span></p>
          </div>
      )}
    </div>
  );
};