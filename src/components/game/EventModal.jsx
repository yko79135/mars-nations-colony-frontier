import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';

const EVENT_ART = {
  dustStorm:        { emoji: '🌪️', bg: 'from-amber-950 to-orange-950', border: 'rgba(217,119,6,0.5)', glow: 'rgba(217,119,6,0.15)' },
  solarStorm:       { emoji: '☀️', bg: 'from-yellow-950 to-amber-950',  border: 'rgba(234,179,8,0.5)', glow: 'rgba(234,179,8,0.15)' },
  equipmentFailure: { emoji: '⚙️', bg: 'from-gray-950 to-zinc-950',     border: 'rgba(161,161,170,0.4)', glow: 'rgba(161,161,170,0.1)' },
  waterContamination:{ emoji: '💧', bg: 'from-blue-950 to-cyan-950',    border: 'rgba(96,165,250,0.4)', glow: 'rgba(96,165,250,0.12)' },
  cropDisease:      { emoji: '🌾', bg: 'from-green-950 to-emerald-950', border: 'rgba(74,222,128,0.4)', glow: 'rgba(74,222,128,0.1)' },
  meteorStrike:     { emoji: '☄️', bg: 'from-red-950 to-rose-950',      border: 'rgba(248,113,113,0.5)', glow: 'rgba(248,113,113,0.15)' },
  supplyDelay:      { emoji: '🚀', bg: 'from-slate-950 to-gray-950',    border: 'rgba(148,163,184,0.4)', glow: 'rgba(148,163,184,0.1)' },
  iceDiscovery:     { emoji: '🧊', bg: 'from-sky-950 to-blue-950',      border: 'rgba(125,211,252,0.5)', glow: 'rgba(125,211,252,0.15)' },
  scienceDiscovery: { emoji: '🔬', bg: 'from-purple-950 to-violet-950', border: 'rgba(167,139,250,0.5)', glow: 'rgba(167,139,250,0.15)' },
  populationBoom:   { emoji: '🎉', bg: 'from-emerald-950 to-teal-950',  border: 'rgba(52,211,153,0.5)', glow: 'rgba(52,211,153,0.15)' },
};

const RESOURCE_COLORS = {
  energy: '#EAB308', water: '#60A5FA', food: '#4ADE80',
  minerals: '#F59E0B', science: '#A78BFA', population: '#22D3EE',
  morale: '#FB923C',
};
const RESOURCE_ICONS = {
  energy: '⚡', water: '💧', food: '🌾', minerals: '💎',
  science: '🔬', population: '👥', morale: '😊',
};

export default function EventModal() {
  const { t, lang } = useLang();
  const { gameState, dismissEvent } = useGame();

  if (!gameState?.activeEvent) return null;
  const event = gameState.activeEvent;
  const isPositive = event.type === 'positive';
  const art = EVENT_ART[event.id] || { emoji: '📋', bg: 'from-gray-950 to-slate-950', border: 'rgba(255,255,255,0.2)', glow: 'rgba(255,255,255,0.05)' };
  const targetPlayer = event.targetPlayer !== undefined ? gameState.players[event.targetPlayer] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(4px)' }}>
      <div className="max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{
          border: `1px solid ${art.border}`,
          boxShadow: `0 0 40px ${art.glow}, 0 20px 60px rgba(0,0,0,0.6)`,
        }}>

        {/* Event artwork header */}
        <div className={`bg-gradient-to-br ${art.bg} px-5 py-6 flex flex-col items-center text-center`}>
          <div className="text-6xl mb-3 drop-shadow-lg">{art.emoji}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-widest font-heading mb-1">
            {isPositive
              ? (lang === 'ko' ? '🌟 긍정적 사건' : '🌟 Positive Event')
              : (lang === 'ko' ? '⚠️ 위험 사건' : '⚠️ Hazard Event')
            }
          </div>
          <h3 className="text-white font-heading font-bold text-lg leading-tight">
            {t.events[event.id] || event.id}
          </h3>
        </div>

        {/* Event details */}
        <div className="px-5 py-4" style={{ background: 'rgba(8,12,25,0.98)' }}>
          {/* Description */}
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {t.events[event.id + 'Desc'] || (lang === 'ko' ? '이 사건이 발생했습니다.' : 'This event has occurred.')}
          </p>

          {/* Affected nation(s) */}
          {targetPlayer && (
            <div className="flex items-center gap-2 mb-3 text-xs py-2 px-3 rounded-lg"
              style={{ background: targetPlayer.colorHex + '18', border: `1px solid ${targetPlayer.colorHex}40` }}>
              <span className="text-gray-400">{lang === 'ko' ? '영향 대상:' : 'Affects:'}</span>
              <span className="font-bold" style={{ color: targetPlayer.colorHex }}>
                {targetPlayer.emblem} {targetPlayer.countryName}
              </span>
            </div>
          )}
          {event.scope === 'all' && (
            <div className="flex items-center gap-2 mb-3 text-xs py-2 px-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              🌍 <span className="text-gray-400">{lang === 'ko' ? '모든 국가에 영향' : 'Affects all nations'}</span>
            </div>
          )}

          {/* Resource effects */}
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(event.effects).map(([res, amt]) => {
              const color = RESOURCE_COLORS[res] || '#fff';
              const icon = RESOURCE_ICONS[res] || '📦';
              return (
                <div key={res} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    background: amt > 0 ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                    border: `1px solid ${amt > 0 ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    color: amt > 0 ? '#4ade80' : '#f87171',
                  }}>
                  <span>{icon}</span>
                  <span style={{ color }}>{t.resources[res] || res}</span>
                  <span>{amt > 0 ? '+' : ''}{amt}</span>
                </div>
              );
            })}
          </div>

          {/* Dismiss button */}
          <button onClick={dismissEvent}
            className="w-full py-2.5 rounded-xl font-heading font-bold text-sm text-white transition-all"
            style={{
              background: isPositive
                ? 'linear-gradient(135deg, rgba(52,211,153,0.25), rgba(16,185,129,0.25))'
                : 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.2))',
              border: `1px solid ${isPositive ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}`,
            }}>
            {lang === 'ko' ? '계속하기 →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}