import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { ChevronLeft, Trophy, Medal } from 'lucide-react';

export default function Rankings() {
  const { t } = useLang();
  const { gameState, setScreen } = useGame();
  
  if (!gameState) return null;

  const scoreCategories = [
    { key: 'territory', label: t.scoring.territory },
    { key: 'science', label: t.scoring.science },
    { key: 'population', label: t.scoring.populationScore },
    { key: 'livingConditions', label: t.scoring.livingConditions },
    { key: 'economic', label: t.scoring.economic },
    { key: 'cooperation', label: t.scoring.cooperation },
    { key: 'sustainability', label: t.scoring.sustainability },
    { key: 'achievement', label: t.scoring.achievement },
  ];

  const playersTotalSorted = [...gameState.players].sort((a, b) => {
    const totalA = Object.values(a.scores).reduce((sum, v) => sum + v, 0);
    const totalB = Object.values(b.scores).reduce((sum, v) => sum + v, 0);
    return totalB - totalA;
  });

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => setScreen('playing')} className="text-gray-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <Trophy size={20} className="text-yellow-400" />
        <h2 className="text-white font-heading font-bold text-lg">{t.nav.rankings}</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Overall ranking */}
          <div className="mb-8">
            <h3 className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-3">{t.scoring.total}</h3>
            <div className="space-y-2">
              {playersTotalSorted.map((player, rank) => {
                const total = Object.values(player.scores).reduce((sum, v) => sum + v, 0);
                return (
                  <div
                    key={player.index}
                    className="flex items-center gap-3 bg-gray-900/60 rounded-lg p-3 border border-gray-800"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      rank === 0 ? 'bg-yellow-600/30 text-yellow-400' :
                      rank === 1 ? 'bg-gray-500/30 text-gray-300' :
                      rank === 2 ? 'bg-amber-700/30 text-amber-500' :
                      'bg-gray-800 text-gray-500'
                    }`}>
                      {rank + 1}
                    </span>
                    <span className="text-lg">{player.emblem}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm" style={{ color: player.colorHex }}>
                        {player.countryName}
                      </p>
                      <p className="text-gray-500 text-xs">{player.playerName}</p>
                    </div>
                    <span className="text-white font-bold text-lg font-mono">{total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoreCategories.map(cat => {
              const sorted = [...gameState.players].sort((a, b) => (b.scores[cat.key] || 0) - (a.scores[cat.key] || 0));
              return (
                <div key={cat.key} className="bg-gray-900/40 rounded-lg border border-gray-800 p-3">
                  <h4 className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-2">{cat.label}</h4>
                  {sorted.map((player, i) => (
                    <div key={player.index} className="flex items-center gap-2 py-1">
                      <span className="text-gray-500 text-xs w-4">{i + 1}.</span>
                      <span className="text-xs">{player.emblem}</span>
                      <span className="text-gray-300 text-xs flex-1">{player.abbreviation}</span>
                      <span className="text-white text-xs font-mono">{player.scores[cat.key] || 0}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}