import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ModeSelector from './ModeSelector';
import { GRADE_MODES } from '@/lib/gameModes';

export default function GameSetup() {
  const { t } = useLang();
  const { setScreen } = useGame();

  const [settings, setSettings] = useState({
    playerCount: 2,
    gradeMode: 'junior',
    mapSize: 'small',
    gameLength: 8,
    eventFrequency: 'low',
    startingResources: 'abundant',
    protectionPeriod: 4,
    actionPointsPerTurn: 3,
    educationalMode: true,
  });

  const applyGradeMode = (modeKey) => {
    const mode = GRADE_MODES[modeKey];
    if (mode) {
      setSettings(s => ({
        ...s,
        gradeMode: modeKey,
        mapSize: mode.mapSize,
        gameLength: mode.gameLength,
        eventFrequency: mode.eventFrequency,
        startingResources: mode.startingResources,
        protectionPeriod: mode.protectionPeriod,
        actionPointsPerTurn: mode.actionPointsPerTurn,
      }));
    }
  };

  const handleNext = () => {
    sessionStorage.setItem('marsGameSettings', JSON.stringify(settings));
    setScreen('nationCreation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-red-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-900/80 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-display font-bold text-white mb-6">{t.setup.title}</h2>

        <div className="mb-6">
          <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-3 block">{t.setup.gradeMode}</label>
          <ModeSelector value={settings.gradeMode} onChange={applyGradeMode} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">{t.setup.players}</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setSettings(s => ({ ...s, playerCount: n }))}
                  className={`w-10 h-10 rounded font-bold text-sm transition-colors ${settings.playerCount === n ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">{t.setup.mapSize}</label>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map(s => (
                <button key={s} onClick={() => setSettings(prev => ({ ...prev, mapSize: s }))}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${settings.mapSize === s ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {t.setup[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
              {t.setup.gameLength}: <span className="text-orange-400">{settings.gameLength}</span>
            </label>
            <input type="range" min={5} max={50} step={1} value={settings.gameLength}
              onChange={e => setSettings(s => ({ ...s, gameLength: parseInt(e.target.value) }))}
              className="w-full accent-orange-500" />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">{t.setup.eventFrequency}</label>
            <div className="flex gap-2">
              {['low', 'normal', 'high'].map(f => (
                <button key={f} onClick={() => setSettings(s => ({ ...s, eventFrequency: f }))}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${settings.eventFrequency === f ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {t.setup[f]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">{t.setup.startingResources}</label>
            <div className="flex gap-2">
              {['scarce', 'standard', 'abundant'].map(r => (
                <button key={r} onClick={() => setSettings(s => ({ ...s, startingResources: r }))}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${settings.startingResources === r ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {t.setup[r]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button onClick={() => setScreen('menu')}
            className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ChevronLeft size={16} />
            {t.setup.back}
          </button>
          <button onClick={handleNext}
            className="flex items-center gap-1 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-semibold transition-colors">
            {t.setup.next}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}