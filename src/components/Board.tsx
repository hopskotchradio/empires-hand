import React, { useMemo, useState, useCallback } from 'react';
import { GameState, Card } from '../types';
import { SpriteLayer } from './SpriteLayer';

interface BoardProps {
  gameState: GameState;
  currentPlayerId: string;
}

// Layout: Hero Top | 3 fog | 5x5 Grid | 3 fog | Hero Bottom
// Middle row (row 2) is the control lane
const GRID_SIZE = 5;
const CONTROL_LANE_ROW = 2;

export const Board: React.FC<BoardProps> = ({ gameState, currentPlayerId }) => {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const opponent = gameState.players.find(p => p.id !== currentPlayerId);

  if (!currentPlayer || !opponent) return null;

  const [unitPositions, setUnitPositions] = useState({
    'zeus-1': { x: 2, y: 4 },
    'thor-1': { x: 2, y: 0 },
  });

  const [draggedUnit, setDraggedUnit] = useState<string | null>(null);

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

  const handleDragStart = useCallback((unitId: string, e: React.DragEvent) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit?.canMove) {
      e.preventDefault();
      return;
    }
    setDraggedUnit(unitId);
    e.dataTransfer.effectAllowed = 'move';
  }, [units]);

  const handleDrop = useCallback((gridX: number, gridY: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedUnit) return;
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
      {/* Top Hero Section */}
      <HeroSection 
        hero={opponent.hero}
        level={opponent.heroLevel}
      />

      {/* Battlefield */}
      <div style={styles.battlefield}>
        {/* Left Fog Zones */}
        <div style={styles.fogContainer}>
          <div style={styles.fogZone} />
          <div style={styles.fogZone} />
          <div style={styles.fogZone} />
        </div>

        {/* Main 5x5 Grid - 3x bigger cells */}
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
                        border: isControlLane ? '3px solid rgba(200, 150, 50, 0.6)' : '2px solid #444',
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
            width={525}
            height={525}
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

      {/* Bottom Hero Section */}
      <HeroSection 
        hero={currentPlayer.hero}
        level={currentPlayer.heroLevel}
        draggable
        onDragStart={(e) => handleDragStart(`${currentPlayer.hero.id}-1`, e)}
      />
    </div>
  );
};

interface HeroSectionProps {
  hero: Card;
  level: number;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ hero, level, draggable, onDragStart }) => {
  return (
    <div style={styles.heroSection}>
      {/* Left side - Tech and Units (larger) */}
      <div style={styles.leftPanel}>
        <div style={styles.panelButton}>TECH TREE</div>
        <div style={styles.panelButton}>UNITS</div>
      </div>

      {/* Center - Hero Portrait */}
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

      {/* Right side - Forces, Industry, Knowledge (bigger cards) */}
      <div style={styles.rightPanel}>
        <DeckPile name="FORCES" color="#c44" />
        <DeckPile name="INDUSTRY" color="#4a4" />
        <DeckPile name="KNOWLEDGE" color="#44c" />
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
    gap: 24,
    padding: '16px 32px',
    minHeight: 160,
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: 100,
  },
  panelButton: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7ac',
    textTransform: 'uppercase',
    padding: '12px 16px',
    backgroundColor: '#1a2a4a',
    borderRadius: 6,
    border: '2px solid #4a7ac4',
    textAlign: 'center',
    cursor: 'pointer',
  },
  heroCard: {
    width: 160,
    height: 130,
    backgroundColor: '#3a2a1a',
    borderRadius: 12,
    border: '3px solid #8a6a4a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    userSelect: 'none',
  },
  heroImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#2a1a0a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    border: '2px solid #6a5a4a',
  },
  heroInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#daa',
  },
  heroNameLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0c090',
    textAlign: 'center',
  },
  heroLevelLarge: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  dragHint: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: 100,
  },
  pile: {
    width: 100,
    height: 36,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  },
  pileText: {
    color: 'white',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    letterSpacing: 1,
  },
  battlefield: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: '12px 32px',
    minHeight: 0,
  },
  fogContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: 100,
    height: 420,
  },
  fogZone: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    borderRadius: 8,
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
    gap: 6,
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  row: {
    display: 'flex',
    gap: 6,
    borderRadius: 6,
  },
  cell: {
    width: 87,
    height: 87,
    borderRadius: 6,
    transition: 'all 0.2s',
  },
};
