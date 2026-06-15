import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { X } from 'lucide-react';
import { BUILDINGS, TERRAIN_TYPES } from '@/lib/gameData';

// Resource display helpers — consistent icons used everywhere
export const RES_ICON = {
  energy:   '⚡',
  water:    '💧',
  food:     '🌾',
  minerals: '💎',
  science:  '🔬',
  population: '👥',
};

const JUNIOR_BUILDING_GUIDE = [
  {
    id: 'habitat',
    emoji: '🏠',
    en: 'Habitat',
    ko: '거주지',
    purpose: 'Lets more colonists live here. Raises your colony development score.',
    purposeKo: '더 많은 주민이 살 수 있습니다. 식민지 발전 점수가 올라갑니다.',
    terrainBonus: null,
    terrainBonusKo: null,
    note: 'Cannot be built on Lava Fields or Radiation Zones.',
    noteKo: '용암 지대나 방사선 구역에는 지을 수 없습니다.',
  },
  {
    id: 'solarFarm',
    emoji: '☀️',
    en: 'Power Station',
    ko: '발전소',
    purpose: 'Produces Energy every round. Powers your other buildings.',
    purposeKo: '매 라운드 에너지를 생산합니다. 다른 건물이 작동하도록 돕습니다.',
    terrainBonus: 'Dust Zone gives +1 Energy bonus.',
    terrainBonusKo: '먼지 지대에 지으면 에너지가 +1 더 나옵니다.',
    note: null,
    noteKo: null,
  },
  {
    id: 'waterExtractor',
    emoji: '💧',
    en: 'Water Station',
    ko: '물 공급소',
    purpose: 'Produces Water every round.',
    purposeKo: '매 라운드 물을 생산합니다.',
    terrainBonus: 'Ice Deposit / Polar Ice gives a big Water bonus!',
    terrainBonusKo: '얼음 매장지나 극지방 얼음에 지으면 물을 훨씬 많이 생산합니다!',
    note: 'Uses 1 Energy each round to run.',
    noteKo: '작동하려면 매 라운드 에너지 1이 필요합니다.',
  },
  {
    id: 'greenhouse',
    emoji: '🌿',
    en: 'Farm',
    ko: '농장',
    purpose: 'Produces Food every round. Food keeps your colonists healthy.',
    purposeKo: '매 라운드 식량을 생산합니다. 식량이 있어야 주민이 건강해요.',
    terrainBonus: null,
    terrainBonusKo: null,
    note: 'Uses 1 Water each round. Cannot be built on Lava or Radiation zones.',
    noteKo: '매 라운드 물 1이 필요합니다. 용암·방사선 구역에는 지을 수 없습니다.',
  },
  {
    id: 'mine',
    emoji: '⛏️',
    en: 'Mine',
    ko: '광산',
    purpose: 'Produces Materials (Minerals) every round. Materials are needed to build things.',
    purposeKo: '매 라운드 자재(광물)를 생산합니다. 건물을 짓는 데 꼭 필요합니다.',
    terrainBonus: 'Crater, Mountain, or Mineral Deposit gives extra Materials!',
    terrainBonusKo: '충돌구, 산악 지대, 또는 광물 매장지에 지으면 자재가 더 많이 나와요!',
    note: 'Uses 1 Energy each round to run.',
    noteKo: '작동하려면 매 라운드 에너지 1이 필요합니다.',
  },
  {
    id: 'researchModule',
    emoji: '🔬',
    en: 'Research Station',
    ko: '연구 기지',
    purpose: 'Produces Research Points every round. Research unlocks new technologies.',
    purposeKo: '매 라운드 연구 점수를 생산합니다. 새로운 기술을 더 빨리 개발할 수 있어요.',
    terrainBonus: null,
    terrainBonusKo: null,
    note: 'You start with one at your Capital.',
    noteKo: '수도에 이미 하나 있습니다.',
  },
];

// Shows one building card in the guide
function BuildingGuideCard({ guide, building, playerResources, lang, compact = false }) {
  const canAfford = building ? Object.entries(building.cost).every(([r, a]) => (playerResources?.[r] || 0) >= a) : true;

  return (
    <div className={`bg-gray-800/70 border rounded-xl p-3 ${compact ? '' : 'w-full'}`}
      style={{ borderColor: canAfford === false ? '#6b7280' : '#374151' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{guide.emoji}</span>
        <div>
          <p className="text-white font-heading font-bold text-sm leading-tight">{guide.en}</p>
          <p className="text-gray-400 text-xs">{guide.ko}</p>
        </div>
      </div>

      <p className="text-gray-200 text-xs leading-snug mb-2">
        {lang === 'ko' ? guide.purposeKo : guide.purpose}
      </p>

      {building && (
        <div className="space-y-1">
          {/* Cost */}
          {Object.keys(building.cost).length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-gray-500 text-[10px] uppercase tracking-wide mr-0.5">
                {lang === 'ko' ? '비용' : 'Cost'}:
              </span>
              {Object.entries(building.cost).map(([r, a]) => {
                const has = playerResources ? (playerResources[r] || 0) >= a : true;
                return (
                  <span key={r} className={`text-[11px] font-mono font-bold px-1 rounded ${has ? 'bg-gray-700 text-white' : 'bg-red-900/40 text-red-300'}`}>
                    {RES_ICON[r]}{a}
                  </span>
                );
              })}
            </div>
          )}
          {/* Production */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-gray-500 text-[10px] uppercase tracking-wide mr-0.5">
              {lang === 'ko' ? '생산' : 'Produces'}:
            </span>
            {Object.entries(building.production).map(([r, a]) => (
              <span key={r} className="text-[11px] font-mono font-bold bg-green-900/30 text-green-300 px-1 rounded">
                +{a}{RES_ICON[r] || ''}
              </span>
            ))}
          </div>
          {/* Maintenance */}
          {Object.keys(building.maintenance).length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-gray-500 text-[10px] uppercase tracking-wide mr-0.5">
                {lang === 'ko' ? '소모' : 'Uses'}:
              </span>
              {Object.entries(building.maintenance).map(([r, a]) => (
                <span key={r} className="text-[11px] font-mono font-bold bg-red-900/30 text-red-300 px-1 rounded">
                  -{a}{RES_ICON[r] || ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {guide.terrainBonus && (
        <p className="mt-2 text-[10px] text-amber-300 bg-amber-900/20 border border-amber-700/30 rounded px-2 py-1">
          🌟 {lang === 'ko' ? guide.terrainBonusKo : guide.terrainBonus}
        </p>
      )}
      {guide.note && (
        <p className="mt-1.5 text-[10px] text-gray-400">
          ⚠️ {lang === 'ko' ? guide.noteKo : guide.note}
        </p>
      )}
    </div>
  );
}

// Full Building Guide panel (modal triggered from "?" button)
export function BuildingGuideModal({ onClose }) {
  const { lang } = useLang();
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-600 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 shrink-0">
          <div>
            <h2 className="text-white font-heading font-bold text-base">
              {lang === 'ko' ? '🏗️ 건물 안내' : '🏗️ Building Guide'}
            </h2>
            <p className="text-gray-400 text-xs">{lang === 'ko' ? '각 건물이 하는 일을 알아보세요' : 'Learn what each building does'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3">
          {JUNIOR_BUILDING_GUIDE.map(guide => (
            <BuildingGuideCard
              key={guide.id}
              guide={guide}
              building={BUILDINGS[guide.id]}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Hex tooltip shown when a hex is selected
export function HexTooltip({ hexKey, gameState, onClose }) {
  const { lang } = useLang();
  if (!hexKey || !gameState) return null;
  const hex = gameState.map.hexes[hexKey];
  if (!hex) return null;

  const terrain = TERRAIN_TYPES[hex.terrain];
  const owner = hex.owner !== null ? gameState.players[hex.owner] : null;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Which buildings work well here
  const terrainBuildingTips = {
    iceDeposit:     { en: 'Water Station works great here!', ko: '물 공급소를 지으면 훨씬 많은 물을 얻어요!' },
    polarIce:       { en: 'Water Station works great here!', ko: '물 공급소를 지으면 훨씬 많은 물을 얻어요!' },
    mineralDeposit: { en: 'Mine works great here!',         ko: '광산을 지으면 훨씬 많은 자재를 얻어요!' },
    crater:         { en: 'Mine gets extra minerals here.', ko: '광산을 지으면 광물이 더 많이 나와요.' },
    mountain:       { en: 'Mine gets lots of minerals here.', ko: '광산을 지으면 광물이 많이 나와요.' },
    dustBasin:      { en: 'Power Station gets extra energy here.', ko: '발전소를 지으면 에너지가 더 많이 나와요.' },
    canyon:         { en: 'Water Station gets extra water here.', ko: '물 공급소를 지으면 물이 더 많이 나와요.' },
    lavaField:      { en: 'Dangerous! Only a Mine can be built here.', ko: '위험합니다! 광산만 지을 수 있어요.' },
    highRadiation:  { en: 'Dangerous! Only a Mine or Power Station here.', ko: '위험합니다! 광산과 발전소만 지을 수 있어요.' },
  };
  const tip = terrainBuildingTips[hex.terrain];

  // Hex state
  let stateLabel = lang === 'ko' ? '미탐사' : 'Unexplored';
  let stateColor = 'text-gray-400';
  if (hex.explored && owner === null) { stateLabel = lang === 'ko' ? '탐사됨 — 점령 가능' : 'Explored — can be claimed'; stateColor = 'text-green-300'; }
  if (hex.explored && owner !== null && owner.index !== currentPlayer.index) { stateLabel = lang === 'ko' ? `${owner.countryName}의 영토` : `${owner.countryName}'s territory`; stateColor = 'text-orange-300'; }
  if (hex.explored && owner !== null && owner.index === currentPlayer.index) { stateLabel = lang === 'ko' ? '내 영토' : 'Your territory'; stateColor = 'text-blue-300'; }

  return (
    <div className="absolute bottom-14 left-2 z-20 w-56 bg-gray-900/98 border border-gray-600 rounded-xl shadow-2xl p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center text-xl shrink-0 border border-gray-600"
            style={{ backgroundColor: terrain?.color || '#333' }}>
            {hex.explored ? (terrain?.icon || '?') : '❓'}
          </div>
          <div>
            <p className="text-white font-heading font-semibold text-xs leading-tight">
              {hex.explored ? (lang === 'ko' ? getTerrainNameKo(hex.terrain) : getTerrainNameEn(hex.terrain)) : (lang === 'ko' ? '미탐사 타일' : 'Unexplored Tile')}
            </p>
            <p className={`text-[10px] ${stateColor}`}>{stateLabel}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white shrink-0"><X size={12} /></button>
      </div>

      {hex.explored && (
        <>
          {tip && (
            <p className="text-amber-300 text-[10px] bg-amber-900/20 border border-amber-700/30 rounded px-2 py-1 mb-2">
              🌟 {lang === 'ko' ? tip.ko : tip.en}
            </p>
          )}
          {(terrain?.waterMod > 0 || terrain?.mineralMod > 0 || terrain?.energyMod > 0) && (
            <div className="flex gap-2 mb-2">
              {terrain.waterMod > 0   && <span className="text-[11px] bg-blue-900/30 text-blue-300 rounded px-1 font-mono">💧+{terrain.waterMod}/turn</span>}
              {terrain.mineralMod > 0 && <span className="text-[11px] bg-amber-900/30 text-amber-300 rounded px-1 font-mono">💎+{terrain.mineralMod}/turn</span>}
              {terrain.energyMod > 0  && <span className="text-[11px] bg-yellow-900/30 text-yellow-300 rounded px-1 font-mono">⚡+{terrain.energyMod}/turn</span>}
            </div>
          )}
          {hex.buildings && hex.buildings.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 mb-1">{lang === 'ko' ? '건물:' : 'Buildings:'}</p>
              <div className="flex flex-wrap gap-1">
                {hex.buildings.map(bId => {
                  const guide = JUNIOR_BUILDING_GUIDE.find(g => g.id === bId);
                  return (
                    <span key={bId} className="text-[10px] bg-gray-700 rounded px-1.5 py-0.5 text-gray-200">
                      {guide ? guide.emoji : '🏗️'} {lang === 'ko' ? (guide?.ko || bId) : (guide?.en || bId)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!hex.explored && (
        <p className="text-gray-400 text-[10px]">
          {lang === 'ko' ? '탐사 행동을 선택하면 이 타일을 조사할 수 있어요.' : 'Choose Explore action to investigate this tile.'}
        </p>
      )}
    </div>
  );
}

function getTerrainNameEn(terrain) {
  const names = {
    rockyPlain: 'Rocky Plain', crater: 'Crater', mountain: 'Mountain',
    canyon: 'Canyon', iceDeposit: 'Ice Deposit', mineralDeposit: 'Mineral Deposit',
    lavaField: 'Lava Field', dustBasin: 'Dust Zone', highRadiation: 'Radiation Hazard', polarIce: 'Polar Ice',
  };
  return names[terrain] || terrain;
}

function getTerrainNameKo(terrain) {
  const names = {
    rockyPlain: '암석 평원', crater: '충돌구', mountain: '산악 지대',
    canyon: '협곡', iceDeposit: '얼음 매장지', mineralDeposit: '광물 매장지',
    lavaField: '용암 지대', dustBasin: '먼지 지대', highRadiation: '방사선 위험', polarIce: '극지방 얼음',
  };
  return names[terrain] || terrain;
}

// Rich build selection cards shown before confirming a build
export function BuildSelectionCards({ hexKey, gameState, onBuild, onClose }) {
  const { lang } = useLang();
  const [selected, setSelected] = useState(null);

  if (!hexKey || !gameState) return null;
  const hex = gameState.map.hexes[hexKey];
  const player = gameState.players[gameState.currentPlayerIndex];

  const allBuildings = ['habitat', 'solarFarm', 'waterExtractor', 'greenhouse', 'mine'];

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="bg-gray-900 border border-amber-700/50 rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
          <div>
            <h3 className="text-white font-heading font-bold text-sm">
              {lang === 'ko' ? '🏗️ 무엇을 지을까요?' : '🏗️ What will you build?'}
            </h3>
            <p className="text-gray-400 text-[10px]">
              {lang === 'ko' ? `지형: ${getTerrainNameKo(hex.terrain)} ${TERRAIN_TYPES[hex.terrain]?.icon}` : `Terrain: ${getTerrainNameEn(hex.terrain)} ${TERRAIN_TYPES[hex.terrain]?.icon}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {allBuildings.map(bId => {
            const b = BUILDINGS[bId];
            const guide = JUNIOR_BUILDING_GUIDE.find(g => g.id === bId);
            if (!guide || !b) return null;

            // Terrain restriction check
            const terrainBlocked = b.terrainRestrictions?.includes(hex.terrain);
            // Cost check
            const canAfford = Object.entries(b.cost).every(([r, a]) => (player.resources[r] || 0) >= a);
            const alreadyBuilt = hex.buildings.includes(bId);

            const disabled = terrainBlocked || !canAfford || alreadyBuilt;
            const isSelected = selected === bId;

            // Terrain bonus
            const terrainBonusMap = {
              solarFarm:     ['dustBasin'],
              waterExtractor:['iceDeposit', 'polarIce', 'canyon'],
              mine:          ['crater', 'mountain', 'mineralDeposit', 'lavaField', 'highRadiation'],
            };
            const hasTBonus = terrainBonusMap[bId]?.includes(hex.terrain);

            return (
              <button
                key={bId}
                disabled={disabled}
                onClick={() => !disabled && setSelected(isSelected ? null : bId)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  disabled ? 'opacity-40 cursor-not-allowed bg-gray-800/30 border-gray-700/30'
                  : isSelected ? 'bg-orange-900/30 border-orange-500/60'
                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{guide.emoji}</span>
                    <div>
                      <span className="text-white font-heading font-semibold text-sm">{guide.en}</span>
                      <span className="text-gray-400 text-[10px] ml-1.5">{guide.ko}</span>
                    </div>
                  </div>
                  {hasTBonus && <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-700/40 rounded px-1.5 py-0.5">🌟 bonus</span>}
                </div>

                <p className="text-gray-300 text-[11px] mb-2 leading-snug">
                  {lang === 'ko' ? guide.purposeKo : guide.purpose}
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Cost */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">{lang === 'ko' ? '비용' : 'Cost'}:</span>
                    {Object.keys(b.cost).length === 0
                      ? <span className="text-[11px] text-green-400 font-mono">Free</span>
                      : Object.entries(b.cost).map(([r, a]) => {
                          const has = (player.resources[r] || 0) >= a;
                          return (
                            <span key={r} className={`text-[11px] font-mono font-bold px-1 rounded ${has ? 'bg-gray-700 text-white' : 'bg-red-900/40 text-red-300'}`}>
                              {RES_ICON[r]}{a}
                            </span>
                          );
                        })
                    }
                  </div>
                  {/* Output */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">{lang === 'ko' ? '생산' : 'Gives'}:</span>
                    {Object.entries(b.production).map(([r, a]) => {
                      const bonus = hasTBonus && ((r === 'water' && ['waterExtractor'].includes(bId)) || (r === 'minerals' && bId === 'mine') || (r === 'energy' && bId === 'solarFarm'));
                      return (
                        <span key={r} className="text-[11px] font-mono font-bold bg-green-900/30 text-green-300 px-1 rounded">
                          +{a}{bonus ? '+' : ''}{RES_ICON[r]}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {terrainBlocked && <p className="mt-1.5 text-[10px] text-red-400">⛔ {lang === 'ko' ? '이 지형에는 지을 수 없습니다.' : 'Cannot build on this terrain.'}</p>}
                {alreadyBuilt && <p className="mt-1.5 text-[10px] text-gray-400">✓ {lang === 'ko' ? '이미 지어져 있습니다.' : 'Already built here.'}</p>}
                {!canAfford && !terrainBlocked && !alreadyBuilt && <p className="mt-1.5 text-[10px] text-red-400">💸 {lang === 'ko' ? '자원이 부족합니다.' : 'Not enough resources.'}</p>}

                {isSelected && !disabled && (
                  <button
                    onClick={e => { e.stopPropagation(); onBuild(hexKey, bId); }}
                    className="mt-2 w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-bold text-sm transition-colors"
                  >
                    {lang === 'ko' ? `✓ ${guide.ko} 짓기` : `✓ Build ${guide.en}`}
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { JUNIOR_BUILDING_GUIDE };
export default BuildingGuideModal;