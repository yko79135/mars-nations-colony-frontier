import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { DIPLOMACY_RESOURCES } from '@/lib/gameData';
import { ArrowRightLeft, X } from 'lucide-react';

const RES_ICONS = {
  energy: '⚡', water: '💧', food: '🌾', minerals: '💎', science: '🔬',
};

export default function TradeForm({ recipientIndex, onSent, onCancel }) {
  const { t, lang } = useLang();
  const { gameState, proposeAgreement } = useGame();
  const [offers, setOffers] = useState({});
  const [requests, setRequests] = useState({});
  const [error, setError] = useState('');

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const recipient = gameState.players[recipientIndex];

  const setOffer = (res, val) => {
    const v = parseInt(val) || 0;
    setOffers(prev => v > 0 ? { ...prev, [res]: v } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== res)));
    setError('');
  };
  const setRequest = (res, val) => {
    const v = parseInt(val) || 0;
    setRequests(prev => v > 0 ? { ...prev, [res]: v } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== res)));
    setError('');
  };

  const handleSend = () => {
    if (Object.keys(offers).length === 0 && Object.keys(requests).length === 0) {
      setError(t.diplomacy.enterOneResource);
      return;
    }
    for (const [res, amt] of Object.entries(offers)) {
      if ((player.resources[res] || 0) < amt) {
        setError(t.diplomacy.notEnoughResource.replace('{resource}', t.resources[res]));
        return;
      }
    }
    proposeAgreement('trade', recipientIndex, {
      offeredResources: { ...offers },
      requestedResources: { ...requests },
    });
    onSent();
  };

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft size={16} style={{ color: '#60a5fa' }} />
          <h3 className="text-white font-heading font-bold text-sm">{t.diplomacy.proposeTrade}</h3>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors"><X size={16} /></button>
      </div>

      {/* You offer */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-2">{lang === 'ko' ? `${player.countryName} 제공` : `${player.countryName} offers`}</p>
        <div className="space-y-1.5">
          {DIPLOMACY_RESOURCES.map(res => (
            <div key={res} className="flex items-center gap-2">
              <span className="text-xs w-16 text-gray-400">{RES_ICONS[res]} {t.resources[res]}</span>
              <input type="number" min="0" placeholder="0"
                value={offers[res] || ''}
                onChange={e => setOffer(res, e.target.value)}
                className="w-20 px-2 py-1 text-xs rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[9px] text-gray-600">{lang === 'ko' ? '보유' : 'Have'}: {player.resources[res] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* They offer */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-2">{lang === 'ko' ? `${recipient.countryName} 제공` : `${recipient.countryName} offers`}</p>
        <div className="space-y-1.5">
          {DIPLOMACY_RESOURCES.map(res => (
            <div key={res} className="flex items-center gap-2">
              <span className="text-xs w-16 text-gray-400">{RES_ICONS[res]} {t.resources[res]}</span>
              <input type="number" min="0" placeholder="0"
                value={requests[res] || ''}
                onChange={e => setRequest(res, e.target.value)}
                className="w-20 px-2 py-1 text-xs rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-green-500"
              />
              <span className="text-[9px] text-gray-600">{lang === 'ko' ? '보유' : 'Have'}: {recipient.resources[res] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-xs mb-3">⚠ {error}</p>}

      {/* Summary */}
      {(Object.keys(offers).length > 0 || Object.keys(requests).length > 0) && (
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-[9px] text-gray-500 mb-1">{lang === 'ko' ? '요약' : 'Summary'}</p>
          <div className="flex items-center gap-3 text-xs">
            <span style={{ color: player.colorHex }}>{player.abbreviation}</span>
            <span className="text-gray-400">
              {Object.entries(offers).map(([r, a]) => `${a} ${RES_ICONS[r]}`).join(', ') || '—'}
            </span>
            <span className="text-gray-600">↔</span>
            <span className="text-gray-400">
              {Object.entries(requests).map(([r, a]) => `${a} ${RES_ICONS[r]}`).join(', ') || '—'}
            </span>
            <span style={{ color: recipient.colorHex }}>{recipient.abbreviation}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSend}
          disabled={gameState.actionPoints <= 0}
          className="flex-1 py-2.5 rounded-xl text-sm font-heading font-bold transition-all disabled:opacity-40"
          style={{ background: 'rgba(96,165,250,0.25)', border: '1px solid rgba(96,165,250,0.4)', color: '#93c5fd' }}>
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