import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useGame } from '@/lib/gameContext';
import { TERRAIN_TYPES, hexToPixel, getHexCorners, getHexNeighbors } from '@/lib/gameData';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const HEX_SIZE = 30;

function getTerrainFill(terrain, explored) {
  if (!explored) return '#111827';
  return TERRAIN_TYPES[terrain]?.color || '#444';
}

export default function HexMap({ onHexSelect, selectedHex, actionMode }) {
  const { gameState } = useGame();
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Camera state lives here — stable, never reset by game-state changes.
  // Only resetView() and fitToScreen() (called from the button) change it.
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Track which map we have already fitted — fit only once per new map generation.
  const fittedMapRef = useRef(null);

  const map = gameState?.map;
  const players = gameState?.players || [];

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
  }, [map, gameState, actionMode]);

  // Calculate the fit-to-screen viewBox from the current map extents
  const computeFitViewBox = useCallback(() => {
    if (!map) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    Object.values(map.hexes).forEach(hex => {
      const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
      minX = Math.min(minX, x - HEX_SIZE); minY = Math.min(minY, y - HEX_SIZE);
      maxX = Math.max(maxX, x + HEX_SIZE); maxY = Math.max(maxY, y + HEX_SIZE);
    });
    const padding = HEX_SIZE * 2;
    return { x: minX - padding, y: minY - padding, w: (maxX - minX) + padding * 2, h: (maxY - minY) + padding * 2 };
  }, [map]);

  const fitToScreen = useCallback(() => {
    const vb = computeFitViewBox();
    if (vb) setViewBox(vb);
  }, [computeFitViewBox]);

  const resetView = useCallback(() => {
    setViewBox({ x: 0, y: 0, w: 800, h: 600 });
  }, []);

  // Fit to screen ONLY when a brand-new map first appears — never again until a new game starts.
  // We identify the map by the number of hexes + radius, which is stable within a game session.
  useEffect(() => {
    if (!map) return;
    const mapId = `${map.radius}-${Object.keys(map.hexes).length}`;
    if (fittedMapRef.current === mapId) return; // already fitted this map
    fittedMapRef.current = mapId;
    const vb = computeFitViewBox();
    if (vb) setViewBox(vb);
  }, [map, computeFitViewBox]); // computeFitViewBox is stable as long as map reference identity doesn't change

  // Wheel zoom — passive: false so we can preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => { e.preventDefault(); handleZoom(e.deltaY < 0 ? 1 : -1); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const handleZoom = (dir) => {
    setViewBox(prev => {
      const factor = dir > 0 ? 0.8 : 1.25;
      const newW = prev.w * factor, newH = prev.h * factor;
      const cx = prev.x + prev.w / 2, cy = prev.y + prev.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
  };

  const handleMouseDown = (e) => { if (e.button === 0 || e.button === 1) { setIsPanning(true); setPanStart({ x: e.clientX, y: e.clientY }); } };
  const handleMouseMove = (e) => {
    if (!isPanning || !containerRef.current) return;
    const dx = (e.clientX - panStart.x) * (viewBox.w / containerRef.current.clientWidth);
    const dy = (e.clientY - panStart.y) * (viewBox.h / containerRef.current.clientHeight);
    setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setIsPanning(false);

  const handleTouchStart = (e) => { if (e.touches.length === 1) { setIsPanning(true); setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY }); } };
  const handleTouchMove = (e) => {
    if (!isPanning || e.touches.length !== 1 || !containerRef.current) return;
    const dx = (e.touches[0].clientX - panStart.x) * (viewBox.w / containerRef.current.clientWidth);
    const dy = (e.touches[0].clientY - panStart.y) * (viewBox.h / containerRef.current.clientHeight);
    setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
    setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  const handleTouchEnd = () => setIsPanning(false);

  if (!map) return null;

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={() => handleZoom(1)} className="w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600"><ZoomIn size={16} /></button>
        <button onClick={() => handleZoom(-1)} className="w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600"><ZoomOut size={16} /></button>
        <button onClick={fitToScreen} title="Fit to screen" className="w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600"><Maximize size={16} /></button>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.w + 2000} height={viewBox.h + 2000} fill="#060914" />
        {Object.entries(map.hexes).map(([key, hex]) => {
          const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
          const corners = getHexCorners(x, y, HEX_SIZE - 1);
          const points = corners.map(c => `${c.x},${c.y}`).join(' ');
          const fill = getTerrainFill(hex.terrain, hex.explored);
          const isSelected = selectedHex === key;
          const isValid = validTiles.has(key);
          const ownerColor = hex.owner !== null && hex.owner !== undefined ? players[hex.owner]?.colorHex : null;
          const icon = hex.explored ? (TERRAIN_TYPES[hex.terrain]?.icon || '?') : '?';
          let strokeColor = '#1e2235', strokeWidth = 0.5;
          if (isSelected) { strokeColor = '#ffffff'; strokeWidth = 2.5; }
          else if (isValid) { strokeColor = actionMode === 'explore' ? '#60a5fa' : actionMode === 'claim' ? '#4ade80' : '#fbbf24'; strokeWidth = 2; }
          else if (ownerColor) { strokeColor = ownerColor; strokeWidth = 2; }
          return (
            <g key={key} onClick={(e) => { e.stopPropagation(); onHexSelect(key); }} className="cursor-pointer">
              <polygon points={points} fill={fill} stroke={strokeColor} strokeWidth={strokeWidth} opacity={hex.explored ? 1 : 0.5} />
              {ownerColor && <polygon points={points} fill={ownerColor} opacity={0.18} stroke="none" />}
              {isValid && !isSelected && <polygon points={points} fill={actionMode === 'explore' ? '#3b82f6' : actionMode === 'claim' ? '#22c55e' : '#f59e0b'} opacity={0.15} stroke="none" />}
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={hex.explored ? 11 : 9} opacity={hex.explored ? 0.85 : 0.25} style={{ pointerEvents: 'none' }}>{icon}</text>
              {hex.settlement && (
                <>
                  <circle cx={x} cy={y - HEX_SIZE * 0.35} r={6} fill={ownerColor || '#fff'} opacity={0.9} />
                  <text x={x} y={y - HEX_SIZE * 0.35 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#fff" fontWeight="bold" style={{ pointerEvents: 'none' }}>{hex.isCapital ? '★' : '◆'}</text>
                </>
              )}
              {hex.owner !== null && hex.owner !== undefined && (
                <text x={x} y={y + HEX_SIZE * 0.45} textAnchor="middle" dominantBaseline="middle" fontSize={6} fill={ownerColor || '#fff'} fontWeight="bold" opacity={0.8} style={{ pointerEvents: 'none' }}>{players[hex.owner]?.abbreviation}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}