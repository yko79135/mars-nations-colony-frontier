import React, { useState, useMemo } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { canPressurizeHex, getPressureCost } from '@/lib/gameData';
import { ArrowLeftRight, Heart, Zap, Shield, ScrollText, ArrowLeft, Star, Loader2 } from 'lucide-react';

const RES_ICONS = { energy: '⚡', water: '💧', food: '🌾', minerals: '💎' };
const RES_META = [
  { key: 'energy',   icon: '⚡', en: 'Energy',   ko: '에너지' },
  { key: 'water',    icon: '💧', en: 'Water',    ko: '물' },
  { key: 'food',     icon: '🌾', en: 'Food',     ko: '식량' },
  { key: 'minerals', icon: '💎', en: 'Materials', ko: '자재' },
];

const TERRAIN_ICONS = {
  rockyPlain: '🪨', crater: '🕳️', mountain: '⛰️', canyon: '🏜️',
  iceDeposit: '🧊', mineralDeposit: '💎', lavaField: '🌋', dustBasin: '🏖️',
  highRadiation: '☢️', polarIce: '❄️',
};

// ────────────── DIPLOMACY ACTIONS ──────────────
const DIPLO_ACTIONS = [
  { key: 'trade',    icon: ArrowLeftRight, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)',  text: '#93c5fd', en: 'Trade',              ko: '무역',           apCost: 0, descEn: 'Propose a resource exchange. The other nation can accept or reject on their turn.', descKo: '자원 교환을 제안합니다. 상대 국가가 턴에 수락 또는 거절할 수 있습니다.' },
  { key: 'giveAid',  icon: Heart,          color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.3)',  text: '#86efac', en: 'Give Aid',           ko: '지원하기',       apCost: 0, descEn: 'Send resources immediately. Gain Cooperation points.', descKo: '자원을 즉시 보냅니다. 협력 점수를 얻습니다.' },
  { key: 'pressure', icon: Zap,            color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)',  text: '#fca5a5', en: 'Pressure a Hex',     ko: '타일 압박',      apCost: 1, descEn: 'Spend Influence to pressure an adjacent enemy border hex.', descKo: '영향력을 소모하여 인접한 적국 변경 타일을 압박합니다.' },
  { key: 'respond',  icon: Shield,         color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: '#fde68a', en: 'Respond to Pressure',ko: '압박 대응',      apCost: 0, descEn: 'Resist or surrender to incoming territorial pressure.', descKo: '들어오는 영토 압박에 저항하거나 포기합니다.' },
  { key: 'status',   icon: ScrollText,     color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.3)',  text: '#c4b5fd', en: 'Diplomacy Status',   ko: '외교 현황',      apCost: 0, descEn: 'View trade proposals, pressures, and cooperation history.', descKo: '무역 제안, 압박 상태, 협력 기록을 확인합니다.' },
];

export default function JuniorDiplomacyPanel({ onClose, onPressureHexSelect, highlightPressureHexes, selectedPressureHex }) {
  const { t, lang } = useLang();
  const { gameState, giveResource, pressurizeHex, resistPressure, surrenderPressure, proposeJuniorTrade, acceptProposal, rejectProposal } = useGame();

  const [flow, setFlow] = useState({ step: 'chooseAction', action: null, targetNationId: null, offerRes: {}, requestRes: {}, aidRes: 'minerals', aidAmt: '', pressureCost: null, resultMsg: null, reviewing: false });

  if (!gameState) return null;
  const pidx = gameState.currentPlayerIndex;
  const player = gameState.players[pidx];
  const otherPlayers = gameState.players.filter((_, i) => i !== pidx);
  const stars = player.influenceStars || 0;
  const ap = gameState.actionPoints;

  const incomingPressures = (gameState.pendingPressures || []).filter(p => p.status === 'active' && p.defenderIdx === pidx);
  const outgoingPressures = (gameState.pendingPressures || []).filter(p => p.status === 'active' && p.attackerIdx === pidx);
  const pendingTradeProposals = (gameState.diplomacy?.proposals || []).filter(p => p.status === 'pending' && p.type === 'trade');
  const incomingTrades = pendingTradeProposals.filter(p => p.recipientIndex === pidx);
  const outgoingTrades = pendingTradeProposals.filter(p => p.proposerIndex === pidx);

  const setStep = (step, extra = {}) => setFlow(prev => ({ ...prev, step, ...extra, reviewing: false }));
  const resetAll = () => setFlow({ step: 'chooseAction', action: null, targetNationId: null, offerRes: {}, requestRes: {}, aidRes: 'minerals', aidAmt: '', pressureCost: null, resultMsg: null, reviewing: false });

  const backToActions = () => setStep('chooseAction', { targetNationId: null, offerRes: {}, requestRes: {}, aidRes: 'minerals', aidAmt: '', pressureCost: null });
  const backToNation = () => setStep('chooseNation', { offerRes: {}, requestRes: {}, aidRes: 'minerals', aidAmt: '', pressureCost: null });

  // ── Give Aid ──
  const handleGiveAid = () => {
    const amt = parseInt(flow.aidAmt) || 0;
    if (!flow.targetNationId === null || amt <= 0) return;
    if ((player.resources[flow.aidRes] || 0) < amt) {
      setStep('result', { resultMsg: lang === 'ko' ? '자원이 부족합니다.' : 'Not enough resources.' });
      return;
    }
    giveResource(flow.targetNationId, flow.aidRes, amt);
    setStep('result', { resultMsg: lang === 'ko'
      ? `${RES_META.find(r => r.key === flow.aidRes)?.ko} ${amt}을(를) ${gameState.players[flow.targetNationId].countryName}에게 보냈습니다! 협력 점수 +5.`
      : `Sent ${amt} ${RES_META.find(r => r.key === flow.aidRes)?.en} to ${gameState.players[flow.targetNationId].countryName}! Cooperation +5.` });
  };

  // ── Trade ──
  const toggleOffer = (res) => {
    setFlow(prev => {
      const next = { ...prev.offerRes };
      if (next[res]) { delete next[res]; return { ...prev, offerRes: next }; }
      next[res] = (prev.offerRes[res] || 0);
      return { ...prev, offerRes: next };
    });
  };
  const toggleRequest = (res) => {
    setFlow(prev => {
      const next = { ...prev.requestRes };
      if (next[res]) { delete next[res]; return { ...prev, requestRes: next }; }
      next[res] = (prev.requestRes[res] || 0);
      return { ...prev, requestRes: next };
    });
  };
  const setResourceAmt = (res, amt, which) => setFlow(prev => ({ ...prev, [which]: { ...prev[which], [res]: Math.max(0, parseInt(amt) || 0) } }));

  const handleSendTrade = () => {
    const hasOffer = Object.values(flow.offerRes).some(v => v > 0);
    const hasRequest = Object.values(flow.requestRes).some(v => v > 0);
    if (!hasOffer && !hasRequest) return;
    // Validate offer resources
    for (const [res, amt] of Object.entries(flow.offerRes)) {
      if ((player.resources[res] || 0) < amt) {
        setStep('result', { resultMsg: lang === 'ko' ? `보낼 ${RES_META.find(r => r.key === res)?.ko}이(가) 부족합니다.` : `Not enough ${RES_META.find(r => r.key === res)?.en} to offer.` });
        return;
      }
    }
    proposeJuniorTrade(flow.targetNationId, flow.offerRes, flow.requestRes);
    setStep('result', { resultMsg: lang === 'ko'
      ? `${gameState.players[flow.targetNationId].countryName}에게 무역 제안을 보냈습니다!`
      : `Trade proposal sent to ${gameState.players[flow.targetNationId].countryName}!` });
  };

  // ── Pressure ──
  const startPressureFlow = () => {
    // Check AP
    if (ap <= 0) {
      setStep('result', { resultMsg: lang === 'ko' ? '행동력이 부족합니다.' : 'Not enough Action Points.' });
      return;
    }
    onPressureHexSelect(true, flow.targetNationId);
  };

  const confirmPressure = () => {
    if (!selectedPressureHex) return;
    const hex = gameState.map.hexes[selectedPressureHex];
    if (!hex) return;
    const cost = getPressureCost(hex, gameState);
    if (stars < cost) {
      setStep('result', { resultMsg: lang === 'ko' ? `영향력이 부족합니다! (필요: ⭐${cost})` : `Not enough Influence! (Need: ⭐${cost})` });
      return;
    }
    pressurizeHex(selectedPressureHex);
    onPressureHexSelect(false, null);
    setStep('result', {
      resultMsg: lang === 'ko'
        ? `타일 압박이 시작되었습니다! (⭐${cost}, 1 AP 소모)`
        : `Pressure applied! (⭐${cost}, 1 AP used)`,
      pressureCost: null,
    });
  };

  const cancelPressure = () => {
    onPressureHexSelect(false, null);
  };

  // ── Respond to Pressure ──
  const handleResist = (pressureId, cost) => {
    if (stars < cost) {
      setStep('result', { resultMsg: lang === 'ko' ? `영향력이 부족합니다! (필요: ⭐${cost})` : `Not enough Influence! (Need: ⭐${cost})` });
      return;
    }
    resistPressure(pressureId);
    setStep('result', { resultMsg: lang === 'ko' ? '압박을 막았습니다! 영향력이 소모되었습니다.' : 'Pressure resisted! Influence was spent.' });
  };

  const handleSurrender = (pressureId) => {
    surrenderPressure(pressureId);
    setStep('result', { resultMsg: lang === 'ko' ? '타일을 포기했습니다. 건물은 유지되지만 비활성화됩니다.' : 'Hex surrendered. Buildings remain but are inactive.' });
  };

  // ── Trade response ──
  const handleAcceptTrade = (proposalId) => {
    acceptProposal(proposalId);
    setStep('result', { resultMsg: lang === 'ko' ? '무역 제안을 수락했습니다!' : 'Trade accepted! Resources exchanged.' });
  };
  const handleRejectTrade = (proposalId) => {
    rejectProposal(proposalId);
    setStep('result', { resultMsg: lang === 'ko' ? '무역 제안을 거절했습니다.' : 'Trade proposal rejected.' });
  };

  // ── RENDER ──

  // STEP: Result
  if (flow.step === 'result') {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
            ✓
          </div>
          <p className="text-white font-heading font-bold text-sm mb-2">
            {lang === 'ko' ? '완료!' : 'Done!'}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">{flow.resultMsg}</p>
        </div>
        <div className="px-2 pb-2 space-y-1.5">
          <button onClick={backToActions}
            className="w-full py-2 rounded-xl text-sm font-heading font-bold transition-all"
            style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)', color: '#fdba74' }}>
            {lang === 'ko' ? '다른 외교 행동' : 'Another Action'}
          </button>
          <button onClick={() => { resetAll(); onClose(); }}
            className="w-full py-2 rounded-xl text-sm font-heading font-bold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db' }}>
            {lang === 'ko' ? '게임으로 돌아가기' : 'Back to Game'}
          </button>
        </div>
      </div>
    );
  }

  // STEP: Select Hex (Pressure)
  if (flow.step === 'selectHex') {
    const cost = selectedPressureHex ? getPressureCost(gameState.map.hexes[selectedPressureHex], gameState) : null;
    const selHex = selectedPressureHex ? gameState.map.hexes[selectedPressureHex] : null;
    return (
      <div className="flex flex-col flex-1">
        <div className="px-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={backToNation} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={10} />
            <span>{lang === 'ko' ? '국가 선택으로' : 'Back to nation'}</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <h3 className="text-white font-heading font-bold text-[11px] mb-1">
              {lang === 'ko' ? '압박할 타일 선택' : 'Select a Hex to Pressure'}
            </h3>
            <p className="text-[10px] text-gray-400">
              {lang === 'ko'
                ? '지도에서 강조된 국경 타일을 클릭하세요. 비용: 기본 2 + 건물당 1 영향력.'
                : 'Click a highlighted border hex on the map. Cost: 2 base + 1 per building.'}
            </p>
          </div>

          {selectedPressureHex && selHex && (
            <div className="rounded-xl p-3 mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{TERRAIN_ICONS[selHex.terrain] || '🪨'}</span>
                <div>
                  <p className="text-white font-heading font-bold text-xs">{lang === 'ko' ? t.terrain[selHex.terrain] : t.terrain[selHex.terrain]}</p>
                  <p className="text-[9px] text-gray-500">{lang === 'ko' ? `소유: ${gameState.players[selHex.owner]?.countryName}` : `Owner: ${gameState.players[selHex.owner]?.countryName}`}</p>
                </div>
              </div>
              {(selHex.buildings || []).length > 0 && (
                <p className="text-[9px] text-yellow-400 mb-2">
                  🏗️ {(selHex.buildings || []).length} {lang === 'ko' ? '건물' : 'buildings'} ({selHex.buildings.map(b => t.buildings[b] || b).join(', ')})
                </p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{lang === 'ko' ? '총 비용' : 'Total cost'}</span>
                <span className="font-mono font-bold" style={{ color: stars >= cost ? '#fde68a' : '#f87171' }}>⭐{cost}</span>
              </div>
              <button onClick={confirmPressure} disabled={stars < cost || ap <= 0}
                className="w-full mt-2 py-2 rounded-xl text-xs font-heading font-bold transition-all disabled:opacity-30"
                style={{ background: 'rgba(248,113,113,0.25)', border: '1px solid rgba(248,113,113,0.4)', color: '#fca5a5' }}>
                {lang === 'ko' ? `압박 확인 (⭐${cost}, 1 AP)` : `Confirm Pressure (⭐${cost}, 1 AP)`}
              </button>
              <button onClick={cancelPressure}
                className="w-full mt-1 py-1.5 rounded-lg text-xs text-gray-500 hover:text-white transition-all">
                {lang === 'ko' ? '취소' : 'Cancel'}
              </button>
            </div>
          )}

          {eligibleHexes.length === 0 && (
            <p className="text-gray-600 text-xs text-center py-4">
              {lang === 'ko' ? '압박 가능한 인접 적국 변경 헥스가 없습니다.' : 'No adjacent enemy border hexes available.'}
            </p>
          )}

          <p className="text-[9px] text-gray-600 text-center mt-2">
            {lang === 'ko'
              ? `가능한 타일: ${eligibleHexes.length}개 | 영향력: ⭐${stars}`
              : `${eligibleHexes.length} eligible hexes | Influence: ⭐${stars}`}
          </p>
        </div>
      </div>
    );
  }

  // STEP: Choose Action (main menu)
  if (flow.step === 'chooseAction') {
    return (
      <div className="flex flex-col flex-1">
        {/* Quick incoming pressure warning */}
        {incomingPressures.length > 0 && (
          <div className="mx-2 mt-2 px-2 py-1.5 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p className="text-[10px] text-red-400 font-bold">
              ⚠️ {lang === 'ko' ? `받고 있는 압박 ${incomingPressures.length}건!` : `${incomingPressures.length} incoming pressure(s)!`}
            </p>
          </div>
        )}

        <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
          {DIPLO_ACTIONS.map(a => {
            const Icon = a.icon;
            const isRespond = a.key === 'respond';
            const hasIncoming = incomingPressures.length > 0;
            const disabled = isRespond && !hasIncoming;
            const isPressure = a.key === 'pressure';
            return (
              <button key={a.key} onClick={() => {
                if (disabled) return;
                if (a.key === 'pressure') { setStep('chooseNation', { action: a.key }); return; }
                if (a.key === 'respond') { setStep('chooseNation', { action: a.key }); return; }
                if (a.key === 'status') { setStep('chooseNation', { action: a.key }); return; }
                setStep('chooseNation', { action: a.key });
              }} disabled={disabled}
                className="w-full text-left p-2.5 rounded-xl transition-all disabled:opacity-25"
                style={{
                  background: a.bg,
                  border: `1px solid ${a.border}`,
                  color: a.text,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} />
                  <span className="font-heading font-bold text-xs">{a[lang]}</span>
                  {a.apCost > 0 && <span className="ml-auto text-[9px] opacity-70">{a.apCost} AP</span>}
                </div>
                <p className="text-[9px] opacity-70">{a.descEn && a.descKo ? a[`desc${lang === 'ko' ? 'Ko' : 'En'}`] : ''}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // STEP: Choose Nation
  if (flow.step === 'chooseNation') {
    const action = DIPLO_ACTIONS.find(a => a.key === flow.action);
    const ActionIcon = action?.icon;

    if (flow.action === 'status') {
      // Diplomacy Status – overview
      return (
        <div className="flex flex-col flex-1 overflow-y-auto px-2 py-2 space-y-2">
          <button onClick={backToActions} className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-white transition-colors mb-1">
            <ArrowLeft size={10} />
            <span>{lang === 'ko' ? '액션 선택으로' : 'Back to actions'}</span>
          </button>

          <h3 className="text-white font-heading font-bold text-xs">{lang === 'ko' ? '외교 현황' : 'Diplomacy Status'}</h3>

          {/* Incoming Trades */}
          <div className="rounded-lg p-2" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <p className="text-[9px] text-blue-400 font-bold mb-1">{lang === 'ko' ? '받은 무역 제안' : 'Incoming Trade Proposals'}</p>
            {incomingTrades.length === 0 && <p className="text-[9px] text-gray-500">{lang === 'ko' ? '없음' : 'None'}</p>}
            {incomingTrades.map(prop => (
              <div key={prop.id} className="flex items-center gap-2 p-1.5 rounded mb-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ color: gameState.players[prop.proposerIndex]?.colorHex }}>{gameState.players[prop.proposerIndex]?.emblem}</span>
                <div className="flex-1 text-[9px] text-gray-300">
                  {Object.entries(prop.offeredResources || {}).filter(([_,v]) => v > 0).map(([r,v]) => `${RES_ICONS[r]}${v}`).join(' + ') || '—'}
                  {' ⇄ '}
                  {Object.entries(prop.requestedResources || {}).filter(([_,v]) => v > 0).map(([r,v]) => `${RES_ICONS[r]}${v}`).join(' + ') || '—'}
                </div>
                <button onClick={() => handleAcceptTrade(prop.id)} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(74,222,128,0.15)', color: '#86efac' }}>
                  {lang === 'ko' ? '수락' : 'Accept'}
                </button>
                <button onClick={() => handleRejectTrade(prop.id)} className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                  {lang === 'ko' ? '거절' : 'Reject'}
                </button>
              </div>
            ))}
          </div>

          {/* Outgoing Trades */}
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] text-gray-400 font-bold mb-1">{lang === 'ko' ? '보낸 무역 제안' : 'Outgoing Trade Proposals'}</p>
            {outgoingTrades.length === 0 && <p className="text-[9px] text-gray-500">{lang === 'ko' ? '없음' : 'None'}</p>}
            {outgoingTrades.map(prop => (
              <div key={prop.id} className="p-1 text-[9px] text-gray-400">
                → {gameState.players[prop.recipientIndex]?.countryName}: {lang === 'ko' ? '대기 중' : 'Pending'}
              </div>
            ))}
          </div>

          {/* Incoming Pressures */}
          <div className="rounded-lg p-2" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-[9px] text-red-400 font-bold mb-1">{lang === 'ko' ? '받은 압박' : 'Incoming Pressure'}</p>
            {incomingPressures.length === 0 && <p className="text-[9px] text-gray-500">{lang === 'ko' ? '없음' : 'None'}</p>}
            {incomingPressures.map(p => {
              const attacker = gameState.players[p.attackerIdx];
              const hex = gameState.map.hexes[p.hexKey];
              return (
                <div key={p.id} className="flex items-center gap-2 p-1.5 rounded mb-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ color: attacker?.colorHex }}>{attacker?.emblem}</span>
                  <div className="flex-1 text-[9px] text-red-300">
                    {attacker?.countryName} → {t.terrain[hex?.terrain]}
                    <span className="text-gray-600 ml-1">⭐{p.cost} · {p.defenderTurnsRemaining}t</span>
                  </div>
                  <button onClick={() => handleResist(p.id, p.cost)} disabled={stars < p.cost}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold disabled:opacity-30"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#86efac' }}>
                    {lang === 'ko' ? '저항' : 'Resist'}
                  </button>
                  <button onClick={() => handleSurrender(p.id)}
                    className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                    {lang === 'ko' ? '포기' : 'Give'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Outgoing Pressures */}
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] text-gray-400 font-bold mb-1">{lang === 'ko' ? '가한 압박' : 'Outgoing Pressure'}</p>
            {outgoingPressures.length === 0 && <p className="text-[9px] text-gray-500">{lang === 'ko' ? '없음' : 'None'}</p>}
            {outgoingPressures.map(p => {
              const def = gameState.players[p.defenderIdx];
              return (
                <div key={p.id} className="p-1 text-[9px] text-gray-400">
                  → {def?.countryName}: ⭐{p.cost} · {p.defenderTurnsRemaining}t {lang === 'ko' ? '남음' : 'left'}
                </div>
              );
            })}
          </div>

          {/* Cooperation & Influence */}
          <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] text-gray-400 font-bold mb-1">{lang === 'ko' ? '협력 및 영향력' : 'Cooperation & Influence'}</p>
            <div className="flex gap-3 text-xs">
              <span>🤝 {player.cooperationActions || 0}</span>
              <span>⭐ {stars}</span>
            </div>
          </div>
        </div>
      );
    }

    if (flow.action === 'respond') {
      // Nation pick for respond — show nations that are pressuring us
      const pressuringNations = [...new Set(incomingPressures.map(p => p.attackerIdx))];
      return (
        <div className="flex flex-col flex-1 overflow-y-auto px-2 py-2">
          <button onClick={backToActions} className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-white transition-colors mb-2">
            <ArrowLeft size={10} />
            <span>{lang === 'ko' ? '액션 선택으로' : 'Back to actions'}</span>
          </button>

          <h3 className="text-white font-heading font-bold text-xs mb-2">
            {lang === 'ko' ? '압박 대응' : 'Respond to Pressure'}
          </h3>

          {pressuringNations.length === 0 && (
            <p className="text-gray-600 text-xs text-center py-6">
              {lang === 'ko' ? '받은 압박이 없습니다.' : 'No incoming pressure.'}
            </p>
          )}

          {pressuringNations.map(nIdx => {
            const nation = gameState.players[nIdx];
            const nationPressures = incomingPressures.filter(p => p.attackerIdx === nIdx);
            return (
              <div key={nIdx} className="rounded-xl p-3 mb-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: nation.colorHex }}>{nation.emblem}</span>
                  <span className="text-white font-heading font-bold text-xs">{nation.countryName}</span>
                </div>
                {nationPressures.map(p => {
                  const hex = gameState.map.hexes[p.hexKey];
                  return (
                    <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg mb-1"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 text-[10px] text-gray-300">
                        {t.terrain[hex?.terrain]} <span className="text-gray-600">⭐{p.cost} · {p.defenderTurnsRemaining}t</span>
                      </div>
                      <button onClick={() => handleResist(p.id, p.cost)} disabled={stars < p.cost}
                        className="px-2 py-1 rounded text-[9px] font-bold disabled:opacity-30"
                        style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: '#86efac' }}>
                        {lang === 'ko' ? '저항' : 'Resist'}
                      </button>
                      <button onClick={() => handleSurrender(p.id)}
                        className="px-2 py-1 rounded text-[9px] font-bold"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                        {lang === 'ko' ? '포기' : 'Surrender'}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }

    // Standard nation pick for trade, giveAid, pressure
    return (
      <div className="flex flex-col flex-1 overflow-y-auto px-2 py-2">
        <button onClick={backToActions} className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-white transition-colors mb-2">
          <ArrowLeft size={10} />
          <span>{lang === 'ko' ? '액션 선택으로' : 'Back to actions'}</span>
        </button>

        <div className="flex items-center gap-2 mb-2">
          {ActionIcon && <ActionIcon size={14} style={{ color: action?.text }} />}
          <h3 className="text-white font-heading font-bold text-xs">{action?.[lang]}</h3>
        </div>
        <p className="text-[9px] text-gray-500 mb-2">
          {lang === 'ko' ? '대상 국가를 선택하세요.' : 'Select a target nation.'}
        </p>

        <div className="space-y-1.5">
          {otherPlayers.map(p => {
            const isSelected = flow.targetNationId === p.index;
            const incomingFromThis = incomingPressures.filter(pr => pr.attackerIdx === p.index).length;
            const outgoingToThis = outgoingPressures.filter(pr => pr.defenderIdx === p.index).length;
            return (
              <button key={p.index} onClick={() => {
                setStep('configureAction', { targetNationId: p.index });
              }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl transition-all"
                style={{
                  background: isSelected ? p.colorHex + '15' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? p.colorHex + '40' : 'rgba(255,255,255,0.06)'}`,
                  color: isSelected ? p.colorHex : '#d1d5db',
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: p.colorHex + '18', border: `1px solid ${p.colorHex}40` }}>
                  {p.emblem}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-heading font-bold">{p.countryName}</p>
                  <p className="text-[9px] opacity-60">{p.playerName}</p>
                </div>
                <div className="text-right text-[9px] space-y-0.5">
                  <div className="flex items-center gap-1 justify-end">
                    <span>⭐{p.influenceStars || 0}</span>
                    <span>🤝{p.cooperationActions || 0}</span>
                  </div>
                  {incomingFromThis > 0 && <p className="text-red-400">{lang === 'ko' ? '압박 중' : 'Pressuring'}</p>}
                  {outgoingToThis > 0 && <p className="text-orange-400">{lang === 'ko' ? '압박 받는 중' : 'Pressured'}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // STEP: Configure Action
  if (flow.step === 'configureAction') {
    const target = gameState.players[flow.targetNationId];
    const action = DIPLO_ACTIONS.find(a => a.key === flow.action);
    const ActionIcon = action?.icon;

    if (!target) return null;

    if (flow.action === 'giveAid') {
      const amt = parseInt(flow.aidAmt) || 0;
      const owned = player.resources[flow.aidRes] || 0;
      const after = Math.max(0, owned - amt);
      const valid = amt > 0 && amt <= owned;
      return (
        <div className="flex flex-col flex-1 overflow-y-auto px-2 py-2">
          <button onClick={backToNation} className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-white mb-2">
            <ArrowLeft size={10} />
            <span>{lang === 'ko' ? '국가 선택으로' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2 mb-3">
            <ActionIcon size={14} style={{ color: action?.color }} />
            <h3 className="text-white font-heading font-bold text-xs">
              {lang === 'ko' ? `${target.countryName}에게 지원` : `Give Aid to ${target.countryName}`}
            </h3>
          </div>

          <div className="space-y-2 mb-3">
            <p className="text-[10px] text-gray-400">{lang === 'ko' ? '자원 선택' : 'Choose resource'}</p>
            <div className="flex gap-1.5 flex-wrap">
              {RES_META.map(m => (
                <button key={m.key} onClick={() => setFlow(prev => ({ ...prev, aidRes: m.key }))}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] transition-all ${
                    flow.aidRes === m.key ? 'text-white' : 'text-gray-500'
                  }`}
                  style={{
                    background: flow.aidRes === m.key ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${flow.aidRes === m.key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                  {m.icon} {m[lang]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input type="number" min="1" value={flow.aidAmt}
                onChange={e => setStep('configureAction', { aidAmt: e.target.value })}
                className="w-20 px-2 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 text-white"
                placeholder="0"
              />
              <span className="text-[9px] text-gray-500">
                {lang === 'ko' ? `보유: ${owned}` : `Owned: ${owned}`}
                {amt > 0 && ` → ${lang === 'ko' ? '남음' : 'after'}: ${after}`}
              </span>
            </div>

            <p className="text-[9px] text-green-400">
              {lang === 'ko' ? '보상: +5 협력 점수' : 'Reward: +5 Cooperation'}
            </p>
          </div>

          <button onClick={handleGiveAid} disabled={!valid}
            className="w-full py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-30"
            style={{ background: 'rgba(74,222,128,0.25)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac' }}>
            {lang === 'ko'
              ? `${RES_META.find(r => r.key === flow.aidRes)?.ko} ${amt || ''} 전송`
              : `Send ${amt || ''} ${RES_META.find(r => r.key === flow.aidRes)?.en || ''}`}
          </button>
        </div>
      );
    }

    if (flow.action === 'trade') {
      const hasOffer = Object.values(flow.offerRes).some(v => v > 0);
      const hasRequest = Object.values(flow.requestRes).some(v => v > 0);
      const canSend = hasOffer || hasRequest;
      return (
        <div className="flex flex-col flex-1 overflow-y-auto px-2 py-2">
          <button onClick={backToNation} className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-white mb-2">
            <ArrowLeft size={10} />
            <span>{lang === 'ko' ? '국가 선택으로' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2 mb-3">
            <ActionIcon size={14} style={{ color: action?.color }} />
            <h3 className="text-white font-heading font-bold text-xs">
              {lang === 'ko' ? `${target.countryName}과 무역` : `Trade with ${target.countryName}`}
            </h3>
          </div>

          {/* Offer section */}
          <div className="rounded-lg p-2 mb-2" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p className="text-[9px] text-green-400 font-bold mb-1.5">
              {lang === 'ko' ? '제공할 자원' : 'You Offer'}
            </p>
            {RES_META.map(m => {
              const selected = flow.offerRes[m.key] !== undefined;
              return (
                <div key={m.key} className="flex items-center gap-2 mb-1">
                  <button onClick={() => toggleOffer(m.key)}
                    className={`px-2 py-1 rounded text-[10px] transition-all ${selected ? 'text-white' : 'text-gray-600'}`}
                    style={{ background: selected ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.04)'}` }}>
                    {m.icon} {m[lang]}
                  </button>
                  {selected && (
                    <input type="number" min="0" value={flow.offerRes[m.key] || 0}
                      onChange={e => setResourceAmt(m.key, e.target.value, 'offerRes')}
                      className="w-14 px-1.5 py-0.5 text-[10px] rounded bg-gray-800 border border-gray-700 text-white" />
                  )}
                  {selected && <span className="text-[9px] text-gray-500">{lang === 'ko' ? `보유: ${player.resources[m.key] || 0}` : `Have: ${player.resources[m.key] || 0}`}</span>}
                </div>
              );
            })}
          </div>

          {/* Request section */}
          <div className="rounded-lg p-2 mb-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p className="text-[9px] text-red-400 font-bold mb-1.5">
              {lang === 'ko' ? '요청할 자원' : 'You Request'}
            </p>
            {RES_META.map(m => {
              const selected = flow.requestRes[m.key] !== undefined;
              return (
                <div key={m.key} className="flex items-center gap-2 mb-1">
                  <button onClick={() => toggleRequest(m.key)}
                    className={`px-2 py-1 rounded text-[10px] transition-all ${selected ? 'text-white' : 'text-gray-600'}`}
                    style={{ background: selected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.04)'}` }}>
                    {m.icon} {m[lang]}
                  </button>
                  {selected && (
                    <input type="number" min="0" value={flow.requestRes[m.key] || 0}
                      onChange={e => setResourceAmt(m.key, e.target.value, 'requestRes')}
                      className="w-14 px-1.5 py-0.5 text-[10px] rounded bg-gray-800 border border-gray-700 text-white" />
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={handleSendTrade} disabled={!canSend}
            className="w-full py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-30"
            style={{ background: 'rgba(96,165,250,0.25)', border: '1px solid rgba(96,165,250,0.4)', color: '#93c5fd' }}>
            {lang === 'ko' ? '무역 제안 보내기' : 'Send Trade Proposal'}
          </button>
        </div>
      );
    }

    if (flow.action === 'pressure') {
      return (
        <div className="flex flex-col flex-1 overflow-y-auto px-2 py-2">
          <button onClick={backToNation} className="flex items-center gap-1 text-[9px] text-gray-500 hover:text-white mb-2">
            <ArrowLeft size={10} />
            <span>{lang === 'ko' ? '국가 선택으로' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2 mb-3">
            <ActionIcon size={14} style={{ color: action?.color }} />
            <h3 className="text-white font-heading font-bold text-xs">
              {lang === 'ko' ? `${target.countryName}의 타일 압박` : `Pressure ${target.countryName}'s Hex`}
            </h3>
          </div>

          <div className="rounded-xl p-3 mb-2" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <p className="text-[10px] text-gray-400 mb-2">
              {lang === 'ko'
                ? '비용 = 기본 2 + 건물당 1 영향력. 상대는 3턴 내에 대응해야 합니다.'
                : 'Cost = 2 base + 1 per building. Owner has 3 turns to respond.'}
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500">{lang === 'ko' ? '내 영향력' : 'My Influence'}</span>
              <span className="font-mono font-bold" style={{ color: stars >= 2 ? '#fde68a' : '#f87171' }}>⭐{stars}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500">{lang === 'ko' ? '행동력' : 'Action Points'}</span>
              <span className="font-mono text-white">{ap}</span>
            </div>
          </div>

          <button onClick={startPressureFlow} disabled={ap <= 0 || stars < 2}
            className="w-full py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-30"
            style={{ background: 'rgba(248,113,113,0.25)', border: '1px solid rgba(248,113,113,0.4)', color: '#fca5a5' }}>
            {lang === 'ko' ? '타일 선택하기' : 'Select a Hex'}
          </button>
        </div>
      );
    }

    return null;
  }

  // Fallback
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <Loader2 size={16} className="animate-spin text-gray-600" />
    </div>
  );
}