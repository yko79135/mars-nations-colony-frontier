import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { ChevronLeft, Users, ArrowRightLeft, Shield, Share2, Heart } from 'lucide-react';

export default function DiplomacyPanel() {
  const { t } = useLang();
  const { gameState, updateGameState, setScreen } = useGame();
  const [targetPlayer, setTargetPlayer] = useState(null);
  
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
    setTargetPlayer(null);
  };

  const diplomacyActions = [
    { key: 'trade', label: t.diplomacy.proposeTrade, icon: ArrowRightLeft },
    { key: 'alliance', label: t.diplomacy.formAlliance, icon: Users },
    { key: 'nonAggression', label: t.diplomacy.nonAggression, icon: Shield },
    { key: 'shareTech', label: t.diplomacy.shareTech, icon: Share2 },
    { key: 'offerHelp', label: t.diplomacy.offerHelp, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => setScreen('playing')} className="text-gray-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <Users size={20} className="text-blue-400" />
        <h2 className="text-white font-heading font-bold text-lg">{t.nav.diplomacy}</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-3">Nations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherPlayers.map(p => (
                <div key={p.index}
                  className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${targetPlayer === p.index ? 'border-blue-500 bg-blue-900/20' : 'border-gray-800 bg-gray-900/40 hover:bg-gray-900/60'}`}
                  onClick={() => setTargetPlayer(p.index)}>
                  <div className="w-8 h-8 rounded flex items-center justify-center text-lg" style={{ backgroundColor: p.colorHex + '20', border: `1px solid ${p.colorHex}` }}>
                    {p.emblem}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{p.countryName}</p>
                    <p className="text-gray-500 text-xs">{p.playerName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {targetPlayer !== null && (
            <div>
              <h3 className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-3">{t.general.availableActions}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {diplomacyActions.map(da => (
                  <button key={da.key} onClick={() => createAgreement(da.key)}
                    className="flex items-center gap-2 p-3 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg border border-gray-700 text-left transition-colors">
                    <da.icon size={16} className="text-blue-400" />
                    <span className="text-gray-200 text-sm">{da.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-3">{t.diplomacy.agreements}</h3>
            {player.agreements.length === 0 ? (
              <p className="text-gray-600 text-sm">{t.diplomacy.noAgreements}</p>
            ) : (
              <div className="space-y-2">
                {player.agreements.map((ag, i) => {
                  const otherIdx = ag.between.find(x => x !== gameState.currentPlayerIndex);
                  const other = gameState.players[otherIdx];
                  return (
                    <div key={i} className="flex items-center gap-3 bg-gray-900/60 rounded p-3 border border-gray-800">
                      <span>{other?.emblem}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm">{t.diplomacy[ag.type] || ag.type}</p>
                        <p className="text-gray-500 text-xs">{other?.countryName} · {t.general.round} {ag.round}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-green-900/30 text-green-400">{t.diplomacy.active}</span>
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