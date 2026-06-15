import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { getHexNeighbors } from '@/lib/gameData';
import { Search, MapPin, Hammer, FlaskConical, SkipForward } from 'lucide-react';

// Map actions require hex selection. Research does NOT.
const ACTIONS = [
  { key: 'explore',  emoji: '🔭', icon: Search,       apCost: 1, requiresHexTarget: true  },
  { key: 'claim',    emoji: '🏴', icon: MapPin,       apCost: 1, requiresHexTarget: true  },
  { key: 'build',    emoji: '🏗️', icon: Hammer,       apCost: 1, requiresHexTarget: true  },
  { key: 'research', emoji: '🔬', icon: FlaskConical, apCost: 1, requiresHexTarget: false },
];

function checkHasValidTargets(actionKey, gameState) {
  if (!gameState) return true;
  const { map, players, currentPlayerIndex } = gameState;
  const player = players[currentPlayerIndex];
  const hasLongRange = player.technologies.includes('longRangeRovers');
  const range = hasLongRange ? 2 : 1;

  if (actionKey === 'explore') {
    return Object.values(map.hexes).some(hex => {
      if (hex.explored) return false;
      if (range >= 2) return Object.values(map.hexes).some(h => h.owner === currentPlayerIndex && Math.max(Math.abs(h.q - hex.q), Math.abs(h.r - hex.r), Math.abs((-h.q - h.r) - (-hex.q - hex.r))) <= range);
      return getHexNeighbors(hex.q, hex.r).some(n => { const nk = `${n.q},${n.r}`; return map.hexes[nk]?.owner === currentPlayerIndex; });
    });
  }
  if (actionKey === 'claim') {
    return Object.values(map.hexes).some(hex => {
      if (!hex.explored || hex.owner !== null) return false;
      return getHexNeighbors(hex.q, hex.r).some(n => { const nk = `${n.q},${n.r}`; return map.hexes[nk]?.owner === currentPlayerIndex; });
    });
  }
  if (actionKey === 'build') {
    return Object.values(map.hexes).some(h => h.owner === currentPlayerIndex);
  }
  return true;
}

export default function TurnActions({ onAction, actionMode }) {
  const { t } = useLang();
  const { gameState, endTurn } = useGame();

  if (!gameState) return null;
  const ap = gameState.actionPoints;

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="text-xs text-gray-500 font-heading uppercase tracking-wider mb-1">{t.actions.selectAction}</div>
      {ACTIONS.map(action => {
        const isActive = actionMode === action.key;
        const noAP = ap <= 0;
        const noTargets = action.requiresHexTarget && !noAP && !checkHasValidTargets(action.key, gameState);
        const disabled = noAP && action.apCost > 0;
        const tooltipReason = noTargets ? (t.actions['noValid' + action.key.charAt(0).toUpperCase() + action.key.slice(1)] || t.actions.noValidTargets) : '';

        return (
          <div key={action.key} className="relative group">
            <button onClick={() => onAction(action.key)} disabled={disabled}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors border ${
                isActive ? 'bg-orange-600/30 border-orange-500/60 text-orange-200'
                : disabled ? 'bg-gray-800/40 border-gray-700/40 text-gray-600 cursor-not-allowed'
                : noTargets ? 'bg-gray-800/40 border-gray-700/30 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800/60 border-gray-700/40 text-gray-300 hover:bg-gray-700/60 hover:text-white'
              }`}>
              <span className="text-sm">{action.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{t.actions[action.key]}</p>
                <p className="text-[10px] text-gray-500">
                  {action.requiresHexTarget ? 'Select hex' : 'Opens panel'} · {action.apCost} AP
                </p>
              </div>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />}
            </button>
            {noTargets && tooltipReason && (
              <div className="hidden group-hover:block absolute left-full ml-2 top-0 z-20 w-48 bg-gray-800 border border-gray-600 rounded p-2 text-[10px] text-gray-300 shadow-lg pointer-events-none">
                {tooltipReason}
              </div>
            )}
          </div>
        );
      })}
      <button onClick={endTurn} className="w-full mt-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-semibold text-sm transition-colors flex items-center justify-center gap-2">
        <SkipForward size={15} />
        {t.actions.endTurn}
      </button>
    </div>
  );
}