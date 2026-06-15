import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { ChevronLeft, Users, ArrowRightLeft, Shield, Share2, Heart, CheckCircle } from 'lucide-react';

const DIPLOMACY_ACTIONS = [
  { key: 'trade',         labelKey: 'proposeTrade',  icon: ArrowRightLeft, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)' },
  { key: 'alliance',      labelKey: 'formAlliance',  icon: Users,          color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)' },
  { key: 'nonAggression', labelKey: 'nonAggression', icon: Shield,         color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)' },
  { key: 'shareTech',     labelKey: 'shareTech',     icon: Share2,         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  { key: 'offerHelp',     labelKey: 'offerHelp',     icon: Heart,          color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)' },
];

const AGREEMENT_COLORS = {
  trade: '#60a5fa', alliance: '#4ade80', nonAggression: '#fbbf24', shareTech: '#a78bfa', offerHelp: '#fb923c',
};

export default function DiplomacyPanel() {
  const { t, lang } = useLang();
  const { gameState, updateGameState, setScreen } = useGame();
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [flash, setFlash] = useState(false);

  if (!gameState) return null;

  const player = gameState.players[gameState.currentPlayerIndex];
  const otherPlayers = gameState.players.filter((_, i) => i !== gameState.currentPlayerIndex);

  const createAgreement = (type) => {
    if (targetPlayer === null) return;
    updateGameState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const agreement = { type, between: [prev.currentPlayerIndex, targetPlayer], round: prev.currentRound, status: 'active' };
      next.players[prev.currentPlayerIndex].agreements.push(agreement);
      next.players[targetPlayer].agreements.push(agreement);
      return next;
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
    setTargetPlayer(null);
  };

  const selectedOther = targetPlayer !== null ? gameState.players[targetPlayer] : null;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#04080f' }}>
      <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
        style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => setScreen('playing')} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <ChevronLeft size={18} />
        </button>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)' }}>🤝</div>
        <h2 className="text-white font-heading font-bold text-base">{t.nav.diplomacy}</h2>
        {flash && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
            <CheckCircle size={12} /> {lang === 'ko' ? '협정 체결됨' : 'Agreement created'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-xl mx-auto space-y-6">

          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-3">
              {lang === 'ko' ? '국가 선택' : 'Select Nation'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherPlayers.map(p => {
                const isSelected = targetPlayer === p.index;
                return (
                  <button key={p.index} onClick={() => setTargetPlayer(isSelected ? null : p.index)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? p.colorHex + '18' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? p.colorHex + '50' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: p.colorHex + '20', border: `2px solid ${p.colorHex}` }}>{p.emblem}</div>
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-sm leading-tight" style={{ color: isSelected ? p.colorHex : 'white' }}>{p.countryName}</p>
                      <p className="text-gray-500 text-[10px] leading-tight truncate">{p.playerName}</p>
                    </div>
                    {isSelected && <span className="ml-auto text-[10px] font-bold" style={{ color: p.colorHex }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedOther && (
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-3">
                {lang === 'ko' ? `${selectedOther.countryName}에게 제안` : `Propose to ${selectedOther.countryName}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DIPLOMACY_ACTIONS.map(da => {
                  const Icon = da.icon;
                  return (
                    <button key={da.key} onClick={() => createAgreement(da.key)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all"
                      style={{ background: da.bg, border: `1px solid ${da.border}` }}>
                      <Icon size={16} style={{ color: da.color }} className="shrink-0" />
                      <span className="text-sm font-medium" style={{ color: da.color }}>{t.diplomacy[da.labelKey]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-3">{t.diplomacy.agreements}</p>
            {player.agreements.length === 0 ? (
              <div className="text-center py-6 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-gray-600 text-sm">{t.diplomacy.noAgreements}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {player.agreements.map((ag, i) => {
                  const otherIdx = ag.between.find(x => x !== gameState.currentPlayerIndex);
                  const other = gameState.players[otherIdx];
                  const col = AGREEMENT_COLORS[ag.type] || '#9ca3af';
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{ background: other?.colorHex + '20', border: `1px solid ${other?.colorHex}` }}>{other?.emblem}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">{t.diplomacy[ag.type] || ag.type}</p>
                        <p className="text-gray-500 text-[10px] truncate">{other?.countryName} · {t.general.round} {ag.round}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: col + '18', border: `1px solid ${col}40`, color: col }}>
                        {t.diplomacy.active}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}