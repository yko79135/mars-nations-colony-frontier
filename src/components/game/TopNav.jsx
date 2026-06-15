import React from 'react';
import { useLang } from '@/lib/i18n';
import { useGame } from '@/lib/gameContext';
import { Globe, Map, FlaskConical, Handshake, Trophy, BookOpen, Settings, Rocket } from 'lucide-react';

export default function TopNav() {
  const { lang, setLang, t } = useLang();
  const { screen, setScreen, gameState } = useGame();
  
  const navItems = [
    { key: 'playing', label: t.nav.game, icon: Rocket },
    { key: 'map', label: t.nav.map, icon: Map },
    { key: 'techTree', label: t.nav.technology, icon: FlaskConical },
    { key: 'diplomacy', label: t.nav.diplomacy, icon: Handshake },
    { key: 'rankings', label: t.nav.rankings, icon: Trophy },
  ];

  return (
    <nav className="h-12 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 flex items-center px-4 gap-1 shrink-0">
      <div className="flex items-center gap-2 mr-4">
        <span className="text-orange-400 text-lg">🔴</span>
        <span className="text-white font-display font-bold text-sm hidden sm:block">
          {t.gameTitle}
        </span>
      </div>
      
      {gameState && (
        <div className="flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setScreen(item.key === 'map' ? 'playing' : item.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                (screen === item.key || (item.key === 'playing' && screen === 'playing'))
                  ? 'bg-orange-600/30 text-orange-300'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <item.icon size={14} />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </div>
      )}
      
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors border border-gray-600"
        >
          <Globe size={14} />
          {lang === 'en' ? '한국어' : 'English'}
        </button>
      </div>
    </nav>
  );
}