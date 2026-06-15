import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Flag } from 'lucide-react';
import ResourceBar from './ResourceBar';
import TurnActions from './TurnActions';

export default function LeftSidebar({ onAction, actionMode }) {
  const { t } = useLang();
  const { gameState } = useGame();

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="w-64 bg-gray-900/95 border-r border-gray-700 flex flex-col h-full overflow-y-auto shrink-0">
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span className="font-heading">{t.general.round} {gameState.currentRound} / {gameState.settings.gameLength}</span>
          <span className="font-mono">{t.actions.actionPoints}: <span className="text-orange-400 font-bold">{gameState.actionPoints}</span></span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div className="bg-orange-500 rounded-full h-1.5 transition-all" style={{ width: `${Math.min(100, (gameState.currentRound / gameState.settings.gameLength) * 100)}%` }} />
        </div>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: gameState.settings.actionPointsPerTurn || 3 }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < gameState.actionPoints ? 'bg-orange-500 border-orange-400' : 'bg-gray-800 border-gray-600'}`} />
          ))}
        </div>
      </div>

      <div className="p-3 border-b border-gray-700/50">
        <div className="text-xs text-gray-500 mb-1.5">{t.general.currentPlayer}</div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: player.colorHex + '25', border: `2px solid ${player.colorHex}` }}>
            {player.emblem}
          </div>
          <div className="min-w-0">
            <p className="text-white font-heading font-semibold text-sm truncate">{player.countryName}</p>
            <p className="text-gray-400 text-xs truncate">{player.playerName}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <Flag size={10} />
          <span className="truncate">{player.colonyName}</span>
        </div>
        {gameState.currentRound <= (gameState.settings.protectionPeriod || 3) && (
          <div className="mt-1.5 px-2 py-0.5 bg-blue-900/30 border border-blue-700/40 rounded text-blue-300 text-xs">
            🛡️ {t.general.protectionDesc.replace('{n}', gameState.settings.protectionPeriod || 3)}
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs">{t.scoring.livingConditions}</span>
          <span className={`text-xs font-bold ${(player.scores?.livingConditions || 0) > 60 ? 'text-green-400' : (player.scores?.livingConditions || 0) > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
            {player.scores?.livingConditions || 0}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div className="rounded-full h-1.5 transition-all" style={{
            width: `${Math.min(100, player.scores?.livingConditions || 0)}%`,
            backgroundColor: (player.scores?.livingConditions || 0) > 60 ? '#22c55e' : (player.scores?.livingConditions || 0) > 30 ? '#f59e0b' : '#ef4444',
          }} />
        </div>
      </div>

      <ResourceBar />

      <div className="flex-1">
        <TurnActions onAction={onAction} actionMode={actionMode} />
      </div>
    </div>
  );
}