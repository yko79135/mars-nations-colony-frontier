import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Globe, Rocket, FlaskConical, Users, Trophy } from 'lucide-react';
import { GRADE_MODES } from '@/lib/gameModes';

const SENIOR_NAV = [
  { key: 'playing',   label: 'nav.game',       icon: Rocket,      color: '#F97316' },
  { key: 'techTree',  label: 'nav.technology',  icon: FlaskConical, color: '#A78BFA' },
  { key: 'diplomacy', label: 'nav.diplomacy',   icon: Users,       color: '#60A5FA' },
  { key: 'rankings',  label: 'nav.rankings',    icon: Trophy,      color: '#FBBF24' },
];

export default function TopNav() {
  const { lang, setLang, t } = useLang();
  const { screen, setScreen, gameState } = useGame();
  const isJunior = gameState?.settings?.gradeMode === 'junior';
  const navItems = isJunior ? [SENIOR_NAV[0]] : SENIOR_NAV;

  return (
    <nav className="h-12 flex items-center px-4 gap-1 shrink-0"
      style={{
        background: 'rgba(5,8,20,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.5)',
      }}>

      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-base"
          style={{ background: 'radial-gradient(circle at 35% 35%, #ef4444, #991b1b)' }}>
          🔴
        </div>
        <span className="text-white font-display font-bold text-sm hidden sm:block tracking-wide">
          {t.gameTitle}
        </span>
      </div>

      {/* Nav items */}
      {gameState && (
        <div className="flex items-center gap-0.5">
          {navItems.map(item => {
            const labelParts = item.label.split('.');
            const label = labelParts.reduce((obj, key) => obj?.[key], t) || item.label;
            const isActive = screen === item.key || (item.key === 'playing' && screen === 'playing');
            const Icon = item.icon;
            return (
              <button key={item.key}
                onClick={() => setScreen(item.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: isActive ? `${item.color}20` : 'transparent',
                  color: isActive ? item.color : 'rgba(156,163,175,1)',
                  border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
                }}>
                <Icon size={13} />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Grade mode badge */}
        {gameState && (
          <span className="hidden sm:inline text-[10px] px-2.5 py-1 rounded-full font-heading"
            style={{
              background: isJunior ? 'rgba(74,222,128,0.1)' : 'rgba(167,139,250,0.1)',
              border: isJunior ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(167,139,250,0.3)',
              color: isJunior ? '#4ade80' : '#a78bfa',
            }}>
            {lang === 'ko'
              ? GRADE_MODES[gameState.settings?.gradeMode || 'senior']?.labelKo
              : GRADE_MODES[gameState.settings?.gradeMode || 'senior']?.label}
          </span>
        )}

        {/* Language toggle */}
        <button onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-gray-400 hover:text-white"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <Globe size={13} />
          {lang === 'en' ? '한국어' : 'English'}
        </button>
      </div>
    </nav>
  );
}