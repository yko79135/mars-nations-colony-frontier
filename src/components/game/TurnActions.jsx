import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Search, MapPin, Hammer, FlaskConical, SkipForward } from 'lucide-react';

const ACTIONS = [
  { key: 'explore', emoji: '🔭', icon: Search,       apCost: 1, descKey: 'explore' },
  { key: 'claim',   emoji: '🏴', icon: MapPin,       apCost: 1, descKey: 'claim',    extraCost: '2💰+1⚡' },
  { key: 'build',   emoji: '🏗️', icon: Hammer,       apCost: 1, descKey: 'build',    extraCost: '+resources' },
  { key: 'research',emoji: '🔬', icon: FlaskConical, apCost: 1, descKey: 'research', extraCost: '+science' },
];

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
        const disabled = ap <= 0;
        return (
          <button key={action.key} onClick={() => onAction(action.key)} disabled={disabled}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors border ${isActive ? 'bg-orange-600/30 border-orange-500/60 text-orange-200' : disabled ? 'bg-gray-800/40 border-gray-700/40 text-gray-600 cursor-not-allowed' : 'bg-gray-800/60 border-gray-700/40 text-gray-300 hover:bg-gray-700/60 hover:text-white'}`}>
            <span className="text-sm">{action.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{t.actions[action.descKey]}</p>
              <p className="text-[10px] text-gray-500">{action.apCost} AP{action.extraCost ? ` + ${action.extraCost}` : ''}</p>
            </div>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" />}
          </button>
        );
      })}
      <button onClick={endTurn} className="w-full mt-2 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-semibold text-sm transition-colors flex items-center justify-center gap-2">
        <SkipForward size={15} />
        {t.actions.endTurn}
      </button>
    </div>
  );
}