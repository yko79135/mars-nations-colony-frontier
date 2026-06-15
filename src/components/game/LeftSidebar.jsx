import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import ResourceBar from './ResourceBar';
import TurnActions from './TurnActions';

export default function LeftSidebar({ onAction, actionMode }) {
  const { t, lang } = useLang();
  const { gameState } = useGame();

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const roundProgress = Math.min(100, (gameState.currentRound / gameState.settings.gameLength) * 100);
  const lc = player.scores?.livingConditions || 0;
  const lcColor = lc > 60 ? '#4ade80' : lc > 30 ? '#fbbf24' : '#f87171';

  return (
    <div className="w-64 flex flex-col h-full overflow-y-auto shrink-0"
      style={{ background: 'rgba(8,12,25,0.97)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Round / AP header */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-500 font-heading uppercase tracking-widest">
            {lang === 'ko' ? '라운드' : 'Round'}
          </span>
          <span className="text-xs font-heading font-bold text-gray-300">
            {gameState.currentRound}
            <span className="text-gray-600 font-normal"> / {gameState.settings.gameLength}</span>
          </span>
        </div>
        {/* Round progress bar */}
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${roundProgress}%`, background: 'linear-gradient(90deg, #ea580c, #f97316)' }} />
        </div>
      </div>

      {/* Current player card */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">
          {t.general.currentPlayer}
        </div>
        <div className="flex items-center gap-3">
          {/* Nation emblem */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg"
            style={{
              background: player.colorHex + '22',
              border: `2px solid ${player.colorHex}`,
              boxShadow: `0 0 12px ${player.colorHex}33`,
            }}>
            {player.emblem}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-heading font-bold text-sm truncate leading-tight">{player.countryName}</p>
            <p className="text-gray-500 text-[10px] truncate leading-tight">{player.playerName}</p>
            <p className="text-[10px] truncate leading-tight mt-0.5" style={{ color: player.colorHex + 'cc' }}>
              🏴 {player.colonyName}
            </p>
          </div>
        </div>

        {/* Living conditions */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-gray-600">{lang === 'ko' ? '생활 환경' : 'Living Conditions'}</span>
            <span className="text-[10px] font-bold" style={{ color: lcColor }}>{lc}</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, lc)}%`, backgroundColor: lcColor }} />
          </div>
        </div>

        {/* Protection period notice */}
        {gameState.currentRound <= (gameState.settings.protectionPeriod || 3) && (
          <div className="mt-2 px-2 py-1 rounded-lg text-[9px] text-blue-300"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
            🛡️ {t.general.protectionDesc.replace('{n}', gameState.settings.protectionPeriod || 3)}
          </div>
        )}
      </div>

      {/* Resource bar */}
      <ResourceBar />

      {/* Turn actions */}
      <div className="flex-1">
        <TurnActions onAction={onAction} actionMode={actionMode} />
      </div>
    </div>
  );
}