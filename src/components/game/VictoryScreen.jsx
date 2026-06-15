import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Trophy, Medal, Star, Rocket } from 'lucide-react';

export default function VictoryScreen() {
  const { t } = useLang();
  const { gameState, setScreen, updateGameState } = useGame();
  
  if (!gameState) return null;

  const players = gameState.players;
  const sorted = [...players].sort((a, b) => {
    const totalA = Object.values(a.scores).reduce((s, v) => s + v, 0);
    const totalB = Object.values(b.scores).reduce((s, v) => s + v, 0);
    return totalB - totalA;
  });

  // Special awards
  const awards = [
    { label: t.victory.bestLiving, winner: [...players].sort((a, b) => b.scores.livingConditions - a.scores.livingConditions)[0] },
    { label: t.victory.greatestScience, winner: [...players].sort((a, b) => b.scores.science - a.scores.science)[0] },
    { label: t.victory.mostSustainable, winner: [...players].sort((a, b) => b.scores.sustainability - a.scores.sustainability)[0] },
    { label: t.victory.strongestEconomy, winner: [...players].sort((a, b) => b.scores.economic - a.scores.economic)[0] },
    { label: t.victory.bestPartner, winner: [...players].sort((a, b) => b.scores.cooperation - a.scores.cooperation)[0] },
    { label: t.victory.largestTerritory, winner: [...players].sort((a, b) => b.scores.territory - a.scores.territory)[0] },
  ];

  const handleNewGame = () => {
    updateGameState(null);
    setScreen('menu');
  };

  const handleContinue = () => {
    updateGameState(prev => ({
      ...prev,
      gameOver: false,
      settings: { ...prev.settings, gameLength: prev.settings.gameLength + 10 }
    }));
    setScreen('playing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-red-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-display font-bold text-white mb-2">{t.victory.gameOver}</h1>
          <p className="text-gray-400">{t.general.round} {gameState.currentRound}</p>
        </div>

        {/* Final rankings */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-heading font-bold mb-4">{t.victory.rankings}</h2>
          <div className="space-y-3">
            {sorted.map((player, rank) => {
              const total = Object.values(player.scores).reduce((s, v) => s + v, 0);
              return (
                <div
                  key={player.index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    rank === 0 ? 'bg-yellow-900/20 border border-yellow-700/40' : 'bg-gray-800/40'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    rank === 0 ? 'bg-yellow-600/40 text-yellow-300 text-xl' :
                    rank === 1 ? 'bg-gray-500/30 text-gray-300 text-lg' :
                    rank === 2 ? 'bg-amber-700/30 text-amber-500 text-lg' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : rank + 1}
                  </span>
                  <span className="text-2xl">{player.emblem}</span>
                  <div className="flex-1">
                    <p className="text-white font-heading font-semibold" style={{ color: player.colorHex }}>
                      {player.countryName}
                    </p>
                    <p className="text-gray-500 text-xs">{player.playerName}</p>
                  </div>
                  <span className="text-white font-bold text-2xl font-mono">{total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Awards */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-white font-heading font-bold mb-4 flex items-center gap-2">
            <Medal size={18} className="text-orange-400" />
            {t.victory.awards}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {awards.map((award, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-800/40 rounded-lg p-3">
                <Star size={14} className="text-yellow-400 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">{award.label}</p>
                  <p className="text-white text-sm font-medium">
                    {award.winner.emblem} {award.winner.countryName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleNewGame}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-heading font-semibold transition-colors flex items-center gap-2"
          >
            <Rocket size={18} />
            {t.victory.newGame}
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-semibold transition-colors"
          >
            {t.victory.continuePlay}
          </button>
        </div>
      </div>
    </div>
  );
}