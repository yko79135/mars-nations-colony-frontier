import React, { useState } from 'react';
import { useGame } from '@/lib/gameContext';
import { useLang } from '@/lib/i18n';
import HexMap from './HexMap';
import LeftSidebar from './LeftSidebar';
import HexInfoPanel from './HexInfoPanel';
import EventModal from './EventModal';
import SaveLoadModal from './SaveLoadModal';
import MapLegend from './MapLegend';
import ResearchPanel from './ResearchPanel';
import JuniorGameScreen from './JuniorGameScreen';
import { Save, X } from 'lucide-react';

export default function GameScreen() {
  const { gameState } = useGame();
  const { t } = useLang();
  const [selectedHex, setSelectedHex] = useState(null);
  // actionMode: only map-targeting actions (explore, claim, build) — never research
  const [actionMode, setActionMode] = useState(null);
  const [showSave, setShowSave] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  if (!gameState) return null;

  // Route to Junior screen
  if (gameState.settings?.gradeMode === 'junior') {
    return <JuniorGameScreen />;
  }

  // Senior screen
  const handleAction = (mode) => {
    // Research is NOT a map action — open panel directly
    if (mode === 'research') {
      setShowResearch(true);
      setActionMode(null);
      setActionMsg('');
      return;
    }
    setActionMsg('');
    setActionMode(prev => prev === mode ? null : mode);
    setSelectedHex(null);
  };

  const handleNoValidTargets = (reason) => {
    setActionMsg(t.actions[reason] || t.actions.noValidTargets);
    setActionMode(null);
  };

  return (
    <div className="flex h-[calc(100vh-48px)] bg-gray-950 overflow-hidden">
      <LeftSidebar onAction={handleAction} actionMode={actionMode} />

      <div className="flex-1 relative">
        {actionMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 rounded-full text-xs text-white shadow-2xl"
            style={{ background: 'rgba(10,14,30,0.97)', border: '1px solid rgba(249,115,22,0.5)', boxShadow: '0 0 20px rgba(249,115,22,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            {actionMode === 'explore' && `🔭 ${t.actions.explore} — ${t.general.selectHex}`}
            {actionMode === 'claim'   && `🏴 ${t.actions.claim} — ${t.general.selectHex}`}
            {actionMode === 'build'   && `🏗️ ${t.actions.build} — ${t.general.selectHex}`}
            <button onClick={() => { setActionMode(null); setActionMsg(''); }}
              className="ml-1 text-gray-500 hover:text-white flex items-center gap-0.5 transition-colors">
              <X size={12} /> <span className="text-[10px]">{t.actions.cancelAction}</span>
            </button>
          </div>
        )}
        {actionMsg && !actionMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs shadow-2xl"
            style={{ background: 'rgba(10,14,30,0.97)', border: '1px solid rgba(234,179,8,0.4)' }}>
            <span className="text-yellow-300">⚠️ {actionMsg}</span>
            <button onClick={() => setActionMsg('')} className="text-gray-500 hover:text-white"><X size={12} /></button>
          </div>
        )}
        <button onClick={() => setShowSave(true)} className="absolute bottom-3 left-3 z-10 w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600">
          <Save size={16} />
        </button>
        <HexMap onHexSelect={setSelectedHex} selectedHex={selectedHex} actionMode={actionMode} />
        <MapLegend />
      </div>

      {selectedHex && (
        <HexInfoPanel hexKey={selectedHex} onClose={() => setSelectedHex(null)} actionMode={actionMode} onClearAction={() => setActionMode(null)} />
      )}

      {showResearch && <ResearchPanel onClose={() => setShowResearch(false)} />}
      <EventModal />
      <SaveLoadModal isOpen={showSave} onClose={() => setShowSave(false)} />
    </div>
  );
}