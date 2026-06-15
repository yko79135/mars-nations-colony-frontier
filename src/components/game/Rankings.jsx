import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { ChevronLeft, Trophy } from 'lucide-react';

const MEDAL = ['🥇', '🥈', '🥉'];

const CATEGORY_COLORS = {
  territory: '#60a5fa', science: '#a78bfa', population: '#22d3ee',
  livingConditions: '#4ade80', economic: '#fbbf24', cooperation: '#fb923c',
  sustainability: '#34d399', achievement: '#f472b6',
};

export default function Rankings() {
  const { t } = useLang();
  const { gameState, setScreen } = useGame();

  if (!gameState) return null;

  const scoreCategories = [
    { key: 'territory',        label: t.scoring.territory },
    { key: 'science',          label: t.scoring.science },
    { key: 'population',       label: t.scoring.populationScore },
    { key: 'livingConditions', label: t.scoring.livingConditions },
    { key: 'economic',         label: t.scoring.economic },
    { key: 'cooperation',      label: t.scoring.cooperation },
    { key: 'sustainability',   label: t.scoring.sustainability },
    { key: 'achievement',      label: t.scoring.achievement },
  ];

  const sorted = [...gameState.players].sort((a, b) => {
    const ta = Object.values(a.scores).reduce((s, v) => s + v, 0);
    const tb = Object.values(b.scores).reduce((s, v) => s + v, 0);
    return tb - ta;
  });
  const maxTotal = Object.values(sorted[0]?.scores || {}).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#04080f' }}>
      <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
        style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => setScreen('playing')} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <ChevronLeft size={18} />
        </button>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <Trophy size={14} className="text-yellow-400" />
        </div>
        <h2 className="text-white font-heading font-bold text-base">{t.nav.rankings}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-3">{t.scoring.total}</p>
            <div className="space-y-2">
              {sorted.map((player, rank) => {
                const total = Object.values(player.scores).reduce((s, v) => s + v, 0);
                const barPct = Math.round((total / maxTotal) * 100);
                const isFirst = rank === 0;
                return (
                  <div key={player.index} className="px-4 py-3 rounded-xl overflow-hidden relative"
                    style={{
                      background: isFirst ? player.colorHex + '12' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isFirst ? player.colorHex + '40' : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: isFirst ? `0 0 24px ${player.colorHex}18` : 'none',
                    }}>
                    <div className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ width: `${barPct}%`, background: player.colorHex + '08' }} />
                    <div className="relative flex items-center gap-3">
                      <span className="text-lg w-8 text-center shrink-0">{MEDAL[rank] || `${rank + 1}.`}</span>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: player.colorHex + '22', border: `2px solid ${player.colorHex}` }}>
                        {player.emblem}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm leading-tight" style={{ color: player.colorHex }}>{player.countryName}</p>
                        <p className="text-gray-500 text-[10px] leading-tight">{player.playerName}</p>
                      </div>
                      <span className="text-white font-mono font-bold text-xl">{total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scoreCategories.map(cat => {
              const catSorted = [...gameState.players].sort((a, b) => (b.scores[cat.key] || 0) - (a.scores[cat.key] || 0));
              const catMax = catSorted[0]?.scores[cat.key] || 1;
              const col = CATEGORY_COLORS[cat.key] || '#9ca3af';
              return (
                <div key={cat.key} className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[9px] uppercase tracking-widest mb-2 font-heading" style={{ color: col }}>{cat.label}</p>
                  {catSorted.map((player, i) => {
                    const score = player.scores[cat.key] || 0;
                    const pct = catMax > 0 ? (score / catMax) * 100 : 0;
                    return (
                      <div key={player.index} className="flex items-center gap-2 py-1">
                        <span className="text-gray-600 text-[10px] w-4 shrink-0">{i + 1}.</span>
                        <span className="text-sm shrink-0">{player.emblem}</span>
                        <div className="flex-1 flex items-center gap-1.5 min-w-0">
                          <span className="text-gray-400 text-[10px] w-10 truncate shrink-0">{player.abbreviation}</span>
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: col + 'aa' }} />
                          </div>
                        </div>
                        <span className="text-white text-xs font-mono font-bold shrink-0 w-6 text-right">{score}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}