import React, { useState } from 'react';
import { useGame } from '@/lib/gameContext';
import { useLang } from '@/lib/i18n';
import HexMap from './HexMap';
import EventModal from './EventModal';
import SaveLoadModal from './SaveLoadModal';
import ResearchPanel from './ResearchPanel';
import CooperationPanel from './CooperationPanel';
import JuniorMapLegend from './JuniorMapLegend';
import BuildingGuideModal, { BuildSelectionCards, HexTooltip, JUNIOR_BUILDING_GUIDE, RES_ICON } from './JuniorBuildGuide';
import { getHexNeighbors } from '@/lib/gameData';
import { Save, Search, MapPin, Hammer, FlaskConical, Heart, SkipForward, X, HelpCircle, BookOpen } from 'lucide-react';

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
  const { t, lang } = useLang();
  const [selectedHex, setSelectedHex] = useState(null);
  const [actionMode, setActionMode] = useState(null);
  const [showResearch, setShowResearch] = useState(false);
  const [showCoop, setShowCoop] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showBuildGuide, setShowBuildGuide] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [buildMenu, setBuildMenu] = useState(false); // hexKey when build selection open

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const ap = gameState.actionPoints;

  const handleAction = (mode) => {
    if (mode === 'research') { setShowResearch(true); setActionMode(null); return; }
    if (mode === 'help') { setShowCoop(true); setActionMode(null); return; }
    setActionMsg('');
    if (mode === actionMode) { setActionMode(null); return; }
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

  const ACTIONS = [
    { key: 'explore',  emoji: '🔭', icon: Search,       label: t.actions.explore,  ap: 1, mapAction: true },
    { key: 'claim',    emoji: '🏴', icon: MapPin,        label: t.actions.claim,    ap: 1, mapAction: true },
    { key: 'build',    emoji: '🏗️', icon: Hammer,        label: t.actions.build,    ap: 1, mapAction: true },
    { key: 'research', emoji: '🔬', icon: FlaskConical,  label: t.actions.research, ap: 1, mapAction: false },
    { key: 'help',     emoji: '🤝', icon: Heart,         label: t.actions.help,     ap: 0, mapAction: false },
  ];

  const scores = gameState.players.map(p => ({
    ...p,
    total: Object.values(p.scores || {}).reduce((s, v) => s + (v || 0), 0),
  })).sort((a, b) => b.total - a.total);

  // Resource meta with consistent icons
  const RESOURCE_META = [
    { key: 'energy',   icon: RES_ICON.energy,   color: 'text-yellow-400', label: lang === 'ko' ? '에너지' : 'Energy' },
    { key: 'water',    icon: RES_ICON.water,     color: 'text-blue-400',   label: lang === 'ko' ? '물' : 'Water' },
    { key: 'food',     icon: RES_ICON.food,      color: 'text-green-400',  label: lang === 'ko' ? '식량' : 'Food' },
    { key: 'minerals', icon: RES_ICON.minerals,  color: 'text-amber-400',  label: lang === 'ko' ? '자재' : 'Materials' },
    { key: 'science',  icon: RES_ICON.science,   color: 'text-purple-400', label: lang === 'ko' ? '연구' : 'Research' },
  ];

  const hexForTooltip = selectedHex && !buildMenu && !actionMode ? selectedHex : null;

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] bg-gray-950">
      {/* Top info bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 border-b border-gray-800 text-xs flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center text-lg" style={{ backgroundColor: player.colorHex + '25', border: `2px solid ${player.colorHex}` }}>{player.emblem}</div>
          <span className="text-white font-heading font-semibold">{player.countryName}</span>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <span className="text-gray-400">
          {t.general.round} <span className="text-white font-bold">{gameState.currentRound}</span>/{gameState.settings.gameLength}
        </span>
        <div className="h-4 w-px bg-gray-700" />
        <span className="text-gray-400">{t.actions.actionPoints}:</span>
        {Array.from({ length: gameState.settings.actionPointsPerTurn || 3 }).map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full border ${i < ap ? 'bg-orange-500 border-orange-400' : 'bg-gray-800 border-gray-600'}`} />
        ))}
        <div className="ml-auto flex items-center gap-3">
          {RESOURCE_META.map(m => {
            const val = player.resources[m.key] || 0;
            const low = val <= 3;
            return (
              <span key={m.key} className={`${m.color} font-mono font-bold ${low ? 'animate-pulse' : ''}`} title={m.label}>
                {m.icon}{val}
                {low && <span className="text-red-400 text-[9px] ml-0.5">!</span>}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative">
          {/* Action mode banner */}
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

          {/* Save button */}
          <button onClick={() => setShowSave(true)} className="absolute bottom-2 left-2 z-10 w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600">
            <Save size={14} />
          </button>

          {/* Hex tooltip (shown when hex selected but no action active) */}
          {hexForTooltip && (
            <HexTooltip
              hexKey={hexForTooltip}
              gameState={gameState}
              onClose={() => setSelectedHex(null)}
            />
          )}

          {/* Map Legend — bottom-right */}
          <JuniorMapLegend />
        </div>

        {/* Right panel: actions + scores + help */}
        <div className="w-48 bg-gray-900/95 border-l border-gray-700 flex flex-col shrink-0 overflow-y-auto">
          {/* Building guide shortcut */}
          <button
            onClick={() => setShowBuildGuide(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 border-b border-gray-800 transition-colors"
          >
            <BookOpen size={13} />
            <span>{lang === 'ko' ? '건물 안내 보기' : 'Building Guide'}</span>
          </button>

          <div className="p-2 space-y-1.5">
            {ACTIONS.map(action => {
              const isActive = actionMode === action.key;
              const disabled = ap <= 0 && action.ap > 0;
              return (
                <button key={action.key} onClick={() => handleAction(action.key)} disabled={disabled}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors border text-sm font-medium ${
                    isActive
                      ? 'bg-orange-600/30 border-orange-500/60 text-orange-200'
                      : disabled
                        ? 'bg-gray-800/30 border-gray-700/30 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-800/60 border-gray-700/40 text-gray-200 hover:bg-gray-700/60'
                  }`}>
                  <span className="text-base">{action.emoji}</span>
                  <span className="flex-1">{action.label}</span>
                  {action.ap > 0 && (
                    <span className={`text-[10px] font-mono ${disabled ? 'text-gray-600' : 'text-gray-500'}`}>
                      {action.ap}AP
                    </span>
                  )}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
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

          {/* Resource key */}
          <div className="px-3 py-2 border-t border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-heading mb-1.5">
              {lang === 'ko' ? '자원' : 'Resources'}
            </p>
            <div className="space-y-0.5">
              {RESOURCE_META.map(m => (
                <div key={m.key} className="flex items-center gap-1.5">
                  <span className={`${m.color} text-xs font-mono w-5`}>{m.icon}</span>
                  <span className="text-gray-400 text-[10px]">{m.label}</span>
                  <span className={`ml-auto font-mono text-xs font-bold ${m.color}`}>{player.resources[m.key] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini score display */}
          <div className="mt-auto p-2 border-t border-gray-800">
            <div className="text-[10px] text-gray-500 font-heading uppercase tracking-wider mb-1">
              {lang === 'ko' ? '점수' : 'Score'}
            </div>
            {scores.map((p, rank) => (
              <div key={p.index} className="flex items-center gap-1.5 py-0.5">
                <span className="text-xs">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : `${rank + 1}.`}</span>
                <span className="text-xs" style={{ color: p.colorHex }}>{p.emblem} {p.abbreviation}</span>
                <span className="ml-auto text-xs font-mono text-white">{p.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Build selection cards (replaces old build menu) */}
      {buildMenu && (
        <BuildSelectionCards
          hexKey={buildMenu}
          gameState={gameState}
          onBuild={handleBuild}
          onClose={() => { setBuildMenu(false); setSelectedHex(null); }}
        />
      )}

      {/* Building guide modal */}
      {showBuildGuide && <BuildingGuideModal onClose={() => setShowBuildGuide(false)} />}

      {showResearch && <ResearchPanel onClose={() => setShowResearch(false)} />}
      {showCoop && <CooperationPanel onClose={() => setShowCoop(false)} />}
      <EventModal />
      <SaveLoadModal isOpen={showSave} onClose={() => setShowSave(false)} />
    </div>
  );
}