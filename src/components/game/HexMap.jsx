import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGame } from '@/lib/gameContext';
import { useLang } from '@/lib/i18n';
import { TERRAIN_TYPES, hexToPixel, getHexCorners } from '@/lib/gameData';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

const HEX_SIZE = 30;

function getTerrainFill(terrain, explored) {
  if (!explored) return '#1a1a2e';
  return TERRAIN_TYPES[terrain]?.color || '#444';
}

function getTerrainPattern(terrain) {
  if (!TERRAIN_TYPES[terrain]) return null;
  return TERRAIN_TYPES[terrain].icon;
}

export default function HexMap({ onHexSelect, selectedHex }) {
  const { gameState } = useGame();
  const { t } = useLang();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const map = gameState?.map;
  const hexes = map ? Object.entries(map.hexes) : [];

  // Calculate initial viewbox to fit map
  const resetView = useCallback(() => {
    if (!map) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    Object.values(map.hexes).forEach(hex => {
      const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
      minX = Math.min(minX, x - HEX_SIZE);
      minY = Math.min(minY, y - HEX_SIZE);
      maxX = Math.max(maxX, x + HEX_SIZE);
      maxY = Math.max(maxY, y + HEX_SIZE);
    });
    const padding = HEX_SIZE * 2;
    setViewBox({
      x: minX - padding,
      y: minY - padding,
      w: (maxX - minX) + padding * 2,
      h: (maxY - minY) + padding * 2,
    });
    setZoom(1);
  }, [map]);

  useEffect(() => { resetView(); }, [resetView]);

  // Attach wheel listener via ref to use { passive: false }
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      handleZoom(e.deltaY < 0 ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const handleZoom = (dir) => {
    setViewBox(prev => {
      const factor = dir > 0 ? 0.8 : 1.25;
      const newW = prev.w * factor;
      const newH = prev.h * factor;
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
    setZoom(z => dir > 0 ? z * 1.25 : z * 0.8);
  };


  const handleMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = (e.clientX - panStart.x) * (viewBox.w / containerRef.current.clientWidth);
    const dy = (e.clientY - panStart.y) * (viewBox.h / containerRef.current.clientHeight);
    setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => { setIsPanning(false); };

  const handleHexClick = (key, e) => {
    e.stopPropagation();
    onHexSelect(key);
  };

  // Touch handling
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    const dx = (e.touches[0].clientX - panStart.x) * (viewBox.w / containerRef.current.clientWidth);
    const dy = (e.touches[0].clientY - panStart.y) * (viewBox.h / containerRef.current.clientHeight);
    setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
    setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => { setIsPanning(false); };

  const players = gameState?.players || [];

  if (!map) return null;

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button onClick={() => handleZoom(1)} className="w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => handleZoom(-1)} className="w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600">
          <ZoomOut size={16} />
        </button>
        <button onClick={resetView} className="w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600">
          <Maximize size={16} />
        </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}

        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background */}
        <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.w + 2000} height={viewBox.h + 2000} fill="#0a0a1a" />
        
        {hexes.map(([key, hex]) => {
          const { x, y } = hexToPixel(hex.q, hex.r, HEX_SIZE);
          const corners = getHexCorners(x, y, HEX_SIZE - 1);
          const points = corners.map(c => `${c.x},${c.y}`).join(' ');
          const fill = getTerrainFill(hex.terrain, hex.explored);
          const isSelected = selectedHex === key;
          const ownerColor = hex.owner !== null && hex.owner !== undefined ? players[hex.owner]?.colorHex : null;
          const icon = hex.explored ? getTerrainPattern(hex.terrain) : '?';

          return (
            <g key={key} onClick={(e) => handleHexClick(key, e)} className="cursor-pointer">
              {/* Hex fill */}
              <polygon
                points={points}
                fill={fill}
                stroke={isSelected ? '#fff' : ownerColor || '#2a2a3a'}
                strokeWidth={isSelected ? 2 : ownerColor ? 2.5 : 0.5}
                opacity={hex.explored ? 1 : 0.4}
              />
              
              {/* Owner overlay */}
              {ownerColor && (
                <polygon
                  points={points}
                  fill={ownerColor}
                  opacity={0.2}
                  stroke="none"
                />
              )}

              {/* Terrain icon */}
              <text
                x={x} y={y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={hex.explored ? 11 : 8}
                opacity={hex.explored ? 0.8 : 0.3}
                style={{ pointerEvents: 'none' }}
              >
                {icon}
              </text>
              
              {/* Settlement marker */}
              {hex.settlement && (
                <>
                  <circle cx={x} cy={y - HEX_SIZE * 0.35} r={6} fill={ownerColor || '#fff'} opacity={0.9} />
                  <text
                    x={x} y={y - HEX_SIZE * 0.35 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={7}
                    fill="#fff"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {hex.isCapital ? '★' : '◆'}
                  </text>
                </>
              )}

              {/* Abbreviation for owned hexes */}
              {hex.owner !== null && hex.owner !== undefined && (
                <text
                  x={x} y={y + HEX_SIZE * 0.45}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={6}
                  fill={ownerColor || '#fff'}
                  fontWeight="bold"
                  opacity={0.7}
                  style={{ pointerEvents: 'none' }}
                >
                  {players[hex.owner]?.abbreviation}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}