import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Share2, X, Check } from 'lucide-react';

export default function TechShareForm({ recipientIndex, onSent, onCancel }) {
  const { t, lang } = useLang();
  const { gameState, proposeAgreement } = useGame();
  const [selectedTech, setSelectedTech] = useState(null);
  const [error, setError] = useState('');

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const recipient = gameState.players[recipientIndex];

  const shareableTechs = (player.technologies || []).filter(techId => {
    return !(recipient.technologies || []).includes(techId) &&
           !(recipient.techCostReductions && recipient.techCostReductions[techId]);
  });

  const handleSend = () => {
    if (!selectedTech) {
      setError(t.diplomacy.selectTechnology);
      return;
    }
    if (recipient.technologies?.includes(selectedTech)) {
      setError(t.diplomacy.alreadyHasTech);
      return;
    }
    proposeAgreement('shareTech', recipientIndex, { techId: selectedTech });
    onSent();
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Share2 size={16} style={{ color: '#a78bfa' }} />
          <h3 className="text-white font-heading font-bold text-sm">{t.diplomacy.shareTech}</h3>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      {/* Effect */}
      <div className="mb-4 p-2.5 rounded-lg" style={{ background: 'rgba(167,139,250,0.1)' }}>
        <p className="text-[10px] text-purple-300">{t.diplomacy.techShareEffect}</p>
      </div>

      {/* Tech selection */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-2">{t.diplomacy.selectTechnology}</p>
        {shareableTechs.length === 0 ? (
          <p className="text-gray-600 text-xs">{t.diplomacy.noTechnologiesToShare}</p>
        ) : (
          <div className="space-y-1.5">
            {shareableTechs.map(techId => {
              const isSelected = selectedTech === techId;
              return (
                <button key={techId} onClick={() => { setSelectedTech(techId); setError(''); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all"
                  style={{
                    background: isSelected ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isSelected ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    color: isSelected ? '#c4b5fd' : '#9ca3af',
                  }}>
                  {isSelected && <Check size={12} className="text-purple-400" />}
                  {t.tech[techId] || techId}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mb-3">⚠ {error}</p>}

      <div className="flex gap-2">
        <button onClick={handleSend}
          disabled={gameState.actionPoints <= 0 || !selectedTech}
          className="flex-1 py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
          style={{ background: 'rgba(167,139,250,0.25)', border: '1px solid rgba(167,139,250,0.4)', color: '#c4b5fd' }}>
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