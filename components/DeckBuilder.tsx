
import React, { useState, useCallback, useEffect } from 'react';
import { CardDefinition, PlayerCollection, DeckArray, SavedDecks, CollectionCard } from '../types';
import { DECK_SIZE } from '../constants';
import { CardDisplay } from './CardDisplay';
import { CardSelector } from './CardSelector'; // Import the new component
import { SFX } from '../utils/SoundManager';

interface DeckBuilderProps {
  collection: PlayerCollection;
  masterCardList: CardDefinition[];
  savedDecks: SavedDecks;
  onSaveNamedDeck: (name: string, deck: DeckArray) => boolean;
  onDeleteDeck: (name: string) => void;
  onBack: () => void;
}

const Button: React.FC<{onClick: () => void, children: React.ReactNode, disabled?: boolean, className?: string, title?: string}> = ({ onClick, children, disabled, className, title }) => (
  <button onClick={() => { if (!disabled) SFX.buttonClick(); onClick(); }} disabled={disabled} className={`px-4 py-2 bg-amber-600 text-black font-bold rounded-md hover:bg-amber-500 transition-colors shadow-sm disabled:bg-gray-500 disabled:cursor-not-allowed ${className}`} title={title}>
    {children}
  </button>
);

export const DeckBuilder: React.FC<DeckBuilderProps> = ({
  collection,
  masterCardList,
  savedDecks,
  onSaveNamedDeck,
  onDeleteDeck,
  onBack,
}) => {
  const [deck, setDeck] = useState<DeckArray>(Array(DECK_SIZE).fill(null));
  const [selectingForSlot, setSelectingForSlot] = useState<number | null>(null);
  
  const [deckNameInput, setDeckNameInput] = useState('');
  const [selectedDeck, setSelectedDeck] = useState('');

  const findCardDefById = useCallback((id: string) => masterCardList.find(card => card.id === id), [masterCardList]);
  
  useEffect(() => {
     if (!savedDecks[selectedDeck]) {
       setSelectedDeck('');
     }
  }, [savedDecks, selectedDeck]);

  const handleSelectCardForSlot = (card: CollectionCard) => {
    if (selectingForSlot === null) return;
    const newDeck = [...deck];
    newDeck[selectingForSlot] = card;
    setDeck(newDeck);
    setSelectingForSlot(null);
  };
  
  const handleRemoveCardFromDeck = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent opening the selector
    SFX.buttonClick();
    const newDeck = [...deck];
    newDeck[index] = null;
    setDeck(newDeck);
  };

  const handleLoadDeck = () => {
    if (selectedDeck && savedDecks[selectedDeck]) {
      setDeck(savedDecks[selectedDeck]);
      setDeckNameInput(selectedDeck);
    } else {
        // If loading an empty or invalid selection, clear the deck
        setDeck(Array(DECK_SIZE).fill(null));
        setDeckNameInput('');
    }
  };

  const handleDeleteDeckClick = () => {
    if (selectedDeck) {
      onDeleteDeck(selectedDeck);
    }
  };

  const handleSaveDeckClick = () => {
    if (deck.filter(Boolean).length < DECK_SIZE) {
      alert(`Your deck must have ${DECK_SIZE} cards to be saved.`);
      return;
    }
    if (onSaveNamedDeck(deckNameInput, deck)) {
        setSelectedDeck(deckNameInput);
    }
  };

  const isDeckFull = deck.filter(Boolean).length === DECK_SIZE;

  // Collection cards available to be added to the deck
  const deckInstanceIds = new Set(deck.map(c => c?.instanceId));
  const availableCollection = collection.filter(c => !deckInstanceIds.has(c.instanceId));

  if (selectingForSlot !== null) {
    return (
      <CardSelector 
        availableCards={availableCollection}
        masterCardList={masterCardList}
        onSelectCard={handleSelectCardForSlot}
        onCancel={() => setSelectingForSlot(null)}
      />
    );
  }

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-md">
        Deck Builder
      </h1>
      <p className="text-gray-400 mb-4">Click a slot to add or replace a card.</p>
      
      {/* Deck Management UI */}
      <div className="w-full bg-black/30 p-3 rounded-lg border-2 border-amber-800 mb-4 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <select value={selectedDeck} onChange={(e) => setSelectedDeck(e.target.value)} className="bg-gray-800 border-2 border-gray-600 rounded-md px-2 py-2 text-white focus:ring-amber-500 focus:border-amber-500 w-full sm:w-auto">
              <option value="">-- Load Saved Deck --</option>
              {Object.keys(savedDecks).map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleLoadDeck}>Load</Button>
              <Button onClick={handleDeleteDeckClick} disabled={!selectedDeck} className="bg-red-700 hover:bg-red-600 text-white">Delete</Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button 
                onClick={handleSaveDeckClick} 
                disabled={!deckNameInput.trim() || !isDeckFull}
                title={!isDeckFull ? `Deck must contain ${DECK_SIZE} cards.` : !deckNameInput.trim() ? "Deck must have a name." : "Save this deck"}
             >
                Save Deck
             </Button>
          </div>
      </div>


      {/* Deck Slots */}
      <div className="w-full bg-black/30 p-4 rounded-lg border-2 border-amber-700 mb-6">
        <div className="flex justify-center items-center mb-4">
          <input 
            type="text" 
            value={deckNameInput} 
            onChange={(e) => setDeckNameInput(e.target.value)} 
            placeholder="Enter Deck Name" 
            className="text-2xl text-amber-400 bg-transparent border-b-2 border-amber-800 text-center focus:outline-none focus:border-amber-500"
          />
          <span className="text-2xl text-amber-400 ml-2">({deck.filter(Boolean).length}/{DECK_SIZE})</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {Array.from({ length: DECK_SIZE }).map((_, index) => {
            const deckCard = deck[index];
            const cardDef = deckCard ? findCardDefById(deckCard.cardId) : null;
            return (
              <div
                key={index}
                className="aspect-[2/3] rounded-lg border-2 border-dashed border-gray-600 bg-gray-900/50 flex items-center justify-center cursor-pointer transition-colors hover:border-amber-400 hover:bg-amber-900/20 relative group"
                onClick={() => { SFX.buttonClick(); setSelectingForSlot(index); }}
              >
                {deckCard && cardDef ? (
                    <>
                        <CardDisplay card={cardDef} />
                        <button 
                            onClick={(e) => handleRemoveCardFromDeck(e, index)}
                            className="absolute top-0 right-0 -m-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold border-2 border-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity z-10"
                            aria-label="Remove card"
                        >
                            &times;
                        </button>
                    </>
                ) : (
                    <span className="text-gray-500 text-4xl">+</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <button onClick={() => { SFX.buttonClick(); onBack(); }} className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md">
          Back to Menu
        </button>
      </div>
    </div>
  );
};