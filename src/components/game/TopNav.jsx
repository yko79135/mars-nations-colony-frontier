import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Globe, Rocket, FlaskConical, Users, Trophy, Map } from 'lucide-react';
import { GRADE_MODES } from '@/lib/gameModes';

const SENIOR_NAV = [
  { key: 'playing',   label: 'nav.game',       icon: Rocket },
  { key: 'techTree',  label: 'nav.technology',  icon: FlaskConical },
  { key: 'diplomacy', label: 'nav.diplomacy',   icon: Users },
  { key: 'rankings',  label: 'nav.rankings',    icon: Trophy },
];

const JUNIOR_NAV = [
  { key: 'playing', label: 'nav.game', icon: Rocket },
  { key: 'map',     label: 'nav.map',  icon: Map },
];

export default function TopNav() {
  const { lang, setLang, t } = useLang();
  const { screen, setScreen, gameState } = useGame();
  const isJunior = gameState?.settings?.gradeMode === 'junior';
  const navItems = isJunior ? JUNIOR_NAV : SENIOR_NAV;

  return (
    <nav className="h-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 flex items-center px-4 gap-1 shrink-0">
      <div className="flex items-center gap-2 mr-4">
        <span className="text-orange-400 text-lg">🔴</span>
        <span className="text-white font-display font-bold text-sm hidden sm:block">{t.gameTitle}</span>
      </div>

      {gameState && (
        <div className="flex items-center gap-0.5">
          {navItems.map(item => {
            const labelParts = item.label.split('.');
            const label = labelParts.reduce((obj, key) => obj?.[key], t) || item.label;
            const isActive = screen === item.key || (item.key === 'playing' && screen === 'playing');
            return (
              <button key={item.key}
                onClick={() => setScreen(item.key === 'map' ? 'playing' : item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${isActive ? 'bg-orange-600/30 text-orange-300' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}>
                <item.icon size={14} />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {gameState && (
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded bg-gray-700/60 text-gray-400 border border-gray-600">
            {lang === 'ko' ? GRADE_MODES[gameState.settings?.gradeMode || 'senior']?.labelKo : GRADE_MODES[gameState.settings?.gradeMode || 'senior']?.label}
          </span>
        )}
        <button onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors border border-gray-600">
          <Globe size={14} />
          {lang === 'en' ? '한국어' : 'English'}
        </button>
      </div>
    </nav>
  );
}