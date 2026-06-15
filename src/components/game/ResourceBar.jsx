import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { calculateResourceProduction, calculateMaintenance } from '@/lib/gameData';
import { getActiveResources } from '@/lib/gameModes';

const RESOURCE_META = {
  energy:     { icon: '⚡', label: 'Energy', labelKo: '에너지', color: '#EAB308', bg: 'rgba(234,179,8,0.08)', warn: 'rgba(234,179,8,0.25)' },
  water:      { icon: '💧', label: 'Water',  labelKo: '물',    color: '#60A5FA', bg: 'rgba(96,165,250,0.08)', warn: 'rgba(96,165,250,0.25)' },
  food:       { icon: '🌾', label: 'Food',   labelKo: '식량',  color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', warn: 'rgba(74,222,128,0.25)' },
  minerals:   { icon: '💎', label: 'Materials', labelKo: '자재', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', warn: 'rgba(245,158,11,0.25)' },
  science:    { icon: '🔬', label: 'Research', labelKo: '연구', color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', warn: 'rgba(167,139,250,0.25)' },
  population: { icon: '👥', label: 'Population', labelKo: '인구', color: '#22D3EE', bg: 'rgba(34,211,238,0.08)', warn: null },
  morale:     { icon: '😊', label: 'Morale', labelKo: '사기', color: '#FB923C', bg: 'rgba(251,146,60,0.08)', warn: null },
  oxygen:     { icon: '💨', label: 'Oxygen', labelKo: '산소', color: '#7DD3FC', bg: 'rgba(125,211,252,0.08)', warn: null },
};

export default function ResourceBar() {
  const { t, lang } = useLang();
  const { gameState } = useGame();

  if (!gameState) return null;

  const player = gameState.players[gameState.currentPlayerIndex];
  const gradeMode = gameState.settings?.gradeMode || 'senior';
  const activeResources = getActiveResources(gradeMode);
  const displayResources = activeResources.includes('science') ? activeResources : [...activeResources, 'science'];

  const production = calculateResourceProduction(player, gameState.map);
  const maintenance = calculateMaintenance(player, gameState.map);

  return (
    <div className="px-3 py-2 border-b border-white/5">
      <div className="text-[10px] text-gray-500 mb-2 font-heading uppercase tracking-widest">
        {lang === 'ko' ? '자원 현황' : 'Resources'}
      </div>
      <div className="space-y-1">
        {displayResources.map(key => {
          const meta = RESOURCE_META[key];
          if (!meta) return null;
          const current = player.resources[key] || 0;
          const prod = production[key] || 0;
          const maint = maintenance[key] || 0;
          const net = prod - maint;
          const isCritical = current <= 0 && key !== 'morale' && key !== 'population' && key !== 'science';
          const isLow = current > 0 && current < 5 && key !== 'morale' && key !== 'population' && key !== 'science';
          const label = lang === 'ko' ? meta.labelKo : meta.label;

          return (
            <div key={key}
              className="rounded-lg px-2 py-1.5 flex items-center gap-2 transition-all"
              style={{
                background: isCritical ? 'rgba(220,38,38,0.15)' : isLow ? 'rgba(234,179,8,0.08)' : meta.bg,
                border: isCritical ? '1px solid rgba(220,38,38,0.4)' : isLow ? '1px solid rgba(234,179,8,0.2)' : '1px solid transparent',
              }}>
              {/* Icon */}
              <span className="text-sm shrink-0" style={{ filter: isCritical ? 'grayscale(0.3)' : 'none' }}>{meta.icon}</span>

              {/* Label */}
              <span className="text-[10px] text-gray-400 flex-1 truncate">{label}</span>

              {/* Production/consumption deltas */}
              <div className="flex flex-col items-end gap-0 shrink-0">
                {/* Current */}
                <span className="font-mono font-bold text-xs leading-tight"
                  style={{ color: isCritical ? '#f87171' : isLow ? '#fbbf24' : meta.color }}>
                  {current}
                </span>
                {/* Net change */}
                {net !== 0 && (
                  <span className={`font-mono text-[9px] leading-tight ${net > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {net > 0 ? '+' : ''}{net}
                  </span>
                )}
              </div>

              {/* Critical pulse dot */}
              {isCritical && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}