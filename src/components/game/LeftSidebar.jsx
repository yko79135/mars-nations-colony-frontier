import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Zap, Droplets, Wheat, Gem, FlaskConical, Coins, Users, Smile, Wind, Flag, SkipForward } from 'lucide-react';

const RESOURCE_ICONS = {
  energy: { icon: Zap, color: 'text-yellow-400' },
  water: { icon: Droplets, color: 'text-blue-400' },
  food: { icon: Wheat, color: 'text-green-400' },
  minerals: { icon: Gem, color: 'text-amber-500' },
  science: { icon: FlaskConical, color: 'text-purple-400' },
  credits: { icon: Coins, color: 'text-emerald-400' },
  population: { icon: Users, color: 'text-cyan-400' },
  morale: { icon: Smile, color: 'text-orange-400' },
  oxygen: { icon: Wind, color: 'text-sky-300' },
};

export default function LeftSidebar({ onAction }) {
  const { t } = useLang();
  const { gameState, endTurn } = useGame();
  
  if (!gameState) return null;
  
  const player = gameState.players[gameState.currentPlayerIndex];
  const resources = player.resources;

  return (
    <div className="w-64 bg-gray-900/95 border-r border-gray-700 flex flex-col h-full overflow-y-auto shrink-0">
      {/* Round info */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{t.general.round} {gameState.currentRound} / {gameState.settings.gameLength}</span>
          <span>{t.actions.actionPoints}: <span className="text-orange-400 font-bold">{gameState.actionPoints}</span></span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1.5">
          <div 
            className="bg-orange-500 rounded-full h-1.5 transition-all"
            style={{ width: `${(gameState.currentRound / gameState.settings.gameLength) * 100}%` }}
          />
        </div>
      </div>

      {/* Current player */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="text-xs text-gray-500 mb-1">{t.general.currentPlayer}</div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: player.colorHex + '30', borderColor: player.colorHex, borderWidth: 2 }}>
            {player.emblem}
          </div>
          <div>
            <p className="text-white font-heading font-semibold text-sm">{player.countryName}</p>
            <p className="text-gray-400 text-xs">{player.playerName}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <Flag size={10} />
          <span>{t.general.capital}: {player.colonyName}</span>
        </div>
        {gameState.currentRound <= (gameState.settings.protectionPeriod || 4) && (
          <div className="mt-1.5 px-2 py-0.5 bg-blue-900/30 border border-blue-700/40 rounded text-blue-300 text-xs">
            🛡️ {t.general.protectionDesc.replace('{n}', gameState.settings.protectionPeriod || 4)}
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="grid grid-cols-1 gap-1.5">
          {Object.entries(RESOURCE_ICONS).map(([key, { icon: Icon, color }]) => (
            <div key={key} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-1.5">
                <Icon size={13} className={color} />
                <span className="text-gray-300 text-xs">{t.resources[key]}</span>
              </div>
              <span className="text-white text-xs font-mono font-medium">{resources[key] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Living conditions */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">{t.living.score}</span>
          <span className="text-orange-400 font-bold text-sm">{player.scores?.livingConditions || 0}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
          <div 
            className="rounded-full h-1.5 transition-all"
            style={{ 
              width: `${Math.min(100, player.scores?.livingConditions || 0)}%`,
              backgroundColor: (player.scores?.livingConditions || 0) > 60 ? '#22c55e' : (player.scores?.livingConditions || 0) > 30 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 flex-1">
        <div className="text-xs text-gray-500 mb-2">{t.actions.selectAction}</div>
        <div className="space-y-1.5">
          {[
            { key: 'explore', label: t.actions.explore, cost: '1 AP', emoji: '🔭' },
            { key: 'claim', label: t.actions.claim, cost: '1 AP + 2💰 + 1⚡', emoji: '🏴' },
            { key: 'build', label: t.actions.build, cost: '1 AP + resources', emoji: '🏗️' },
            { key: 'research', label: t.actions.research, cost: '1 AP + science', emoji: '🔬' },
          ].map(action => (
            <button
              key={action.key}
              onClick={() => onAction(action.key)}
              disabled={gameState.actionPoints <= 0}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800/60 hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed rounded text-left transition-colors group"
            >
              <span className="text-sm">{action.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-xs font-medium">{action.label}</p>
                <p className="text-gray-500 text-[10px]">{action.cost}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* End turn */}
      <div className="p-3 border-t border-gray-700/50">
        <button
          onClick={endTurn}
          className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <SkipForward size={16} />
          {t.actions.endTurn}
        </button>
      </div>
    </div>
  );
}