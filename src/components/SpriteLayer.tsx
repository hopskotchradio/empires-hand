import React, { useEffect, useRef, useState } from 'react';
import { Application, Sprite, Assets, Container, Texture } from 'pixi.js';
import { Card } from '../types';

interface UnitSprite {
  id: string;
  card: Card;
  gridX: number;
  gridY: number;
  isHero?: boolean;
}

interface SpriteLayerProps {
  units: UnitSprite[];
  width: number;
  height: number;
  onUnitClick?: (unit: UnitSprite) => void;
}

// Isometric projection constants
const TILE_WIDTH = 48;
const TILE_HEIGHT = 24;
const GRID_COLS = 14;
const GRID_ROWS = 8;

export const SpriteLayer: React.FC<SpriteLayerProps> = ({
  units,
  width,
  height,
  onUnitClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const spritesRef = useRef<Map<string, Sprite>>(new Map());
  const unitContainerRef = useRef<Container | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize PixiJS
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

        // Container for all units (centered)
        const unitContainer = new Container();
        unitContainer.x = width / 2;
        unitContainer.y = height / 2 - 50;
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

  // Update sprites when units change
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
      } else {
        createUnitSprite(unit, container, currentSprites, onUnitClick);
      }
    });

    // Remove sprites for units that no longer exist
    currentSprites.forEach((sprite, id) => {
      if (!seenIds.has(id)) {
        container.removeChild(sprite);
        sprite.destroy();
        currentSprites.delete(id);
      }
    });
  }, [units, onUnitClick, isReady]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
};

// Convert grid coordinates to isometric screen coordinates
function gridToIso(gridX: number, gridY: number): { x: number; y: number } {
  const offsetX = -(GRID_COLS * TILE_WIDTH) / 2;
  const offsetY = -(GRID_ROWS * TILE_HEIGHT) / 2;

  return {
    x: offsetX + (gridX - gridY) * (TILE_WIDTH / 2),
    y: offsetY + (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

// Create a unit sprite
async function createUnitSprite(
  unit: UnitSprite,
  container: Container,
  spritesMap: Map<string, Sprite>,
  onClick?: (unit: UnitSprite) => void
) {
  const size = unit.isHero ? 40 : 24;
  const color = unit.card.type === 'hero' ? 0xffaa44 : 0x4488ff;

  let sprite: Sprite;

  try {
    const texturePath = `${window.location.origin}/sprites/${unit.card.id.charAt(0).toUpperCase() + unit.card.id.slice(1)}-idle.png`;
    console.log('Loading texture:', texturePath);
    const texture = await Assets.load(texturePath).catch((err) => {
      console.log('Texture load failed:', err);
      return null;
    });

    if (texture) {
      console.log('Texture loaded for', unit.card.name);
      sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      const targetWidth = unit.isHero ? 60 : 32;
      sprite.scale.set(targetWidth / sprite.width);
    } else {
      console.log('Using placeholder for', unit.card.name);
      sprite = createPlaceholderSprite(size, color, unit.card.name);
    }
  } catch (err) {
    console.error('Error creating sprite:', err);
    sprite = createPlaceholderSprite(size, color, unit.card.name);
  }

  const pos = gridToIso(unit.gridX, unit.gridY);
  sprite.x = pos.x;
  sprite.y = pos.y;

  sprite.eventMode = 'static';
  sprite.cursor = 'pointer';
  sprite.on('pointerdown', () => onClick?.(unit));

  sprite.on('pointerover', () => {
    sprite.scale.set(sprite.scale.x * 1.1, sprite.scale.y * 1.1);
    sprite.alpha = 0.9;
  });
  sprite.on('pointerout', () => {
    sprite.scale.set(sprite.scale.x / 1.1, sprite.scale.y / 1.1);
    sprite.alpha = 1;
  });

  const shadow = createShadow(size);
  shadow.x = pos.x;
  shadow.y = pos.y + 4;
  container.addChild(shadow);
  container.addChild(sprite);

  spritesMap.set(unit.id, sprite);
}

// Create a placeholder colored sprite
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

// Create a simple shadow
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
