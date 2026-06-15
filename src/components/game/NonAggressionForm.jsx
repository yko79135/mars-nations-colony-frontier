import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Shield, X } from 'lucide-react';

const DURATIONS = [3, 5, 8];

export default function NonAggressionForm({ recipientIndex, onSent, onCancel }) {
  const { t, lang } = useLang();
  const { gameState, proposeAgreement } = useGame();
  const [pactDuration, setPactDuration] = useState(5);

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const recipient = gameState.players[recipientIndex];

  const handleSend = () => {
    proposeAgreement('nonAggression', recipientIndex, { pactDuration });
    onSent();
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} style={{ color: '#fbbf24' }} />
          <h3 className="text-white font-heading font-bold text-sm">{t.diplomacy.nonAggression}</h3>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      {/* Duration selector */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-2">{t.diplomacy.pactDuration}</p>
        <div className="flex gap-2">
          {DURATIONS.map(d => {
            const isSelected = pactDuration === d;
            const label = d === 3 ? t.diplomacy.rounds3 : d === 5 ? t.diplomacy.rounds5 : t.diplomacy.rounds8;
            return (
              <button key={d} onClick={() => setPactDuration(d)}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: isSelected ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: isSelected ? '#fde68a' : '#9ca3af',
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Effect */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <p className="text-[10px] text-gray-400 leading-relaxed">{t.diplomacy.pactEffect}</p>
      </div>

      {/* Nations preview */}
      <div className="mb-4 flex items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded flex items-center justify-center text-xs"
            style={{ background: player.colorHex + '30', border: `1px solid ${player.colorHex}` }}>{player.emblem}</div>
          <span style={{ color: player.colorHex }}>{player.abbreviation}</span>
        </div>
        <span className="text-gray-600">🛡️</span>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded flex items-center justify-center text-xs"
            style={{ background: recipient.colorHex + '30', border: `1px solid ${recipient.colorHex}` }}>{recipient.emblem}</div>
          <span style={{ color: recipient.colorHex }}>{recipient.abbreviation}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSend}
          disabled={gameState.actionPoints <= 0}
          className="flex-1 py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
          style={{ background: 'rgba(251,191,36,0.25)', border: '1px solid rgba(251,191,36,0.4)', color: '#fde68a' }}>
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