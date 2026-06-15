import React, { useState } from 'react';
import { useGame } from '@/lib/gameContext';
import { useLang } from '@/lib/i18n';
import HexMap from './HexMap';
import LeftSidebar from './LeftSidebar';
import HexInfoPanel from './HexInfoPanel';
import EventModal from './EventModal';
import SaveLoadModal from './SaveLoadModal';
import { Save } from 'lucide-react';

export default function GameScreen() {
  const { gameState } = useGame();
  const { t } = useLang();
  const [selectedHex, setSelectedHex] = useState(null);
  const [actionMode, setActionMode] = useState(null); // explore, claim, build, research
  const [showSave, setShowSave] = useState(false);

  if (!gameState) return null;

  const handleAction = (mode) => {
    setActionMode(prev => prev === mode ? null : mode);
  };

  const handleHexSelect = (key) => {
    setSelectedHex(key);
    
    // If in explore mode and hex is unexplored, auto-explore
    if (actionMode === 'explore') {
      const hex = gameState.map.hexes[key];
      if (hex && !hex.explored) {
        // Will be handled by HexInfoPanel
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)] bg-gray-950 overflow-hidden">
      {/* Left sidebar */}
      <LeftSidebar onAction={handleAction} />
      
      {/* Main map area */}
      <div className="flex-1 relative">
        {/* Action mode indicator */}
        {actionMode && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-gray-800/90 border border-gray-600 rounded-lg text-xs text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            {actionMode === 'explore' && `🔭 ${t.actions.explore}: ${t.general.selectHex}`}
            {actionMode === 'claim' && `🏴 ${t.actions.claim}: ${t.general.selectHex}`}
            {actionMode === 'build' && `🏗️ ${t.actions.build}: ${t.general.selectHex}`}
            {actionMode === 'research' && `🔬 ${t.actions.research}`}
            <button
              onClick={() => setActionMode(null)}
              className="text-gray-400 hover:text-white ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={() => setShowSave(true)}
          className="absolute bottom-3 left-3 z-10 w-8 h-8 bg-gray-800/90 hover:bg-gray-700 rounded flex items-center justify-center text-gray-300 border border-gray-600"
        >
          <Save size={16} />
        </button>

        <HexMap onHexSelect={handleHexSelect} selectedHex={selectedHex} />
      </div>

      {/* Right info panel */}
      {selectedHex && (
        <HexInfoPanel
          hexKey={selectedHex}
          onClose={() => setSelectedHex(null)}
          actionMode={actionMode}
        />
      )}

      {/* Event modal */}
      <EventModal />
      
      {/* Save/Load modal */}
      <SaveLoadModal isOpen={showSave} onClose={() => setShowSave(false)} />
    </div>
  );
}