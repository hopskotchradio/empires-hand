import React, { useMemo, useState, useCallback } from 'react';
import { GameState, PlayerState, Card } from '../types';
import { SpriteLayer } from './SpriteLayer';

interface BoardProps {
  gameState: GameState;
  currentPlayerId: string;
}

// Grid layout: 3 fog zones | 5x5 Grid | 3 fog zones
// Middle row (row 2) is the control lane
const FOG_COLS = 3;
const GRID_SIZE = 5;
const TOTAL_COLS = FOG_COLS + GRID_SIZE + FOG_COLS; // 11
const TOTAL_ROWS = GRID_SIZE; // 5
const CONTROL_LANE_ROW = 2; // Middle row for control points

export const Board: React.FC<BoardProps> = ({ gameState, currentPlayerId }) => {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const opponent = gameState.players.find(p => p.id !== currentPlayerId);

  if (!currentPlayer || !opponent) return null;

  // Track unit positions with state for dragging (positions within the 5x5 grid)
  const [unitPositions, setUnitPositions] = useState({
    'zeus-1': { x: 2, y: 4 }, // Bottom area
    'thor-1': { x: 2, y: 0 }, // Top area
  });

  const [draggedUnit, setDraggedUnit] = useState<string | null>(null);

  // Convert to unit format for SpriteLayer (add FOG_COLS offset for rendering)
  const units = useMemo(() => [
    {
      id: 'zeus-1',
      card: { ...currentPlayer.hero, id: 'zeus' },
      gridX: unitPositions['zeus-1'].x + FOG_COLS,
      gridY: unitPositions['zeus-1'].y,
      isHero: true,
      canMove: true,
    },
    {
      id: 'thor-1', 
      card: { ...opponent.hero, id: 'thor' },
      gridX: unitPositions['thor-1'].x + FOG_COLS,
      gridY: unitPositions['thor-1'].y,
      isHero: true,
      canMove: false,
    },
  ], [currentPlayer.hero, opponent.hero, unitPositions]);

  // Handle drag start
  const handleDragStart = useCallback((unitId: string, e: React.DragEvent) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit?.canMove) {
      e.preventDefault();
      return;
    }
    setDraggedUnit(unitId);
    e.dataTransfer.effectAllowed = 'move';
  }, [units]);

  // Handle drop on grid cell
  const handleDrop = useCallback((gridX: number, gridY: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedUnit) return;

    // Check bounds (must be within 5x5 playable grid)
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) return;

    setUnitPositions(prev => ({
      ...prev,
      [draggedUnit]: { x: gridX, y: gridY }
    }));
    setDraggedUnit(null);
  }, [draggedUnit]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div style={styles.container}>
      {/* Opponent Area (Top) */}
      <PlayerArea player={opponent} position="top" />

      {/* Battlefield */}
      <div style={styles.battlefield}>
        {/* Main Grid with Fog Zones */}
        <div style={styles.gridContainer}>
          <div style={styles.grid}>
            {Array.from({ length: TOTAL_ROWS }).map((_, row) => (
              <div key={row} style={{
                ...styles.row,
                // Highlight control lane
                backgroundColor: row === CONTROL_LANE_ROW ? 'rgba(200, 150, 50, 0.15)' : 'transparent',
                borderRadius: 4,
              }}>
                {Array.from({ length: TOTAL_COLS }).map((_, col) => {
                  const isLeftFog = col < FOG_COLS;
                  const isRightFog = col >= FOG_COLS + GRID_SIZE;
                  const isFog = isLeftFog || isRightFog;
                  const isGrid = !isFog;
                  const isControlLane = row === CONTROL_LANE_ROW;
                  const isValidDrop = isGrid && draggedUnit !== null;

                  return (
                    <div
                      key={`${row}-${col}`}
                      style={{
                        ...styles.cell,
                        backgroundColor: isFog ? '#0a0a1a' : (isControlLane ? 'rgba(200, 150, 50, 0.3)' : '#2a2a4a'),
                        border: isFog ? '1px solid #1a1a2a' : (isControlLane ? '1px solid rgba(200, 150, 50, 0.5)' : '1px solid #444'),
                        cursor: isValidDrop ? 'copy' : 'default',
                        opacity: isFog ? 0.3 : 1,
                      }}
                      onDragOver={isGrid ? handleDragOver : undefined}
                      onDrop={isGrid ? (e) => handleDrop(col - FOG_COLS, row, e) : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <SpriteLayer
            units={units}
            width={360}
            height={180}
            onUnitClick={(unit) => console.log('Clicked:', unit.card.name)}
            draggedUnit={draggedUnit}
          />
        </div>
      </div>

      {/* Current Player Area (Bottom) */}
      <PlayerArea 
        player={currentPlayer} 
        position="bottom" 
        onDragStart={handleDragStart}
      />
    </div>
  );
};

interface PlayerAreaProps {
  player: PlayerState;
  position: 'top' | 'bottom';
  onDragStart?: (unitId: string, e: React.DragEvent) => void;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({ player, position, onDragStart }) => {
  const isTop = position === 'top';
  const isCurrentPlayer = position === 'bottom';

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

      {/* Hero - Draggable for current player */}
      <div style={styles.heroArea}>
        <div 
          style={{
            ...styles.heroCard,
            cursor: isCurrentPlayer ? 'grab' : 'default',
          }}
          draggable={isCurrentPlayer}
          onDragStart={(e) => onDragStart?.(`${player.hero.id}-1`, e)}
        >
          <div style={styles.heroName}>{player.hero.name}</div>
          <div style={styles.heroLevel}>Lv.{player.heroLevel}</div>
          {isCurrentPlayer && <div style={styles.dragHint}>↔ Drag</div>}
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
    userSelect: 'none',
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
  dragHint: {
    fontSize: 8,
    color: '#666',
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
    position: 'relative',
    padding: '0 10px',
  },
  fogZone: {
    width: 80,
    backgroundColor: '#0a0a1a',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    color: '#333',
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
    gap: 1,
    padding: 6,
    backgroundColor: '#222',
    borderRadius: 6,
  },
  row: {
    display: 'flex',
    gap: 1,
    flex: 1,
  },
  cell: {
    flex: 1,
    borderRadius: 2,
    aspectRatio: '1 / 1',
    minHeight: 22,
    minWidth: 22,
    transition: 'all 0.2s',
  },
};
