

import React, { useState, useMemo, useEffect } from 'react';
import { CardClassName, CardDefinition } from '../types';
import { getCardImageUrl } from '../utils';
import { MediaDisplay } from './MediaDisplay';
import { fantasyNames } from '../utils/names';
import { SFX } from '../utils/SoundManager';

interface CardCreatorProps {
  onCreateCard: (className: CardClassName, name: string, image: string | undefined) => void;
  onBack: () => void;
  masterCardList: CardDefinition[];
}

// A local, simplified card preview component for the creator
const CreatorCardPreview: React.FC<{ 
  className: CardClassName;
  setClassName: (value: CardClassName) => void;
  name: string;
  setName: (value: string) => void;
  image: string | undefined; 
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRandomizeName: () => void;
}> = ({ className, setClassName, name, setName, image, onImageUpload, onRandomizeName }) => {
    const altText = (className && name) ? `${className} - ${name}` : 'Card Preview';
    const mediaUrl = image || (className && name ? getCardImageUrl(className, name) : null);
    const styles = { borderColor: 'border-gray-500/60', shadow: 'shadow-[0_0_6px_rgba(156,163,175,0.6)]' };

    const handleRandomClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      SFX.buttonClick();
      onRandomizeName();
    };

    return (
        <div className={`w-full aspect-[2/3] bg-black rounded-lg border-2 ${styles.borderColor} ${styles.shadow} flex flex-col overflow-hidden relative items-center justify-center transition-all duration-300`}>
            <label htmlFor="card-media-upload" className="w-full h-full absolute inset-0 cursor-pointer flex items-center justify-center text-center bg-gray-900">
              {mediaUrl ? (
                <MediaDisplay
                  src={mediaUrl} 
                  alt={altText} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-gray-500 p-4">Click to upload image or MP4 video</span>
              )}
            </label>
            <input 
              id="card-media-upload" 
              type="file" 
              accept="image/*,video/mp4" 
              onChange={onImageUpload} 
              className="hidden" 
            />

            {/* Class Name: Top Right */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded-md border-2 bg-black/60 border-black/60 max-w-[calc(50%-1rem)]">
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value as CardClassName)}
                  className="bg-transparent text-white/80 text-sm font-bold drop-shadow-md truncate focus:outline-none appearance-none pr-2"
                >
                    <option value="Knight" className="bg-gray-800">Knight</option>
                    <option value="Thief" className="bg-gray-800">Thief</option>
                    <option value="Assassin" className="bg-gray-800">Assassin</option>
                    <option value="Guard" className="bg-gray-800">Guard</option>
                    <option value="Archer" className="bg-gray-800">Archer</option>
                    <option value="Mage" className="bg-gray-800">Mage</option>
                    <option value="Healer" className="bg-gray-800">Healer</option>
                </select>
            </div>
            {/* Card Name: Bottom Center */}
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-md border-2 bg-black/60 border-black/60 text-center flex items-center gap-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="w-full bg-transparent text-white/80 text-sm font-bold truncate drop-shadow-md text-center focus:outline-none"
                />
                <button 
                  onClick={handleRandomClick}
                  className="text-white/80 text-lg hover:text-amber-400 transition-colors"
                  title="Randomize Name"
                >
                  🎲
                </button>
            </div>
        </div>
    );
};


export const CardCreator: React.FC<CardCreatorProps> = ({ onCreateCard, onBack, masterCardList }) => {
  const [className, setClassName] = useState<CardClassName>('Knight');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [image, setImage] = useState<string | undefined>();

  const existingNames = useMemo(() => 
    new Set(masterCardList.map(card => card.name.toLowerCase())),
    [masterCardList]
  );

  useEffect(() => {
    if (name.trim() && existingNames.has(name.trim().toLowerCase())) {
      setNameError('This name is already taken. Please choose another.');
    } else {
      setNameError('');
    }
  }, [name, existingNames]);

  const handleRandomizeName = () => {
    const availableNames = fantasyNames.filter(n => !existingNames.has(n.toLowerCase()));
    if (availableNames.length === 0) {
        alert("All available random names are in use!");
        return;
    }
    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    setName(randomName);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (name.trim() === '') {
        alert("Card must have a name.");
        return;
    }
    if (nameError) {
        alert(nameError);
        return;
    }
    onCreateCard(className, name, image);
    alert('Card created and one copy added to your collection!');
    onBack();
  };
  
  const isCardComplete = className && name.trim() && !nameError;

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-md">
        Card Creator
      </h1>
      <p className="text-gray-400 mb-6 text-center">A card's name must be unique.</p>
      
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-72 relative">
          <CreatorCardPreview 
            className={className} 
            setClassName={setClassName}
            name={name} 
            setName={setName}
            image={image} 
            onImageUpload={handleImageUpload}
            onRandomizeName={handleRandomizeName}
          />
        </div>
         {nameError && (
            <p className="text-red-500 text-sm mt-2">{nameError}</p>
        )}
      </div>
      
      <div className="flex space-x-4 mt-8">
        <button onClick={() => { SFX.buttonClick(); onBack(); }} className="px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-lg hover:bg-gray-500 transition-colors duration-300 shadow-md">
          Back
        </button>
        <button
          onClick={() => { if (!isCardComplete) return; SFX.buttonClick(); handleSave(); }}
          disabled={!isCardComplete}
          className="px-8 py-3 bg-amber-600 text-black font-bold text-lg rounded-lg hover:bg-amber-500 transition-colors duration-300 shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed"
          title={!isCardComplete ? "Card must have a Class and a unique Name." : "Save your card"}
        >
          Save Card
        </button>
      </div>
    </div>
  );
};