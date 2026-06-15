import React, { useState } from 'react';
import { useGame } from '@/lib/gameContext';
import { useLang } from '@/lib/i18n';
import HexMap from './HexMap';
import LeftSidebar from './LeftSidebar';
import HexInfoPanel from './HexInfoPanel';
import EventModal from './EventModal';
import SaveLoadModal from './SaveLoadModal';
import MapLegend from './MapLegend';
import { Save } from 'lucide-react';

export default function GameScreen() {
  const { gameState } = useGame();
  const { t } = useLang();
  const [selectedHex, setSelectedHex] = useState(null);
  const [actionMode, setActionMode] = useState(null);
  const [showSave, setShowSave] = useState(false);

  if (!gameState) return null;

  const handleAction = (mode) => setActionMode(prev => prev === mode ? null : mode);

  return (
    <div className="flex h-[calc(100vh-48px)] bg-gray-950 overflow-hidden">
      <LeftSidebar onAction={handleAction} actionMode={actionMode} />

      <div className="flex-1 relative">
        {actionMode && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-gray-800/95 border border-orange-500/50 rounded-lg text-xs text-white flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            {actionMode === 'explore' && `🔭 ${t.actions.explore} — ${t.general.selectHex}`}
            {actionMode === 'claim'   && `🏴 ${t.actions.claim} — ${t.general.selectHex}`}
            {actionMode === 'build'   && `🏗️ ${t.actions.build} — ${t.general.selectHex}`}
            {actionMode === 'research'&& `🔬 ${t.actions.research} — ${t.general.selectHex}`}
            <button onClick={() => setActionMode(null)} className="text-gray-400 hover:text-white ml-1">✕</button>
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

      <EventModal />
      <SaveLoadModal isOpen={showSave} onClose={() => setShowSave(false)} />
    </div>
  );
}