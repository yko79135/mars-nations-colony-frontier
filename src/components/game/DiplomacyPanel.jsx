import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { getTrust, getTrustLabel, TRUST_LABELS } from '@/lib/gameData';
import { ChevronLeft, Users, ArrowRightLeft, Shield, Share2, Heart, CheckCircle } from 'lucide-react';
import TradeForm from './TradeForm';
import AllianceForm from './AllianceForm';
import NonAggressionForm from './NonAggressionForm';
import TechShareForm from './TechShareForm';
import EmergencyAidForm from './EmergencyAidForm';
import ActiveAgreementsList from './ActiveAgreementsList';

const DIPLOMACY_ACTIONS = [
  { key: 'trade',         icon: ArrowRightLeft, color: '#60a5fa' },
  { key: 'alliance',      icon: Users,          color: '#4ade80' },
  { key: 'nonAggression', icon: Shield,         color: '#fbbf24' },
  { key: 'shareTech',     icon: Share2,         color: '#a78bfa' },
  { key: 'emergencyAid',  icon: Heart,          color: '#fb923c' },
];

const ACTION_LABELS = {
  trade:         { en: 'Propose Trade',          ko: '무역 제안' },
  alliance:      { en: 'Form Alliance',          ko: '동맹 결성' },
  nonAggression: { en: 'Non-Aggression Pact',    ko: '불가침 조약' },
  shareTech:     { en: 'Share Technology',       ko: '기술 공유' },
  emergencyAid:  { en: 'Emergency Aid',          ko: '긴급 지원' },
};

export default function DiplomacyPanel() {
  const { t, lang } = useLang();
  const { gameState, setScreen } = useGame();
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [activeForm, setActiveForm] = useState(null); // 'trade' | 'alliance' | etc
  const [showAgreements, setShowAgreements] = useState(false);
  const [flash, setFlash] = useState(null);

  if (!gameState) return null;

  const player = gameState.players[gameState.currentPlayerIndex];
  const otherPlayers = gameState.players.filter((_, i) => i !== gameState.currentPlayerIndex);

  const handleFormSent = (msgKey) => {
    setActiveForm(null);
    setFlash(msgKey);
    setTimeout(() => setFlash(null), 2500);
  };

  if (showAgreements) {
    return <ActiveAgreementsList onClose={() => setShowAgreements(false)} />;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#04080f' }}>
      <div className="flex items-center gap-3 px-5 py-3.5 shrink-0"
        style={{ background: 'rgba(8,12,25,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => setScreen('playing')} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <ChevronLeft size={18} />
        </button>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)' }}>🤝</div>
        <h2 className="text-white font-heading font-bold text-base">{t.nav.diplomacy}</h2>
        <div className="ml-auto flex items-center gap-2">
          {flash && (
            <span className="flex items-center gap-1 text-xs text-green-400 animate-pulse">
              <CheckCircle size={12} /> {t.diplomacy[flash] || flash}
            </span>
          )}
          <button onClick={() => setShowAgreements(true)}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {t.diplomacy.agreements}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Select Nation */}
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-3">
              {t.diplomacy.selectNation}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {otherPlayers.map(p => {
                const isSelected = targetPlayer === p.index;
                const trust = getTrust(gameState, gameState.currentPlayerIndex, p.index);
                const trustKey = getTrustLabel(trust);
                const trustLabel = lang === 'ko'
                  ? TRUST_LABELS[trustKey]?.ko || trustKey
                  : TRUST_LABELS[trustKey]?.en || trustKey;
                return (
                  <button key={p.index} onClick={() => setTargetPlayer(isSelected ? null : p.index)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: isSelected ? p.colorHex + '18' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? p.colorHex + '50' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: p.colorHex + '20', border: `2px solid ${p.colorHex}` }}>{p.emblem}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-bold text-sm leading-tight" style={{ color: isSelected ? p.colorHex : 'white' }}>{p.countryName}</p>
                      <p className="text-gray-500 text-[10px] leading-tight">{p.playerName} · {p.colonyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-500">{t.diplomacy.trust}: {trust}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{
                        background: trust > 60 ? 'rgba(74,222,128,0.15)' : trust > 40 ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.15)',
                        color: trust > 60 ? '#4ade80' : trust > 40 ? '#fbbf24' : '#f87171',
                      }}>{trustLabel}</span>
                    </div>
                    {isSelected && <span className="text-[10px] font-bold" style={{ color: p.colorHex }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error message */}
          {!targetPlayer && activeForm && (
            <div className="text-center py-3">
              <p className="text-yellow-400 text-xs">{t.diplomacy.selectNationFirst}</p>
            </div>
          )}

          {/* Action buttons */}
          {targetPlayer && !activeForm && (
            <div>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-3">
                {lang === 'ko'
                  ? `${gameState.players[targetPlayer].countryName}에게 제안`
                  : `Propose to ${gameState.players[targetPlayer].countryName}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DIPLOMACY_ACTIONS.map(da => {
                  const Icon = da.icon;
                  const label = ACTION_LABELS[da.key][lang];
                  return (
                    <button key={da.key} onClick={() => setActiveForm(da.key)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: da.color + '1A',
                        border: `1px solid ${da.color}40`,
                      }}>
                      <Icon size={16} style={{ color: da.color }} className="shrink-0" />
                      <span className="text-sm font-medium" style={{ color: da.color }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active form */}
          {targetPlayer !== null && activeForm && (
            <div>
              {activeForm === 'trade' && (
                <TradeForm
                  recipientIndex={targetPlayer}
                  onSent={() => handleFormSent('proposalSent')}
                  onCancel={() => setActiveForm(null)}
                />
              )}
              {activeForm === 'alliance' && (
                <AllianceForm
                  recipientIndex={targetPlayer}
                  onSent={() => handleFormSent('allianceFormed')}
                  onCancel={() => setActiveForm(null)}
                />
              )}
              {activeForm === 'nonAggression' && (
                <NonAggressionForm
                  recipientIndex={targetPlayer}
                  onSent={() => handleFormSent('proposalSent')}
                  onCancel={() => setActiveForm(null)}
                />
              )}
              {activeForm === 'shareTech' && (
                <TechShareForm
                  recipientIndex={targetPlayer}
                  onSent={() => handleFormSent('proposalSent')}
                  onCancel={() => setActiveForm(null)}
                />
              )}
              {activeForm === 'emergencyAid' && (
                <EmergencyAidForm
                  recipientIndex={targetPlayer}
                  onSent={() => handleFormSent('aidSent')}
                  onCancel={() => setActiveForm(null)}
                />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}