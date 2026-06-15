import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { JUNIOR_TECHS } from '@/lib/gameModes';
import { TECH_TREE, getPlayerLabLevel } from '@/lib/gameData';
import { X, FlaskConical, Check, Lock, ChevronDown, ChevronUp } from 'lucide-react';

// ---- Junior Research Panel ----
function JuniorResearchPanel({ onClose }) {
  const { t, lang } = useLang();
  const { gameState, researchTech } = useGame();
  const [justResearched, setJustResearched] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const ap = gameState.actionPoints;

  const handleResearch = (techId, techData) => {
    setErrorMsg('');
    if (player.technologies.includes(techId)) { setErrorMsg(t.research.alreadyResearched); return; }
    if (ap <= 0) { setErrorMsg(t.research.notEnoughAP); return; }
    const cost = techData.cost.science || 0;
    if ((player.resources.science || 0) < cost) { setErrorMsg(t.research.notEnoughScience); return; }
    for (const prereq of techData.prerequisites) {
      if (!player.technologies.includes(prereq)) { setErrorMsg(t.research.prerequisitesMissing); return; }
    }
    researchTech(techId);
    setJustResearched(techId);
    setTimeout(() => setJustResearched(null), 2000);
  };

  const techList = Object.entries(JUNIOR_TECHS);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-md w-full bg-gray-900 border border-purple-700/50 rounded-xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-purple-400" />
            <h3 className="text-white font-heading font-bold text-lg">{t.research.juniorTitle}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex items-center gap-3 mb-4 p-2 bg-gray-800/60 rounded-lg text-xs">
          <span className="text-gray-400">🔬 {t.resources.science}: <span className="text-purple-400 font-bold">{player.resources.science || 0}</span></span>
          <span className="text-gray-400">{t.actions.actionPoints}: <span className="text-orange-400 font-bold">{ap}</span></span>
        </div>

        {errorMsg && (
          <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700/50 rounded text-red-300 text-xs">{errorMsg}</div>
        )}
        {justResearched && (
          <div className="mb-3 px-3 py-2 bg-green-900/30 border border-green-700/50 rounded text-green-300 text-xs">
            ✓ {lang === 'ko' ? t.research.confirmedKo : t.research.confirmed}
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {techList.map(([techId, techData]) => {
            const isResearched = player.technologies.includes(techId);
            const canAfford = (player.resources.science || 0) >= techData.cost.science;
            const prereqsMet = techData.prerequisites.every(p => player.technologies.includes(p));
            const canResearch = !isResearched && canAfford && prereqsMet && ap > 0;

            return (
              <div key={techId} className={`p-3 rounded-lg border transition-all ${isResearched ? 'border-green-700/40 bg-green-900/10 opacity-70' : canResearch ? 'border-purple-600/40 bg-purple-900/10' : 'border-gray-700/50 bg-gray-800/30'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isResearched ? <Check size={14} className="text-green-400 shrink-0" /> : prereqsMet ? <FlaskConical size={14} className="text-purple-400 shrink-0" /> : <Lock size={14} className="text-gray-500 shrink-0" />}
                    <div>
                      <p className="text-white font-medium text-sm">{lang === 'ko' ? (techData.nameKo || t.tech[techId] || techId) : (techData.nameEn || t.tech[techId] || techId)}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{lang === 'ko' ? techData.effectDescKo : techData.effectDesc}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-purple-300 font-mono">🔬 {techData.cost.science}</div>
                  </div>
                </div>
                {isResearched ? (
                  <div className="mt-1 text-[11px] text-green-400">{t.research.researched}</div>
                ) : canResearch ? (
                  <button onClick={() => handleResearch(techId, techData)}
                    className="mt-2 w-full py-1.5 bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 rounded text-xs font-medium transition-colors">
                    {t.research.researchBtn} (🔬 {techData.cost.science})
                  </button>
                ) : !prereqsMet ? (
                  <div className="mt-1 text-[11px] text-gray-500">{t.research.prerequisitesMissing}</div>
                ) : !canAfford ? (
                  <div className="mt-1 text-[11px] text-red-400">{t.research.notEnoughScience}</div>
                ) : (
                  <div className="mt-1 text-[11px] text-gray-500">{t.research.notEnoughAP}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Senior Research Panel (full branching tree) ----
const BRANCHES = ['survival', 'energy', 'agriculture', 'industry', 'transportation', 'society', 'planetaryScience'];
const BRANCH_ICONS = { survival: '❤️', energy: '⚡', agriculture: '🌱', industry: '⚙️', transportation: '🚀', society: '🏛️', planetaryScience: '🔭' };
const LAB_LABELS = { null: 'noLab', 1: 'researchLab', 2: 'advancedLab' };

function SeniorResearchPanel({ onClose }) {
  const { t, lang } = useLang();
  const { gameState, researchTech } = useGame();
  const [selectedBranch, setSelectedBranch] = useState('survival');
  const [justResearched, setJustResearched] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [expanded, setExpanded] = useState(null);

  if (!gameState) return null;
  const player = gameState.players[gameState.currentPlayerIndex];
  const ap = gameState.actionPoints;
  const labLevel = getPlayerLabLevel(player, gameState.map);

  const getTechStatus = (techId) => {
    const techData = TECH_TREE[techId];
    if (!techData) return 'locked';
    if (player.technologies.includes(techId)) return 'researched';
    const prereqsMet = techData.prerequisites.every(p => player.technologies.includes(p));
    const labOk = !techData.labRequired || labLevel >= techData.labRequired;
    const canAfford = Object.entries(techData.cost).every(([r, a]) => (player.resources[r] || 0) >= a);
    if (prereqsMet && labOk && canAfford) return 'available';
    if (prereqsMet && labOk) return 'unaffordable';
    return 'locked';
  };

  const handleResearch = (techId) => {
    setErrorMsg('');
    const techData = TECH_TREE[techId];
    if (!techData) return;
    if (player.technologies.includes(techId)) { setErrorMsg(t.research.alreadyResearched); return; }
    if (ap <= 0) { setErrorMsg(t.research.notEnoughAP); return; }
    for (const prereq of techData.prerequisites) {
      if (!player.technologies.includes(prereq)) { setErrorMsg(t.research.prerequisitesMissing); return; }
    }
    if (techData.labRequired && labLevel < techData.labRequired) {
      setErrorMsg(techData.labRequired === 2 ? t.research.advancedLabMissing : t.research.labMissing);
      return;
    }
    for (const [res, amt] of Object.entries(techData.cost)) {
      if ((player.resources[res] || 0) < amt) { setErrorMsg(t.research.notEnoughScience); return; }
    }
    researchTech(techId);
    setJustResearched(techId);
    setTimeout(() => setJustResearched(null), 2000);
  };

  const branchTechs = Object.entries(TECH_TREE).filter(([, d]) => d.branch === selectedBranch);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="max-w-2xl w-full bg-gray-900 border border-purple-700/50 rounded-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-purple-400" />
            <h3 className="text-white font-heading font-bold text-lg">{t.research.title}</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">🔬 <span className="text-purple-400 font-bold">{player.resources.science || 0}</span></span>
            <span className="text-gray-400">AP: <span className="text-orange-400 font-bold">{ap}</span></span>
            <span className="text-xs px-2 py-0.5 bg-gray-800 rounded border border-gray-700 text-gray-400">
              Lab: {labLevel === 2 ? '🏆' : labLevel === 1 ? '🔬' : '📡'} L{labLevel}
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-white ml-2"><X size={18} /></button>
          </div>
        </div>

        {(errorMsg || justResearched) && (
          <div className={`mx-4 mt-3 px-3 py-2 rounded text-xs ${justResearched ? 'bg-green-900/30 border border-green-700/50 text-green-300' : 'bg-red-900/30 border border-red-700/50 text-red-300'}`}>
            {justResearched ? `✓ ${t.research.confirmed}` : errorMsg}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="w-36 bg-gray-900/50 border-r border-gray-800 p-2 overflow-y-auto shrink-0">
            {BRANCHES.map(branch => (
              <button key={branch} onClick={() => setSelectedBranch(branch)}
                className={`w-full flex items-center gap-1.5 px-2 py-2 rounded text-left text-xs font-medium mb-1 transition-colors ${selectedBranch === branch ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <span>{BRANCH_ICONS[branch]}</span>
                <span className="truncate">{t.tech[branch]}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {branchTechs.map(([techId, techData]) => {
                const status = getTechStatus(techId);
                const isExp = expanded === techId;
                const labLabel = t.research[LAB_LABELS[techData.labRequired] ?? 'noLab'];
                return (
                  <div key={techId} className={`rounded-lg border transition-all ${status === 'researched' ? 'border-green-700/30 bg-green-900/10 opacity-60' : status === 'available' ? 'border-purple-600/50 bg-purple-900/10' : status === 'unaffordable' ? 'border-yellow-700/30 bg-yellow-900/5' : 'border-gray-700/40 bg-gray-800/20'}`}>
                    <button className="w-full flex items-center gap-2 p-3 text-left" onClick={() => setExpanded(isExp ? null : techId)}>
                      <span>{status === 'researched' ? '✅' : status === 'available' ? '🔬' : status === 'unaffordable' ? '💸' : '🔒'}</span>
                      <span className="flex-1 font-medium text-sm text-white">{t.tech[techId] || techId}</span>
                      <span className="text-xs text-gray-500 shrink-0">🔬 {techData.cost.science}</span>
                      {isExp ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}
                    </button>
                    {isExp && (
                      <div className="px-3 pb-3 border-t border-gray-700/30 pt-2 space-y-2">
                        <p className="text-gray-300 text-xs">{lang === 'ko' ? techData.effectDescKo : techData.effectDesc}</p>
                        {techData.prerequisites.length > 0 && (
                          <p className="text-gray-500 text-xs">{t.research.prerequisites}: {techData.prerequisites.map(p => t.tech[p] || p).join(', ')}</p>
                        )}
                        <p className="text-gray-500 text-xs">{t.research.labRequired}: {labLabel}</p>
                        {status === 'available' && (
                          <button onClick={() => handleResearch(techId)}
                            className="w-full py-1.5 bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 rounded text-xs font-medium transition-colors">
                            {t.research.researchBtn} (🔬 {techData.cost.science})
                          </button>
                        )}
                        {status === 'unaffordable' && <p className="text-yellow-400 text-xs">{t.research.notEnoughScience}</p>}
                        {status === 'locked' && !player.technologies.includes(techId) && (
                          <p className="text-gray-500 text-xs">
                            {techData.labRequired && labLevel < techData.labRequired
                              ? (techData.labRequired === 2 ? t.research.advancedLabMissing : t.research.labMissing)
                              : t.research.prerequisitesMissing}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Exported wrapper ----
export default function ResearchPanel({ onClose }) {
  const { gameState } = useGame();
  const isJunior = gameState?.settings?.gradeMode === 'junior';
  return isJunior
    ? <JuniorResearchPanel onClose={onClose} />
    : <SeniorResearchPanel onClose={onClose} />;
}