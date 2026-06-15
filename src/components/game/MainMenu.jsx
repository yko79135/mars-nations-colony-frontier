import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Rocket, FolderOpen, Trash2 } from 'lucide-react';

export default function MainMenu() {
  const { t } = useLang();
  const { setScreen, getSavedGames, loadGame, deleteSave } = useGame();
  const [showLoad, setShowLoad] = useState(false);
  const saves = getSavedGames();
  const saveKeys = Object.keys(saves);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-red-950 flex items-center justify-center p-4">
      <div className="text-center max-w-lg w-full">
        <div className="mb-8">
          <div className="text-6xl mb-4">🔴</div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
            Mars Nations
          </h1>
          <p className="text-orange-400 font-heading text-lg">Colony Frontier</p>
          <p className="text-orange-300/60 text-sm mt-1">화성 국가: 식민지 개척</p>
          <p className="text-gray-400 text-sm mt-4">{t.gameSubtitle}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setScreen('setup')}
            className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Rocket size={20} />
            {t.save.newGame}
          </button>

          <button
            onClick={() => setShowLoad(!showLoad)}
            className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-heading font-medium transition-colors flex items-center justify-center gap-2 border border-gray-700"
          >
            <FolderOpen size={18} />
            {t.save.loadGame}
          </button>
        </div>

        {showLoad && (
          <div className="mt-4 bg-gray-900/80 rounded-lg border border-gray-700 p-4">
            <h3 className="text-gray-300 font-heading text-sm mb-3">{t.save.savedGames}</h3>
            {saveKeys.length === 0 ? (
              <p className="text-gray-500 text-sm">{t.save.noSaves}</p>
            ) : (
              <div className="space-y-2">
                {saveKeys.map(key => (
                  <div key={key} className="flex items-center justify-between bg-gray-800/60 rounded p-2">
                    <div className="text-left">
                      <p className="text-gray-200 text-sm font-medium">{key}</p>
                      <p className="text-gray-500 text-xs">
                        {t.general.round} {saves[key].currentRound}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadGame(key)}
                        className="px-3 py-1 bg-orange-600/30 text-orange-300 rounded text-xs hover:bg-orange-600/50"
                      >
                        {t.save.load}
                      </button>
                      <button
                        onClick={() => { deleteSave(key); setShowLoad(false); setTimeout(() => setShowLoad(true), 0); }}
                        className="p-1 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-12 text-gray-600 text-xs">
          <p>Educational Strategy Game · 교육 전략 게임</p>
          <p className="mt-1">2–6 Players · Local Multiplayer</p>
        </div>
      </div>
    </div>
  );
}