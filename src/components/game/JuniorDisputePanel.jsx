import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { canPressurizeHex, getPressureCost, getHexNeighbors } from '@/lib/gameData';
import { Handshake, MapPin, Star, Gavel, Zap } from 'lucide-react';

const RES_ICONS = { energy: '⚡', water: '💧', food: '🌾', minerals: '💎', science: '🔬' };
const TERRAIN_ICONS = {
  rockyPlain: '🪨', crater: '🕳️', mountain: '⛰️', canyon: '🏜️',
  iceDeposit: '🧊', mineralDeposit: '💎', lavaField: '🌋', dustBasin: '🏖️',
  highRadiation: '☢️', polarIce: '❄️',
};

export default function JuniorDisputePanel({ onClose }) {
  const { t, lang } = useLang();
  const { gameState, giveResource, adjustJuniorInfluenceStars, juniorLandExchange, pressurizeHex, resistPressure, surrenderPressure } = useGame();
  const [tab, setTab] = useState('request');
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [resource, setResource] = useState('minerals');
  const [amount, setAmount] = useState('');
  const [selectedHex, setSelectedHex] = useState(null);
  const [flash, setFlash] = useState(null);

  if (!gameState) return null;
  const pidx = gameState.currentPlayerIndex;
  const player = gameState.players[pidx];
  const otherPlayers = gameState.players.filter((_, i) => i !== pidx);
  const stars = player.influenceStars || 0;

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(null), 2000); };

  const handleFriendlyRequest = () => {
    if (!targetPlayer || !amount) return;
    giveResource(targetPlayer, resource, -parseInt(amount)); // Negative = request
    showFlash(lang === 'ko' ? '요청을 보냈습니다!' : 'Request sent!');
  };

  const handleStrongRequest = () => {
    if (!targetPlayer || !amount || stars < 1) return;
    adjustJuniorInfluenceStars(pidx, -1);
    giveResource(targetPlayer, resource, -parseInt(amount));
    showFlash(lang === 'ko' ? '강력한 요청을 보냈습니다!' : 'Strong request sent!');
  };

  const handleLandExchange = () => {
    if (!targetPlayer || !selectedHex || !amount) return;
    juniorLandExchange(selectedHex, targetPlayer, resource, parseInt(amount));
    showFlash(lang === 'ko' ? '땅을 교환했습니다!' : 'Land exchanged!');
    setSelectedHex(null);
    setAmount('');
  };

  const handleMarsCouncil = () => {
    if (stars < 2) return;
    adjustJuniorInfluenceStars(pidx, -2);
    showFlash(lang === 'ko' ? '화성 위원회에 요청했습니다!' : 'Mars Council requested!');
  };

  const handlePressurizeHex = (hexKey) => {
    if (!targetPlayer || gameState.actionPoints <= 0) return;
    const hex = gameState.map.hexes[hexKey];
    const cost = getPressureCost(hex, gameState);
    if ((player.influenceStars || 0) < cost) {
      showFlash(lang === 'ko' ? `영향력이 부족합니다! (필요: ${cost})` : `Not enough Influence! (Need: ${cost})`);
      return;
    }
    pressurizeHex(hexKey);
    showFlash(lang === 'ko' ? '압박을 가했습니다!' : 'Pressure applied!');
  };

  const JUNIOR_RESOURCES = ['energy', 'water', 'food', 'minerals'];

  const ACTIONS = [
    { key: 'request',  icon: Handshake,  color: '#60a5fa', en: 'Friendly Request',  ko: '우호 요청',    costStars: 0 },
    { key: 'land',     icon: MapPin,      color: '#4ade80', en: 'Trade Land',        ko: '땅 교환',      costStars: 0 },
    { key: 'pressure', icon: Zap,         color: '#f87171', en: 'Pressure Hex',      ko: '헥스 압박',    costStars: 0 },
    { key: 'strong',   icon: Star,        color: '#fbbf24', en: 'Use Influence',     ko: '영향력 사용',  costStars: 1 },
    { key: 'council',  icon: Gavel,       color: '#a78bfa', en: 'Mars Council',      ko: '화성 위원회',  costStars: 2 },
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* Stars indicator */}
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-[9px] text-gray-500">{lang === 'ko' ? '영향력' : 'Influence'}</span>
        <span className="text-yellow-400 text-xs">⭐</span>
        <span className="text-yellow-400 font-mono font-bold text-xs">{stars}</span>
      </div>

      {/* Target selection */}
      <div className="px-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[8px] text-gray-600 uppercase tracking-widest mb-1.5">{t.cooperation.selectNation}</p>
        <div className="flex gap-1.5 flex-wrap">
          {otherPlayers.map(p => {
            const isSelected = targetPlayer === p.index;
            return (
              <button key={p.index} onClick={() => setTargetPlayer(isSelected ? null : p.index)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-all"
                style={{
                  background: isSelected ? p.colorHex + '20' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? p.colorHex + '50' : 'rgba(255,255,255,0.07)'}`,
                  color: isSelected ? p.colorHex : '#d1d5db',
                }}>
                <span>{p.emblem}</span>
                <span className="font-medium">{p.countryName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {flash && (
        <div className="mx-2 mt-2 px-2 py-1.5 rounded-lg text-[10px] text-center animate-pulse"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fde68a' }}>
          {flash}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {/* Action tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {ACTIONS.map(a => {
            const Icon = a.icon;
            const isActive = tab === a.key;
            const disabled = a.costStars > stars;
            return (
              <button key={a.key} onClick={() => setTab(a.key)} disabled={disabled}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30"
                style={{
                  background: isActive ? a.color + '20' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? a.color + '40' : 'rgba(255,255,255,0.06)'}`,
                  color: isActive ? a.color : '#9ca3af',
                }}>
                <Icon size={12} />
                <span>{a[lang]}</span>
                {a.costStars > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px]">
                    <Star size={8} style={{ color: '#fbbf24' }} />{a.costStars}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Friendly Request */}
        {tab === 'request' && targetPlayer && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <h3 className="text-white font-heading font-bold text-sm mb-3">
              {lang === 'ko'
                ? `${gameState.players[targetPlayer].countryName}에게 요청`
                : `Ask ${gameState.players[targetPlayer].countryName}`}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <select value={resource} onChange={e => setResource(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg bg-gray-800 border border-gray-700 text-white">
                {JUNIOR_RESOURCES.map(r => (
                  <option key={r} value={r}>{RES_ICONS[r]} {t.resources[r]}</option>
                ))}
              </select>
              <input type="number" min="1" value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-20 px-2 py-2 text-xs rounded-lg bg-gray-800 border border-gray-700 text-white"
                placeholder="0"
              />
            </div>
            <button onClick={handleFriendlyRequest} disabled={!amount || gameState.actionPoints <= 0}
              className="w-full py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
              style={{ background: 'rgba(96,165,250,0.25)', border: '1px solid rgba(96,165,250,0.4)', color: '#93c5fd' }}>
              {lang === 'ko' ? '요청 보내기' : 'Send Request'} (0 AP)
            </button>
          </div>
        )}

        {/* Trade Land */}
        {tab === 'land' && targetPlayer && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <h3 className="text-white font-heading font-bold text-sm mb-3">{lang === 'ko' ? '땅 교환' : 'Trade Land'}</h3>
            <p className="text-xs text-gray-400 mb-2">
              {lang === 'ko' ? '교환할 변경 헥스를 선택하세요.' : 'Select a border hex to trade.'}
            </p>
            {/* List eligible hexes */}
            {Object.entries(gameState.map.hexes)
              .filter(([k, h]) => h.owner === pidx && !h.isCapital)
              .filter(([k]) => {
                    const [q, r] = k.split(',').map(Number);
                    return getHexNeighbors(q, r).some(n => {
                      const nk = `${n.q},${n.r}`;
                  const nh = gameState.map.hexes[nk];
                  return nh && (nh.owner === null || nh.owner === undefined || nh.owner !== pidx);
                });
              })
              .slice(0, 10)
              .map(([hk, hex]) => {
                const isSelected = selectedHex === hk;
                return (
                  <button key={hk} onClick={() => setSelectedHex(isSelected ? null : hk)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs mb-1 transition-all"
                    style={{
                      background: isSelected ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: isSelected ? '#86efac' : '#9ca3af',
                    }}>
                    <span>{TERRAIN_ICONS[hex.terrain] || '🪨'}</span>
                    <span>{t.terrain[hex.terrain]}</span>
                    <span className="text-[9px] text-gray-600 ml-auto">({hk})</span>
                  </button>
                );
              })}
            {selectedHex && (
              <>
                <div className="flex items-center gap-2 mt-3">
                  <select value={resource} onChange={e => setResource(e.target.value)}
                    className="px-3 py-2 text-xs rounded-lg bg-gray-800 border border-gray-700 text-white">
                    {JUNIOR_RESOURCES.map(r => (
                      <option key={r} value={r}>{RES_ICONS[r]} {t.resources[r]}</option>
                    ))}
                  </select>
                  <input type="number" min="1" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-20 px-2 py-2 text-xs rounded-lg bg-gray-800 border border-gray-700 text-white"
                    placeholder="0"
                  />
                </div>
                <button onClick={handleLandExchange} disabled={!amount || gameState.actionPoints <= 0}
                  className="w-full mt-2 py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
                  style={{ background: 'rgba(74,222,128,0.25)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac' }}>
                  {lang === 'ko'
                    ? `이 땅을 ${t.resources[resource]} ${amount}개와 교환`
                    : `Trade this land for ${amount} ${t.resources[resource]}`}
                </button>
              </>
            )}
          </div>
        )}

        {/* Use Influence */}
        {tab === 'strong' && targetPlayer && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <h3 className="text-white font-heading font-bold text-sm mb-3">{lang === 'ko' ? '영향력 사용' : 'Use Influence'}</h3>
            <p className="text-xs text-gray-400 mb-2">
              {lang === 'ko'
                ? '영향력 별 1개를 사용하여 더 강력한 요청을 합니다. 거절 시 화성 위원회 결정으로 이어질 수 있습니다.'
                : 'Use 1 Influence Star for a stronger request. Rejection may trigger a Mars Council decision.'}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <select value={resource} onChange={e => setResource(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg bg-gray-800 border border-gray-700 text-white">
                {JUNIOR_RESOURCES.map(r => (
                  <option key={r} value={r}>{RES_ICONS[r]} {t.resources[r]}</option>
                ))}
              </select>
              <input type="number" min="1" value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-20 px-2 py-2 text-xs rounded-lg bg-gray-800 border border-gray-700 text-white"
                placeholder="0"
              />
            </div>
            <button onClick={handleStrongRequest} disabled={!amount || stars < 1}
              className="w-full py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
              style={{ background: 'rgba(251,191,36,0.25)', border: '1px solid rgba(251,191,36,0.4)', color: '#fde68a' }}>
              {lang === 'ko' ? '강력 요청 보내기' : 'Send Strong Request'} (⭐1)
            </button>
          </div>
        )}

        {/* Mars Council */}
        {tab === 'council' && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <h3 className="text-white font-heading font-bold text-sm mb-3">{lang === 'ko' ? '화성 위원회' : 'Mars Council'}</h3>
            <p className="text-xs text-gray-400 mb-3">
              {lang === 'ko'
                ? '영향력 별 2개를 사용하여 모든 관련 없는 국가가 분쟁에 투표합니다.'
                : 'Use 2 Influence Stars to have all uninvolved nations vote on the dispute.'}
            </p>
            <button onClick={handleMarsCouncil} disabled={stars < 2 || !targetPlayer}
              className="w-full py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
              style={{ background: 'rgba(167,139,250,0.25)', border: '1px solid rgba(167,139,250,0.4)', color: '#c4b5fd' }}>
              {lang === 'ko' ? '위원회 요청' : 'Request Council Vote'} (⭐⭐2)
            </button>
          </div>
        )}

        {/* Pressure Hex */}
        {tab === 'pressure' && targetPlayer && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 className="text-white font-heading font-bold text-sm mb-2">
              {lang === 'ko'
                ? `${gameState.players[targetPlayer].countryName}의 헥스 압박`
                : `Pressure ${gameState.players[targetPlayer].countryName}'s Hex`}
            </h3>
            <p className="text-[10px] text-gray-500 mb-3">
              {lang === 'ko'
                ? '비용 = 기본 2 + 건물당 1. 영향력은 즉시 소모됩니다. 상대는 3턴 안에 맞서야 합니다.'
                : 'Cost = 2 base + 1 per building. Influence committed immediately. Owner has 3 turns to match.'}
            </p>

            {/* List eligible pressure targets */}
            {Object.entries(gameState.map.hexes)
              .filter(([k, h]) => canPressurizeHex(gameState, pidx, k))
              .slice(0, 10)
              .map(([hk, hex]) => {
                const cost = getPressureCost(hex, gameState);
                const canAfford = (player.influenceStars || 0) >= cost;
                const isSelected = selectedHex === hk;
                return (
                  <button key={hk} onClick={() => setSelectedHex(isSelected ? null : hk)}
                    disabled={!canAfford}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs mb-1 transition-all disabled:opacity-30"
                    style={{
                      background: isSelected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: isSelected ? '#fca5a5' : '#9ca3af',
                    }}>
                    <span>{TERRAIN_ICONS[hex.terrain] || '🪨'}</span>
                    <span className="flex-1 text-left">{t.terrain[hex.terrain]}</span>
                    {hex.buildings?.length > 0 && (
                      <span className="text-[8px] text-yellow-500">{hex.buildings.length} {lang === 'ko' ? '건물' : 'bldgs'}</span>
                    )}
                    <span className="text-[9px] font-mono" style={{ color: canAfford ? '#fbbf24' : '#f87171' }}>
                      ⭐{cost}
                    </span>
                  </button>
                );
              })}

            {Object.entries(gameState.map.hexes).filter(([k, h]) => canPressurizeHex(gameState, pidx, k)).length === 0 && (
              <p className="text-gray-600 text-xs text-center py-3">
                {lang === 'ko' ? '압박 가능한 인접 적국 변경 헥스가 없습니다.' : 'No adjacent enemy border hexes available.'}
              </p>
            )}

            {selectedHex && (() => {
              const hex = gameState.map.hexes[selectedHex];
              const cost = getPressureCost(hex, gameState);
              return (
                <button onClick={() => handlePressurizeHex(selectedHex)}
                  disabled={(player.influenceStars || 0) < cost || gameState.actionPoints <= 0}
                  className="w-full mt-3 py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
                  style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}>
                  {lang === 'ko'
                    ? `압박하기 (⭐${cost}, 1 AP)`
                    : `Apply Pressure (⭐${cost}, 1 AP)`}
                </button>
              );
            })()}
          </div>
        )}


        {!targetPlayer && tab !== 'council' && (
          <p className="text-gray-600 text-sm text-center py-8">
            {lang === 'ko' ? '먼저 대화할 국가를 선택하세요.' : 'Select a nation to interact with first.'}
          </p>
        )}

        {/* Active incoming pressures (for defender response) */}
        {(gameState.pendingPressures || []).filter(p => p.status === 'active' && p.defenderIdx === pidx).length > 0 && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <h4 className="text-white font-heading font-bold text-xs mb-2">
              {lang === 'ko' ? '받은 압박' : 'Incoming Pressure'}
            </h4>
            {(gameState.pendingPressures || []).filter(p => p.status === 'active' && p.defenderIdx === pidx).map(p => {
              const attacker = gameState.players[p.attackerIdx];
              const hex = gameState.map.hexes[p.hexKey];
              return (
                <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg mb-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: attacker?.colorHex }}>{attacker?.emblem}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white truncate">{attacker?.countryName} → {t.terrain[hex?.terrain]}</p>
                    <p className="text-[9px] text-gray-500">
                      {lang === 'ko' ? `비용 ⭐${p.cost} · 남은 턴 ${p.defenderTurnsRemaining}` : `⭐${p.cost} · ${p.defenderTurnsRemaining} turns left`}
                    </p>
                  </div>
                  <button onClick={() => { resistPressure(p.id); showFlash(lang === 'ko' ? '압박에 저항했습니다!' : 'Pressure resisted!'); }}
                    disabled={(player.influenceStars || 0) < p.cost}
                    className="px-2 py-1 rounded text-[9px] font-bold transition-all disabled:opacity-30"
                    style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: '#86efac' }}>
                    {lang === 'ko' ? '저항' : 'Resist'}
                  </button>
                  <button onClick={() => { surrenderPressure(p.id); showFlash(lang === 'ko' ? '헥스를 포기했습니다!' : 'Hex surrendered!'); }}
                    className="px-2 py-1 rounded text-[9px] font-bold transition-all"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    {lang === 'ko' ? '포기' : 'Give Up'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}