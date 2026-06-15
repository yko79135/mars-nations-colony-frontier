import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { ChevronLeft, Check, X, Clock, Shield, Users, ArrowRightLeft, Share2, Heart } from 'lucide-react';

const TYPE_ICONS = {
  trade: ArrowRightLeft, alliance: Users, nonAggression: Shield,
  shareTech: Share2, emergencyAid: Heart,
};
const TYPE_COLORS = {
  trade: '#60a5fa', alliance: '#4ade80', nonAggression: '#fbbf24',
  shareTech: '#a78bfa', emergencyAid: '#fb923c',
};
const TYPE_LABELS = {
  trade: { en: 'Trade', ko: '무역' },
  alliance: { en: 'Alliance', ko: '동맹' },
  nonAggression: { en: 'Non-Aggression', ko: '불가침' },
  shareTech: { en: 'Tech Share', ko: '기술 공유' },
  emergencyAid: { en: 'Emergency Aid', ko: '긴급 지원' },
};
const RES_ICONS = { energy: '⚡', water: '💧', food: '🌾', minerals: '💎', science: '🔬' };

export default function ActiveAgreementsList({ onClose }) {
  const { t, lang } = useLang();
  const { gameState, acceptProposal, rejectProposal, withdrawProposal, cancelAgreement } = useGame();
  const [tab, setTab] = useState('pending'); // 'pending' | 'active' | 'history'
  const [flash, setFlash] = useState(null);

  if (!gameState) return null;

  const pidx = gameState.currentPlayerIndex;
  const player = gameState.players[pidx];
  const dipl = gameState.diplomacy || { proposals: [], agreements: [], history: [] };

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(null), 2000); };

  const handleAccept = (id) => { acceptProposal(id); showFlash('accepted'); };
  const handleReject = (id) => { rejectProposal(id); showFlash('rejected'); };
  const handleWithdraw = (id) => { withdrawProposal(id); showFlash('withdrawn'); };

  // Pending: incoming + outgoing
  const pendingProposals = dipl.proposals.filter(p => p.status === 'pending');
  const incomingProposals = pendingProposals.filter(p => p.recipientIndex === pidx);
  const outgoingProposals = pendingProposals.filter(p => p.proposerIndex === pidx);

  // Active
  const activeAgreements = dipl.agreements.filter(a => a.status === 'active' && a.nationIds.includes(pidx));

  // History
  const historyItems = dipl.history || [];

  const renderProposalCard = (prop, isIncoming) => {
    const otherIdx = isIncoming ? prop.proposerIndex : prop.recipientIndex;
    const other = gameState.players[otherIdx];
    const TypeIcon = TYPE_ICONS[prop.type] || ArrowRightLeft;
    const col = TYPE_COLORS[prop.type] || '#9ca3af';
    const typeLabel = (TYPE_LABELS[prop.type] || {})[lang] || prop.type;

    return (
      <div key={prop.id} className="rounded-xl p-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-2">
          <TypeIcon size={14} style={{ color: col }} />
          <span className="text-xs font-medium" style={{ color: col }}>{typeLabel}</span>
          <span className="text-[9px] text-gray-500 ml-auto">{t.general.round} {prop.createdRound}</span>
        </div>

        {/* Trade details */}
        {prop.type === 'trade' && (
          <div className="text-[10px] text-gray-400 mb-2">
            {Object.keys(prop.offeredResources || {}).length > 0 && (
              <span>{Object.entries(prop.offeredResources || {}).map(([r, a]) => `${a} ${RES_ICONS[r] || r}`).join(', ')}</span>
            )}
            {Object.keys(prop.offeredResources || {}).length > 0 && Object.keys(prop.requestedResources || {}).length > 0 && (
              <span className="text-gray-600"> ↔ </span>
            )}
            {Object.keys(prop.requestedResources || {}).length > 0 && (
              <span>{Object.entries(prop.requestedResources || {}).map(([r, a]) => `${a} ${RES_ICONS[r] || r}`).join(', ')}</span>
            )}
          </div>
        )}
        {prop.type === 'alliance' && (
          <p className="text-[10px] text-gray-400 mb-2">{t.diplomacy.duration}: {prop.duration || 5} {lang === 'ko' ? '라운드' : 'rounds'}</p>
        )}
        {prop.type === 'nonAggression' && (
          <p className="text-[10px] text-gray-400 mb-2">{t.diplomacy.pactDuration}: {prop.pactDuration || 5} {lang === 'ko' ? '라운드' : 'rounds'}</p>
        )}
        {prop.type === 'shareTech' && (
          <p className="text-[10px] text-gray-400 mb-2">🔬 {t.tech[prop.techId] || prop.techId}</p>
        )}
        {prop.type === 'emergencyAid' && (
          <p className="text-[10px] text-gray-400 mb-2">{RES_ICONS[prop.aidResource]} {prop.aidAmount} {t.resources[prop.aidResource]}</p>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded flex items-center justify-center text-[8px]"
              style={{ background: other?.colorHex + '30', border: `1px solid ${other?.colorHex}` }}>{other?.emblem}</div>
            <span className="text-[10px] text-gray-400">{other?.countryName}</span>
          </div>
          <div className="ml-auto flex gap-1">
            {isIncoming ? (
              <>
                <button onClick={() => handleAccept(prop.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
                  style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#86efac' }}>
                  <Check size={10} /> {t.diplomacy.acceptProposal}
                </button>
                <button onClick={() => handleReject(prop.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <X size={10} /> {t.diplomacy.rejectProposal}
                </button>
              </>
            ) : (
              <button onClick={() => handleWithdraw(prop.id)}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
                style={{ background: 'rgba(156,163,175,0.15)', border: '1px solid rgba(156,163,175,0.3)', color: '#9ca3af' }}>
                <X size={10} /> {t.diplomacy.withdrawProposal}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveCard = (agr) => {
    const otherIdx = agr.nationIds.find(i => i !== pidx);
    const other = gameState.players[otherIdx];
    const TypeIcon = TYPE_ICONS[agr.type] || ArrowRightLeft;
    const col = TYPE_COLORS[agr.type] || '#9ca3af';
    const typeLabel = (TYPE_LABELS[agr.type] || {})[lang] || agr.type;
    const elapsed = gameState.currentRound - agr.startRound;
    const remaining = Math.max(0, agr.duration - elapsed);

    return (
      <div key={agr.id} className="rounded-xl p-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mb-2">
          <TypeIcon size={14} style={{ color: col }} />
          <span className="text-xs font-medium" style={{ color: col }}>{typeLabel}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto"
            style={{ background: col + '18', border: `1px solid ${col}40`, color: col }}>
            {t.diplomacy.active}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded flex items-center justify-center text-[8px]"
              style={{ background: other?.colorHex + '30', border: `1px solid ${other?.colorHex}` }}>{other?.emblem}</div>
            <span className="text-[10px] text-gray-400">{other?.countryName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-gray-500">
          <span>{t.diplomacy.started}: {t.general.round} {agr.startRound}</span>
          <span>{t.diplomacy.remaining}: {remaining} {lang === 'ko' ? '라운드' : 'rounds'}</span>
        </div>
        {/* Cancel button */}
        <div className="mt-2">
          <button onClick={() => cancelAgreement(agr.id)}
            className="text-[9px] text-red-400 hover:text-red-300 transition-colors">
            {t.diplomacy.cancel}
          </button>
        </div>
      </div>
    );
  };

  const renderHistoryItem = (item) => {
    const otherIdx = item.nationIds
      ? item.nationIds.find(i => i !== (item.proposerIndex ?? item.cancelledBy ?? pidx))
      : (item.proposerIndex === pidx ? item.recipientIndex : item.proposerIndex);
    const other = gameState.players[otherIdx];
    const TypeIcon = TYPE_ICONS[item.type] || ArrowRightLeft;
    const col = TYPE_COLORS[item.type] || '#9ca3af';
    const typeLabel = (TYPE_LABELS[item.type] || {})[lang] || item.type;
    const statusColors = {
      accepted: '#4ade80', rejected: '#f87171', completed: '#60a5fa',
      withdrawn: '#9ca3af', cancelled: '#f87171',
    };
    const statusColor = statusColors[item.status] || '#9ca3af';
    const statusLabel = t.diplomacy[item.status] || item.status;

    return (
      <div key={item.id || Math.random()} className="rounded-xl p-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <TypeIcon size={12} style={{ color: col, opacity: 0.6 }} />
          <span className="text-[10px] text-gray-400">{typeLabel}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto"
            style={{ background: statusColor + '18', border: `1px solid ${statusColor}40`, color: statusColor }}>
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-3 h-3 rounded flex items-center justify-center text-[6px]"
            style={{ background: other?.colorHex + '30', border: `1px solid ${other?.colorHex}` }}>{other?.emblem}</div>
          <span className="text-[9px] text-gray-600">{other?.countryName}</span>
          <span className="text-[9px] text-gray-700 ml-auto">{t.general.round} {item.createdRound || item.startRound}</span>
        </div>
      </div>
    );
  };

  const TABS = [
    { key: 'pending', label: t.diplomacy.pendingProposals, count: pendingProposals.length },
    { key: 'active', label: t.diplomacy.activeAgreements, count: activeAgreements.length },
    { key: 'history', label: t.diplomacy.history, count: historyItems.length },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#04080f' }}>
      <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
        style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-white font-heading font-bold text-base">{t.diplomacy.agreements}</h2>
        {flash && (
          <span className="ml-auto flex items-center gap-1 text-xs animate-pulse"
            style={{ color: flash === 'accepted' ? '#4ade80' : flash === 'rejected' ? '#f87171' : '#9ca3af' }}>
            {flash === 'accepted' && <Check size={12} />}
            {flash === 'rejected' && <X size={12} />}
            {t.diplomacy[`proposal${flash.charAt(0).toUpperCase() + flash.slice(1)}`] || flash}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-2 shrink-0"
        style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tabItem => {
          const isActive = tab === tabItem.key;
          return (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                color: isActive ? 'white' : '#9ca3af',
              }}>
              {tabItem.label}
              {tabItem.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px]"
                  style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>{tabItem.count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-2xl mx-auto space-y-3">

          {/* Pending */}
          {tab === 'pending' && (
            <>
              {incomingProposals.length === 0 && outgoingProposals.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-sm">{t.diplomacy.noAgreements}</div>
              )}
              {incomingProposals.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">{t.diplomacy.incoming}</p>
                  {incomingProposals.map(p => renderProposalCard(p, true))}
                </div>
              )}
              {outgoingProposals.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-2 mt-4">{t.diplomacy.outgoing}</p>
                  {outgoingProposals.map(p => renderProposalCard(p, false))}
                </div>
              )}
            </>
          )}

          {/* Active */}
          {tab === 'active' && (
            <>
              {activeAgreements.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-sm">{t.diplomacy.noAgreements}</div>
              )}
              {activeAgreements.map(a => renderActiveCard(a))}
            </>
          )}

          {/* History */}
          {tab === 'history' && (
            <>
              {historyItems.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-sm">
                  {lang === 'ko' ? '외교 기록이 없습니다.' : 'No diplomatic history yet.'}
                </div>
              )}
              {[...historyItems].reverse().map(item => renderHistoryItem(item))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}