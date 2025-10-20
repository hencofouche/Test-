// Fix: Removed circular dependency and constants, and defined all necessary types for the application.
export type Player = 'Gold' | 'Black';

export type CardClassName = 'Thief' | 'Assassin' | 'Guard' | 'Knight' | 'Archer' | 'Mage' | 'Healer';

export type Position = {
  row: number;
  col: number;
};

// CardDefinition now includes a single image instead of stages.
export interface CardDefinition {
  id: string;
  className: CardClassName;
  name:string;
  image?: string;
}

export interface Card extends CardDefinition {
  player: Player;
  abilityUsed?: boolean;
}

export type CollectionCard = {
  instanceId: string; // Unique ID for this specific copy of the card
  cardId: string; // ID of the CardDefinition
};

export type PlayerCollection = CollectionCard[];

export type DeckCard = CollectionCard;

export type DeckArray = (DeckCard | null)[];

export type SavedDecks = Record<string, DeckArray>;

export type GameMode = 'local' | 'bot';

export type GameState = 'start' | 'play_menu' | 'pre_game' | 'playing' | 'game_over' | 'deck_builder' | 'gacha' | 'codex' | 'creator' | 'rules';

// Fix: Added missing ConnectionStatus type for multiplayer connection status.
export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';