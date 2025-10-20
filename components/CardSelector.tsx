
import React, { useState, useMemo } from 'react';
import { CollectionCard, CardDefinition } from '../types';
import { CardDisplay } from './CardDisplay';
import { SFX } from '../utils/SoundManager';

interface CardSelectorProps {
  availableCards: CollectionCard[];
  masterCardList: CardDefinition[];
  onSelectCard: (card: CollectionCard) => void;
  onCancel: () => void;
}

export const CardSelector: React.FC<CardSelectorProps> = ({ availableCards, masterCardList, onSelectCard, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const findCardDefById = (id: string) => masterCardList.find(card => card.id === id);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    masterCardList.forEach(def => classes.add(def.className));
    return Array.from(classes);
  }, [masterCardList]);

  const filteredCards = useMemo(() => {
    return availableCards.filter(instance => {
      const def = findCardDefById(instance.cardId);
      if (!def) return false;
      const nameMatch = def.name.toLowerCase().includes(searchTerm.toLowerCase());
      const classMatch = classFilter ? def.className === classFilter : true;
      return nameMatch && classMatch;
    });
  }, [availableCards, searchTerm, classFilter, findCardDefById]);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col p-4 animate-fade-in">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-amber-400 text-center mb-4">Select a Card</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-grow px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
          />
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredCards.map(instance => {
              const def = findCardDefById(instance.cardId);
              if (!def) return null;
              return (
                <button key={instance.instanceId} onClick={() => { SFX.buttonClick(); onSelectCard(instance); }} className="aspect-[2/3] transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-400 rounded-lg">
                  <CardDisplay card={def} />
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-16">No matching cards found.</p>
        )}
      </div>

      <div className="flex-shrink-0 mt-4 text-center">
        <button onClick={() => { SFX.buttonClick(); onCancel(); }} className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md">
          Cancel
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};