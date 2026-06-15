import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { TECH_TREE } from '@/lib/gameData';
import { ChevronLeft, FlaskConical, Lock, Check, Microscope } from 'lucide-react';

const BRANCHES = ['survival', 'energy', 'agriculture', 'industry', 'transportation', 'society', 'planetaryScience'];

const BRANCH_COLORS = {
  survival: 'border-red-500/40 bg-red-900/10',
  energy: 'border-yellow-500/40 bg-yellow-900/10',
  agriculture: 'border-green-500/40 bg-green-900/10',
  industry: 'border-amber-500/40 bg-amber-900/10',
  transportation: 'border-blue-500/40 bg-blue-900/10',
  society: 'border-purple-500/40 bg-purple-900/10',
  planetaryScience: 'border-cyan-500/40 bg-cyan-900/10',
};

const BRANCH_ICONS = {
  survival: '❤️', energy: '⚡', agriculture: '🌱', industry: '⚙️',
  transportation: '🚀', society: '🏛️', planetaryScience: '🔭',
};

export default function TechTree() {
  const { t } = useLang();
  const { gameState, researchTech, setScreen } = useGame();
  const [selectedBranch, setSelectedBranch] = useState('survival');
  
  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];

  const getTechStatus = (techId) => {
    if (player.technologies.includes(techId)) return 'researched';
    const techData = TECH_TREE[techId];
    const prereqsMet = techData.prerequisites.every(p => player.technologies.includes(p));
    const canAfford = Object.entries(techData.cost).every(([res, amt]) => (player.resources[res] || 0) >= amt);
    if (prereqsMet && canAfford) return 'available';
    return 'locked';
  };

  const branchTechs = Object.entries(TECH_TREE).filter(([, data]) => data.branch === selectedBranch);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <button onClick={() => setScreen('playing')} className="text-gray-400 hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <FlaskConical size={20} className="text-purple-400" />
        <h2 className="text-white font-heading font-bold text-lg">{t.nav.technology}</h2>
        <div className="ml-auto text-xs text-gray-400">
          🔬 {t.resources.science}: <span className="text-purple-400 font-bold">{player.resources.science}</span>
          <span className="ml-3">{t.actions.actionPoints}: <span className="text-orange-400 font-bold">{gameState.actionPoints}</span></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-gray-900/50 border-r border-gray-800 p-2 overflow-y-auto shrink-0">
          {BRANCHES.map(branch => (
            <button key={branch} onClick={() => setSelectedBranch(branch)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left text-xs font-medium mb-1 transition-colors ${selectedBranch === branch ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <span>{BRANCH_ICONS[branch]}</span>
              <span>{t.tech[branch]}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-3">
            {branchTechs.map(([techId, techData]) => {
              const status = getTechStatus(techId);
              return (
                <div key={techId} className={`p-4 rounded-lg border ${BRANCH_COLORS[selectedBranch]} ${status === 'researched' ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {status === 'researched' ? <Check size={16} className="text-green-400" /> : status === 'available' ? <Microscope size={16} className="text-yellow-400" /> : <Lock size={16} className="text-gray-500" />}
                      <h3 className="text-white font-heading font-semibold text-sm">{t.tech[techId] || techId}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${status === 'researched' ? 'bg-green-900/30 text-green-400' : status === 'available' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>
                      {t.tech[status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span>{t.actions.cost}: 🔬 {techData.cost.science}</span>
                    {techData.prerequisites.length > 0 && <span>Requires: {techData.prerequisites.map(p => t.tech[p] || p).join(', ')}</span>}
                  </div>
                  {techData.unlocks.length > 0 && <div className="text-xs text-gray-500">Unlocks: {techData.unlocks.map(u => t.buildings[u] || u).join(', ')}</div>}
                  {status === 'available' && gameState.actionPoints > 0 && (
                    <button onClick={() => researchTech(techId)} className="mt-2 px-4 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-xs font-medium transition-colors">
                      {t.tech.researchBtn} (🔬 {techData.cost.science})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}