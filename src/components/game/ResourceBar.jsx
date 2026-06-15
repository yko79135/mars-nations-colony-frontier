import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { calculateResourceProduction, calculateMaintenance } from '@/lib/gameData';
import { getActiveResources } from '@/lib/gameModes';
import { Zap, Droplets, Wheat, Gem, FlaskConical, Coins, Users, Smile, Wind } from 'lucide-react';

const RESOURCE_META = {
  energy:     { icon: Zap,          color: 'text-yellow-400' },
  water:      { icon: Droplets,     color: 'text-blue-400' },
  food:       { icon: Wheat,        color: 'text-green-400' },
  minerals:   { icon: Gem,          color: 'text-amber-500' },
  science:    { icon: FlaskConical, color: 'text-purple-400' },
  credits:    { icon: Coins,        color: 'text-emerald-400' },
  population: { icon: Users,        color: 'text-cyan-400' },
  morale:     { icon: Smile,        color: 'text-orange-400' },
  oxygen:     { icon: Wind,         color: 'text-sky-300' },
};

export default function ResourceBar() {
  const { t } = useLang();
  const { gameState } = useGame();

  if (!gameState) return null;

  const player = gameState.players[gameState.currentPlayerIndex];
  const gradeMode = gameState.settings?.gradeMode || 'standard';
  const activeResources = getActiveResources(gradeMode);
  const production = calculateResourceProduction(player, gameState.map);
  const maintenance = calculateMaintenance(player, gameState.map);

  return (
    <div className="p-3 border-b border-gray-700/50">
      <div className="text-xs text-gray-500 mb-2 font-heading uppercase tracking-wider">{t.phases.resourceProduction}</div>
      <div className="space-y-1.5">
        {activeResources.map(key => {
          const meta = RESOURCE_META[key];
          if (!meta) return null;
          const Icon = meta.icon;
          const current = player.resources[key] || 0;
          const net = (production[key] || 0) - (maintenance[key] || 0);
          const isLow = current < 5 && key !== 'morale' && key !== 'population';
          const isCritical = current <= 0 && key !== 'morale' && key !== 'population';
          return (
            <div key={key} className={`flex items-center justify-between py-1 px-1.5 rounded ${isCritical ? 'bg-red-900/30 border border-red-700/50' : isLow ? 'bg-orange-900/20' : ''}`}>
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon size={12} className={meta.color} />
                <span className="text-gray-300 text-xs truncate">{t.resources[key]}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-mono font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-white'}`}>{current}</span>
                {net !== 0 && <span className={`text-[10px] font-mono ${net > 0 ? 'text-green-400' : 'text-red-400'}`}>{net > 0 ? '+' : ''}{net}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}