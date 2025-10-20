// Fix: Creating a simple Card component for rendering a card on the game board.
import React from 'react';
import { Card as CardType, Player } from '../types';
import { getCardImageUrl } from '../utils';
import { MediaDisplay } from './MediaDisplay';

interface CardProps {
  card: CardType;
  currentPlayer: Player;
}

export const Card: React.FC<CardProps> = ({ card, currentPlayer }) => {
  const styles = { borderColor: 'border-gray-500/60', shadow: 'shadow-[0_0_6px_rgba(156,163,175,0.6)]' };
  const displayName = `${card.className}: ${card.name}`;
  const isInactive = card.player !== currentPlayer;
  
  // Prioritize an uploaded image/video, but fall back to the naming convention.
  const mediaUrl = card.image || getCardImageUrl(card.className, card.name);

  // A simple onError handler to show a clear message if the media fails to load.
  const handleMediaError = (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement, Event>) => {
    const target = e.currentTarget as HTMLElement;
    target.style.display = 'none'; // Hide the broken media icon
    const parent = target.parentElement;
    if (parent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-xs text-red-500 text-center p-1';
        errorDiv.innerText = 'Media Not Found';
        // Prevent adding multiple error messages
        if (!parent.querySelector('.text-red-500')) {
             parent.appendChild(errorDiv);
        }
    }
  };

  return (
    <div className={`w-full h-full rounded-md flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 ${styles.borderColor} ${styles.shadow} border-2 bg-gray-800 relative`}>
       {mediaUrl ? (
          <MediaDisplay
            src={mediaUrl} 
            alt={displayName} 
            className={`w-full h-full object-cover rounded-sm pointer-events-none transition-all duration-300 ${isInactive ? 'grayscale' : ''}`} 
            draggable={false} 
            onError={handleMediaError}
          />
        ) : (
          <div className="text-xs text-gray-400 text-center p-1">No Image</div>
        )
       }
    </div>
  );
};