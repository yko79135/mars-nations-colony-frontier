import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { TERRAIN_TYPES, BUILDINGS } from '@/lib/gameData';
import { X, MapPin, Mountain, Building2, AlertTriangle, Gem } from 'lucide-react';

export default function HexInfoPanel({ hexKey, onClose, actionMode, onBuild }) {
  const { t } = useLang();
  const { gameState, exploreHex, claimHex, buildOnHex } = useGame();
  
  if (!hexKey || !gameState) return null;
  
  const hex = gameState.map.hexes[hexKey];
  if (!hex) return null;
  
  const player = gameState.players[gameState.currentPlayerIndex];
  const ownerPlayer = hex.owner !== null && hex.owner !== undefined ? gameState.players[hex.owner] : null;
  const terrainData = TERRAIN_TYPES[hex.terrain];
  const isOwned = hex.owner === gameState.currentPlayerIndex;

  const difficultyLabel = {
    low: t.hexPanel.low, medium: t.hexPanel.medium, 
    high: t.hexPanel.high, extreme: t.hexPanel.extreme
  };
  const radiationLabel = {
    low: t.hexPanel.low, medium: t.hexPanel.medium, 
    high: t.hexPanel.high, extreme: t.hexPanel.extreme
  };

  // Buildable buildings
  const buildableBuildings = isOwned && actionMode === 'build' ? Object.entries(BUILDINGS).filter(([id, b]) => {
    if (b.terrainRestrictions.includes(hex.terrain)) return false;
    if (b.techRequired && !player.technologies.includes(b.techRequired)) return false;
    // Check cost
    for (const [res, amt] of Object.entries(b.cost)) {
      if ((player.resources[res] || 0) < amt) return false;
    }
    return true;
  }) : [];

  return (
    <div className="w-72 bg-gray-900/95 border-l border-gray-700 flex flex-col h-full overflow-y-auto shrink-0">
      <div className="p-3 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="text-white font-heading font-semibold text-sm">{t.general.hexInfo}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white p-0.5">
          <X size={16} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Coordinates */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin size={12} />
          <span>{t.general.coordinates}: ({hex.q}, {hex.r})</span>
        </div>

        {/* Terrain */}
        {hex.explored ? (
          <>
            <div>
              <div className="text-xs text-gray-500 mb-1">{t.hexPanel.terrainType}</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{terrainData?.icon}</span>
                <span className="text-white text-sm font-medium">{t.terrain[hex.terrain] || hex.terrain}</span>
              </div>
            </div>

            {/* Owner */}
            <div>
              <div className="text-xs text-gray-500 mb-1">{t.general.owner}</div>
              {ownerPlayer ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ backgroundColor: ownerPlayer.colorHex + '30', border: `1px solid ${ownerPlayer.colorHex}` }}>
                    {ownerPlayer.emblem}
                  </div>
                  <span className="text-white text-sm">{ownerPlayer.countryName}</span>
                </div>
              ) : (
                <span className="text-gray-400 text-sm">{t.general.unclaimed}</span>
              )}
            </div>

            {/* Resource deposits */}
            <div>
              <div className="text-xs text-gray-500 mb-1">{t.hexPanel.resourceDeposits}</div>
              <div className="text-sm text-gray-300 space-y-0.5">
                {terrainData?.waterMod > 0 && <p>💧 {t.resources.water} +{terrainData.waterMod}</p>}
                {terrainData?.mineralMod > 0 && <p>💎 {t.resources.minerals} +{terrainData.mineralMod}</p>}
                {terrainData?.energyMod > 0 && <p>⚡ {t.resources.energy} +{terrainData.energyMod}</p>}
                {!terrainData?.waterMod && !terrainData?.mineralMod && !terrainData?.energyMod && (
                  <p className="text-gray-500">{t.general.none}</p>
                )}
              </div>
            </div>

            {/* Construction / Radiation */}
            <div className="flex gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">{t.hexPanel.constructionDifficulty}</div>
                <span className={`text-xs font-medium ${
                  terrainData?.constructionDifficulty === 'extreme' ? 'text-red-400' :
                  terrainData?.constructionDifficulty === 'high' ? 'text-orange-400' :
                  terrainData?.constructionDifficulty === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {difficultyLabel[terrainData?.constructionDifficulty] || terrainData?.constructionDifficulty}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">{t.hexPanel.radiationRisk}</div>
                <span className={`text-xs font-medium ${
                  terrainData?.radiationRisk === 'extreme' ? 'text-red-400' :
                  terrainData?.radiationRisk === 'high' ? 'text-orange-400' :
                  terrainData?.radiationRisk === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {radiationLabel[terrainData?.radiationRisk] || terrainData?.radiationRisk}
                </span>
              </div>
            </div>

            {/* Buildings */}
            {hex.buildings.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">{t.hexPanel.buildings}</div>
                <div className="space-y-1">
                  {hex.buildings.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300 bg-gray-800/50 rounded px-2 py-1">
                      <Building2 size={10} />
                      {t.buildings[b] || b}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settlement */}
            {hex.settlement && (
              <div className="bg-gray-800/60 rounded p-2 border border-gray-700/50">
                <div className="text-xs text-gray-500 mb-0.5">{t.hexPanel.settlement}</div>
                <p className="text-white text-sm font-medium">{hex.settlement.name}</p>
                {hex.isCapital && <span className="text-yellow-400 text-xs">★ {t.general.capital}</span>}
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-1.5 pt-2">
              {actionMode === 'explore' && !hex.explored && (
                <button
                  onClick={() => exploreHex(hexKey)}
                  disabled={gameState.actionPoints <= 0}
                  className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded text-xs font-medium disabled:opacity-40"
                >
                  🔭 {t.actions.explore}
                </button>
              )}
              
              {actionMode === 'claim' && hex.explored && hex.owner === null && (
                <button
                  onClick={() => claimHex(hexKey)}
                  disabled={gameState.actionPoints <= 0 || player.resources.credits < 2 || player.resources.energy < 1}
                  className="w-full py-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded text-xs font-medium disabled:opacity-40"
                >
                  🏴 {t.actions.claim} (2💰 + 1⚡)
                </button>
              )}

              {actionMode === 'build' && isOwned && buildableBuildings.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">{t.actions.build}:</div>
                  {buildableBuildings.map(([id, b]) => (
                    <button
                      key={id}
                      onClick={() => buildOnHex(hexKey, id)}
                      disabled={gameState.actionPoints <= 0}
                      className="w-full py-1.5 px-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded text-xs font-medium disabled:opacity-40 text-left flex items-center justify-between"
                    >
                      <span>{t.buildings[id] || id}</span>
                      <span className="text-[10px] text-gray-400">
                        {Object.entries(b.cost).map(([r, a]) => `${a}${r === 'minerals' ? '💎' : r === 'energy' ? '⚡' : r === 'credits' ? '💰' : r === 'science' ? '🔬' : r === 'water' ? '💧' : ''}`).join(' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">{t.terrain.unexplored}</p>
            {actionMode === 'explore' && (
              <button
                onClick={() => exploreHex(hexKey)}
                disabled={gameState.actionPoints <= 0}
                className="mt-3 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded text-xs font-medium disabled:opacity-40"
              >
                🔭 {t.actions.explore}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}