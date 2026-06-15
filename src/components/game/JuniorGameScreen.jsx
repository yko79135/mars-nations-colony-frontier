import React, { useState } from 'react';
import { useGame } from '@/lib/gameContext';
import { useLang } from '@/lib/i18n';
import HexMap from './HexMap';
import EventModal from './EventModal';
import SaveLoadModal from './SaveLoadModal';
import ResearchPanel from './ResearchPanel';
import CooperationPanel from './CooperationPanel';
import { BUILDINGS, JUNIOR_BUILDINGS, getHexNeighbors } from '@/lib/gameData';
import { Save, Search, MapPin, Hammer, FlaskConical, Heart, SkipForward, X } from 'lucide-react';

const RESOURCE_META = {
  energy:   { icon: '⚡', color: 'text-yellow-400' },
  water:    { icon: '💧', color: 'text-blue-400' },
  food:     { icon: '🌾', color: 'text-green-400' },
  minerals: { icon: '💎', color: 'text-amber-500' },
};

function checkValidTargets(actionMode, gameState) {
  if (!gameState || !actionMode) return { hasTargets: false, reason: '' };
  const { map, players, currentPlayerIndex } = gameState;
  const player = players[currentPlayerIndex];
  const hasLongRange = player.technologies.includes('longRangeRover');
  const range = hasLongRange ? 2 : 1;

  if (actionMode === 'explore') {
    const hasTargets = Object.values(map.hexes).some(hex => {
      if (hex.explored) return false;
      if (range >= 2) {
        return Object.values(map.hexes).some(h => h.owner === currentPlayerIndex && Math.max(Math.abs(h.q - hex.q), Math.abs(h.r - hex.r), Math.abs((-h.q - h.r) - (-hex.q - hex.r))) <= range);
      }
      return getHexNeighbors(hex.q, hex.r).some(n => { const nk = `${n.q},${n.r}`; return map.hexes[nk]?.owner === currentPlayerIndex; });
    });
    return { hasTargets, reason: 'noValidExplore' };
  }
  if (actionMode === 'claim') {
    const hasTargets = Object.values(map.hexes).some(hex => {
      if (!hex.explored || hex.owner !== null) return false;
      return getHexNeighbors(hex.q, hex.r).some(n => { const nk = `${n.q},${n.r}`; return map.hexes[nk]?.owner === currentPlayerIndex; });
    });
    return { hasTargets, reason: 'noValidClaim' };
  }
  if (actionMode === 'build') {
    const hasTargets = Object.values(map.hexes).some(hex => hex.owner === currentPlayerIndex);
    return { hasTargets, reason: 'noValidBuild' };
  }
  return { hasTargets: true, reason: '' };
}

export default function JuniorGameScreen() {
  const { gameState, endTurn, buildOnHex, exploreHex, claimHex } = useGame();
  const { t } = useLang();
  const [selectedHex, setSelectedHex] = useState(null);
  const [actionMode, setActionMode] = useState(null);
  const [showResearch, setShowResearch] = useState(false);
  const [showCoop, setShowCoop] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [buildMenu, setBuildMenu] = useState(false);

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const ap = gameState.actionPoints;

  const handleAction = (mode) => {
    if (mode === 'research') { setShowResearch(true); setActionMode(null); return; }
    if (mode === 'help') { setShowCoop(true); setActionMode(null); return; }

    setActionMsg('');
    if (mode === actionMode) { setActionMode(null); return; }

    // Check valid targets before entering selection mode
    const { hasTargets, reason } = checkValidTargets(mode, gameState);
    if (!hasTargets) {
      setActionMsg(t.actions[reason] || t.actions.noValidTargets);
      setActionMode(null);
      return;
    }
    setActionMode(mode);
    setSelectedHex(null);
  };

  const handleHexSelect = (hexKey) => {
    setSelectedHex(hexKey);
    const hex = gameState.map.hexes[hexKey];
    if (!hex) return;

    if (actionMode === 'explore' && !hex.explored) {
      exploreHex(hexKey);
      setActionMode(null);
      setSelectedHex(null);
    } else if (actionMode === 'claim' && hex.explored && hex.owner === null) {
      claimHex(hexKey);
      setActionMode(null);
      setSelectedHex(null);
    } else if (actionMode === 'build' && hex.owner === gameState.currentPlayerIndex) {
      setBuildMenu(hexKey);
    }
  };

  const handleBuild = (hexKey, buildingId) => {
    buildOnHex(hexKey, buildingId);
    setBuildMenu(false);
    setActionMode(null);
    setSelectedHex(null);
  };

  const buildableForHex = buildMenu && gameState.map.hexes[buildMenu]
    ? JUNIOR_BUILDINGS.filter(bId => {
        const b = BUILDINGS[bId];
        const hex = gameState.map.hexes[buildMenu];
        if (b.terrainRestrictions?.includes(hex.terrain)) return false;
        for (const [res, amt] of Object.entries(b.cost)) { if ((player.resources[res] || 0) < amt) return false; }
        return true;
      })
    : [];

  const ACTIONS = [
    { key: 'explore', emoji: '🔭', icon: Search,       label: t.actions.explore,   ap: 1, mapAction: true },
    { key: 'claim',   emoji: '🏴', icon: MapPin,       label: t.actions.claim,     ap: 1, mapAction: true },
    { key: 'build',   emoji: '🏗️', icon: Hammer,       label: t.actions.build,     ap: 1, mapAction: true },
    { key: 'research',emoji: '🔬', icon: FlaskConical, label: t.actions.research,  ap: 1, mapAction: false },
    { key: 'help',    emoji: '🤝', icon: Heart,        label: t.actions.help,      ap: 0, mapAction: false },
  ];

  const scores = gameState.players.map(p => ({
    ...p,
    total: Object.values(p.scores || {}).reduce((s, v) => s + (v || 0), 0),
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] bg-gray-950">
      {/* Top info bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 border-b border-gray-800 text-xs flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center text-lg" style={{ backgroundColor: player.colorHex + '25', border: `2px solid ${player.colorHex}` }}>{player.emblem}</div>
          <span className="text-white font-heading font-semibold">{player.countryName}</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <span className="text-gray-400">{t.general.round} <span className="text-white font-bold">{gameState.currentRound}</span>/{gameState.settings.gameLength}</span>
        <div className="h-4 w-px bg-gray-700" />
        <span className="text-gray-400">{t.actions.actionPoints}: </span>
        {Array.from({ length: gameState.settings.actionPointsPerTurn || 3 }).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full border ${i < ap ? 'bg-orange-500 border-orange-400' : 'bg-gray-800 border-gray-600'}`} />
        ))}
        <div className="ml-auto flex items-center gap-3">
          {Object.entries(RESOURCE_META).map(([key, meta]) => (
            <span key={key} className={`${meta.color} font-mono font-bold`}>{meta.icon}{player.resources[key] || 0}</span>
          ))}
          <span className="text-purple-400 font-mono font-bold">🔬{player.resources.science || 0}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative">
          {actionMode && (
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-2 bg-gray-900/95 border border-orange-500/50 rounded-lg px-3 py-2 text-xs shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-white">
                  {actionMode === 'explore' && `🔭 ${t.actions.explore} — ${t.general.selectHex}`}
                  {actionMode === 'claim'   && `🏴 ${t.actions.claim} — ${t.general.selectHex}`}
                  {actionMode === 'build'   && `🏗️ ${t.actions.build} — ${t.general.selectHex}`}
                </span>
              </div>
              <button onClick={() => { setActionMode(null); setActionMsg(''); }} className="text-gray-400 hover:text-white flex items-center gap-1">
                <X size={14} /> {t.actions.cancelAction}
              </button>
            </div>
          )}
          {actionMsg && !actionMode && (
            <div className="absolute top-2 left-2 right-2 z-10 bg-gray-900/95 border border-yellow-600/50 rounded-lg px-3 py-2 text-xs text-yellow-300 shadow-lg flex items-center justify-between">
              <span>⚠️ {actionMsg}</span>
              <button onClick={() => setActionMsg('')} className="text-gray-400 hover:text-white"><X size={14} /></button>
            </div>
          )}
          <HexMap onHexSelect={handleHexSelect} selectedHex={selectedHex} actionMode={actionMode} />
          <button onClick={() => setShowSave(true)} className="absolute bottom-2 left-2 z-10 w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600">
            <Save size={14} />
          </button>
        </div>

        {/* Right panel: actions + scores */}
        <div className="w-48 bg-gray-900/95 border-l border-gray-700 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-2 space-y-1.5">
            {ACTIONS.map(action => {
              const isActive = actionMode === action.key;
              const disabled = ap <= 0 && action.ap > 0;
              return (
                <button key={action.key} onClick={() => handleAction(action.key)} disabled={disabled}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors border text-sm font-medium ${isActive ? 'bg-orange-600/30 border-orange-500/60 text-orange-200' : disabled ? 'bg-gray-800/30 border-gray-700/30 text-gray-600 cursor-not-allowed' : 'bg-gray-800/60 border-gray-700/40 text-gray-200 hover:bg-gray-700/60'}`}>
                  <span className="text-base">{action.emoji}</span>
                  <span>{action.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
                </button>
              );
            })}
            <div className="pt-1">
              <button onClick={endTurn} className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <SkipForward size={15} />
                {t.actions.endTurn}
              </button>
            </div>
          </div>

          {/* Mini score display */}
          <div className="mt-auto p-2 border-t border-gray-800">
            <div className="text-[10px] text-gray-500 font-heading uppercase tracking-wider mb-1">Score</div>
            {scores.map((p, rank) => (
              <div key={p.index} className="flex items-center gap-1.5 py-0.5">
                <span className="text-xs">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : `${rank+1}.`}</span>
                <span className="text-xs" style={{ color: p.colorHex }}>{p.emblem} {p.abbreviation}</span>
                <span className="ml-auto text-xs font-mono text-white">{p.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Build menu popup */}
      {buildMenu && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={() => setBuildMenu(false)}>
          <div className="bg-gray-900 border border-amber-700/50 rounded-xl p-5 max-w-xs w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-heading font-bold">{t.actions.build}</h3>
              <button onClick={() => setBuildMenu(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
            </div>
            {buildableForHex.length === 0 ? (
              <p className="text-gray-500 text-sm">{t.actions.noValidBuild}</p>
            ) : (
              <div className="space-y-2">
                {buildableForHex.map(bId => {
                  const b = BUILDINGS[bId];
                  const costStr = Object.entries(b.cost).map(([r, a]) => `${a}${RESOURCE_META[r]?.icon || ''}`).join(' ');
                  return (
                    <button key={bId} onClick={() => handleBuild(buildMenu, bId)}
                      className="w-full flex items-center justify-between p-2.5 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg border border-gray-700 transition-colors">
                      <span className="text-white text-sm">{t.buildings[bId]}</span>
                      <span className="text-gray-400 text-xs font-mono">{costStr || 'Free'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {showResearch && <ResearchPanel onClose={() => setShowResearch(false)} />}
      {showCoop && <CooperationPanel onClose={() => setShowCoop(false)} />}
      <EventModal />
      <SaveLoadModal isOpen={showSave} onClose={() => setShowSave(false)} />
    </div>
  );
}