// Card definitions for Empire's Hand

import { Card, Hero, Civilization, PileType } from '../types';

// ==================== UTILITY ====================

const createCard = (
  id: string,
  name: string,
  type: Card['type'],
  pile: PileType,
  cost: Card['cost'],
  description: string,
  extras: Partial<Card> = {}
): Card => ({
  id,
  name,
  type,
  pile,
  cost,
  description,
  ...extras,
});

// ==================== GREEKS (MYTHIC) ====================

export const greekHero: Hero = {
  id: 'zeus',
  name: 'Zeus',
  type: 'hero',
  cost: {},
  description: 'King of Olympus. Commands lightning and sky.',
  pile: 'forces',
  attack: 8,
  health: 30,
  movement: 2,
  abilities: [
    {
      id: 'lightning_bolt',
      name: 'Lightning Bolt',
      description: 'Deal 10 damage to any unit or building.',
      unlockLevel: 1,
      cooldown: 2,
    },
    {
      id: 'thunder_clap',
      name: 'Thunder Clap',
      description: 'Stun all enemy units for 1 turn.',
      unlockLevel: 2,
      cooldown: 4,
    },
    {
      id: 'wrath_of_olympus',
      name: 'Wrath of Olympus',
      description: 'Deal 20 damage to all enemies. Zeus becomes invulnerable for 1 turn.',
      unlockLevel: 3,
      cooldown: 6,
    },
  ],
  maxLevel: 5,
};

export const greekCards: Card[] = [
  // FORCES
  createCard('hoplite', 'Hoplite', 'unit', 'forces', { food: 2, gold: 1 }, 'Shielded infantry. +2 defense when adjacent to another Hoplite.', { attack: 4, health: 8, movement: 1 }),
  createCard('myrmidon', 'Myrmidon', 'unit', 'forces', { food: 3, gold: 2 }, 'Elite warriors. Gains +1 attack for each battle survived.', { attack: 5, health: 6, movement: 2 }),
  createCard('pegasus', 'Pegasus', 'unit', 'forces', { food: 2, wood: 2 }, 'Flying cavalry. Ignores terrain. Can scout fog with +1 to roll.', { attack: 4, health: 4, movement: 3 }),
  createCard('cyclops', 'Cyclops', 'unit', 'forces', { food: 4, gold: 3 }, 'Siege monster. Deals double damage to buildings.', { attack: 8, health: 12, movement: 1 }),
  createCard('oracle', 'Oracle', 'unit', 'forces', { gold: 2 }, 'Support unit. Reveals enemy intentions in shared vision zone.', { attack: 0, health: 3, movement: 2 }),
  
  // INDUSTRY
  createCard('olive_grove', 'Olive Grove', 'building', 'industry', { wood: 2 }, 'Generate 2 Food per turn.'),
  createCard('silver_mine', 'Silver Mine', 'building', 'industry', { wood: 3, stone: 1 }, 'Generate 2 Gold per turn.'),
  createCard('tribute', 'Tribute', 'event', 'industry', {}, 'Gain 3 Gold. Your opponent gains 1 Gold.'),
  createCard('plentiful_harvest', 'Plentiful Harvest', 'event', 'industry', { food: 1 }, 'All your Industry cards generate +1 resource this turn.'),
  
  // KNOWLEDGE
  createCard('parthenon', 'Parthenon', 'building', 'knowledge', { wood: 4, stone: 2, gold: 2 }, 'Unlocks advanced Greek units. Heroes gain +1 level when built.'),
  createCard('phalanx', 'Phalanx', 'technology', 'knowledge', { gold: 3 }, 'Hoplites gain +2 attack and can form shield wall.'),
  createCard('divine_favor', 'Divine Favor', 'technology', 'knowledge', { gold: 4 }, 'Hero abilities cost 1 less cooldown. Once per game: resurrect hero at Shrine.'),
  createCard('olympian_arms', 'Olympian Arms', 'technology', 'knowledge', { gold: 3, stone: 2 }, 'All units gain +1 attack. Mythic units gain +2.'),
];

export const greeks: Civilization = {
  id: 'greeks',
  name: 'Greeks',
  type: 'mythic',
  description: 'Masters of phalanx warfare and divine intervention. Their heroes can return from death.',
  hero: greekHero,
  bonuses: {
    knowledge: { drawCostModifier: -1 },
  },
  coreCards: greekCards,
};

// ==================== NORSE (MYTHIC) ====================

export const norseHero: Hero = {
  id: 'thor',
  name: 'Thor',
  type: 'hero',
  cost: {},
  description: 'God of Thunder. Wields Mjölnir.',
  pile: 'forces',
  attack: 10,
  health: 25,
  movement: 2,
  abilities: [
    {
      id: 'mjolnir_throw',
      name: 'Mjölnir Throw',
      description: 'Deal 8 damage to target. Bounces to adjacent enemy for 4 damage.',
      unlockLevel: 1,
      cooldown: 2,
    },
    {
      id: 'lightning_aura',
      name: 'Lightning Aura',
      description: 'Adjacent enemies take 3 damage at start of each turn.',
      unlockLevel: 2,
      cooldown: 0,
    },
    {
      id: 'ragnarok_fury',
      name: 'Ragnarök Fury',
      description: 'Thor gains +5 attack and attacks all adjacent enemies.',
      unlockLevel: 3,
      cooldown: 5,
    },
  ],
  maxLevel: 5,
};

export const norseCards: Card[] = [
  // FORCES
  createCard('berserker', 'Berserker', 'unit', 'forces', { food: 2 }, 'Frenzied warrior. +3 attack when health is below 50%.', { attack: 5, health: 6, movement: 2 }),
  createCard('shield_maiden', 'Shield Maiden', 'unit', 'forces', { food: 2, wood: 1 }, 'Defensive specialist. Adjacent allies take -2 damage.', { attack: 3, health: 8, movement: 1 }),
  createCard('wolf_rider', 'Wolf Rider', 'unit', 'forces', { food: 3, wood: 1 }, 'Fast cavalry. Can move after attacking.', { attack: 4, health: 5, movement: 3 }),
  createCard('jarl', 'Jarl', 'unit', 'forces', { food: 3, gold: 2 }, 'Elite commander. Nearby units gain +1 attack.', { attack: 6, health: 8, movement: 2 }),
  createCard('valkyrie', 'Valkyrie', 'unit', 'forces', { food: 2, gold: 3 }, 'Flying support. Can resurrect one fallen unit per battle as Veteran.', { attack: 3, health: 5, movement: 3 }),
  
  // INDUSTRY
  createCard('longhouse', 'Longhouse', 'building', 'industry', { wood: 2 }, 'Generate 2 Wood per turn. Units deployed here gain +1 health.'),
  createCard('runestone', 'Runestone', 'building', 'industry', { stone: 2 }, 'Generate 1 of each resource every 3 turns.'),
  createCard('raid', 'Raid', 'event', 'industry', {}, 'Destroy one enemy Industry building. Gain resources equal to its cost.'),
  createCard('winter_stores', 'Winter Stores', 'event', 'industry', { wood: 2 }, 'Draw 2 cards from Industry pile.'),
  
  // KNOWLEDGE
  createCard('valhalla', 'Valhalla', 'building', 'knowledge', { wood: 3, stone: 3, gold: 2 }, 'Shrine of Resurrection. Heroes respawn here in Mythic mode.'),
  createCard('runic_weapons', 'Runic Weapons', 'technology', 'knowledge', { gold: 2, stone: 1 }, 'All units gain +1 attack. Berserkers gain additional +2.'),
  createCard('seafaring', 'Seafaring', 'technology', 'knowledge', { wood: 2, gold: 2 }, 'Unlock Longship units. Scouts get +1 to roll.'),
  createCard('fimbulwinter', 'Fimbulwinter', 'event', 'knowledge', { gold: 4 }, 'Event: All enemy units lose 2 movement for 2 turns.'),
];

export const norse: Civilization = {
  id: 'norse',
  name: 'Norse',
  type: 'mythic',
  description: 'Fierce raiders and warriors of legend. Embrace death and return stronger.',
  hero: norseHero,
  bonuses: {
    forces: { drawCostModifier: -1 },
  },
  coreCards: norseCards,
};

// ==================== EXPORTS ====================

export const civilizations = {
  greeks,
  norse,
};

export const allCards = [...greekCards, ...norseCards];
