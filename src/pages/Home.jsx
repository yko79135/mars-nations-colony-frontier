import React from 'react';
import { LangProvider } from '@/lib/i18n';
import { GameProvider, useGame } from '@/lib/gameContext';
import TopNav from '@/components/game/TopNav';
import MainMenu from '@/components/game/MainMenu';
import GameSetup from '@/components/game/GameSetup';
import NationCreation from '@/components/game/NationCreation';
import GameScreen from '@/components/game/GameScreen';
import TechTree from '@/components/game/TechTree';
import DiplomacyPanel from '@/components/game/DiplomacyPanel';
import Rankings from '@/components/game/Rankings';
import VictoryScreen from '@/components/game/VictoryScreen';

// Error boundary for Senior Mode
class SeniorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-gray-950 flex items-center justify-center p-8">
          <div className="bg-gray-900 border border-red-700/50 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-red-400 font-heading font-bold text-lg mb-2">
              Senior Mode could not load
            </h2>
            <p className="text-gray-400 text-sm mb-1 font-bold">고급 모드를 불러올 수 없습니다.</p>
            <p className="text-gray-500 text-xs mb-4 font-mono bg-gray-800 rounded p-2 overflow-auto max-h-24">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); this.props.onReset?.(); }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-heading font-semibold text-sm"
            >
              ← Return to Menu
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function GameRouter() {
  const { screen, setScreen, gameState, updateGameState } = useGame();
  const isJunior = gameState?.settings?.gradeMode === 'junior';

  const handleReset = () => { updateGameState(null); setScreen('menu'); };

  // Victory
  if (gameState?.gameOver) {
    return (
      <div className="h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-hidden"><VictoryScreen /></div>
      </div>
    );
  }

  if (screen === 'menu') return <MainMenu />;
  if (screen === 'setup') return <><TopNav /><GameSetup /></>;
  if (screen === 'nationCreation') return <><TopNav /><NationCreation /></>;

  // Junior: single GameScreen routes internally
  if (isJunior) {
    return (
      <div className="h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-hidden"><GameScreen /></div>
      </div>
    );
  }

  // Senior: map always mounted, panels are overlays
  return (
    <SeniorErrorBoundary onReset={handleReset}>
      <div className="h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-hidden relative">
          {/* Map is always mounted */}
          <GameScreen />

          {/* Panels are full-height overlays that slide over the map */}
          {screen === 'techTree' && (
            <div className="absolute inset-0 z-30 bg-gray-950/98 overflow-y-auto">
              <TechTree />
            </div>
          )}
          {screen === 'diplomacy' && (
            <div className="absolute inset-0 z-30 bg-gray-950/98 overflow-y-auto">
              <DiplomacyPanel />
            </div>
          )}
          {screen === 'rankings' && (
            <div className="absolute inset-0 z-30 bg-gray-950/98 overflow-y-auto">
              <Rankings />
            </div>
          )}
        </div>
      </div>
    </SeniorErrorBoundary>
  );
}

export default function Home() {
  return (
    <LangProvider>
      <GameProvider>
        <GameRouter />
      </GameProvider>
    </LangProvider>
  );
}