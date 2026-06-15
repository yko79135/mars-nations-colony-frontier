import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Save, FolderOpen, Trash2, X, Check } from 'lucide-react';

export default function SaveLoadModal({ isOpen, onClose }) {
  const { t } = useLang();
  const { saveGame, loadGame, getSavedGames, deleteSave } = useGame();
  const [saveName, setSaveName] = useState('');
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('save');

  if (!isOpen) return null;
  const saves = getSavedGames();
  const saveKeys = Object.keys(saves);

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveGame(saveName.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button onClick={() => setTab('save')} className={`px-3 py-1 rounded text-sm ${tab === 'save' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t.save.saveGame}</button>
            <button onClick={() => setTab('load')} className={`px-3 py-1 rounded text-sm ${tab === 'load' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}>{t.save.loadGame}</button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        {tab === 'save' && (
          <div>
            <div className="flex gap-2 mb-4">
              <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder={t.save.saveName}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-orange-500 focus:outline-none" />
              <button onClick={handleSave} disabled={!saveName.trim()} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm font-medium disabled:opacity-40 flex items-center gap-1">
                {saved ? <Check size={16} /> : <Save size={16} />}
                {t.save.save}
              </button>
            </div>
            {saved && <p className="text-green-400 text-sm">{t.save.saveSuccess}</p>}
          </div>
        )}

        {tab === 'load' && (
          <div>
            {saveKeys.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">{t.save.noSaves}</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {saveKeys.map(key => (
                  <div key={key} className="flex items-center justify-between bg-gray-800/60 rounded p-3">
                    <div>
                      <p className="text-gray-200 text-sm font-medium">{key}</p>
                      <p className="text-gray-500 text-xs">{t.general.round} {saves[key].currentRound} · {saves[key].players?.length || 0} players</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { loadGame(key); onClose(); }} className="px-3 py-1 bg-orange-600/30 text-orange-300 rounded text-xs hover:bg-orange-600/50">{t.save.load}</button>
                      <button onClick={() => deleteSave(key)} className="p-1 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}