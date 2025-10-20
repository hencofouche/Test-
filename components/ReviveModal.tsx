
import React from 'react';
import { Card as CardType } from '../types';
import { CardDisplay } from './CardDisplay';
import { SFX } from '../utils/SoundManager';

interface ReviveModalProps {
  capturedCards: CardType[];
  onRevive: (card: CardType) => void;
  onCancel: () => void;
}

export const ReviveModal: React.FC<ReviveModalProps> = ({ capturedCards, onRevive, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4"
      onClick={onCancel}
    >
      <div
        className="relative transform transition-transform duration-300 animate-slide-up bg-gray-900 border-2 border-amber-700 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-amber-400 text-center mb-4 flex-shrink-0">Choose an Ally to Revive</h2>
        
        <div className="flex-grow overflow-y-auto">
            {capturedCards.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {capturedCards.map((card, index) => (
                        <button 
                            key={index} 
                            onClick={() => { SFX.buttonClick(); onRevive(card); }}
                            className="aspect-[2/3] transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-400 rounded-lg"
                        >
                            <CardDisplay card={card} />
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-16">No captured cards available.</p>
            )}
        </div>

        <div className="flex-shrink-0 mt-6 text-center">
            <button
                onClick={() => { SFX.buttonClick(); onCancel(); }}
                className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md"
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
