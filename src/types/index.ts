// Core types for Empire's Hand

export type Resource = 'food' | 'wood' | 'gold' | 'stone';

export interface Cost {
  food?: number;
  wood?: number;
  gold?: number;
  stone?: number;
}

export type CardType = 'unit' | 'building' | 'technology' | 'event' | 'hero';

export type PileType = 'forces' | 'industry' | 'knowledge';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  cost: Cost;
  description: string;
  pile: PileType;
  // Unit-specific
  attack?: number;
  health?: number;
  movement?: number;
  // Building-specific
  production?: Partial<Record<Resource, number>>;
  // Technology-specific
  unlocks?: string[];
  // Event-specific
  instant?: boolean;
}

export interface Hero extends Card {
  type: 'hero';
  abilities: Ability[];
  maxLevel: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  cooldown: number;
}

export type CivType = 'historical' | 'mythic';

export interface Civilization {
  id: string;
  name: string;
  type: CivType;
  description: string;
  hero: Hero;
  bonuses: {
    forces?: { drawCostModifier: number };
    industry?: { resourceBonus: number };
    knowledge?: { drawCostModifier: number };
  };
  coreCards: Card[];
}

export interface GameState {
  turn: number;
  phase: 'planning' | 'resolution' | 'combat' | 'upkeep';
  players: PlayerState[];
}

export interface PlayerState {
  id: string;
  civilization: Civilization;
  hero: Hero;
  heroLevel: number;
  resources: Record<Resource, number>;
  hand: Card[];
  deployed: Card[];
  fogReserves: Card[];
  buildings: Card[];
  technologies: string[];
}
