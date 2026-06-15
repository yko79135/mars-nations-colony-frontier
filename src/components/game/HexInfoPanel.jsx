import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { TERRAIN_TYPES, BUILDINGS } from '@/lib/gameData';
import { X, MapPin } from 'lucide-react';

const TERRAIN_ICONS = {
  rockyPlain: '🪨', crater: '🕳️', mountain: '⛰️', canyon: '🏜️',
  iceDeposit: '🧊', mineralDeposit: '💎', lavaField: '🌋', dustBasin: '🏖️',
  highRadiation: '☢️', polarIce: '❄️',
};
const BUILDING_ICONS = {
  habitat: '🏠', landingHabitat: '🏠', advancedHabitat: '🏛️', solarFarm: '☀️',
  nuclearReactor: '⚛️', waterExtractor: '💧', algaeFarm: '🌿', greenhouse: '🌱',
  mine: '⛏️', factory: '🏭', researchModule: '🔬', researchLab: '🔭',
  advancedResearchLab: '🧬', medicalCenter: '❤️‍🩹', recreationCenter: '🎭',
  commsCenter: '📡', tradeHub: '🤝', roverStation: '🚗', spaceport: '🚀', radiationShelter: '🛡️',
};
const COST_ICONS = { minerals: '💎', energy: '⚡', credits: '💰', science: '🔬', water: '💧' };

export default function HexInfoPanel({ hexKey, onClose, actionMode }) {
  const { t, lang } = useLang();
  const { gameState, exploreHex, claimHex, buildOnHex } = useGame();

  if (!hexKey || !gameState) return null;
  const hex = gameState.map.hexes[hexKey];
  if (!hex) return null;

  const player = gameState.players[gameState.currentPlayerIndex];
  const ownerPlayer = hex.owner !== null && hex.owner !== undefined ? gameState.players[hex.owner] : null;
  const terrainData = TERRAIN_TYPES[hex.terrain];
  const isOwned = hex.owner === gameState.currentPlayerIndex;

  const buildableBuildings = isOwned && actionMode === 'build'
    ? Object.entries(BUILDINGS).filter(([id, b]) => {
        if (b.terrainRestrictions?.includes(hex.terrain)) return false;
        if (b.techRequired && !player.technologies.includes(b.techRequired)) return false;
        for (const [res, amt] of Object.entries(b.cost)) {
          if ((player.resources[res] || 0) < amt) return false;
        }
        return true;
      })
    : [];

  const hasYield = terrainData?.waterMod > 0 || terrainData?.mineralMod > 0 || terrainData?.energyMod > 0;

  return (
    <div className="w-72 flex flex-col h-full overflow-y-auto shrink-0"
      style={{ background: 'rgba(6,9,22,0.98)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>

      <div className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-gray-500" />
          <span className="text-gray-400 text-xs font-mono">({hex.q}, {hex.r})</span>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X size={15} /></button>
      </div>

      {hex.explored ? (
        <div className="flex-1 p-4 space-y-4">
          {/* Terrain */}
          <div className="rounded-xl px-3 py-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-3xl">{TERRAIN_ICONS[hex.terrain] || '🪨'}</span>
            <div>
              <p className="text-white font-heading font-bold text-sm">{t.terrain[hex.terrain] || hex.terrain}</p>
              <p className="text-gray-500 text-[10px]">{lang === 'ko' ? '지형 유형' : 'Terrain Type'}</p>
            </div>
          </div>

          {/* Owner */}
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">{t.general.owner}</p>
            {ownerPlayer ? (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{ background: ownerPlayer.colorHex + '18', border: `1px solid ${ownerPlayer.colorHex}35` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ background: ownerPlayer.colorHex + '25', border: `1px solid ${ownerPlayer.colorHex}` }}>{ownerPlayer.emblem}</div>
                <div>
                  <p className="text-xs font-bold" style={{ color: ownerPlayer.colorHex }}>{ownerPlayer.countryName}</p>
                  <p className="text-[10px] text-gray-500">{ownerPlayer.colonyName}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-xs px-1">{t.general.unclaimed}</p>
            )}
          </div>

          {/* Yields */}
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">{t.hexPanel.resourceDeposits}</p>
            {hasYield ? (
              <div className="flex flex-wrap gap-1.5">
                {terrainData?.waterMod > 0 && (
                  <span className="text-xs px-2 py-1 rounded-lg font-mono font-bold"
                    style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa' }}>
                    💧 +{terrainData.waterMod}
                  </span>
                )}
                {terrainData?.mineralMod > 0 && (
                  <span className="text-xs px-2 py-1 rounded-lg font-mono font-bold"
                    style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                    💎 +{terrainData.mineralMod}
                  </span>
                )}
                {terrainData?.energyMod > 0 && (
                  <span className="text-xs px-2 py-1 rounded-lg font-mono font-bold"
                    style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', color: '#eab308' }}>
                    ⚡ +{terrainData.energyMod}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-xs px-1">{t.general.none}</p>
            )}
          </div>

          {/* Settlement */}
          {hex.settlement && (
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <p className="text-[9px] text-yellow-600 uppercase tracking-widest mb-1">{t.hexPanel.settlement}</p>
              <p className="text-white text-sm font-heading font-bold">{hex.settlement.name}</p>
              {hex.isCapital && <span className="text-[10px] text-yellow-400">★ {t.general.capital}</span>}
            </div>
          )}

          {/* Buildings */}
          {hex.buildings?.length > 0 && (
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">{t.hexPanel.buildings}</p>
              <div className="space-y-1">
                {hex.buildings.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span>{BUILDING_ICONS[b] || '🏗️'}</span>
                    <span className="text-gray-300">{t.buildings[b] || b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-1">
            {actionMode === 'explore' && !hex.explored && (
              <button onClick={() => exploreHex(hexKey)} disabled={gameState.actionPoints <= 0}
                className="w-full py-2.5 rounded-xl text-xs font-heading font-bold transition-all disabled:opacity-40"
                style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.4)', color: '#93c5fd' }}>
                🔭 {t.actions.explore}
              </button>
            )}
            {actionMode === 'claim' && hex.explored && hex.owner === null && (
              <button onClick={() => claimHex(hexKey)} disabled={gameState.actionPoints <= 0}
                className="w-full py-2.5 rounded-xl text-xs font-heading font-bold transition-all disabled:opacity-40"
                style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac' }}>
                🏴 {t.actions.claim}
              </button>
            )}
            {actionMode === 'build' && isOwned && buildableBuildings.length > 0 && (
              <div className="space-y-1">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest px-1">{t.actions.build}</p>
                {buildableBuildings.map(([id, b]) => (
                  <button key={id} onClick={() => buildOnHex(hexKey, id)} disabled={gameState.actionPoints <= 0}
                    className="w-full py-2 px-3 rounded-lg text-xs font-medium transition-all disabled:opacity-40 flex items-center justify-between"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fde68a' }}>
                    <span className="flex items-center gap-1.5">
                      <span>{BUILDING_ICONS[id] || '🏗️'}</span>{t.buildings[id] || id}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {Object.entries(b.cost).map(([r, a]) => `${a}${COST_ICONS[r] || ''}`).join(' ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <span className="text-5xl opacity-30">?</span>
          <p className="text-gray-500 text-sm">{t.terrain.unexplored}</p>
          {actionMode === 'explore' && (
            <button onClick={() => exploreHex(hexKey)} disabled={gameState.actionPoints <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition-all disabled:opacity-40"
              style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.4)', color: '#93c5fd' }}>
              🔭 {t.actions.explore}
            </button>
          )}
        </div>
      )}
    </div>
  );
}