import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { X, Heart } from 'lucide-react';

const JUNIOR_RESOURCES = ['energy', 'water', 'food', 'minerals'];

export default function CooperationPanel({ onClose }) {
  const { t } = useLang();
  const { gameState, giveResource } = useGame();
  const [selectedNation, setSelectedNation] = useState(null);
  const [selectedResource, setSelectedResource] = useState('food');
  const [amount, setAmount] = useState(1);
  const [msg, setMsg] = useState('');

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const others = gameState.players.filter((_, i) => i !== gameState.currentPlayerIndex);

  const handleGive = () => {
    if (selectedNation === null) return;
    if ((player.resources[selectedResource] || 0) < amount) { setMsg('Not enough ' + selectedResource); return; }
    giveResource(selectedNation, selectedResource, amount);
    setMsg('✓ Resource given!');
    setTimeout(() => setMsg(''), 2000);
  };

  const resourceIcons = { energy: '⚡', water: '💧', food: '🌾', minerals: '💎' };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-sm w-full bg-gray-900 border border-blue-700/50 rounded-xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-blue-400" />
            <h3 className="text-white font-heading font-bold">{t.cooperation.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        {others.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">{t.cooperation.noOtherNations}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-2 block">{t.cooperation.selectNation}</label>
              <div className="flex flex-col gap-2">
                {others.map(p => (
                  <button key={p.index} onClick={() => setSelectedNation(p.index)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${selectedNation === p.index ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/40 hover:bg-gray-700/40'}`}>
                    <span>{p.emblem}</span>
                    <span className="text-white text-sm" style={{ color: p.colorHex }}>{p.countryName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-2 block">{t.cooperation.selectResource}</label>
              <div className="flex gap-2">
                {JUNIOR_RESOURCES.map(r => (
                  <button key={r} onClick={() => setSelectedResource(r)}
                    className={`flex-1 py-2 rounded text-xs font-medium transition-colors ${selectedResource === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                    {resourceIcons[r]} {t.resources[r]}
                    <div className="text-[10px] mt-0.5 opacity-70">{player.resources[r] || 0}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-heading uppercase tracking-wider mb-1 block">{t.cooperation.amount}: {amount}</label>
              <input type="range" min={1} max={Math.min(5, player.resources[selectedResource] || 0)} value={amount}
                onChange={e => setAmount(parseInt(e.target.value))}
                className="w-full accent-blue-500" />
            </div>

            {msg && <div className="px-3 py-2 bg-green-900/30 border border-green-700/50 rounded text-green-300 text-xs">{msg}</div>}

            <button onClick={handleGive} disabled={selectedNation === null}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-heading font-semibold text-sm transition-colors disabled:opacity-40">
              {t.cooperation.giveResource} {resourceIcons[selectedResource]} {amount}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}