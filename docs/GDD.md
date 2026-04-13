# Game Design Document — Empire's Hand

## Core Concept

Empire's Hand is a real-time card game that captures the essence of Age of Empires: resource gathering, base building, tech progression, and military combat — all through cards played on a compact battlefield.

## Pillars

1. **RTS Pacing** — Decisions matter under time pressure
2. **Deckbuilding Depth** — Customize your civilization's card pool
3. **Accessibility** — Playable in 10-20 minute sessions on any device
4. **Asymmetric Civs** — Each civilization plays differently

## Core Mechanics

### Resources

- **Food** — Units, villagers, population growth
- **Wood** — Buildings, ranged units, ships
- **Gold** — Advanced units, technologies, trade
- **Stone** — Defensive structures, siege units

### Cards

| Type | Description |
|------|-------------|
| **Villager** | Gather resources, build structures |
| **Unit** | Military cards (infantry, cavalry, archers, siege) |
| **Building** | Production, defense, economy boosts |
| **Technology** | Permanent upgrades, unlocked via buildings |
| **Event** | One-time effects (raids, boons, disasters) |

### The Battlefield

A compact grid with two distinct visibility zones:

| Zone | Visibility | Purpose |
|------|-----------|---------|
| **Shared Vision** | Both players see everything | Main combat, objective control, Town Centers |
| **Fog of War** | Hidden from opponent | Secret deployments, late-game buildup, ambush setups |

**Fog Trade-offs:**
- Units in fog can't move freely (slower deployment, restricted actions)
- Buildings in fog build slower or cost more
- *But* your opponent can't see what you're preparing

**Scouting:**
- Scout units must be deployed to the Shadow Line (your fog) or Front Line
- During Planning, assign scout orders to enemy fog zones
- **Resolution roll:**
  - **High roll (success):** Reveal 2-3 hidden cards in that zone
  - **Medium roll (partial):** Reveal 1 card, scout survives
  - **Low roll (failure):** Scout killed, no intel gained
- Revealed cards stay visible until end of next turn, then fog reclaims
- Counter-play: anti-scout units, decoy cards, fog traps, bait deployments

**Deployment Zones:**
- **Economy Zone** — Villagers gather here
- **Production Zone** — Buildings produce units
- **Front Line** — Military units clash (Shared Vision)
- **Shadow Line** — Hidden buildup (Fog of War)
- **Home Base** — Your Town Center (lose this, lose the game)

### Time & Turns

**Turn-based with simultaneous resolution.**

Both players plan in parallel — no initiative, no "I go, you go." This keeps the game fair and emphasizes prediction over reaction.

Each turn has phases:

1. **Planning** — Both players play cards, assign orders, queue abilities (hidden from opponent)
2. **Lock-in** — Both players confirm they're ready (or timer expires)
3. **Resolution** — Actions execute simultaneously
4. **Combat** — Units clash, abilities trigger, casualties resolved
5. **Upkeep** — Resources gathered, draw cards, end-of-turn effects

This rewards strategy over APM. You can take your time, analyze the board, then commit. Perfect for background play on a second monitor.

**Turn Timer (optional):** For competitive/ranked, a chess-clock style timer keeps games moving.

## Civilizations (TBD)

| Civ | Identity |
|-----|----------|
| **Franks** | Heavy cavalry, farming economy |
| **Britons** | Archers, defensive structures |
| **Mongols** | Raiding, mobility, no walls |
| **Japanese** | Infantry, naval, tight formations |

## Progression

### Ages

1. **Dark Age** — Basic economy, militia
2. **Feudal Age** — Archers, scouts, towers
3. **Castle Age** — Knights, siege, unique units
4. **Imperial Age** — Elite units, powerful techs

Advancing ages unlocks new cards and increases resource generation.

## Multiplayer

- 1v1 ranked
- 2v2 team games
- Async vs AI for practice

## Hero System

The centerpiece of Empire's Hand is your **Hero** — a legendary figure who leads your civilization.

### Hero Types

| Mode | Heroes | Vibe |
|------|--------|------|
| **Historical** | Patton, Joan of Arc, Genghis Khan, Hannibal | Grounded, asymmetric civ bonuses |
| **Mythic** *(expansion/game mode)* | Zeus, Thor, Anubis, Sun Wukong | Fictional/fantastical abilities |

### Hero Death

| Mode | Death Rule | Implication |
|------|-----------|-------------|
| **Historical** | Permanent for the match | High stakes, protect your leader, realistic consequences |
| **Mythic** | Respawn at Shrine (building/ability) | Aggressive plays, sacrificial tactics, godlike resilience |

This split reinforces the tone of each mode. History is unforgiving. Myths are epic.

### Hero Progression

Heroes level up through combat and objectives:

- **Level 1** — Basic ability, stat bonuses
- **Level 2** — Unlock second ability slot
- **Level 3** — Ultimate ability, major power spike
- **Level 4+** — Enhanced stats, ability modifiers

Abilities are chosen from a pool as you level — deckbuilding meets RPG talent trees.

## Veteran System

Borrowing from Total Annihilation: individual units gain veterancy through survival.

| Rank | Bonus |
|------|-------|
| **Veteran** | +10% damage, +10% HP |
| **Elite** | +25% damage, +25% HP, small regen |
| **Heroic** | +50% damage, +50% HP, ability unlock |

Veteran units become valuable assets — protect them, or trade them for high-value targets.

## Victory Conditions

Multiple paths to victory keeps games dynamic:

| Victory | How |
|---------|-----|
| **Military** | Destroy enemy Town Center / Hero |
| **Economic** | Accumulate X gold + control trade routes for Y turns |
| **Discovery** | Research all technologies in a branch, build Wonder |
| **Diplomatic** | Ally with neutral factions, achieve influence threshold |
| **Domination** | Control majority of map objectives simultaneously |

## Deckbuilding & Progression

### Complexity Target

Not Hearthstone-level combo chains. Not flat either.

- **Civilization identity** drives 70% of your strategy (core cards, bonuses)
- **Hero choice** adds 20% (hero cards, ability synergies)
- **Player creativity** fills the last 10% (splash cards, tech choices, build orders)

Depth comes from decision-making, not card text length.

### Collection

- Earn packs through play, daily quests, achievements
- Packs contain cards, hero skins, cosmetic variants
- Rarity: Common → Uncommon → Rare → Epic → Legendary

### Deck Construction

- 40-card minimum deck
- Civilization defines your "core" card pool (always available)
- "Splash" cards from neutral/ally civs (limited slots)
- Hero choice adds hero-specific cards to your pool

### The Store

- Card packs (gold / premium currency)
- Hero unlocks
- Cosmetics (card backs, battlefield skins, emotes)
- Battle Pass for seasonal content

## Game Loop

```
Resources → Deploy → Skirmish → Level Up → Tech → Push
    ↑___________________________________________|
```

1. **Gather** — Villagers harvest Food/Wood/Gold/Stone
2. **Build** — Structures enable units and tech
3. **Skirmish** — Small fights grant XP (Hero) and veterancy (units)
4. **Tech** — Ages unlock new cards and abilities
5. **Push** — Commit to a victory condition
6. **Adapt** — Scout, counter, pivot strategies

## Single Player / Campaign

### Campaign Mode

- Historical scenarios (Battle of Thermopylae, D-Day, etc.)
- Hero-focused narratives with RPG progression
- Branching choices, multiple endings
- Unlock heroes and cards for multiplayer

### Skirmish vs AI

- Adjustable difficulty
- AI personalities (aggressive, economic, turtler)
- Perfect for background play — pause anytime, resume later

### Daily Challenges

- Pre-constructed scenarios
- Leaderboards for fastest/least losses/most efficient

## Unit Caps

Starting point for iteration:

| Type | Limit | Notes |
|------|-------|-------|
| **Hero** | 1 | Your leader, must protect |
| **Deployed Units** | 6 | Active on the battlefield |
| **Fog Reserves** | 3 | Hidden in Fog of War, slower to deploy |
| **Total Army** | 10 | Hero + 6 + 3 |

Small enough for mobile. Large enough for tactical depth.

## Card Draw & Resources

### The Three Piles

Instead of one deck, you manage three draw piles:

| Pile | Draws | When You Need It |
|------|-------|------------------|
| **Forces** | Units, Heroes, Scouts | Building army, responding to threats |
| **Industry** | Resources, Economy cards | Scaling up, recovering from losses |
| **Knowledge** | Technologies, Buildings, Events | Teching up, unlocking capabilities |

Each turn, choose which pile to draw from. No random discard — intentional deckbuilding meets intentional draw choices.

**Hand Size:** 5 cards max. Play or discard down to 5 at end of turn.

### Civilization & Hero Bonuses

All civs access all three piles, but each has strengths:

| Civ | Pile Bonus | Playstyle |
|-----|-----------|-----------|
| **Franks** | Forces draws cost -1 CP | Aggressive, unit-heavy |
| **Britons** | Knowledge draws cost -1 CP | Defensive, tech-focused |
| **Mongols** | Industry generates +1 resource | Economic snowball, raid timing |
| **Japanese** | Scouts get +1 to roll | Information advantage, precision strikes |

Heroes add pile-specific cards or modify draw costs further.

### Alternative: The "Command Points" System

Each turn you get X Command Points. Spend them to:
- Draw from Forces (2 CP)
- Draw from Industry (2 CP)
- Draw from Knowledge (3 CP)
- Deploy unit (1 CP per cost)
- Research tech (variable)

Creates tension: do I draw more options or execute what I have?

## Open Questions

- [x] Hand size and card draw mechanics? → **Three-pile system, 5 card hand**
- [ ] How does micro/macro translate to cards?
- [x] Real-time vs. turn-based with simultaneous phases? → **Turn-based with simultaneous resolution**
- [ ] Mobile UX: how to handle turn-based on small screens?
- [ ] How many heroes per civilization at launch?
- [ ] F2P economy balance — grind vs. pay?
- [ ] Async multiplayer? (play-by-mail style for longer games)
- [ ] Fog of War reveal duration — permanent until rescouted? Fade after N turns?

---

*Work in progress — subject to radical change.*
