import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { AlertTriangle, Sparkles } from 'lucide-react';

export default function EventModal() {
  const { t } = useLang();
  const { gameState, dismissEvent } = useGame();
  
  if (!gameState?.activeEvent) return null;
  
  const event = gameState.activeEvent;
  const isPositive = event.type === 'positive';
  const targetPlayer = event.targetPlayer !== undefined ? gameState.players[event.targetPlayer] : null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-xl border p-6 ${
        isPositive 
          ? 'bg-gray-900 border-green-700/50' 
          : 'bg-gray-900 border-red-700/50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          {isPositive ? (
            <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
              <Sparkles size={20} className="text-green-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
          )}
          <h3 className="text-white font-heading font-bold text-lg">
            {t.events[event.id] || event.id}
          </h3>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          {t.events[event.id + 'Desc'] || ''}
        </p>

        {targetPlayer && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
            <span>Affects:</span>
            <span className="font-medium" style={{ color: targetPlayer.colorHex }}>
              {targetPlayer.emblem} {targetPlayer.countryName}
            </span>
          </div>
        )}

        {event.scope === 'all' && (
          <div className="text-xs text-gray-400 mb-3">
            ⚠️ Affects all nations
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(event.effects).map(([res, amt]) => (
            <span key={res} className={`px-2 py-1 rounded text-xs font-medium ${
              amt > 0 ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
            }`}>
              {t.resources[res] || res}: {amt > 0 ? '+' : ''}{amt}
            </span>
          ))}
        </div>

        <button
          onClick={dismissEvent}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {t.events.dismiss}
        </button>
      </div>
    </div>
  );
}