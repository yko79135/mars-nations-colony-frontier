import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Trophy, Medal, Star, Rocket, BookOpen } from 'lucide-react';
import { GRADE_MODES } from '@/lib/gameModes';

const REFLECTION_QUESTIONS = {
  en: [
    "Which resource was most difficult to manage?",
    "When was cooperation more useful than competition?",
    "Which technology had the greatest effect on your colony?",
    "Did rapid expansion improve or weaken your colony?",
    "What would you do differently next time?",
  ],
  ko: [
    "어떤 자원이 관리하기 가장 어려웠나요?",
    "협력이 경쟁보다 더 유용했던 때는 언제였나요?",
    "어떤 기술이 식민지에 가장 큰 영향을 미쳤나요?",
    "빠른 확장이 식민지를 강화했나요, 아니면 약화시켰나요?",
    "다음에는 무엇을 다르게 하시겠습니까?",
  ],
};

const SCORE_LABELS_EN = {
  territory: 'Territory', science: 'Science', population: 'Population',
  livingConditions: 'Living', economic: 'Economy', cooperation: 'Cooperation',
  sustainability: 'Sustainability', achievement: 'Achievement',
};

export default function VictoryScreen() {
  const { t, lang } = useLang();
  const { gameState, setScreen, updateGameState } = useGame();

  if (!gameState) return null;

  const players = gameState.players;
  const gradeMode = gameState.settings?.gradeMode || 'standard';
  const modeData = GRADE_MODES[gradeMode];

  const sorted = [...players].sort((a, b) => {
    const totalA = Object.values(a.scores).reduce((s, v) => s + (v || 0), 0);
    const totalB = Object.values(b.scores).reduce((s, v) => s + (v || 0), 0);
    return totalB - totalA;
  });

  const awards = [
    { label: t.victory.bestLiving, winner: [...players].sort((a, b) => (b.scores.livingConditions || 0) - (a.scores.livingConditions || 0))[0] },
    { label: t.victory.greatestScience, winner: [...players].sort((a, b) => (b.scores.science || 0) - (a.scores.science || 0))[0] },
    { label: t.victory.mostSustainable, winner: [...players].sort((a, b) => (b.scores.sustainability || 0) - (a.scores.sustainability || 0))[0] },
    { label: t.victory.strongestEconomy, winner: [...players].sort((a, b) => (b.scores.economic || 0) - (a.scores.economic || 0))[0] },
    { label: t.victory.bestPartner, winner: [...players].sort((a, b) => (b.scores.cooperation || 0) - (a.scores.cooperation || 0))[0] },
    { label: t.victory.largestTerritory, winner: [...players].sort((a, b) => (b.scores.territory || 0) - (a.scores.territory || 0))[0] },
  ];

  const handleNewGame = () => {
    updateGameState(null);
    setScreen('menu');
  };

  const handleContinue = () => {
    updateGameState(prev => ({
      ...prev,
      gameOver: false,
      settings: { ...prev.settings, gameLength: prev.settings.gameLength + 10 },
    }));
    setScreen('playing');
  };

  const questions = REFLECTION_QUESTIONS[lang] || REFLECTION_QUESTIONS.en;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-950 via-gray-900 to-red-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Trophy size={44} className="text-yellow-400 mx-auto mb-3" />
          <h1 className="text-3xl font-display font-bold text-white mb-1">{t.victory.gameOver}</h1>
          <p className="text-gray-400 text-sm">
            {lang === 'ko' ? modeData?.labelKo : modeData?.label} · {t.general.round} {gameState.currentRound}
          </p>
        </div>

        {/* Final rankings */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5 mb-4">
          <h2 className="text-white font-heading font-bold mb-4">{t.victory.rankings}</h2>
          <div className="space-y-2">
            {sorted.map((player, rank) => {
              const total = Object.values(player.scores).reduce((s, v) => s + (v || 0), 0);
              return (
                <div
                  key={player.index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    rank === 0 ? 'bg-yellow-900/20 border border-yellow-700/40' :
                    rank === 1 ? 'bg-gray-700/20 border border-gray-600/30' :
                    rank === 2 ? 'bg-amber-900/10 border border-amber-800/20' : 'bg-gray-800/30'
                  }`}
                >
                  <span className="text-xl w-8 text-center">
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`}
                  </span>
                  <span className="text-2xl">{player.emblem}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm" style={{ color: player.colorHex }}>
                      {player.countryName}
                    </p>
                    <p className="text-gray-500 text-xs">{player.playerName}</p>
                  </div>
                  {/* Score breakdown */}
                  <div className="hidden sm:flex gap-1 text-[10px] text-gray-500 font-mono">
                    {Object.entries(player.scores).map(([k, v]) => (
                      <span key={k} className="px-1 bg-gray-800/60 rounded" title={SCORE_LABELS_EN[k]}>{v || 0}</span>
                    ))}
                  </div>
                  <span className="text-white font-bold text-xl font-mono ml-1">{total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special awards */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5 mb-4">
          <h2 className="text-white font-heading font-bold mb-3 flex items-center gap-2">
            <Medal size={16} className="text-orange-400" />
            {t.victory.awards}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {awards.map((award, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-800/40 rounded-lg p-2.5">
                <Star size={13} className="text-yellow-400 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">{award.label}</p>
                  <p className="text-white text-sm font-medium">
                    {award.winner?.emblem} {award.winner?.countryName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection questions */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="text-white font-heading font-bold mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-blue-400" />
            {lang === 'ko' ? '토론 질문' : 'Discussion Questions'}
          </h2>
          <ol className="space-y-2">
            {questions.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-orange-400 font-bold shrink-0">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleNewGame}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-heading font-semibold transition-colors flex items-center gap-2"
          >
            <Rocket size={16} />
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