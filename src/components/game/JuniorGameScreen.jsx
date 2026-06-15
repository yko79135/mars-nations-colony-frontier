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
    <div className="flex flex-col h-[calc(100vh-48px)]" style={{ background: '#04080f' }}>
      {/* Top info bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs flex-wrap shrink-0"
        style={{ background: 'rgba(8,12,25,0.97)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Nation badge */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-lg"
            style={{
              background: player.colorHex + '22',
              border: `2px solid ${player.colorHex}`,
              boxShadow: `0 0 8px ${player.colorHex}44`,
            }}>{player.emblem}</div>
          <div>
            <div className="text-white font-heading font-bold text-xs leading-tight">{player.countryName}</div>
            <div className="text-[9px] leading-tight" style={{ color: player.colorHex + 'bb' }}>🏴 {player.colonyName}</div>
          </div>
        </div>
        {/* Divider */}
        <div className="h-6 w-px mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        {/* Round */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500">{t.general.round}</span>
          <span className="text-white font-bold">{gameState.currentRound}</span>
          <span className="text-gray-600">/{gameState.settings.gameLength}</span>
        </div>
        <div className="h-6 w-px mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        {/* Action points */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-[10px]">AP</span>
          {Array.from({ length: gameState.settings.actionPointsPerTurn || 3 }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < ap ? 'bg-orange-500' : 'bg-gray-800 border border-gray-700'}`}
              style={i < ap ? { boxShadow: '0 0 5px rgba(249,115,22,0.5)' } : {}} />
          ))}
        </div>
        {/* Resource strip */}
        <div className="ml-auto flex items-center gap-3">
          {RESOURCE_META.map(m => {
            const val = player.resources[m.key] || 0;
            const low = val <= 3;
            return (
              <div key={m.key} className={`flex items-center gap-0.5 ${low ? 'animate-pulse' : ''}`}
                style={{ color: low ? '#f87171' : m.color }} title={m.label}>
                <span>{m.icon}</span>
                <span className="font-mono font-bold text-xs">{val}</span>
                {low && <span className="text-[8px] text-red-400">!</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="flex-1 relative">
          {/* Action mode banner */}
          {actionMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs shadow-2xl"
              style={{ background: 'rgba(10,14,30,0.97)', border: '1px solid rgba(249,115,22,0.5)', boxShadow: '0 0 16px rgba(249,115,22,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-white">
                {actionMode === 'explore' && `🔭 ${t.actions.explore} — ${t.general.selectHex}`}
                {actionMode === 'claim'   && `🏴 ${t.actions.claim} — ${t.general.selectHex}`}
                {actionMode === 'build'   && `🏗️ ${t.actions.build} — ${t.general.selectHex}`}
              </span>
              <button onClick={() => { setActionMode(null); setActionMsg(''); }} className="text-gray-500 hover:text-white flex items-center gap-0.5 ml-1 transition-colors">
                <X size={12} />
              </button>
            </div>
          )}
          {actionMsg && !actionMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs shadow-2xl"
              style={{ background: 'rgba(10,14,30,0.97)', border: '1px solid rgba(234,179,8,0.4)' }}>
              <span className="text-yellow-300">⚠️ {actionMsg}</span>
              <button onClick={() => setActionMsg('')} className="text-gray-500 hover:text-white transition-colors"><X size={12} /></button>
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

        {/* Right panel: actions + scores */}
        <div className="w-48 flex flex-col shrink-0 overflow-y-auto"
          style={{ background: 'rgba(8,12,25,0.97)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Building guide shortcut */}
          <button onClick={() => setShowBuildGuide(true)}
            className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500 hover:text-gray-200 transition-colors"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <BookOpen size={12} />
            <span>{lang === 'ko' ? '건물 안내' : 'Building Guide'}</span>
          </button>

          {/* Action buttons */}
          <div className="p-2 space-y-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[9px] text-gray-600 uppercase tracking-widest px-1 mb-1">
              {lang === 'ko' ? '행동 선택' : 'Actions'}
            </div>
            {ACTIONS.map(action => {
              const isActive = actionMode === action.key;
              const disabled = ap <= 0 && action.ap > 0;
              const ACTION_COLORS = {
                explore: { active: 'rgba(96,165,250,0.2)', border: 'rgba(96,165,250,0.5)', text: '#93c5fd' },
                claim:   { active: 'rgba(74,222,128,0.2)', border: 'rgba(74,222,128,0.5)', text: '#86efac' },
                build:   { active: 'rgba(251,191,36,0.2)', border: 'rgba(251,191,36,0.5)', text: '#fde68a' },
                research:{ active: 'rgba(167,139,250,0.2)', border: 'rgba(167,139,250,0.5)', text: '#c4b5fd' },
                help:    { active: 'rgba(251,146,60,0.2)', border: 'rgba(251,146,60,0.5)', text: '#fed7aa' },
              };
              const ac = ACTION_COLORS[action.key];
              return (
                <button key={action.key} onClick={() => handleAction(action.key)} disabled={disabled}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all"
                  style={{
                    background: isActive ? ac.active : disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? ac.border : disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
                    color: isActive ? ac.text : disabled ? 'rgba(107,114,128,1)' : 'rgba(209,213,219,1)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                  }}>
                  <span className="text-base">{action.emoji}</span>
                  <span className="flex-1 text-xs font-medium">{action.label}</span>
                  {action.ap > 0 && <span className="text-[9px] opacity-60">{action.ap}AP</span>}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ac.text }} />}
                </button>
              );
            })}

            <button onClick={endTurn}
              className="w-full py-2.5 text-white rounded-xl font-heading font-bold text-sm transition-all mt-2 flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                border: '1px solid rgba(251,146,60,0.4)',
                boxShadow: '0 4px 12px rgba(234,88,12,0.3)',
              }}>
              <SkipForward size={13} />
              {t.actions.endTurn}
            </button>
          </div>

          {/* Resource list */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">
              {lang === 'ko' ? '자원' : 'Resources'}
            </div>
            <div className="space-y-1">
              {RESOURCE_META.map(m => {
                const val = player.resources[m.key] || 0;
                const low = val <= 3;
                return (
                  <div key={m.key} className="flex items-center gap-1.5 py-0.5 px-1.5 rounded"
                    style={{ background: low ? 'rgba(239,68,68,0.08)' : 'transparent' }}>
                    <span className="text-xs">{m.icon}</span>
                    <span className="text-[10px] text-gray-500 flex-1">{m.label}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: low ? '#f87171' : m.color }}>{val}</span>
                    {low && <span className="text-[8px] text-red-400">!</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score leaderboard */}
          <div className="mt-auto px-3 py-2">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">
              {lang === 'ko' ? '점수 순위' : 'Standings'}
            </div>
            {scores.map((p, rank) => (
              <div key={p.index} className="flex items-center gap-1.5 py-0.5">
                <span className="text-xs">{rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}`}</span>
                <span className="text-xs font-medium" style={{ color: p.colorHex }}>{p.emblem}</span>
                <span className="text-[10px] text-gray-400 flex-1 truncate">{p.abbreviation}</span>
                <span className="text-xs font-mono font-bold text-white">{p.total}</span>
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