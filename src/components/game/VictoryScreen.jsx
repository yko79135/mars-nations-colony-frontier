import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Trophy, Medal, BookOpen, Rocket, RotateCcw } from 'lucide-react';
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
  livingConditions: 'Living', economic: 'Economy', cooperation: 'Coop',
  sustainability: 'Sustain', achievement: 'Achieve',
};

const AWARD_ICONS = ['🌡️', '🔬', '🌿', '💰', '🤝', '🗺️'];

export default function VictoryScreen() {
  const { t, lang } = useLang();
  const { gameState, setScreen, updateGameState } = useGame();

  if (!gameState) return null;

  const players = gameState.players;
  const gradeMode = gameState.settings?.gradeMode || 'standard';
  const modeData = GRADE_MODES[gradeMode];

  const sorted = [...players].sort((a, b) => {
    const ta = Object.values(a.scores).reduce((s, v) => s + (v || 0), 0);
    const tb = Object.values(b.scores).reduce((s, v) => s + (v || 0), 0);
    return tb - ta;
  });
  const winner = sorted[0];

  const awards = [
    { label: t.victory.bestLiving,       winner: [...players].sort((a, b) => (b.scores.livingConditions || 0) - (a.scores.livingConditions || 0))[0] },
    { label: t.victory.greatestScience,  winner: [...players].sort((a, b) => (b.scores.science || 0) - (a.scores.science || 0))[0] },
    { label: t.victory.mostSustainable,  winner: [...players].sort((a, b) => (b.scores.sustainability || 0) - (a.scores.sustainability || 0))[0] },
    { label: t.victory.strongestEconomy, winner: [...players].sort((a, b) => (b.scores.economic || 0) - (a.scores.economic || 0))[0] },
    { label: t.victory.bestPartner,      winner: [...players].sort((a, b) => (b.scores.cooperation || 0) - (a.scores.cooperation || 0))[0] },
    { label: t.victory.largestTerritory, winner: [...players].sort((a, b) => (b.scores.territory || 0) - (a.scores.territory || 0))[0] },
  ];

  const handleNewGame = () => { updateGameState(null); setScreen('menu'); };
  const handleContinue = () => {
    updateGameState(prev => ({ ...prev, gameOver: false, settings: { ...prev.settings, gameLength: prev.settings.gameLength + 10 } }));
    setScreen('playing');
  };

  const questions = REFLECTION_QUESTIONS[lang] || REFLECTION_QUESTIONS.en;

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'linear-gradient(180deg, #04080f 0%, #0d0a1a 40%, #160810 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="text-center rounded-2xl py-8 px-6"
          style={{
            background: winner ? `linear-gradient(135deg, ${winner.colorHex}14, rgba(4,8,15,0.98))` : 'rgba(8,12,25,0.98)',
            border: `1px solid ${winner?.colorHex || '#ffffff'}30`,
            boxShadow: winner ? `0 0 60px ${winner.colorHex}20` : 'none',
          }}>
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">{t.victory.gameOver}</h1>
          <p className="text-gray-500 text-sm mb-4">
            {lang === 'ko' ? modeData?.labelKo : modeData?.label} · {t.general.round} {gameState.currentRound}
          </p>
          {winner && (
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{ background: winner.colorHex + '18', border: `1px solid ${winner.colorHex}40` }}>
              <span className="text-4xl">{winner.emblem}</span>
              <div className="text-left">
                <p className="font-heading font-bold text-base leading-tight" style={{ color: winner.colorHex }}>{winner.countryName}</p>
                <p className="text-gray-400 text-xs">{winner.playerName}</p>
              </div>
              <span className="text-2xl font-mono font-bold text-white ml-2">
                {Object.values(winner.scores).reduce((s, v) => s + (v || 0), 0)}
              </span>
            </div>
          )}
        </div>

        {/* Rankings */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,12,25,0.98)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-white font-heading font-bold text-sm">{t.victory.rankings}</h2>
          </div>
          <div className="p-4 space-y-2">
            {sorted.map((player, rank) => {
              const total = Object.values(player.scores).reduce((s, v) => s + (v || 0), 0);
              return (
                <div key={player.index} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{
                    background: rank === 0 ? player.colorHex + '14' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${rank === 0 ? player.colorHex + '35' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  <span className="text-xl w-8 text-center shrink-0">{['🥇','🥈','🥉'][rank] || `${rank+1}.`}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: player.colorHex + '22', border: `2px solid ${player.colorHex}` }}>{player.emblem}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm leading-tight" style={{ color: player.colorHex }}>{player.countryName}</p>
                    <p className="text-gray-600 text-[10px]">{player.playerName}</p>
                  </div>
                  <div className="hidden sm:flex gap-1 flex-wrap justify-end max-w-[140px]">
                    {Object.entries(player.scores).map(([k, v]) => (
                      <span key={k} className="text-[9px] font-mono px-1.5 py-0.5 rounded text-gray-500"
                        style={{ background: 'rgba(255,255,255,0.06)' }} title={SCORE_LABELS_EN[k]}>{v || 0}</span>
                    ))}
                  </div>
                  <span className="text-white font-mono font-bold text-lg ml-1 shrink-0">{total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Awards */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,12,25,0.98)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <Medal size={14} className="text-orange-400" />
            <h2 className="text-white font-heading font-bold text-sm">{t.victory.awards}</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {awards.map((award, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xl shrink-0">{AWARD_ICONS[i] || '⭐'}</span>
                <div className="min-w-0">
                  <p className="text-gray-500 text-[10px] leading-tight">{award.label}</p>
                  <p className="text-white text-xs font-medium leading-tight truncate">{award.winner?.emblem} {award.winner?.countryName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discussion questions */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,12,25,0.98)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <BookOpen size={14} className="text-blue-400" />
            <h2 className="text-white font-heading font-bold text-sm">{lang === 'ko' ? '토론 질문' : 'Discussion Questions'}</h2>
          </div>
          <div className="p-4">
            <ol className="space-y-2.5">
              {questions.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-orange-500 font-heading font-bold shrink-0 w-5">{i + 1}.</span>
                  <span className="text-gray-300 leading-relaxed">{q}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pb-4">
          <button onClick={handleNewGame}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-sm text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <RotateCcw size={15} /> {t.victory.newGame}
          </button>
          <button onClick={handleContinue}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-sm text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', border: '1px solid rgba(251,146,60,0.4)', boxShadow: '0 4px 16px rgba(234,88,12,0.35)' }}>
            <Rocket size={15} /> {t.victory.continuePlay}
          </button>
        </div>

      </div>
    </div>
  );
}