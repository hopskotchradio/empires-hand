// Core game engine for Empire's Hand

import { GameState, PlayerState, Civilization, Card, Resource, PileType } from '../types';

const STARTING_RESOURCES: Record<Resource, number> = {
  food: 5,
  wood: 5,
  gold: 2,
  stone: 0,
};

const MAX_HAND_SIZE = 5;
const MAX_DEPLOYED = 6;
const MAX_FOG_RESERVES = 3;

export function createPlayer(id: string, civilization: Civilization): PlayerState {
  return {
    id,
    civilization,
    hero: { ...civilization.hero },
    heroLevel: 1,
    resources: { ...STARTING_RESOURCES },
    hand: [],
    deployed: [],
    fogReserves: [],
    buildings: [],
    technologies: [],
  };
}

export function createGame(players: PlayerState[]): GameState {
  return {
    turn: 1,
    phase: 'planning',
    players,
  };
}

export function canAfford(player: PlayerState, cost: Partial<Record<Resource, number>>): boolean {
  for (const [resource, amount] of Object.entries(cost)) {
    if ((player.resources[resource as Resource] || 0) < (amount || 0)) {
      return false;
    }
  }
  return true;
}

export function payCost(player: PlayerState, cost: Partial<Record<Resource, number>>): void {
  for (const [resource, amount] of Object.entries(cost)) {
    player.resources[resource as Resource] -= amount || 0;
  }
}

export function drawFromPile(player: PlayerState, pile: PileType): Card | null {
  // Apply civilization bonuses
  let drawCost = 2; // Base Command Points cost
  if (pile === 'forces' && player.civilization.bonuses.forces) {
    drawCost += player.civilization.bonuses.forces.drawCostModifier;
  }
  if (pile === 'knowledge' && player.civilization.bonuses.knowledge) {
    drawCost += player.civilization.bonuses.knowledge.drawCostModifier;
  }

  // Get available cards from this pile
  const availableCards = player.civilization.coreCards.filter(c => c.pile === pile);
  
  if (availableCards.length === 0) return null;
  if (player.hand.length >= MAX_HAND_SIZE) return null;

  // Simple random draw (will be replaced with actual deck system)
  const card = availableCards[Math.floor(Math.random() * availableCards.length)];
  player.hand.push({ ...card, id: `${card.id}_${Date.now()}` });
  
  return card;
}

export function deployUnit(player: PlayerState, card: Card, toFog: boolean = false): boolean {
  if (card.type !== 'unit' && card.type !== 'hero') return false;
  
  if (toFog) {
    if (player.fogReserves.length >= MAX_FOG_RESERVES) return false;
    player.fogReserves.push(card);
  } else {
    if (player.deployed.length >= MAX_DEPLOYED) return false;
    player.deployed.push(card);
  }
  
  // Remove from hand
  player.hand = player.hand.filter(c => c.id !== card.id);
  return true;
}

export function buildBuilding(player: PlayerState, card: Card): boolean {
  if (card.type !== 'building') return false;
  if (!canAfford(player, card.cost)) return false;
  
  payCost(player, card.cost);
  player.buildings.push(card);
  player.hand = player.hand.filter(c => c.id !== card.id);
  return true;
}

export function researchTechnology(player: PlayerState, card: Card): boolean {
  if (card.type !== 'technology') return false;
  if (!canAfford(player, card.cost)) return false;
  if (player.technologies.includes(card.id)) return false;
  
  payCost(player, card.cost);
  player.technologies.push(card.id);
  player.hand = player.hand.filter(c => c.id !== card.id);
  return true;
}

export function gatherResources(player: PlayerState): void {
  for (const building of player.buildings) {
    if (building.production) {
      for (const [resource, amount] of Object.entries(building.production)) {
        player.resources[resource as Resource] += amount || 0;
      }
    }
  }
  
  // Apply industry bonus
  if (player.civilization.bonuses.industry) {
    const bonus = player.civilization.bonuses.industry.resourceBonus;
    // Add bonus to one random resource
    const resources: Resource[] = ['food', 'wood', 'gold', 'stone'];
    const randomResource = resources[Math.floor(Math.random() * resources.length)];
    player.resources[randomResource] += bonus;
  }
}

export function levelUpHero(player: PlayerState): void {
  if (player.heroLevel < player.hero.maxLevel) {
    player.heroLevel++;
    // Hero stats could scale here
  }
}

// Scout resolution roll
export function resolveScout(scoutRoll: number): 'success' | 'partial' | 'failure' {
  if (scoutRoll >= 8) return 'success';      // Reveal 2-3 cards
  if (scoutRoll >= 4) return 'partial';      // Reveal 1 card
  return 'failure';                           // Scout dies
}
