import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useGame } from '@/lib/gameContext';
import { TERRAIN_TYPES, hexToPixel, getHexCorners, getHexNeighbors } from '@/lib/gameData';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

const HEX_SIZE = 32;

// Rich terrain palette — each terrain gets a gradient-style multi-tone definition
const TERRAIN_PALETTE = {
  rockyPlain:     { base: '#8B5E3C', mid: '#A0714F', rim: '#6B4828', fog: '#2a1a0e' },
  crater:         { base: '#5A3520', mid: '#7A4A2C', rim: '#3D2010', fog: '#1a0d06' },
  mountain:       { base: '#6B4F3A', mid: '#8B6A50', rim: '#4A3225', fog: '#1e1208' },
  canyon:         { base: '#8B4513', mid: '#A0522D', rim: '#6B3410', fog: '#230e04' },
  iceDeposit:     { base: '#8AACBE', mid: '#B8D4E5', rim: '#5A8BA0', fog: '#0d2030' },
  mineralDeposit: { base: '#B87333', mid: '#D4874A', rim: '#9A5D20', fog: '#2a1500' },
  lavaField:      { base: '#2D1B0E', mid: '#4A2010', rim: '#1A0808', fog: '#100503' },
  dustBasin:      { base: '#C4903A', mid: '#DBA94A', rim: '#A07028', fog: '#2e1e06' },
  highRadiation:  { base: '#4A0E0E', mid: '#6A1818', rim: '#300808', fog: '#120303' },
  polarIce:       { base: '#B8D4E8', mid: '#D8EAF8', rim: '#8AACCF', fog: '#0d1e2e' },
};

const TERRAIN_ICONS = {
  rockyPlain: '🪨', crater: '🕳️', mountain: '⛰️', canyon: '🏜️',
  iceDeposit: '🧊', mineralDeposit: '💎', lavaField: '🌋', dustBasin: '🏖️',
  highRadiation: '☢️', polarIce: '❄️',
};

const BUILDING_ICONS = {
  habitat: '🏠', landingHabitat: '🏠', advancedHabitat: '🏛️',
  solarFarm: '☀️', nuclearReactor: '⚛️',
  waterExtractor: '💧', algaeFarm: '🌿',
  greenhouse: '🌱', mine: '⛏️', factory: '🏭',
  researchModule: '🔬', researchLab: '🔭', advancedResearchLab: '🧬',
  medicalCenter: '❤️‍🩹', recreationCenter: '🎭', commsCenter: '📡',
  tradeHub: '🤝', roverStation: '🚗', spaceport: '🚀',
  radiationShelter: '🛡️',
};

// Settlement size based on building count
function getSettlementLevel(hex) {
  const count = (hex.buildings || []).length;
  if (count >= 8) return 4;
  if (count >= 5) return 3;
  if (count >= 3) return 2;
  return 1;
}

function computeFitViewBox(hexes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  Object.values(hexes).forEach(hex => {
    const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
    minX = Math.min(minX, x - HEX_SIZE); minY = Math.min(minY, y - HEX_SIZE);
    maxX = Math.max(maxX, x + HEX_SIZE); maxY = Math.max(maxY, y + HEX_SIZE);
  });
  const padding = HEX_SIZE * 2.5;
  return { x: minX - padding, y: minY - padding, w: (maxX - minX) + padding * 2, h: (maxY - minY) + padding * 2 };
}

// SVG defs id — inline once per map render
const DEFS_ID = 'hex-map-defs';

export default function HexMap({ onHexSelect, selectedHex, actionMode }) {
  const { gameState, getViewBox, setViewBox, fitMapToScreen, resetMapView } = useGame();
  const containerRef = useRef(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const didClickRef = useRef(false);

  const map = gameState?.map;
  const players = gameState?.players || [];
  const viewBox = getViewBox(gameState);

  useEffect(() => {
    if (!map) return;
    const fitted = computeFitViewBox(map.hexes);
    fitMapToScreen(gameState, fitted);
  }, [map?.radius, map ? Object.keys(map.hexes).length : 0]);

  const handleFitToScreen = useCallback(() => {
    if (!map) return;
    setViewBox(gameState, computeFitViewBox(map.hexes));
  }, [map, gameState, setViewBox]);

  const handleResetView = useCallback(() => resetMapView(gameState), [gameState, resetMapView]);

  const handleZoom = useCallback((dir) => {
    setViewBox(gameState, prev => {
      const factor = dir > 0 ? 0.82 : 1.22;
      const newW = prev.w * factor, newH = prev.h * factor;
      const cx = prev.x + prev.w / 2, cy = prev.y + prev.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
  }, [gameState, setViewBox]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 0 || e.button === 1) {
      isPanningRef.current = false;
      didClickRef.current = true;
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const moved = Math.abs(e.clientX - panStartRef.current.x) + Math.abs(e.clientY - panStartRef.current.y);
    if (moved > 5) {
      isPanningRef.current = true;
      didClickRef.current = false;
    }
    if (!isPanningRef.current) return;
    setViewBox(gameState, prev => {
      const dx = (e.clientX - panStartRef.current.x) * (prev.w / containerRef.current.clientWidth);
      const dy = (e.clientY - panStartRef.current.y) * (prev.h / containerRef.current.clientHeight);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return { ...prev, x: prev.x - dx, y: prev.y - dy };
    });
  }, [gameState, setViewBox]);

  const handleMouseUp = useCallback(() => { isPanningRef.current = false; }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      isPanningRef.current = true;
      panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPanningRef.current || e.touches.length !== 1 || !containerRef.current) return;
    setViewBox(gameState, prev => {
      const dx = (e.touches[0].clientX - panStartRef.current.x) * (prev.w / containerRef.current.clientWidth);
      const dy = (e.touches[0].clientY - panStartRef.current.y) * (prev.h / containerRef.current.clientHeight);
      panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { ...prev, x: prev.x - dx, y: prev.y - dy };
    });
  }, [gameState, setViewBox]);

  const handleTouchEnd = useCallback(() => { isPanningRef.current = false; }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); handleZoom(e.deltaY < 0 ? 1 : -1); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [handleZoom]);

  const validTiles = useMemo(() => {
    if (!map || !gameState || !actionMode) return new Set();
    const valid = new Set();
    const pidx = gameState.currentPlayerIndex;
    Object.entries(map.hexes).forEach(([key, hex]) => {
      if (actionMode === 'explore' && !hex.explored) {
        const neighbors = getHexNeighbors(hex.q, hex.r);
        const hasAdj = neighbors.some(n => { const nk = `${n.q},${n.r}`; return map.hexes[nk] && (map.hexes[nk].owner === pidx || map.hexes[nk].explored); });
        if (hasAdj) valid.add(key);
      }
      if (actionMode === 'claim' && hex.explored && hex.owner === null) {
        const neighbors = getHexNeighbors(hex.q, hex.r);
        const hasAdj = neighbors.some(n => { const nk = `${n.q},${n.r}`; return map.hexes[nk] && map.hexes[nk].owner === pidx; });
        if (hasAdj) valid.add(key);
      }
      if (actionMode === 'build' && hex.owner === pidx) valid.add(key);
    });
    return valid;
  }, [map, gameState?.currentPlayerIndex, actionMode]);

  if (!map) return null;

  const ACTION_GLOW = { explore: '#60a5fa', claim: '#4ade80', build: '#fbbf24' };

  return (
    <div className="relative w-full h-full bg-[#04080f]" ref={containerRef}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {([
          ['Zoom in', () => handleZoom(1), <ZoomIn size={15} />],
          ['Zoom out', () => handleZoom(-1), <ZoomOut size={15} />],
          ['Fit to screen', handleFitToScreen, <Maximize2 size={15} />],
          ['Reset view', handleResetView, <RotateCcw size={13} />],
        ]).map(([title, fn, iconEl]) => (
          <button key={title} onClick={fn} title={title}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-lg"
            style={{ background: 'rgba(15,20,35,0.88)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {iconEl}
          </button>
        ))}
      </div>

      <svg className="w-full h-full select-none"
        style={{ cursor: isPanningRef.current ? 'grabbing' : 'grab' }}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>

        {/* SVG filters & gradients */}
        <defs>
          <filter id="glow-white" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-green" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor="#22c55e" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-blue" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor="#60a5fa" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-gold" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor="#fbbf24" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="fog" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" />
          </filter>
          {/* Per-terrain radial gradients */}
          {Object.entries(TERRAIN_PALETTE).map(([key, pal]) => (
            <radialGradient key={key} id={`tg-${key}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={pal.mid} />
              <stop offset="55%" stopColor={pal.base} />
              <stop offset="100%" stopColor={pal.rim} />
            </radialGradient>
          ))}
          {/* Fog gradient for unexplored */}
          <radialGradient id="tg-fog" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1a1020" />
            <stop offset="100%" stopColor="#0a0810" />
          </radialGradient>
        </defs>

        {/* Space background */}
        <rect x={viewBox.x - 2000} y={viewBox.y - 2000} width={viewBox.w + 4000} height={viewBox.h + 4000} fill="#04080f" />
        {/* Stars */}
        {Array.from({ length: 80 }).map((_, i) => {
          const sx = viewBox.x + (i * 97 % (viewBox.w + 3000)) - 1000;
          const sy = viewBox.y + (i * 137 % (viewBox.h + 3000)) - 1000;
          const r = i % 5 === 0 ? 1.2 : 0.6;
          return <circle key={i} cx={sx} cy={sy} r={r} fill="white" opacity={0.15 + (i % 4) * 0.08} />;
        })}

        {/* Hex tiles */}
        {Object.entries(map.hexes).map(([key, hex]) => {
          const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
          const corners = getHexCorners(x, y, HEX_SIZE - 1.5);
          const points = corners.map(c => `${c.x},${c.y}`).join(' ');
          const innerCorners = getHexCorners(x, y, HEX_SIZE - 3.5);
          const innerPoints = innerCorners.map(c => `${c.x},${c.y}`).join(' ');

          const isSelected = selectedHex === key;
          const isValid = validTiles.has(key);
          const ownerColor = hex.owner !== null && hex.owner !== undefined ? players[hex.owner]?.colorHex : null;
          const palette = TERRAIN_PALETTE[hex.terrain] || TERRAIN_PALETTE.rockyPlain;

          // Stroke
          let strokeColor = 'rgba(255,255,255,0.06)';
          let strokeWidth = 0.8;
          let glowFilter = null;
          if (isSelected) { strokeColor = '#ffffff'; strokeWidth = 2.5; glowFilter = 'url(#glow-white)'; }
          else if (isValid && actionMode === 'explore') { strokeColor = '#60a5fa'; strokeWidth = 2; glowFilter = 'url(#glow-blue)'; }
          else if (isValid && actionMode === 'claim') { strokeColor = '#4ade80'; strokeWidth = 2; glowFilter = 'url(#glow-green)'; }
          else if (isValid && actionMode === 'build') { strokeColor = '#fbbf24'; strokeWidth = 2; glowFilter = 'url(#glow-gold)'; }
          else if (ownerColor) { strokeColor = ownerColor; strokeWidth = 2; }

          const settlementLevel = hex.settlement ? getSettlementLevel(hex) : 0;
          const terrainIcon = hex.explored ? (TERRAIN_ICONS[hex.terrain] || '🪨') : '?';
          const buildings = hex.buildings || [];
          const topBuilding = buildings.length > 0 ? BUILDING_ICONS[buildings[buildings.length - 1]] || '🏗️' : null;

          return (
            <g key={key}
              onClick={(e) => { e.stopPropagation(); if (!isPanningRef.current) onHexSelect(key); }}
              style={{ cursor: 'pointer' }}>

              {/* Base terrain fill */}
              <polygon points={points}
                fill={hex.explored ? `url(#tg-${hex.terrain})` : 'url(#tg-fog)'}
                stroke={strokeColor} strokeWidth={strokeWidth}
                opacity={hex.explored ? 1 : 0.7}
                filter={glowFilter || undefined}
              />

              {/* Inner hex rim shadow for depth */}
              {hex.explored && (
                <polygon points={innerPoints}
                  fill="none"
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth={1.5}
                />
              )}

              {/* Ownership tint — very subtle */}
              {ownerColor && hex.explored && (
                <polygon points={points} fill={ownerColor} opacity={0.12} stroke="none" />
              )}

              {/* Valid action highlight */}
              {isValid && !isSelected && (
                <polygon points={points}
                  fill={ACTION_GLOW[actionMode] || '#fff'}
                  opacity={0.10} stroke="none" />
              )}

              {/* Fog dust overlay for unexplored */}
              {!hex.explored && (
                <polygon points={points} fill="rgba(20,10,30,0.45)" stroke="none" />
              )}

              {/* Terrain icon */}
              <text x={x} y={hex.explored && settlementLevel > 0 ? y + 5 : y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={hex.explored ? 11 : 8}
                opacity={hex.explored ? 0.75 : 0.2}
                style={{ pointerEvents: 'none', userSelect: 'none' }}>{terrainIcon}</text>

              {/* Building icon (top building if any) */}
              {topBuilding && hex.explored && !hex.settlement && (
                <text x={x} y={y - 7} textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} opacity={0.85}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>{topBuilding}</text>
              )}

              {/* Settlement — capital or colony */}
              {hex.settlement && hex.explored && (
                <>
                  {/* Settlement backing glow */}
                  <circle cx={x} cy={y - HEX_SIZE * 0.42} r={9 + settlementLevel * 1.5}
                    fill={ownerColor || '#fff'} opacity={0.18} />
                  {/* Settlement dome */}
                  <circle cx={x} cy={y - HEX_SIZE * 0.42} r={6 + settlementLevel}
                    fill={ownerColor || '#f5c518'} opacity={0.92}
                    stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
                  {/* Capitol star or colony diamond */}
                  <text x={x} y={y - HEX_SIZE * 0.42 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={hex.isCapital ? 7 + settlementLevel : 5 + settlementLevel}
                    fill="#fff" fontWeight="bold"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {hex.isCapital ? '★' : '◆'}
                  </text>
                  {/* Settlement building icons strip */}
                  {buildings.slice(0, 3).map((bId, bi) => (
                    <text key={bi}
                      x={x - 8 + bi * 8} y={y + 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={7} opacity={0.8}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {BUILDING_ICONS[bId] || '🏗️'}
                    </text>
                  ))}
                </>
              )}

              {/* Nation abbreviation label */}
              {hex.owner !== null && hex.owner !== undefined && !hex.settlement && (
                <text x={x} y={y + HEX_SIZE * 0.48}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={5.5} fill={ownerColor || '#fff'} fontWeight="bold" opacity={0.75}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {players[hex.owner]?.abbreviation}
                </text>
              )}

              {/* Nation territory border — small colored dots at hex center for owned non-settlement */}
              {hex.owner !== null && hex.owner !== undefined && ownerColor && !hex.settlement && hex.explored && (
                <circle cx={x} cy={y} r={2} fill={ownerColor} opacity={0.6} style={{ pointerEvents: 'none' }} />
              )}

              {/* Unexplored fog label */}
              {!hex.explored && (
                <text x={x} y={y - 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize={10} fill="rgba(255,255,255,0.15)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>?</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}