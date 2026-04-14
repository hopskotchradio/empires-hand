import React, { useMemo } from 'react';
import { GameState, PlayerState, Card } from '../types';
import { SpriteLayer } from './SpriteLayer';

interface BoardProps {
  gameState: GameState;
  currentPlayerId: string;
}

const GRID_COLS = 14;
const GRID_ROWS = 8;

export const Board: React.FC<BoardProps> = ({ gameState, currentPlayerId }) => {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const opponent = gameState.players.find(p => p.id !== currentPlayerId);

  if (!currentPlayer || !opponent) return null;

  // Demo units for testing - replace with actual game state
  const units = useMemo(() => [
    {
      id: 'zeus-1',
      card: { ...currentPlayer.hero, id: 'zeus' },
      gridX: 3,
      gridY: 6,
      isHero: true,
    },
    {
      id: 'thor-1', 
      card: { ...opponent.hero, id: 'thor' },
      gridX: 10,
      gridY: 1,
      isHero: true,
    },
  ], [currentPlayer.hero, opponent.hero]);

  return (
    <div style={styles.container}>
      {/* Opponent Area (Top) */}
      <PlayerArea player={opponent} position="top" />

      {/* Battlefield Grid */}
      <div style={styles.battlefield}>
        {/* Fog Zones (Left/Right edges) */}
        <div style={styles.fogZoneLeft}>FOG</div>
        
        {/* Main Grid with Sprite Layer */}
        <div style={styles.gridContainer}>
          <div style={styles.grid}>
            {Array.from({ length: GRID_ROWS }).map((_, row) => (
              <div key={row} style={styles.row}>
                {Array.from({ length: GRID_COLS }).map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    style={{
                      ...styles.cell,
                      backgroundColor: row === 3 ? '#3a3a5c' : '#2a2a4a',
                      borderTop: row === 4 ? '3px solid #666' : '1px solid #444',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <SpriteLayer
            units={units}
            width={600}
            height={300}
            onUnitClick={(unit) => console.log('Clicked:', unit.card.name)}
          />
        </div>

        <div style={styles.fogZoneRight}>FOG</div>
      </div>

      {/* Current Player Area (Bottom) */}
      <PlayerArea player={currentPlayer} position="bottom" />
    </div>
  );
};

interface PlayerAreaProps {
  player: PlayerState;
  position: 'top' | 'bottom';
}

const PlayerArea: React.FC<PlayerAreaProps> = ({ player, position }) => {
  const isTop = position === 'top';

  return (
    <div style={{ ...styles.playerArea, flexDirection: isTop ? 'row' : 'row-reverse' }}>
      {/* Deck Piles */}
      <div style={styles.deckArea}>
        <div style={styles.pileLabel}>3 PILES</div>
        <div style={styles.piles}>
          <DeckPile name="Forces" color="#c44" />
          <DeckPile name="Industry" color="#4a4" />
          <DeckPile name="Knowledge" color="#44c" />
        </div>
      </div>

      {/* Units Area */}
      <div style={styles.unitsArea}>
        <div style={styles.unitGroup}>
          <div style={styles.groupLabel}>ACTIVE</div>
          <div style={styles.cardSlots}>
            {player.deployed.map((card, i) => (
              <CardSlot key={i} card={card} />
            ))}
            {Array.from({ length: Math.max(0, 6 - player.deployed.length) }).map((_, i) => (
              <CardSlot key={`empty-active-${i}`} />
            ))}
          </div>
        </div>
        <div style={styles.unitGroup}>
          <div style={styles.groupLabel}>FOGGED</div>
          <div style={styles.cardSlots}>
            {player.fogReserves.map((card, i) => (
              <CardSlot key={i} card={card} fogged />
            ))}
            {Array.from({ length: Math.max(0, 3 - player.fogReserves.length) }).map((_, i) => (
              <CardSlot key={`empty-fog-${i}`} fogged />
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={styles.heroArea}>
        <div style={styles.heroCard}>
          <div style={styles.heroName}>{player.hero.name}</div>
          <div style={styles.heroLevel}>Lv.{player.heroLevel}</div>
        </div>
      </div>

      {/* Tech Panel */}
      <div style={styles.techPanel}>
        <div style={styles.techLabel}>TECH TREE</div>
        <div style={styles.techLabel}>RESEARCH</div>
        <div style={styles.techLabel}>UNITS</div>
      </div>
    </div>
  );
};

const DeckPile: React.FC<{ name: string; color: string }> = ({ name, color }) => (
  <div style={{ ...styles.pile, backgroundColor: color }}>
    <span style={styles.pileText}>{name}</span>
  </div>
);

const CardSlot: React.FC<{ card?: Card; fogged?: boolean }> = ({ card, fogged }) => (
  <div style={{ ...styles.cardSlot, opacity: fogged ? 0.6 : 1 }}>
    {card ? (
      <div style={styles.miniCard}>
        <div style={styles.miniCardName}>{card.name}</div>
      </div>
    ) : null}
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1a1a2e',
    color: '#eee',
    fontFamily: 'system-ui, sans-serif',
  },
  playerArea: {
    display: 'flex',
    padding: '10px 20px',
    gap: 20,
    alignItems: 'center',
    minHeight: 140,
  },
  deckArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
  },
  pileLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
  },
  piles: {
    display: 'flex',
    gap: 8,
  },
  pile: {
    width: 50,
    height: 70,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  pileText: {
    color: 'white',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  unitsArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  unitGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  groupLabel: {
    fontSize: 10,
    color: '#888',
    width: 60,
    textAlign: 'right',
  },
  cardSlots: {
    display: 'flex',
    gap: 6,
  },
  cardSlot: {
    width: 50,
    height: 70,
    backgroundColor: '#2a2a4a',
    borderRadius: 6,
    border: '2px dashed #444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a3a5c',
    borderRadius: 4,
    padding: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  miniCardName: {
    fontSize: 8,
    textAlign: 'center',
    color: '#ccc',
  },
  heroArea: {
    display: 'flex',
    alignItems: 'center',
  },
  heroCard: {
    width: 80,
    height: 110,
    backgroundColor: '#4a3a2a',
    borderRadius: 8,
    border: '3px solid #8a7a5a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  heroName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#daa',
    textAlign: 'center',
  },
  heroLevel: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  techPanel: {
    width: 120,
    height: 110,
    backgroundColor: '#1a2a4a',
    border: '2px solid #4a7ac4',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  techLabel: {
    fontSize: 9,
    color: '#7ac',
    textTransform: 'uppercase',
  },
  battlefield: {
    flex: 1,
    display: 'flex',
    padding: '0 10px',
    gap: 10,
  },
  fogZoneLeft: {
    width: 60,
    backgroundColor: '#0a0a1a',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    color: '#444',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  fogZoneRight: {
    width: 60,
    backgroundColor: '#0a0a1a',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    color: '#444',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  gridContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  grid: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  row: {
    display: 'flex',
    gap: 2,
    flex: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 2,
    minHeight: 30,
  },
};
