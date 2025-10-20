
import React, { useState } from 'react';
import { CardDefinition } from '../types';
import { CardDisplay } from './CardDisplay';
import { SFX } from '../utils/SoundManager';

interface GachaProps {
  onDrawPack: () => CardDefinition[];
  onBack: () => void;
}

const FacedownCard: React.FC = () => (
    <div className="w-full h-full bg-gray-800 rounded-lg border-2 border-amber-500 flex items-center justify-center p-2 shadow-lg">
        <div className="w-full h-full border-2 border-amber-700 rounded-md flex items-center justify-center bg-gray-900">
            <span className="text-4xl text-amber-400 font-serif font-bold opacity-50">?</span>
        </div>
    </div>
);


export const Gacha: React.FC<GachaProps> = ({ onDrawPack, onBack }) => {
  const [drawnCards, setDrawnCards] = useState<CardDefinition[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [isOpening, setIsOpening] = useState<boolean>(false);

  const handleBuyPack = () => {
    SFX.gachaDraw();
    const newCards = onDrawPack();
    if (newCards.length > 0) {
      setDrawnCards(newCards);
      setFlippedIndices(new Set());
      setIsOpening(true);
    } else {
      alert("There are no cards to draw! Please create some in the Card Creator first.");
    }
  };

  const handleFlip = (index: number) => {
    SFX.gachaFlip();
    setFlippedIndices(prev => new Set(prev).add(index));
  };
  
  const handleOpenAnother = () => {
      // Add a small delay for a smoother transition
      setIsOpening(false);
      setTimeout(() => {
        handleBuyPack();
      }, 300); // Should match animation duration
  }

  const allFlipped = flippedIndices.size === drawnCards.length && drawnCards.length > 0;

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
        <style>{`
            .flip-card {
                perspective: 1000px;
            }
            .flip-card-inner {
                position: relative;
                width: 100%;
                height: 100%;
                transition: transform 0.6s;
                transform-style: preserve-3d;
            }
            .is-flipped {
                transform: rotateY(180deg);
            }
            .flip-card-front, .flip-card-back {
                position: absolute;
                width: 100%;
                height: 100%;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
            }
            .flip-card-back {
                transform: rotateY(180deg);
            }
        `}</style>

        <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Card Draw
        </h1>
        <p className="text-lg text-amber-300 mb-6">
            Buy a booster pack to get 4 random cards!
        </p>
      
        <div className="w-full min-h-[40vh] flex items-center justify-center bg-black/30 p-4 rounded-lg border-2 border-amber-700 mb-6">
            {!isOpening ? (
                <button
                    onClick={() => { SFX.buttonClick(); handleBuyPack(); }}
                    className="px-10 py-5 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-2xl rounded-lg 
                               hover:from-amber-500 hover:to-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl
                               focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-opacity-75 transform hover:-translate-y-1"
                >
                    Buy a Booster Pack
                </button>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-3xl">
                    {drawnCards.map((card, index) => {
                        const isFlipped = flippedIndices.has(index);
                        return (
                            <div key={index} className="flip-card aspect-[2/3]" onClick={() => !isFlipped && handleFlip(index)}>
                                <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                                    <div className="flip-card-front cursor-pointer">
                                        <FacedownCard />
                                    </div>
                                    <div className="flip-card-back">
                                        <CardDisplay card={card} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

        <div className="flex space-x-4">
            <button
                onClick={() => { SFX.buttonClick(); onBack(); }}
                className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
                Back to Menu
            </button>
            {allFlipped && (
                 <button
                    onClick={() => { SFX.buttonClick(); handleOpenAnother(); }}
                    className="px-8 py-3 bg-amber-600 text-black font-bold text-lg rounded-lg hover:bg-amber-500 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                    Open Another Pack
                </button>
            )}
        </div>
    </div>
  );
};
