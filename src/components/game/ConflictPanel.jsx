import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { getTrust, getTrustLabel, TRUST_LABELS, DIPLOMATIC_INFLUENCE, canPressurizeHex, getPressureCost } from '@/lib/gameData';
import { ChevronLeft, AlertTriangle, Gavel, Shield, Zap, Handshake } from 'lucide-react';
import HexTradePicker from './HexTradePicker';

export default function ConflictPanel() {
  const { t, lang } = useLang();
  const { gameState, setScreen, proposeTerritorialRequest, requestMarsCouncil, createDispute, pressurizeHex, resistPressure, surrenderPressure } = useGame();
  const [tab, setTab] = useState('negotiate');
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [offeredRes, setOfferedRes] = useState({});
  const [requestedRes, setRequestedRes] = useState({});
  const [offeredHexes, setOfferedHexes] = useState([]);
  const [requestedHexes, setRequestedHexes] = useState([]);
  const [disputeReason, setDisputeReason] = useState('');
  const [flash, setFlash] = useState(null);

  if (!gameState) return null;
  const pidx = gameState.currentPlayerIndex;
  const player = gameState.players[pidx];
  const otherPlayers = gameState.players.filter((_, i) => i !== pidx);
  const diplomacy = gameState.diplomacy || {};
  const activeDisputes = (gameState.disputes || []).filter(d => d.status === 'active');
  const hasAlliance = (ti) => diplomacy.agreements?.some(a => a.type === 'alliance' && a.status === 'active' && a.nationIds.includes(pidx) && a.nationIds.includes(ti));
  const hasPact = (ti) => diplomacy.agreements?.some(a => a.type === 'nonAggression' && a.status === 'active' && a.nationIds.includes(pidx) && a.nationIds.includes(ti));

  const DIPLO_RES = ['energy', 'water', 'food', 'minerals', 'science'];
  const RES_ICONS = { energy: '⚡', water: '💧', food: '🌾', minerals: '💎', science: '🔬' };

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(null), 2500); };

  const handleTerritorialRequest = () => {
    if (!targetPlayer) return;
    if (hasAlliance(targetPlayer) || hasPact(targetPlayer)) {
      showFlash(lang === 'ko' ? '동맹 또는 불가침 협정 중에는 할 수 없습니다.' : 'Cannot pressure an ally or pact partner.');
      return;
    }
    proposeTerritorialRequest(targetPlayer, null, offeredRes, requestedRes, offeredHexes, requestedHexes);
    showFlash('proposalSent');
    setOfferedRes({}); setRequestedRes({}); setOfferedHexes([]); setRequestedHexes([]);
  };

  const handleInitiateDispute = () => {
    if (!targetPlayer || !disputeReason.trim()) return;
    createDispute(null, pidx, targetPlayer, disputeReason);
    showFlash(lang === 'ko' ? '분쟁이 등록되었습니다.' : 'Dispute registered.');
    setDisputeReason('');
  };

  const handleCouncilRequest = (disputeId) => {
    requestMarsCouncil(disputeId);
    showFlash(lang === 'ko' ? '화성 위원회에 회부했습니다.' : 'Referred to Mars Council.');
  };

  const TAB_CONFIG = [
    { key: 'negotiate', icon: Handshake, label: lang === 'ko' ? '협상' : 'Negotiate' },
    { key: 'pressure', icon: Zap, label: lang === 'ko' ? '압박' : 'Pressure' },
    { key: 'disputes', icon: AlertTriangle, label: lang === 'ko' ? '분쟁' : 'Disputes' },
    { key: 'council', icon: Gavel, label: lang === 'ko' ? '위원회' : 'Council' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#04080f' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
        style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => setScreen('playing')} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <ChevronLeft size={18} />
        </button>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>⚡</div>
        <h2 className="text-white font-heading font-bold text-base">
          {lang === 'ko' ? '분쟁 및 협상' : 'Conflict & Negotiation'}
        </h2>
        {flash && <span className="ml-auto text-xs text-yellow-300 animate-pulse">{t.diplomacy[flash] || flash}</span>}
      </div>

      {/* Diplomatic Influence bar */}
      <div className="px-5 py-2 shrink-0" style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">{lang === 'ko' ? '외교 영향력' : 'Diplomatic Influence'}</span>
          <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${((player.diplomaticInfluence || 50) / 100) * 100}%`,
              background: (player.diplomaticInfluence || 50) > 60 ? '#4ade80' : (player.diplomaticInfluence || 50) > 40 ? '#fbbf24' : '#f87171',
            }} />
          </div>
          <span className="font-mono font-bold text-white">{player.diplomaticInfluence || 50}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-2 shrink-0"
        style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TAB_CONFIG.map(tc => {
          const Icon = tc.icon;
          const isActive = tab === tc.key;
          return (
            <button key={tc.key} onClick={() => setTab(tc.key)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                color: isActive ? 'white' : '#9ca3af',
              }}>
              <Icon size={11} /> {tc.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* ============ NEGOTIATE TAB ============ */}
          {tab === 'negotiate' && (
            <>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">{lang === 'ko' ? '협상 상대 선택' : 'Select Target'}</p>
              {otherPlayers.map(p => {
                const isSelected = targetPlayer === p.index;
                return (
                  <button key={p.index} onClick={() => { setTargetPlayer(isSelected ? null : p.index); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? p.colorHex + '18' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? p.colorHex + '50' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: p.colorHex + '20', border: `2px solid ${p.colorHex}` }}>{p.emblem}</div>
                    <span className="text-sm font-medium" style={{ color: isSelected ? p.colorHex : 'white' }}>{p.countryName}</span>
                    <span className="text-[9px] text-gray-500 ml-auto">{p.colonyName}</span>
                  </button>
                );
              })}

              {targetPlayer && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <h3 className="text-white font-heading font-bold text-sm mb-3">
                    {lang === 'ko' ? '영토 협상' : 'Territorial Negotiation'}
                  </h3>

                  {/* Offered resources */}
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-500 mb-1.5">{lang === 'ko' ? `${player.countryName} 제공` : `${player.countryName} offers`}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DIPLO_RES.map(res => (
                        <div key={res} className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-500">{RES_ICONS[res]}</span>
                          <input type="number" min="0" placeholder="0"
                            value={offeredRes[res] || ''}
                            onChange={e => { const v = parseInt(e.target.value) || 0; setOfferedRes(prev => v > 0 ? { ...prev, [res]: v } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== res))); }}
                            className="w-16 px-2 py-1 text-[10px] rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Offered hexes */}
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-500 mb-1.5">{lang === 'ko' ? `${player.countryName} 제공 헥스` : `${player.countryName} offers hexes`}</p>
                    <HexTradePicker fromNationIndex={pidx} toNationIndex={targetPlayer}
                      selectedHexes={offeredHexes} onToggle={hk => setOfferedHexes(prev => prev.includes(hk) ? prev.filter(h => h !== hk) : [...prev, hk])}
                      maxHexes={3} />
                  </div>

                  {/* Requested resources */}
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-500 mb-1.5">{lang === 'ko' ? `${gameState.players[targetPlayer].countryName}에게 요청` : `Requests from ${gameState.players[targetPlayer].countryName}`}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {DIPLO_RES.map(res => (
                        <div key={res} className="flex items-center gap-1">
                          <span className="text-[9px] text-gray-500">{RES_ICONS[res]}</span>
                          <input type="number" min="0" placeholder="0"
                            value={requestedRes[res] || ''}
                            onChange={e => { const v = parseInt(e.target.value) || 0; setRequestedRes(prev => v > 0 ? { ...prev, [res]: v } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== res))); }}
                            className="w-16 px-2 py-1 text-[10px] rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-green-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requested hexes */}
                  <div className="mb-4">
                    <p className="text-[10px] text-gray-500 mb-1.5">{lang === 'ko' ? `${gameState.players[targetPlayer].countryName}에게 요청 헥스` : `Requests hexes from ${gameState.players[targetPlayer].countryName}`}</p>
                    <HexTradePicker fromNationIndex={targetPlayer} toNationIndex={pidx}
                      selectedHexes={requestedHexes} onToggle={hk => setRequestedHexes(prev => prev.includes(hk) ? prev.filter(h => h !== hk) : [...prev, hk])}
                      maxHexes={3} />
                  </div>

                  <button onClick={handleTerritorialRequest} disabled={gameState.actionPoints <= 0}
                    className="w-full py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
                    style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}>
                    {t.diplomacy.sendProposal} (1 AP)
                  </button>
                </div>
              )}
            </>
          )}

          {/* ============ PRESSURE TAB ============ */}
          {tab === 'pressure' && (
            <>
              {/* Influence overview */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <h3 className="text-white font-heading font-bold text-sm mb-2">{t.diplomacy.pressure}</h3>
                <p className="text-xs text-gray-400 mb-2">
                  {lang === 'ko'
                    ? `현재 외교 영향력: ${player.diplomaticInfluence || 50}. 비용 = 15 + 건물당 5.`
                    : `Current Influence: ${player.diplomaticInfluence || 50}. Cost = 15 + 5 per building.`}
                </p>
                <p className="text-[10px] text-gray-500">
                  {lang === 'ko'
                    ? '영향력은 즉시 소모됩니다. 상대는 3턴 안에 맞서야 합니다. 동맹/불가침 대상은 압박 불가.'
                    : 'Influence committed immediately. Owner has 3 turns to match. Cannot pressure allies/pact partners.'}
                </p>
              </div>

              {/* Select target */}
              {!targetPlayer && (
                <p className="text-xs text-gray-600 text-center py-4">
                  {lang === 'ko' ? '협상 탭에서 대상을 먼저 선택하세요.' : 'Select a target nation in the Negotiate tab first.'}
                </p>
              )}

              {targetPlayer && (
                <>
                  {/* Pressure hexes list */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <h4 className="text-white font-heading font-bold text-xs mb-2">
                      {lang === 'ko'
                        ? `${gameState.players[targetPlayer].countryName}의 압박 가능 헥스`
                        : `Pressure Targets — ${gameState.players[targetPlayer].countryName}`}
                    </h4>
                    {Object.entries(gameState.map.hexes)
                      .filter(([k, h]) => canPressurizeHex(gameState, pidx, k))
                      .slice(0, 10)
                      .map(([hk, hex]) => {
                        const cost = getPressureCost(hex, gameState);
                        const canAfford = (player.diplomaticInfluence || 0) >= cost;
                        return (
                          <button key={hk}
                            onClick={() => { if (canAfford && gameState.actionPoints > 0) { pressurizeHex(hk); showFlash(t.diplomacy.pressureSent); } }}
                            disabled={!canAfford || gameState.actionPoints <= 0}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs mb-1 transition-all disabled:opacity-30 text-left"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: canAfford ? '#fca5a5' : '#6b7280',
                            }}>
                            <span>{gameState.players[targetPlayer].emblem}</span>
                            <span className="flex-1">({hk})</span>
                            {hex.buildings?.length > 0 && (
                              <span className="text-[8px] text-yellow-500">{hex.buildings.length} {lang === 'ko' ? '건물' : 'bldgs'}</span>
                            )}
                            <span className="text-[9px] font-mono" style={{ color: canAfford ? '#fbbf24' : '#f87171' }}>
                              {cost} inf
                            </span>
                          </button>
                        );
                      })}
                    {Object.entries(gameState.map.hexes).filter(([k, h]) => canPressurizeHex(gameState, pidx, k)).length === 0 && (
                      <p className="text-gray-600 text-xs text-center py-2">{t.diplomacy.pressureNoValidHexes}</p>
                    )}
                  </div>
                </>
              )}

              {/* Active pressures — incoming (for current player to respond to) */}
              {(gameState.pendingPressures || []).filter(p => p.status === 'active' && p.defenderIdx === pidx).length > 0 && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <h4 className="text-white font-heading font-bold text-xs mb-2">
                    {lang === 'ko' ? '받은 압박' : 'Incoming Pressure'}
                  </h4>
                  {(gameState.pendingPressures || []).filter(p => p.status === 'active' && p.defenderIdx === pidx).map(p => {
                    const attacker = gameState.players[p.attackerIdx];
                    const hex = gameState.map.hexes[p.hexKey];
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg mb-1"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: attacker?.colorHex }}>{attacker?.emblem}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">{attacker?.countryName} → ({p.hexKey})</p>
                          <p className="text-[9px] text-gray-500">
                            {lang === 'ko' ? `비용: ${p.cost}  ·  남은 턴: ${p.defenderTurnsRemaining}` : `Cost: ${p.cost}  ·  ${p.defenderTurnsRemaining} turns left`}
                          </p>
                        </div>
                        <button onClick={() => resistPressure(p.id)}
                          disabled={(player.diplomaticInfluence || 0) < p.cost}
                          className="px-2 py-1 rounded text-[10px] font-bold transition-all disabled:opacity-30"
                          style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: '#86efac' }}>
                          {t.diplomacy.resist}
                        </button>
                        <button onClick={() => surrenderPressure(p.id)}
                          className="px-2 py-1 rounded text-[10px] font-bold transition-all"
                          style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                          {t.diplomacy.surrender}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Active pressures — outgoing (pressures the player initiated) */}
              {(gameState.pendingPressures || []).filter(p => p.status === 'active' && p.attackerIdx === pidx).length > 0 && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <h4 className="text-white font-heading font-bold text-xs mb-2">
                    {lang === 'ko' ? '가한 압박' : 'Outgoing Pressure'}
                  </h4>
                  {(gameState.pendingPressures || []).filter(p => p.status === 'active' && p.attackerIdx === pidx).map(p => {
                    const defender = gameState.players[p.defenderIdx];
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg mb-1"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: defender?.colorHex }}>{defender?.emblem}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate">→ {defender?.countryName} ({p.hexKey})</p>
                          <p className="text-[9px] text-gray-500">
                            {lang === 'ko' ? `비용: ${p.cost}  ·  남은 턴: ${p.defenderTurnsRemaining}` : `Cost: ${p.cost}  ·  ${p.defenderTurnsRemaining} turns left`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Coalition Support */}
              {otherPlayers.length > 1 && (gameState.pendingPressures || []).some(p => p.status === 'active' && p.defenderIdx === pidx) && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
                  <h4 className="text-white font-heading font-bold text-xs mb-2">{t.diplomacy.coalitionSupport}</h4>
                  <p className="text-[10px] text-gray-400">
                    {lang === 'ko'
                      ? '다른 국가에 영향력 지원을 요청할 수 있습니다. 동맹국이 요청에 응할 가능성이 높습니다.'
                      : 'You can request influence support from other nations. Allies are more likely to respond.'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* ============ DISPUTES TAB ============ */}
          {tab === 'disputes' && (
            <>
              {activeDisputes.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">
                  {lang === 'ko' ? '활성 분쟁이 없습니다.' : 'No active disputes.'}
                </p>
              )}
              {activeDisputes.map(d => {
                const nations = d.nations.map(i => gameState.players[i]);
                return (
                  <div key={d.id} className="rounded-xl p-3"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={12} className="text-red-400" />
                      <span className="text-xs text-red-300">{lang === 'ko' ? '분쟁' : 'Dispute'}</span>
                      <span className="text-[9px] text-gray-500 ml-auto">{t.general.round} {d.createdRound}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {nations.map((n, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span style={{ color: n?.colorHex }}>{n?.emblem}</span>
                          <span className="text-gray-400">{n?.countryName}</span>
                          {i === 0 && <span className="text-gray-600 mx-1">vs</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">{d.reason}</p>
                    <button onClick={() => handleCouncilRequest(d.id)}
                      className="mt-2 text-[10px] px-2 py-1 rounded text-yellow-400 hover:text-yellow-300 transition-colors"
                      style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      {lang === 'ko' ? '화성 위원회 요청' : 'Request Mars Council'}
                    </button>
                  </div>
                );
              })}
            </>
          )}

          {/* ============ COUNCIL TAB ============ */}
          {tab === 'council' && (
            <>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
                <h3 className="text-white font-heading font-bold text-sm mb-2">{lang === 'ko' ? '화성 위원회' : 'Mars Council'}</h3>
                <p className="text-xs text-gray-400">
                  {lang === 'ko'
                    ? '화성 위원회는 분쟁에 대해 중립국들이 투표하여 해결책을 제시합니다. 분쟁 탭에서 위원회를 요청할 수 있습니다.'
                    : 'The Mars Council lets neutral nations vote on disputes to propose solutions. Request from the Disputes tab.'}
                </p>
              </div>
              {(gameState.marsCouncilVotes || []).filter(v => v.status === 'open').length === 0 && (
                <p className="text-gray-600 text-sm text-center py-8">
                  {lang === 'ko' ? '진행 중인 위원회 투표가 없습니다.' : 'No active council votes.'}
                </p>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}