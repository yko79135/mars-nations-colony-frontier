import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { DIPLOMACY_RESOURCES } from '@/lib/gameData';
import { Heart, X } from 'lucide-react';

const RES_ICONS = {
  energy: '⚡', water: '💧', food: '🌾', minerals: '💎', science: '🔬',
};

export default function EmergencyAidForm({ recipientIndex, onSent, onCancel }) {
  const { t, lang } = useLang();
  const { gameState, proposeAgreement } = useGame();
  const [aidResource, setAidResource] = useState('');
  const [aidAmount, setAidAmount] = useState('');
  const [error, setError] = useState('');

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const recipient = gameState.players[recipientIndex];

  const handleSend = () => {
    if (!aidResource) {
      setError(t.diplomacy.selectTechnology);
      return;
    }
    const amount = parseInt(aidAmount) || 0;
    if (amount <= 0) {
      setError(t.diplomacy.invalidAmount);
      return;
    }
    if ((player.resources[aidResource] || 0) < amount) {
      setError(t.diplomacy.notEnoughResource.replace('{resource}', t.resources[aidResource]));
      return;
    }
    proposeAgreement('emergencyAid', recipientIndex, {
      aidResource,
      aidAmount: amount,
    });
    onSent();
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart size={16} style={{ color: '#fb923c' }} />
          <h3 className="text-white font-heading font-bold text-sm">{t.diplomacy.offerHelp}</h3>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      {/* Resource selection */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-2">{t.diplomacy.aidResource}</p>
        <div className="flex flex-wrap gap-1.5">
          {DIPLOMACY_RESOURCES.map(res => {
            const isSelected = aidResource === res;
            return (
              <button key={res} onClick={() => { setAidResource(res); setError(''); }}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: isSelected ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: isSelected ? '#fed7aa' : '#9ca3af',
                }}>
                {RES_ICONS[res]} {t.resources[res]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      {aidResource && (
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 mb-1">{t.diplomacy.aidAmount}</p>
          <div className="flex items-center gap-2">
            <input type="number" min="1"
              value={aidAmount}
              onChange={e => { setAidAmount(e.target.value); setError(''); }}
              className="w-24 px-3 py-2 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-orange-500"
              placeholder="0"
            />
            <span className="text-[10px] text-gray-600">
              {lang === 'ko' ? '보유' : 'Have'}: {player.resources[aidResource] || 0}
            </span>
          </div>
        </div>
      )}

      {/* Gift label */}
      <div className="mb-4 p-2.5 rounded-lg" style={{ background: 'rgba(251,146,60,0.1)' }}>
        <p className="text-[10px] text-orange-300">{t.diplomacy.gift}</p>
      </div>

      {error && <p className="text-red-400 text-xs mb-3">⚠ {error}</p>}

      {/* Preview */}
      {aidResource && aidAmount && parseInt(aidAmount) > 0 && (
        <div className="mb-4 flex items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs"
              style={{ background: player.colorHex + '30', border: `1px solid ${player.colorHex}` }}>{player.emblem}</div>
            <span style={{ color: player.colorHex }}>{player.abbreviation}</span>
          </div>
          <span className="text-gray-400">{RES_ICONS[aidResource]} {aidAmount} →</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs"
              style={{ background: recipient.colorHex + '30', border: `1px solid ${recipient.colorHex}` }}>{recipient.emblem}</div>
            <span style={{ color: recipient.colorHex }}>{recipient.abbreviation}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSend}
          disabled={gameState.actionPoints <= 0 || !aidResource || !aidAmount}
          className="flex-1 py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
          style={{ background: 'rgba(251,146,60,0.25)', border: '1px solid rgba(251,146,60,0.4)', color: '#fed7aa' }}>
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