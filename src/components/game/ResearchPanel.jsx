import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { JUNIOR_TECHS } from '@/lib/gameModes';
import { TECH_TREE, getPlayerLabLevel } from '@/lib/gameData';
import { X, FlaskConical, Check, Lock, ChevronDown, ChevronUp } from 'lucide-react';

// ---- Junior ----
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
    if ((player.resources.science || 0) < (techData.cost.science || 0)) { setErrorMsg(t.research.notEnoughScience); return; }
    for (const prereq of techData.prerequisites) {
      if (!player.technologies.includes(prereq)) { setErrorMsg(t.research.prerequisitesMissing); return; }
    }
    researchTech(techId);
    setJustResearched(techId);
    setTimeout(() => setJustResearched(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(8,12,25,0.99)', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 0 40px rgba(167,139,250,0.12)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)' }}>
              <FlaskConical size={15} className="text-purple-400" />
            </div>
            <h3 className="text-white font-heading font-bold text-base">{t.research.juniorTitle}</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X size={17} /></button>
        </div>

        <div className="flex items-center gap-4 px-5 py-2.5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-gray-500 text-xs">🔬 <span className="text-purple-400 font-bold font-mono">{player.resources.science || 0}</span></span>
          <span className="text-gray-500 text-xs">AP: <span className="text-orange-400 font-bold font-mono">{ap}</span></span>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg text-xs text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>{errorMsg}</div>
        )}
        {justResearched && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg text-xs text-green-300 flex items-center gap-2"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <Check size={12} /> {lang === 'ko' ? t.research.confirmedKo : t.research.confirmed}
          </div>
        )}

        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {Object.entries(JUNIOR_TECHS).map(([techId, techData]) => {
            const isResearched = player.technologies.includes(techId);
            const canAfford = (player.resources.science || 0) >= techData.cost.science;
            const prereqsMet = techData.prerequisites.every(p => player.technologies.includes(p));
            const canResearch = !isResearched && canAfford && prereqsMet && ap > 0;
            return (
              <div key={techId} className="rounded-xl px-3 py-3 transition-all"
                style={{
                  background: isResearched ? 'rgba(74,222,128,0.06)' : canResearch ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isResearched ? 'rgba(74,222,128,0.25)' : canResearch ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  opacity: isResearched ? 0.7 : 1,
                }}>
                <div className="flex items-start gap-2.5 justify-between">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="mt-0.5 shrink-0">
                      {isResearched ? <Check size={13} className="text-green-400" /> : prereqsMet ? <FlaskConical size={13} className="text-purple-400" /> : <Lock size={13} className="text-gray-600" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm leading-tight">
                        {lang === 'ko' ? (techData.nameKo || t.tech[techId] || techId) : (techData.nameEn || t.tech[techId] || techId)}
                      </p>
                      <p className="text-gray-500 text-[11px] mt-0.5">{lang === 'ko' ? techData.effectDescKo : techData.effectDesc}</p>
                    </div>
                  </div>
                  <span className="text-purple-300 font-mono text-xs shrink-0">🔬 {techData.cost.science}</span>
                </div>
                {isResearched ? (
                  <p className="mt-1.5 text-[11px] text-green-400">{t.research.researched}</p>
                ) : canResearch ? (
                  <button onClick={() => handleResearch(techId, techData)}
                    className="mt-2 w-full py-1.5 rounded-lg text-xs font-heading font-bold transition-all"
                    style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', color: '#c4b5fd' }}>
                    {t.research.researchBtn} (🔬 {techData.cost.science})
                  </button>
                ) : !prereqsMet ? (
                  <p className="mt-1.5 text-[11px] text-gray-600">{t.research.prerequisitesMissing}</p>
                ) : !canAfford ? (
                  <p className="mt-1.5 text-[11px] text-red-400">{t.research.notEnoughScience}</p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-gray-600">{t.research.notEnoughAP}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Senior ----
const BRANCHES = ['survival', 'energy', 'agriculture', 'industry', 'transportation', 'society', 'planetaryScience'];
const BRANCH_META = {
  survival:         { icon: '❤️', color: '#f87171' },
  energy:           { icon: '⚡', color: '#eab308' },
  agriculture:      { icon: '🌱', color: '#4ade80' },
  industry:         { icon: '⚙️', color: '#94a3b8' },
  transportation:   { icon: '🚀', color: '#60a5fa' },
  society:          { icon: '🏛️', color: '#fb923c' },
  planetaryScience: { icon: '🔭', color: '#a78bfa' },
};
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
    if (!techData || player.technologies.includes(techId)) { setErrorMsg(t.research.alreadyResearched); return; }
    if (ap <= 0) { setErrorMsg(t.research.notEnoughAP); return; }
    for (const prereq of techData.prerequisites) {
      if (!player.technologies.includes(prereq)) { setErrorMsg(t.research.prerequisitesMissing); return; }
    }
    if (techData.labRequired && labLevel < techData.labRequired) {
      setErrorMsg(techData.labRequired === 2 ? t.research.advancedLabMissing : t.research.labMissing); return;
    }
    for (const [res, amt] of Object.entries(techData.cost)) {
      if ((player.resources[res] || 0) < amt) { setErrorMsg(t.research.notEnoughScience); return; }
    }
    researchTech(techId);
    setJustResearched(techId);
    setTimeout(() => setJustResearched(null), 2000);
  };

  const branchTechs = Object.entries(TECH_TREE).filter(([, d]) => d.branch === selectedBranch);
  const activeMeta = BRANCH_META[selectedBranch] || { icon: '🔬', color: '#a78bfa' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: 'rgba(6,9,22,0.99)', border: '1px solid rgba(167,139,250,0.25)', boxShadow: '0 0 50px rgba(167,139,250,0.1)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)' }}>
              <FlaskConical size={15} className="text-purple-400" />
            </div>
            <h3 className="text-white font-heading font-bold text-base">{t.research.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs">🔬 <span className="text-purple-400 font-bold">{player.resources.science || 0}</span></span>
            <span className="text-gray-500 text-xs">AP <span className="text-orange-400 font-bold">{ap}</span></span>
            <span className="text-[10px] px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              Lab L{labLevel}
            </span>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors ml-1"><X size={16} /></button>
          </div>
        </div>

        {(errorMsg || justResearched) && (
          <div className={`mx-4 mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${justResearched ? 'text-green-300' : 'text-red-300'}`}
            style={{
              background: justResearched ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${justResearched ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
            {justResearched ? <><Check size={12} /> {t.research.confirmed}</> : errorMsg}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="w-36 shrink-0 p-2 overflow-y-auto"
            style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            {BRANCHES.map(branch => {
              const meta = BRANCH_META[branch];
              const isActive = selectedBranch === branch;
              return (
                <button key={branch} onClick={() => setSelectedBranch(branch)}
                  className="w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left text-xs font-medium mb-1 transition-all"
                  style={{
                    background: isActive ? meta.color + '18' : 'transparent',
                    border: isActive ? `1px solid ${meta.color}35` : '1px solid transparent',
                    color: isActive ? meta.color : '#6b7280',
                  }}>
                  <span>{meta.icon}</span>
                  <span className="truncate">{t.tech[branch]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <span>{activeMeta.icon}</span>
              <p className="text-[9px] uppercase tracking-widest font-heading" style={{ color: activeMeta.color }}>{t.tech[selectedBranch]}</p>
            </div>
            <div className="space-y-2">
              {branchTechs.map(([techId, techData]) => {
                const status = getTechStatus(techId);
                const isExp = expanded === techId;
                const labLabel = t.research[LAB_LABELS[techData.labRequired] ?? 'noLab'];
                return (
                  <div key={techId} className="rounded-xl overflow-hidden transition-all"
                    style={{
                      background: status === 'researched' ? 'rgba(74,222,128,0.05)' : status === 'available' ? activeMeta.color + '10' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${status === 'researched' ? 'rgba(74,222,128,0.2)' : status === 'available' ? activeMeta.color + '35' : 'rgba(255,255,255,0.07)'}`,
                      opacity: status === 'researched' ? 0.7 : 1,
                    }}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                      onClick={() => setExpanded(isExp ? null : techId)}>
                      <span className="text-base shrink-0">
                        {status === 'researched' ? '✅' : status === 'available' ? '🔬' : status === 'unaffordable' ? '💸' : '🔒'}
                      </span>
                      <span className="flex-1 font-medium text-sm text-white">{t.tech[techId] || techId}</span>
                      <span className="text-xs font-mono text-gray-500 shrink-0">🔬 {techData.cost.science}</span>
                      {isExp ? <ChevronUp size={12} className="text-gray-600 shrink-0" /> : <ChevronDown size={12} className="text-gray-600 shrink-0" />}
                    </button>
                    {isExp && (
                      <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-gray-400 text-xs pt-2 leading-relaxed">{lang === 'ko' ? techData.effectDescKo : techData.effectDesc}</p>
                        {techData.prerequisites.length > 0 && (
                          <p className="text-gray-600 text-[11px]">{t.research.prerequisites}: {techData.prerequisites.map(p => t.tech[p] || p).join(', ')}</p>
                        )}
                        <p className="text-gray-600 text-[11px]">{t.research.labRequired}: {labLabel}</p>
                        {status === 'available' && (
                          <button onClick={() => handleResearch(techId)}
                            className="w-full py-1.5 rounded-lg text-xs font-heading font-bold transition-all"
                            style={{ background: activeMeta.color + '20', border: `1px solid ${activeMeta.color}40`, color: activeMeta.color }}>
                            {t.research.researchBtn} (🔬 {techData.cost.science})
                          </button>
                        )}
                        {status === 'unaffordable' && <p className="text-yellow-400 text-xs">{t.research.notEnoughScience}</p>}
                        {status === 'locked' && (
                          <p className="text-gray-600 text-xs">
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

export default function ResearchPanel({ onClose }) {
  const { gameState } = useGame();
  const isJunior = gameState?.settings?.gradeMode === 'junior';
  return isJunior ? <JuniorResearchPanel onClose={onClose} /> : <SeniorResearchPanel onClose={onClose} />;
}