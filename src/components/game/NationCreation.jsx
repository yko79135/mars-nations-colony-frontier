import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { FLAG_EMBLEMS, NATION_COLORS } from '@/lib/gameData';
import { ChevronLeft, Rocket, X, Check } from 'lucide-react';

const defaultNation = () => ({
  countryName: '', abbreviation: '', playerName: '', 
  color: '', colorHex: '', emblem: '🚀', colonyName: '', description: ''
});

export default function NationCreation() {
  const { t } = useLang();
  const { setScreen, startGame } = useGame();
  const settings = JSON.parse(sessionStorage.getItem('marsGameSettings') || '{}');
  const playerCount = settings.playerCount || 2;
  
  const [nations, setNations] = useState(
    Array.from({ length: playerCount }, () => defaultNation())
  );
  const [editingIndex, setEditingIndex] = useState(0);
  const [errors, setErrors] = useState({});

  const usedColors = nations.map(n => n.colorHex).filter(Boolean);
  const usedAbbrs = nations.map(n => n.abbreviation.toUpperCase()).filter(Boolean);

  const updateNation = (index, field, value) => {
    setNations(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrors(prev => ({ ...prev, [`${index}-${field}`]: null }));
  };

  const validate = () => {
    const errs = {};
    const seenColors = new Set();
    const seenAbbrs = new Set();
    
    nations.forEach((n, i) => {
      if (!n.countryName.trim()) errs[`${i}-countryName`] = t.nation.required;
      if (!n.abbreviation.trim()) errs[`${i}-abbreviation`] = t.nation.required;
      else if (n.abbreviation.length > 3) errs[`${i}-abbreviation`] = '3 max';
      if (!n.playerName.trim()) errs[`${i}-playerName`] = t.nation.required;
      if (!n.colorHex) errs[`${i}-color`] = t.nation.required;
      if (!n.colonyName.trim()) errs[`${i}-colonyName`] = t.nation.required;
      
      const abbr = n.abbreviation.toUpperCase();
      if (seenAbbrs.has(abbr) && abbr) errs[`${i}-abbreviation`] = t.nation.duplicate;
      seenAbbrs.add(abbr);
      
      if (seenColors.has(n.colorHex) && n.colorHex) errs[`${i}-color`] = t.nation.duplicate;
      seenColors.add(n.colorHex);
    });
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStart = () => {
    if (!validate()) return;
    startGame(settings, nations);
  };

  const current = nations[editingIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-red-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900/80 border border-gray-700 rounded-xl p-6">
        <h2 className="text-2xl font-display font-bold text-white mb-2">{t.setup.nationCreation}</h2>
        <p className="text-gray-400 text-sm mb-6">
          {t.general.player} {editingIndex + 1} {t.general.of} {playerCount}
        </p>

        {/* Player tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {nations.map((n, i) => (
            <button
              key={i}
              onClick={() => setEditingIndex(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                editingIndex === i
                  ? 'bg-orange-600 text-white'
                  : n.countryName
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-800 text-gray-500'
              }`}
              style={n.colorHex && editingIndex !== i ? { borderLeft: `3px solid ${n.colorHex}` } : {}}
            >
              {n.emblem} {n.countryName || `${t.general.player} ${i + 1}`}
              {n.countryName && n.playerName && n.colonyName && n.colorHex && (
                <Check size={12} className="text-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Edit form */}
        <div className="space-y-4">
          {/* Country name */}
          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
              {t.nation.countryName} *
            </label>
            <input
              type="text"
              value={current.countryName}
              onChange={e => updateNation(editingIndex, 'countryName', e.target.value)}
              placeholder="e.g. Olympus Republic"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
            />
            {errors[`${editingIndex}-countryName`] && <p className="text-red-400 text-xs mt-1">{errors[`${editingIndex}-countryName`]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Abbreviation */}
            <div>
              <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
                {t.nation.abbreviation} *
              </label>
              <input
                type="text"
                value={current.abbreviation}
                onChange={e => updateNation(editingIndex, 'abbreviation', e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
                placeholder="e.g. OLY"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none uppercase"
              />
              {errors[`${editingIndex}-abbreviation`] && <p className="text-red-400 text-xs mt-1">{errors[`${editingIndex}-abbreviation`]}</p>}
            </div>

            {/* Player name */}
            <div>
              <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
                {t.nation.playerName} *
              </label>
              <input
                type="text"
                value={current.playerName}
                onChange={e => updateNation(editingIndex, 'playerName', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
              />
              {errors[`${editingIndex}-playerName`] && <p className="text-red-400 text-xs mt-1">{errors[`${editingIndex}-playerName`]}</p>}
            </div>
          </div>

          {/* Colony name */}
          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
              {t.nation.colonyName} *
            </label>
            <input
              type="text"
              value={current.colonyName}
              onChange={e => updateNation(editingIndex, 'colonyName', e.target.value)}
              placeholder="e.g. Nova Base"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none"
            />
            {errors[`${editingIndex}-colonyName`] && <p className="text-red-400 text-xs mt-1">{errors[`${editingIndex}-colonyName`]}</p>}
          </div>

          {/* Color */}
          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
              {t.nation.countryColor} *
            </label>
            <div className="flex gap-2 flex-wrap">
              {NATION_COLORS.map(c => {
                const taken = usedColors.includes(c.hex) && current.colorHex !== c.hex;
                return (
                  <button
                    key={c.hex}
                    onClick={() => {
                      if (!taken) {
                        updateNation(editingIndex, 'colorHex', c.hex);
                        updateNation(editingIndex, 'color', c.name);
                      }
                    }}
                    disabled={taken}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      current.colorHex === c.hex
                        ? 'border-white scale-110'
                        : taken
                          ? 'border-gray-800 opacity-30 cursor-not-allowed'
                          : 'border-gray-700 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                );
              })}
            </div>
            {errors[`${editingIndex}-color`] && <p className="text-red-400 text-xs mt-1">{errors[`${editingIndex}-color`]}</p>}
          </div>

          {/* Emblem */}
          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
              {t.nation.flagEmblem}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {FLAG_EMBLEMS.map(e => (
                <button
                  key={e}
                  onClick={() => updateNation(editingIndex, 'emblem', e)}
                  className={`w-9 h-9 rounded text-lg flex items-center justify-center transition-all ${
                    current.emblem === e
                      ? 'bg-gray-600 border-2 border-orange-400 scale-110'
                      : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">
              {t.nation.description}
            </label>
            <textarea
              value={current.description}
              onChange={e => updateNation(editingIndex, 'description', e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Preview card */}
        {current.countryName && (
          <div className="mt-6 p-3 rounded-lg border flex items-center gap-3" style={{ borderColor: current.colorHex || '#555', backgroundColor: (current.colorHex || '#333') + '15' }}>
            <span className="text-3xl">{current.emblem}</span>
            <div>
              <p className="text-white font-heading font-bold">{current.countryName} <span className="text-gray-400 font-normal text-xs">[{current.abbreviation}]</span></p>
              <p className="text-gray-400 text-xs">{current.playerName} · {current.colonyName}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setScreen('setup')}
            className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft size={16} />
            {t.setup.back}
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-1 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-heading font-semibold transition-colors"
          >
            <Rocket size={18} />
            {t.setup.startGame}
          </button>
        </div>
      </div>
    </div>
  );
}