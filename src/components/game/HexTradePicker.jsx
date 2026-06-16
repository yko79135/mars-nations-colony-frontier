import React from 'react';
import { useGame } from '@/lib/gameContext';
import { useLang } from '@/lib/i18n';
import { getEligibleHexesForTransfer, TERRAIN_TYPES } from '@/lib/gameData';
import { MapPin, X, Check } from 'lucide-react';

const TERRAIN_ICONS = {
  rockyPlain: '🪨', crater: '🕳️', mountain: '⛰️', canyon: '🏜️',
  iceDeposit: '🧊', mineralDeposit: '💎', lavaField: '🌋', dustBasin: '🏖️',
  highRadiation: '☢️', polarIce: '❄️',
};
const RES_MODS = { waterMod: '💧', mineralMod: '💎', energyMod: '⚡' };

export default function HexTradePicker({ fromNationIndex, toNationIndex, selectedHexes, onToggle, maxHexes }) {
  const { t, lang } = useLang();
  const { gameState } = useGame();
  if (!gameState || fromNationIndex === null || toNationIndex === null) return null;

  const eligible = getEligibleHexesForTransfer(fromNationIndex, toNationIndex, gameState.map);
  if (eligible.length === 0) {
    return (
      <p className="text-gray-600 text-xs py-2">
        {lang === 'ko' ? '교환 가능한 변경 헥스가 없습니다.' : 'No eligible border hexes to trade.'}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[9px] text-gray-500 uppercase tracking-widest">
        {lang === 'ko' ? '교환 가능 헥스' : 'Eligible Hexes'} ({eligible.length})
      </p>
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
        {eligible.map(hk => {
          const hex = gameState.map.hexes[hk];
          const terrainData = TERRAIN_TYPES[hex.terrain];
          const isSelected = (selectedHexes || []).includes(hk);
          const atMax = !isSelected && (selectedHexes || []).length >= (maxHexes || 3);

          return (
            <button key={hk} onClick={() => !atMax && onToggle(hk)}
              disabled={atMax && !isSelected}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-all disabled:opacity-30"
              style={{
                background: isSelected ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: isSelected ? '#86efac' : '#9ca3af',
              }}>
              <span className="text-sm">{TERRAIN_ICONS[hex.terrain] || '🪨'}</span>
              <span className="flex-1">
                <span className="font-medium">{t.terrain[hex.terrain] || hex.terrain}</span>
                <span className="text-[9px] ml-1 text-gray-600">({hk})</span>
              </span>
              {terrainData && (
                <span className="text-[9px] text-gray-600">
                  {terrainData.waterMod > 0 && `💧+${terrainData.waterMod} `}
                  {terrainData.mineralMod > 0 && `💎+${terrainData.mineralMod} `}
                  {terrainData.energyMod > 0 && `⚡+${terrainData.energyMod}`}
                </span>
              )}
              {hex.buildings?.length > 0 && (
                <span className="text-[8px] text-yellow-500">
                  {hex.buildings.length} {lang === 'ko' ? '건물' : 'bldgs'}
                </span>
              )}
              {isSelected && <Check size={12} className="text-green-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}