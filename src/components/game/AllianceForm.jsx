import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { getTrust, getTrustLabel, TRUST_LABELS } from '@/lib/gameData';
import { Users, X, Check } from 'lucide-react';

export default function AllianceForm({ recipientIndex, onSent, onCancel }) {
  const { t, lang } = useLang();
  const { gameState, proposeAgreement } = useGame();
  const [duration] = useState(5);

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const recipient = gameState.players[recipientIndex];
  const trust = getTrust(gameState, gameState.currentPlayerIndex, recipientIndex);
  const trustKey = getTrustLabel(trust);
  const trustLabel = lang === 'ko'
    ? TRUST_LABELS[trustKey]?.ko || trustKey
    : TRUST_LABELS[trustKey]?.en || trustKey;

  // Check for existing alliance
  const existingAlliance = gameState.diplomacy?.agreements?.find(a =>
    a.type === 'alliance' && a.status === 'active' &&
    a.nationIds.includes(gameState.currentPlayerIndex) &&
    a.nationIds.includes(recipientIndex)
  );
  const pendingAlliance = gameState.diplomacy?.proposals?.find(p =>
    p.type === 'alliance' && p.status === 'pending' &&
    ((p.proposerIndex === gameState.currentPlayerIndex && p.recipientIndex === recipientIndex) ||
     (p.proposerIndex === recipientIndex && p.recipientIndex === gameState.currentPlayerIndex))
  );

  const alreadyExists = existingAlliance || pendingAlliance;

  const handleSend = () => {
    if (alreadyExists) return;
    proposeAgreement('alliance', recipientIndex, { duration });
    onSent();
  };

  const BENEFITS = [
    t.diplomacy.allianceBenefit1,
    t.diplomacy.allianceBenefit2,
    t.diplomacy.allianceBenefit3,
    t.diplomacy.allianceBenefit4,
  ];

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} style={{ color: '#4ade80' }} />
          <h3 className="text-white font-heading font-bold text-sm">{t.diplomacy.formAlliance}</h3>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      {/* Current trust */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[10px] text-gray-500">{t.diplomacy.trust}:</span>
        <span className="text-[10px] font-bold" style={{ color: trust > 60 ? '#4ade80' : trust > 40 ? '#fbbf24' : '#f87171' }}>{trust}</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{
          background: trust > 60 ? 'rgba(74,222,128,0.15)' : trust > 40 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
          color: trust > 60 ? '#4ade80' : trust > 40 ? '#fbbf24' : '#f87171',
        }}>{trustLabel}</span>
      </div>

      {/* Duration */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-1">{t.diplomacy.duration}</p>
        <p className="text-white text-sm font-bold">5 {lang === 'ko' ? '라운드' : 'Rounds'}</p>
      </div>

      {/* Benefits */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">{t.diplomacy.allianceBenefits}</p>
        <ul className="space-y-1">
          {BENEFITS.map((b, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-300">
              <Check size={12} className="text-green-400 shrink-0 mt-0.5" />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {alreadyExists && (
        <p className="text-yellow-400 text-xs mb-3">⚠ {t.diplomacy.duplicateAlliance}</p>
      )}

      {/* Nations preview */}
      <div className="mb-4 flex items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded flex items-center justify-center text-xs"
            style={{ background: player.colorHex + '30', border: `1px solid ${player.colorHex}` }}>{player.emblem}</div>
          <span style={{ color: player.colorHex }}>{player.abbreviation}</span>
        </div>
        <span className="text-gray-600">🤝</span>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded flex items-center justify-center text-xs"
            style={{ background: recipient.colorHex + '30', border: `1px solid ${recipient.colorHex}` }}>{recipient.emblem}</div>
          <span style={{ color: recipient.colorHex }}>{recipient.abbreviation}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSend}
          disabled={gameState.actionPoints <= 0 || alreadyExists}
          className="flex-1 py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
          style={{ background: 'rgba(74,222,128,0.25)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac' }}>
          {t.diplomacy.sendProposal} (1 AP)
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {t.diplomacy.cancel}
        </button>
      </div>
    </div>
  );
}