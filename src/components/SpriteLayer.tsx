import React, { useEffect, useRef, useState } from 'react';
import { Application, Sprite, Assets, Container, Texture, Rectangle, AnimatedSprite } from 'pixi.js';
import { Card } from '../types';

interface UnitSprite {
  id: string;
  card: Card;
  gridX: number;
  gridY: number;
  isHero?: boolean;
  canMove?: boolean;
}

interface SpriteLayerProps {
  units: UnitSprite[];
  width: number;
  height: number;
  onUnitClick?: (unit: UnitSprite) => void;
  draggedUnit?: string | null;
}

// Grid config: 5x5 Grid
const GRID_SIZE = 5;
const TOTAL_COLS = GRID_SIZE;
const TOTAL_ROWS = GRID_SIZE;

const TILE_SIZE = 42; // Square cells to match CSS

// Sprite sheet config
const SHEET_COLS = 5;
const SHEET_ROWS = 5;

export const SpriteLayer: React.FC<SpriteLayerProps> = ({
  units,
  width,
  height,
  onUnitClick,
  draggedUnit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const spritesRef = useRef<Map<string, Sprite | AnimatedSprite>>(new Map());
  const unitContainerRef = useRef<Container | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    let mounted = true;

    const init = async () => {
      try {
        const app = new Application();
        await app.init({
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!mounted) {
          app.destroy();
          return;
        }

        containerRef.current?.appendChild(app.canvas);
        appRef.current = app;

        const unitContainer = new Container();
        unitContainer.x = width / 2;
        unitContainer.y = height / 2;
        app.stage.addChild(unitContainer);
        unitContainerRef.current = unitContainer;

        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize PixiJS:', err);
      }
    };

    init();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [width, height]);

  useEffect(() => {
    if (!isReady) return;

    const app = appRef.current;
    const container = unitContainerRef.current;
    if (!app || !container) return;

    const currentSprites = spritesRef.current;
    const seenIds = new Set<string>();

    units.forEach((unit) => {
      seenIds.add(unit.id);

      if (currentSprites.has(unit.id)) {
        const sprite = currentSprites.get(unit.id)!;
        const pos = gridToIso(unit.gridX, unit.gridY);
        sprite.x = pos.x;
        sprite.y = pos.y;
        
        // Update cursor based on canMove
        sprite.cursor = unit.canMove ? 'grab' : 'default';
        sprite.eventMode = unit.canMove ? 'static' : 'none';
        
        // Visual feedback when dragging
        if (draggedUnit === unit.id) {
          sprite.alpha = 0.5;
          sprite.scale.set(sprite.scale.x * 1.1);
        } else {
          sprite.alpha = 1;
        }
      } else {
        createUnitSprite(unit, container, currentSprites, onUnitClick, draggedUnit);
      }
    });

    currentSprites.forEach((sprite, id) => {
      if (!seenIds.has(id)) {
        container.removeChild(sprite);
        sprite.destroy();
        currentSprites.delete(id);
      }
    });
  }, [units, onUnitClick, isReady, draggedUnit]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
    />
  );
};

function gridToIso(gridX: number, gridY: number): { x: number; y: number } {
  const offsetX = -(TOTAL_COLS * TILE_SIZE) / 2;
  const offsetY = -(TOTAL_ROWS * TILE_SIZE) / 2;

  return {
    x: offsetX + (gridX - gridY) * (TILE_SIZE / 2),
    y: offsetY + (gridX + gridY) * (TILE_SIZE / 2),
  };
}

async function createUnitSprite(
  unit: UnitSprite,
  container: Container,
  spritesMap: Map<string, Sprite | AnimatedSprite>,
  onClick?: (unit: UnitSprite) => void,
  draggedUnit?: string | null
) {
  const size = unit.isHero ? 40 : 24;
  const color = unit.card.type === 'hero' ? 0xffaa44 : 0x4488ff;

  let sprite: Sprite | AnimatedSprite;
  let animSprite: AnimatedSprite | null = null;

  try {
    const texturePath = `${window.location.origin}/sprites/${unit.card.id}-idle.png`;
    const baseTexture = await Assets.load(texturePath).catch(() => null);

    if (baseTexture) {
      const frameWidth = baseTexture.width / SHEET_COLS;
      const frameHeight = baseTexture.height / SHEET_ROWS;
      
      const frames: Texture[] = [];
      for (let row = 0; row < SHEET_ROWS; row++) {
        for (let col = 0; col < SHEET_COLS; col++) {
          const rect = new Rectangle(
            col * frameWidth,
            row * frameHeight,
            frameWidth,
            frameHeight
          );
          const frameTexture = new Texture({
            source: baseTexture.source,
            frame: rect,
          });
          frames.push(frameTexture);
        }
      }
      
      animSprite = new AnimatedSprite(frames);
      animSprite.anchor.set(0.5, 1);
      
      const targetWidth = unit.isHero ? 100 : 32;
      animSprite.scale.set(targetWidth / frameWidth);
      
      animSprite.animationSpeed = 0.15;
      animSprite.loop = true;
      animSprite.play();
      
      sprite = animSprite;
    } else {
      sprite = createPlaceholderSprite(size, color, unit.card.name);
    }
  } catch (err) {
    sprite = createPlaceholderSprite(size, color, unit.card.name);
  }

  const pos = gridToIso(unit.gridX, unit.gridY);
  sprite.x = pos.x;
  sprite.y = pos.y;

  // Set cursor and interactivity based on canMove
  sprite.cursor = unit.canMove ? 'grab' : 'default';
  sprite.eventMode = unit.canMove ? 'static' : 'none';
  
  if (unit.canMove) {
    sprite.on('pointerdown', () => onClick?.(unit));
    
    sprite.on('pointerover', () => {
      sprite.scale.set(sprite.scale.x * 1.1);
      sprite.alpha = 0.9;
    });
    sprite.on('pointerout', () => {
      sprite.scale.set(sprite.scale.x / 1.1);
      sprite.alpha = 1;
    });
  }

  // Visual feedback when dragging
  if (draggedUnit === unit.id) {
    sprite.alpha = 0.5;
  }

  const shadow = createShadow(size);
  shadow.x = pos.x;
  shadow.y = pos.y + 4;
  container.addChild(shadow);
  container.addChild(sprite);

  spritesMap.set(unit.id, sprite);
}

function createPlaceholderSprite(size: number, color: number, label: string): Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const hexColor = '#' + color.toString(16).padStart(6, '0');
  ctx.fillStyle = hexColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, 4);
  ctx.fill();

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size / 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label[0], size / 2, size / 2);

  const texture = Texture.from(canvas);
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5, 1);
  return sprite;
}

function createShadow(size: number): Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 3;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(size / 2, size / 6, size / 2, size / 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = Texture.from(canvas);
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5, 0.5);
  return sprite;
}
