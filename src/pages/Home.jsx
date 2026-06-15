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

function GameRouter() {
  const { screen, gameState } = useGame();
  const isJunior = gameState?.settings?.gradeMode === 'junior';

  if (gameState?.gameOver && screen === 'playing') {
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
  if (screen === 'victory') return (
    <div className="h-screen flex flex-col">
      <TopNav />
      <div className="flex-1 overflow-hidden"><VictoryScreen /></div>
    </div>
  );

  // Junior mode: only playing screen (no separate tech/diplomacy/rankings pages)
  if (isJunior) {
    return (
      <div className="h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-hidden"><GameScreen /></div>
      </div>
    );
  }

  // Senior mode: full navigation
  return (
    <div className="h-screen flex flex-col">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        {screen === 'playing'   && <GameScreen />}
        {screen === 'techTree'  && <TechTree />}
        {screen === 'diplomacy' && <DiplomacyPanel />}
        {screen === 'rankings'  && <Rankings />}
      </div>
    </div>
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