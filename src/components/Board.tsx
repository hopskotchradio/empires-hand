import React, { useMemo, useState, useCallback } from 'react';
import { GameState, Card } from '../types';
import { SpriteLayer } from './SpriteLayer';

interface BoardProps {
  gameState: GameState;
  currentPlayerId: string;
}

// Layout: Large Hero Top | 3 fog | 5x5 Grid | 3 fog | Large Hero Bottom
// Middle row (row 2) is the control lane
const GRID_SIZE = 5;
const CONTROL_LANE_ROW = 2;

export const Board: React.FC<BoardProps> = ({ gameState, currentPlayerId }) => {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const opponent = gameState.players.find(p => p.id !== currentPlayerId);

  if (!currentPlayer || !opponent) return null;

  // Track unit positions with state for dragging (positions within the 5x5 grid)
  const [unitPositions, setUnitPositions] = useState({
    'zeus-1': { x: 2, y: 4 }, // Bottom center
    'thor-1': { x: 2, y: 0 }, // Top center
  });

  const [draggedUnit, setDraggedUnit] = useState<string | null>(null);

  // Convert to unit format for SpriteLayer
  const units = useMemo(() => [
    {
      id: 'zeus-1',
      card: { ...currentPlayer.hero, id: 'zeus' },
      gridX: unitPositions['zeus-1'].x,
      gridY: unitPositions['zeus-1'].y,
      isHero: true,
      canMove: true,
    },
    {
      id: 'thor-1', 
      card: { ...opponent.hero, id: 'thor' },
      gridX: unitPositions['thor-1'].x,
      gridY: unitPositions['thor-1'].y,
      isHero: true,
      canMove: false,
    },
  ], [currentPlayer.hero, opponent.hero, unitPositions]);

  // Handle drag start from hero card
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

    // Check bounds (must be within 5x5 grid)
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
      {/* Top Hero Area */}
      <div style={styles.heroSection}>
        <HeroCard 
          hero={opponent.hero} 
          level={opponent.heroLevel}
          position="top"
        />
        {/* Top Deck Piles */}
        <div style={styles.deckArea}>
          <DeckPile name="Forces" color="#c44" />
          <DeckPile name="Industry" color="#4a4" />
          <DeckPile name="Knowledge" color="#44c" />
        </div>
      </div>

      {/* Battlefield */}
      <div style={styles.battlefield}>
        {/* Left Fog Zones */}
        <div style={styles.fogContainer}>
          <div style={styles.fogZone} />
          <div style={styles.fogZone} />
          <div style={styles.fogZone} />
        </div>

        {/* Main 5x5 Grid */}
        <div style={styles.gridContainer}>
          <div style={styles.grid}>
            {Array.from({ length: GRID_SIZE }).map((_, row) => (
              <div 
                key={row} 
                style={{
                  ...styles.row,
                  backgroundColor: row === CONTROL_LANE_ROW ? 'rgba(200, 150, 50, 0.2)' : 'transparent',
                }}
              >
                {Array.from({ length: GRID_SIZE }).map((_, col) => {
                  const isControlLane = row === CONTROL_LANE_ROW;
                  const isValidDrop = draggedUnit !== null;

                  return (
                    <div
                      key={`${row}-${col}`}
                      style={{
                        ...styles.cell,
                        backgroundColor: isControlLane ? 'rgba(200, 150, 50, 0.4)' : '#2a2a4a',
                        border: isControlLane ? '2px solid rgba(200, 150, 50, 0.6)' : '1px solid #444',
                        cursor: isValidDrop ? 'copy' : 'default',
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(col, row, e)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <SpriteLayer
            units={units}
            width={350}
            height={350}
            onUnitClick={(unit) => console.log('Clicked:', unit.card.name)}
            draggedUnit={draggedUnit}
          />
        </div>

        {/* Right Fog Zones */}
        <div style={styles.fogContainer}>
          <div style={styles.fogZone} />
          <div style={styles.fogZone} />
          <div style={styles.fogZone} />
        </div>
      </div>

      {/* Bottom Hero Area */}
      <div style={styles.heroSection}>
        <HeroCard 
          hero={currentPlayer.hero} 
          level={currentPlayer.heroLevel}
          position="bottom"
          draggable
          onDragStart={(e) => handleDragStart(`${currentPlayer.hero.id}-1`, e)}
        />
        {/* Bottom Deck Piles */}
        <div style={styles.deckArea}>
          <DeckPile name="Forces" color="#c44" />
          <DeckPile name="Industry" color="#4a4" />
          <DeckPile name="Knowledge" color="#44c" />
        </div>
      </div>
    </div>
  );
};

interface HeroCardProps {
  hero: Card;
  level: number;
  position: 'top' | 'bottom';
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, level, position, draggable, onDragStart }) => {

  return (
    <div style={styles.heroCardContainer}>
      <div 
        style={{
          ...styles.heroCard,
          cursor: draggable ? 'grab' : 'default',
        }}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        <div style={styles.heroImagePlaceholder}>
          <span style={styles.heroInitial}>{hero.name[0]}</span>
        </div>
        <div style={styles.heroNameLarge}>{hero.name}</div>
        <div style={styles.heroLevelLarge}>Level {level}</div>
        {draggable && <div style={styles.dragHint}>Drag to move</div>}
      </div>
      
      {/* Side panels */}
      <div style={styles.sidePanel}>
        <div style={styles.sideLabel}>TECH</div>
        <div style={styles.sideLabel}>UNITS</div>
      </div>
    </div>
  );
};

const DeckPile: React.FC<{ name: string; color: string }> = ({ name, color }) => (
  <div style={{ ...styles.pile, backgroundColor: color }}>
    <span style={styles.pileText}>{name}</span>
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
    overflow: 'hidden',
  },
  heroSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: '12px 24px',
    minHeight: 140,
  },
  heroCardContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  heroCard: {
    width: 140,
    height: 110,
    backgroundColor: '#3a2a1a',
    borderRadius: 10,
    border: '3px solid #8a6a4a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    userSelect: 'none',
  },
  heroImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#2a1a0a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    border: '2px solid #6a5a4a',
  },
  heroInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#daa',
  },
  heroNameLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e0c090',
    textAlign: 'center',
  },
  heroLevelLarge: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  dragHint: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  sidePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sideLabel: {
    fontSize: 10,
    color: '#7ac',
    textTransform: 'uppercase',
    padding: '4px 8px',
    backgroundColor: '#1a2a4a',
    borderRadius: 4,
    border: '1px solid #4a7ac4',
  },
  deckArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  pile: {
    width: 70,
    height: 28,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  },
  pileText: {
    color: 'white',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  battlefield: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: '8px 24px',
    minHeight: 0,
  },
  fogContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: 70,
    height: 280,
  },
  fogZone: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    borderRadius: 6,
    border: '1px solid #1a1a2a',
    opacity: 0.6,
  },
  gridContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  row: {
    display: 'flex',
    gap: 4,
    borderRadius: 4,
  },
  cell: {
    width: 58,
    height: 58,
    borderRadius: 4,
    transition: 'all 0.2s',
  },
};
