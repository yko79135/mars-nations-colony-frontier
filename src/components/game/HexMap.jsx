import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useGame } from '@/lib/gameContext';
import { TERRAIN_TYPES, hexToPixel, getHexCorners, getHexNeighbors, hexDistance, isExploredByNation, canExploreHex, canClaimHex, canBuildOnHex } from '@/lib/gameData';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

const HEX_SIZE = 32;

const TERRAIN_PALETTE = {
  rockyPlain:     { base: '#8B5E3C', mid: '#A0714F', rim: '#6B4828' },
  crater:         { base: '#5A3520', mid: '#7A4A2C', rim: '#3D2010' },
  mountain:       { base: '#6B4F3A', mid: '#8B6A50', rim: '#4A3225' },
  canyon:         { base: '#8B4513', mid: '#A0522D', rim: '#6B3410' },
  iceDeposit:     { base: '#8AACBE', mid: '#B8D4E5', rim: '#5A8BA0' },
  mineralDeposit: { base: '#B87333', mid: '#D4874A', rim: '#9A5D20' },
  lavaField:      { base: '#2D1B0E', mid: '#4A2010', rim: '#1A0808' },
  dustBasin:      { base: '#C4903A', mid: '#DBA94A', rim: '#A07028' },
  highRadiation:  { base: '#4A0E0E', mid: '#6A1818', rim: '#300808' },
  polarIce:       { base: '#B8D4E8', mid: '#D8EAF8', rim: '#8AACCF' },
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

export default function HexMap({ onHexSelect, selectedHex, actionMode, onHexHover, onHexLeave }) {
  const { gameState, getViewBox, setViewBox, fitMapToScreen, resetMapView } = useGame();
  const containerRef = useRef(null);

  // ---- Drag / click state — all refs, no React state for pointer tracking ----
  const isPointerDownRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, viewBoxX: 0, viewBoxY: 0, w: 800, h: 600 });
  const didDragRef = useRef(false);
  const pendingHexIdRef = useRef(null);
  // Keep a stable ref to onHexSelect so stopDragging never goes stale
  const onHexSelectRef = useRef(onHexSelect);
  useEffect(() => { onHexSelectRef.current = onHexSelect; }, [onHexSelect]);

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

  // ---- Pointer-based drag (mouse + touch) with refs ----
  const handlePointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isPointerDownRef.current = true;
    didDragRef.current = false;
    const vb = getViewBox(gameState);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      viewBoxX: vb.x,
      viewBoxY: vb.y,
      w: vb.w,
      h: vb.h,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, [gameState, getViewBox]);

  const handlePointerMove = useCallback((e) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    if (!didDragRef.current && Math.abs(dx) + Math.abs(dy) > 5) {
      didDragRef.current = true;
    }
    if (!didDragRef.current) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const svgDx = dx * (dragStartRef.current.w / rect.width);
    const svgDy = dy * (dragStartRef.current.h / rect.height);
    setViewBox(gameState, prev => ({
      ...prev,
      x: dragStartRef.current.viewBoxX - svgDx,
      y: dragStartRef.current.viewBoxY - svgDy,
    }));
  }, [gameState, setViewBox]);

  // Called on pointerup/pointercancel — resolves click vs drag
  const stopDragging = useCallback((e) => {
    const wasDragging = didDragRef.current;
    isPointerDownRef.current = false;
    didDragRef.current = false;

    if (e && e.pointerId !== undefined) {
      try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (_) {}
    }

    // If this was a click (not a drag) and a hex was the target, activate it
    if (!wasDragging && pendingHexIdRef.current) {
      const hexId = pendingHexIdRef.current;
      pendingHexIdRef.current = null;
      onHexSelectRef.current(hexId);
    } else {
      pendingHexIdRef.current = null;
    }
  }, []);

  // Touch events (supplemental — pointer events already handle touch on most browsers)
  const touchStartRef = useRef({ x: 0, y: 0, vbX: 0, vbY: 0, w: 0, h: 0 });
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const vb = getViewBox(gameState);
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, vbX: vb.x, vbY: vb.y, w: vb.w, h: vb.h };
    didDragRef.current = false;
    isPointerDownRef.current = true;
  }, [gameState, getViewBox]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length !== 1 || !containerRef.current) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) didDragRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const svgDx = dx * (touchStartRef.current.w / rect.width);
    const svgDy = dy * (touchStartRef.current.h / rect.height);
    setViewBox(gameState, prev => ({
      ...prev,
      x: touchStartRef.current.vbX - svgDx,
      y: touchStartRef.current.vbY - svgDy,
    }));
  }, [gameState, setViewBox]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); handleZoom(e.deltaY < 0 ? 1 : -1); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [handleZoom]);

  // ---- Valid tile computation using shared validators ----
  const validTiles = useMemo(() => {
    if (!map || !gameState || !actionMode) return new Set();
    const valid = new Set();
    const pidx = gameState.currentPlayerIndex;

    Object.keys(map.hexes).forEach(key => {
      if (actionMode === 'explore' && canExploreHex(gameState, pidx, key)) valid.add(key);
      if (actionMode === 'claim'   && canClaimHex(gameState, pidx, key))   valid.add(key);
      if (actionMode === 'build'   && canBuildOnHex(gameState, pidx, key)) valid.add(key);
    });
    return valid;
  }, [map, gameState?.currentPlayerIndex, actionMode, gameState?.players]);

  if (!map) return null;

  const ACTION_GLOW = { explore: '#60a5fa', claim: '#4ade80', build: '#fbbf24' };
  const pidx = gameState.currentPlayerIndex;

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

      <svg
        className="w-full h-full select-none"
        style={{ cursor: isPointerDownRef.current ? 'grabbing' : actionMode ? 'crosshair' : 'grab', touchAction: 'none' }}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopDragging}
      >
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
          {Object.entries(TERRAIN_PALETTE).map(([key, pal]) => (
            <radialGradient key={key} id={`tg-${key}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={pal.mid} />
              <stop offset="55%" stopColor={pal.base} />
              <stop offset="100%" stopColor={pal.rim} />
            </radialGradient>
          ))}
          <radialGradient id="tg-fog" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1a1020" />
            <stop offset="100%" stopColor="#0a0810" />
          </radialGradient>
        </defs>

        {/* Space background */}
        <rect x={viewBox.x - 2000} y={viewBox.y - 2000} width={viewBox.w + 4000} height={viewBox.h + 4000} fill="#04080f" pointerEvents="none" />
        {Array.from({ length: 80 }).map((_, i) => {
          const sx = viewBox.x + (i * 97 % (viewBox.w + 3000)) - 1000;
          const sy = viewBox.y + (i * 137 % (viewBox.h + 3000)) - 1000;
          const r = i % 5 === 0 ? 1.2 : 0.6;
          return <circle key={i} cx={sx} cy={sy} r={r} fill="white" opacity={0.15 + (i % 4) * 0.08} pointerEvents="none" />;
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

          // Visibility: hex is visible if explored by current nation OR it's any capital
          const exploredByMe = isExploredByNation(hex, pidx);
          const isVisible = exploredByMe || hex.isCapital;

          let strokeColor = 'rgba(255,255,255,0.06)';
          let strokeWidth = 0.8;
          let glowFilter = null;
          if (isSelected) { strokeColor = '#ffffff'; strokeWidth = 2.5; glowFilter = 'url(#glow-white)'; }
          else if (isValid && actionMode === 'explore') { strokeColor = '#60a5fa'; strokeWidth = 2; glowFilter = 'url(#glow-blue)'; }
          else if (isValid && actionMode === 'claim')   { strokeColor = '#4ade80'; strokeWidth = 2; glowFilter = 'url(#glow-green)'; }
          else if (isValid && actionMode === 'build')   { strokeColor = '#fbbf24'; strokeWidth = 2; glowFilter = 'url(#glow-gold)'; }
          else if (ownerColor) { strokeColor = ownerColor; strokeWidth = 2; }

          const settlementLevel = hex.settlement ? getSettlementLevel(hex) : 0;
          const terrainIcon = isVisible ? (TERRAIN_ICONS[hex.terrain] || '🪨') : '?';
          const buildings = hex.buildings || [];
          const topBuilding = buildings.length > 0 ? BUILDING_ICONS[buildings[buildings.length - 1]] || '🏗️' : null;

          return (
            <g key={key}
              onMouseEnter={() => onHexHover?.(key)}
              onMouseLeave={() => onHexLeave?.(key)}>

              {/* Transparent hit polygon — catches pointer events for this hex */}
              <polygon points={points}
                fill="transparent"
                stroke="none"
                style={{ pointerEvents: 'all', cursor: isValid ? 'pointer' : 'inherit' }}
                onPointerDown={(e) => {
                  // Don't stop propagation — let the parent SVG also get the event for dragging.
                  // Just record which hex the pointer went down on.
                  pendingHexIdRef.current = key;
                }}
              />

              {/* Visual layers — all pointerEvents="none" so they don't block hits */}
              <g pointerEvents="none">
                <polygon points={points}
                  fill={isVisible ? `url(#tg-${hex.terrain})` : 'url(#tg-fog)'}
                  stroke={strokeColor} strokeWidth={strokeWidth}
                  opacity={isVisible ? 1 : 0.7}
                  filter={glowFilter || undefined}
                />

                {isVisible && (
                  <polygon points={innerPoints}
                    fill="none"
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth={1.5}
                  />
                )}

                {ownerColor && isVisible && (
                  <polygon points={points} fill={ownerColor} opacity={0.12} stroke="none" />
                )}

                {isValid && !isSelected && (
                  <polygon points={points}
                    fill={ACTION_GLOW[actionMode] || '#fff'}
                    opacity={0.10} stroke="none" />
                )}

                {!isVisible && (
                  <polygon points={points} fill="rgba(20,10,30,0.45)" stroke="none" />
                )}

                <text x={x} y={isVisible && settlementLevel > 0 ? y + 5 : y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isVisible ? 11 : 8}
                  opacity={isVisible ? 0.75 : 0.2}
                  style={{ userSelect: 'none' }}>{terrainIcon}</text>

                {topBuilding && isVisible && !hex.settlement && (
                  <text x={x} y={y - 7} textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} opacity={0.85}
                    style={{ userSelect: 'none' }}>{topBuilding}</text>
                )}

                {hex.settlement && isVisible && (
                  <>
                    <circle cx={x} cy={y - HEX_SIZE * 0.42} r={9 + settlementLevel * 1.5}
                      fill={ownerColor || '#fff'} opacity={0.18} />
                    <circle cx={x} cy={y - HEX_SIZE * 0.42} r={6 + settlementLevel}
                      fill={ownerColor || '#f5c518'} opacity={0.92}
                      stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
                    <text x={x} y={y - HEX_SIZE * 0.42 + 1}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={hex.isCapital ? 7 + settlementLevel : 5 + settlementLevel}
                      fill="#fff" fontWeight="bold"
                      style={{ userSelect: 'none' }}>
                      {hex.isCapital ? '★' : '◆'}
                    </text>
                    {buildings.slice(0, 3).map((bId, bi) => (
                      <text key={bi}
                        x={x - 8 + bi * 8} y={y + 2}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={7} opacity={0.8}
                        style={{ userSelect: 'none' }}>
                        {BUILDING_ICONS[bId] || '🏗️'}
                      </text>
                    ))}
                  </>
                )}

                {hex.owner !== null && hex.owner !== undefined && !hex.settlement && (
                  <text x={x} y={y + HEX_SIZE * 0.48}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={5.5} fill={ownerColor || '#fff'} fontWeight="bold" opacity={0.75}
                    style={{ userSelect: 'none' }}>
                    {players[hex.owner]?.abbreviation}
                  </text>
                )}

                {hex.owner !== null && hex.owner !== undefined && ownerColor && !hex.settlement && isVisible && (
                  <circle cx={x} cy={y} r={2} fill={ownerColor} opacity={0.6} />
                )}

                {!isVisible && (
                  <text x={x} y={y - 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill="rgba(255,255,255,0.15)"
                    style={{ userSelect: 'none' }}>?</text>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}