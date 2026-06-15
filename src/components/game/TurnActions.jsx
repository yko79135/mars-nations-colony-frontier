import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { getHexNeighbors } from '@/lib/gameData';
import { Search, MapPin, Hammer, FlaskConical, ChevronRight } from 'lucide-react';

const MAP_ACTIONS = [
  { key: 'explore',  emoji: '🔭', icon: Search,      apCost: 1, requiresHexTarget: true,  colorClass: 'hover:border-blue-500/60 hover:bg-blue-900/20', activeClass: 'border-blue-500/70 bg-blue-900/25 text-blue-200' },
  { key: 'claim',    emoji: '🏴', icon: MapPin,      apCost: 1, requiresHexTarget: true,  colorClass: 'hover:border-green-500/60 hover:bg-green-900/20', activeClass: 'border-green-500/70 bg-green-900/25 text-green-200' },
  { key: 'build',    emoji: '🏗️', icon: Hammer,      apCost: 1, requiresHexTarget: true,  colorClass: 'hover:border-amber-500/60 hover:bg-amber-900/20', activeClass: 'border-amber-500/70 bg-amber-900/25 text-amber-200' },
];
const NATION_ACTIONS = [
  { key: 'research', emoji: '🔬', icon: FlaskConical, apCost: 1, requiresHexTarget: false, colorClass: 'hover:border-purple-500/60 hover:bg-purple-900/20', activeClass: 'border-purple-500/70 bg-purple-900/25 text-purple-200' },
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
  if (actionKey === 'build') return Object.values(map.hexes).some(h => h.owner === currentPlayerIndex);
  return true;
}

function ActionButton({ action, isActive, ap, gameState, onAction, lang }) {
  const { t } = useLang();
  const noAP = ap <= 0;
  const noTargets = action.requiresHexTarget && !noAP && !checkHasValidTargets(action.key, gameState);
  const disabled = noAP && action.apCost > 0;
  const cannotUse = disabled || noTargets;

  const label = t.actions[action.key];
  const sublabel = lang === 'ko'
    ? (action.requiresHexTarget ? '지도에서 선택' : '패널 열기')
    : (action.requiresHexTarget ? 'Select on map' : 'Opens panel');

  return (
    <div className="relative group">
      <button onClick={() => onAction(action.key)} disabled={cannotUse}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all border text-sm ${
          isActive
            ? action.activeClass + ' shadow-inner'
            : cannotUse
              ? 'border-white/5 bg-white/3 text-gray-600 cursor-not-allowed opacity-50'
              : `border-white/8 bg-white/4 text-gray-300 ${action.colorClass}`
        }`}
        style={{ background: isActive ? undefined : cannotUse ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)' }}>
        <span className="text-base shrink-0">{action.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium leading-tight">{label}</p>
          <p className="text-[9px] text-gray-600 leading-tight mt-0.5">{sublabel} · {action.apCost} AP</p>
        </div>
        {isActive
          ? <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
          : !cannotUse && <ChevronRight size={12} className="text-gray-600 shrink-0" />
        }
      </button>
      {noTargets && (
        <div className="hidden group-hover:block absolute left-full ml-2 top-0 z-20 w-44 rounded-lg p-2 text-[10px] text-gray-300 shadow-xl pointer-events-none"
          style={{ background: 'rgba(15,20,35,0.97)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {t.actions['noValid' + action.key.charAt(0).toUpperCase() + action.key.slice(1)] || t.actions.noValidTargets}
        </div>
      )}
    </div>
  );
}

export default function TurnActions({ onAction, actionMode }) {
  const { t, lang } = useLang();
  const { gameState, endTurn } = useGame();

  if (!gameState) return null;
  const ap = gameState.actionPoints;

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Map Actions group */}
      <div>
        <div className="text-[9px] text-gray-600 font-heading uppercase tracking-widest mb-1.5 px-1">
          {lang === 'ko' ? '지도 행동' : 'Map Actions'}
        </div>
        <div className="flex flex-col gap-1">
          {MAP_ACTIONS.map(action => (
            <ActionButton key={action.key} action={action} isActive={actionMode === action.key}
              ap={ap} gameState={gameState} onAction={onAction} lang={lang} />
          ))}
        </div>
      </div>

      {/* Nation Actions group */}
      <div>
        <div className="text-[9px] text-gray-600 font-heading uppercase tracking-widest mb-1.5 px-1">
          {lang === 'ko' ? '국가 행동' : 'Nation Actions'}
        </div>
        <div className="flex flex-col gap-1">
          {NATION_ACTIONS.map(action => (
            <ActionButton key={action.key} action={action} isActive={actionMode === action.key}
              ap={ap} gameState={gameState} onAction={onAction} lang={lang} />
          ))}
        </div>
      </div>

      {/* End Turn — prominent */}
      <button onClick={endTurn}
        className="w-full py-2.5 text-white rounded-xl font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-900/40"
        style={{
          background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
          border: '1px solid rgba(251,146,60,0.4)',
        }}>
        ⏭ {t.actions.endTurn}
      </button>

      {/* AP indicator */}
      <div className="flex items-center gap-1 justify-center">
        {Array.from({ length: gameState.settings.actionPointsPerTurn || 3 }).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${
            i < ap ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]' : 'bg-gray-800 border border-gray-700'
          }`} />
        ))}
        <span className="text-[9px] text-gray-600 ml-1">{ap}/{gameState.settings.actionPointsPerTurn || 3} AP</span>
      </div>
    </div>
  );
}