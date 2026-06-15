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

  if (gameState?.gameOver && screen === 'playing') {
    return (
      <div className="h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-hidden">
          <VictoryScreen />
        </div>
      </div>
    );
  }

  if (screen === 'menu') return <MainMenu />;
  if (screen === 'setup') return (
    <>
      <TopNav />
      <GameSetup />
    </>
  );
  if (screen === 'nationCreation') return (
    <>
      <TopNav />
      <NationCreation />
    </>
  );

  return (
    <div className="h-screen flex flex-col">
      <TopNav />
      <div className="flex-1 overflow-hidden">
        {screen === 'playing' && <GameScreen />}
        {screen === 'techTree' && <TechTree />}
        {screen === 'diplomacy' && <DiplomacyPanel />}
        {screen === 'rankings' && <Rankings />}
        {screen === 'victory' && <VictoryScreen />}
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