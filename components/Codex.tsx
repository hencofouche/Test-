
import React, { useState, useMemo } from 'react';
import { CardDefinition, PlayerCollection } from '../types';
import { CardDisplay } from './CardDisplay';
import { SFX } from '../utils/SoundManager';

interface CodexProps {
  cards: CardDefinition[];
  collection: PlayerCollection;
  onBack: () => void;
}

export const Codex: React.FC<CodexProps> = ({ cards, collection, onBack }) => {
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');

  const isOwned = (cardId: string) => {
    return collection.some(c => c.cardId === cardId);
  };

  const filteredCards = useMemo(() => {
    return cards
      .filter(definition => {
        if (ownershipFilter === 'owned' && !isOwned(definition.id)) return false;
        if (ownershipFilter === 'unowned' && isOwned(definition.id)) return false;
        if (classFilter && definition.className !== classFilter) return false;
        if (searchTerm && !definition.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cards, collection, searchTerm, classFilter, ownershipFilter]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    cards.forEach(def => classes.add(def.className));
    return Array.from(classes);
  }, [cards]);

  const handleCardClick = (definition: CardDefinition) => {
    SFX.buttonClick();
    setSelectedCard(definition);
  };

  const handleCloseModal = () => {
    SFX.buttonClick();
    setSelectedCard(null);
  };

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-6xl mx-auto px-4 min-h-screen">
      <h1 className="text-5xl font-extrabold my-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
        Card Codex
      </h1>

      {/* Filters */}
      <div className="w-full bg-black/30 p-3 rounded-lg border-2 border-amber-800 mb-6 flex flex-col md:flex-row gap-4 justify-between sticky top-2 z-20 backdrop-blur-sm">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-grow px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
        />
        <div className="flex gap-4">
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full md:w-auto px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white">
            <option value="">All Classes</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={ownershipFilter} onChange={e => setOwnershipFilter(e.target.value as any)} className="w-full md:w-auto px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white">
            <option value="all">All Cards</option>
            <option value="owned">Owned</option>
            <option value="unowned">Unowned</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full flex-grow">
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 justify-items-center">
            {filteredCards.map(definition => {
              const owned = isOwned(definition.id);
              return (
                <button
                  key={definition.id}
                  onClick={() => handleCardClick(definition)}
                  className={`w-full aspect-[2/3] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400 rounded-lg relative group ${!owned ? 'grayscale opacity-60 hover:opacity-80' : 'hover:scale-105'}`}
                  title={`${definition.name} ${!owned ? '(Not Owned)' : ''}`}
                >
                  <CardDisplay card={definition} />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-16">No cards match your filters.</p>
        )}
      </div>
      
      <button
        onClick={() => { SFX.buttonClick(); onBack(); }}
        className="my-8 px-8 py-3 bg-amber-600 text-black font-bold text-lg rounded-lg hover:bg-amber-500 transition-colors duration-300 shadow-md hover:shadow-lg"
      >
        Back to Menu
      </button>

      {/* Modal */}
      {selectedCard && (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={handleCloseModal}
        >
          <div 
            className="relative transform transition-transform duration-300 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
             <CardDisplay 
                card={selectedCard}
                collection={collection} 
                isModal={true}
              />
              <button 
                onClick={handleCloseModal}
                className="absolute top-0 right-0 -m-4 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold border-2 border-white hover:bg-red-500 transition-colors z-10"
                aria-label="Close card details"
              >
                &times;
              </button>
          </div>
        </div>
      )}
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