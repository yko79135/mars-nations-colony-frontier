import { createContext, useContext, useState, useCallback } from 'react';
import { createInitialGameState, calculateResourceProduction, calculateMaintenance, calculateScores, EVENTS, BUILDINGS, TECH_TREE, getHexNeighbors } from './gameData';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);
  const [screen, setScreen] = useState('menu'); // menu, setup, nationCreation, playing, techTree, diplomacy, rankings, victory

  const startGame = useCallback((settings, nations) => {
    const state = createInitialGameState(settings, nations);
    setGameState(state);
    setScreen('playing');
  }, []);

  const updateGameState = useCallback((updater) => {
    if (updater === null) {
      setGameState(null);
      return;
    }
    setGameState(prev => {
      if (!prev) return prev;
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  const exploreHex = useCallback((hexKey) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const player = next.players[next.currentPlayerIndex];
      if (next.actionPoints <= 0) return prev;
      
      const hex = next.map.hexes[hexKey];
      if (!hex || hex.explored) return prev;
      
      const neighbors = getHexNeighbors(hex.q, hex.r);
      const hasAdjacentOwned = neighbors.some(n => {
        const nk = `${n.q},${n.r}`;
        return next.map.hexes[nk] && next.map.hexes[nk].owner === next.currentPlayerIndex;
      });
      
      if (!hasAdjacentOwned) {
        const hasAdjacentExplored = neighbors.some(n => {
          const nk = `${n.q},${n.r}`;
          return next.map.hexes[nk] && next.map.hexes[nk].explored;
        });
        if (!hasAdjacentExplored) return prev;
      }
      
      hex.explored = true;
      next.actionPoints -= 1;
      
      neighbors.forEach(n => {
        const nk = `${n.q},${n.r}`;
        if (next.map.hexes[nk]) {
          next.map.hexes[nk].explored = true;
        }
      });
      
      return next;
    });
  }, []);

  const claimHex = useCallback((hexKey) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const player = next.players[next.currentPlayerIndex];
      if (next.actionPoints <= 0) return prev;
      
      const hex = next.map.hexes[hexKey];
      if (!hex || !hex.explored || hex.owner !== null) return prev;
      
      const neighbors = getHexNeighbors(hex.q, hex.r);
      const hasAdjacentOwned = neighbors.some(n => {
        const nk = `${n.q},${n.r}`;
        return next.map.hexes[nk] && next.map.hexes[nk].owner === next.currentPlayerIndex;
      });
      if (!hasAdjacentOwned) return prev;
      
      if (player.resources.credits < 2 || player.resources.energy < 1) return prev;
      
      hex.owner = next.currentPlayerIndex;
      player.resources.credits -= 2;
      player.resources.energy -= 1;
      next.actionPoints -= 1;
      
      return next;
    });
  }, []);

  const buildOnHex = useCallback((hexKey, buildingId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const player = next.players[next.currentPlayerIndex];
      if (next.actionPoints <= 0) return prev;
      
      const hex = next.map.hexes[hexKey];
      if (!hex || hex.owner !== next.currentPlayerIndex) return prev;
      
      const bData = BUILDINGS[buildingId];
      if (!bData) return prev;
      
      if (bData.terrainRestrictions.includes(hex.terrain)) return prev;
      if (bData.techRequired && !player.technologies.includes(bData.techRequired)) return prev;
      
      for (const [res, amt] of Object.entries(bData.cost)) {
        if ((player.resources[res] || 0) < amt) return prev;
      }
      
      for (const [res, amt] of Object.entries(bData.cost)) {
        player.resources[res] -= amt;
      }
      
      hex.buildings.push(buildingId);
      next.actionPoints -= 1;
      
      return next;
    });
  }, []);

  const researchTech = useCallback((techId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const player = next.players[next.currentPlayerIndex];
      if (next.actionPoints <= 0) return prev;
      
      const techData = TECH_TREE[techId];
      if (!techData) return prev;
      if (player.technologies.includes(techId)) return prev;
      
      for (const prereq of techData.prerequisites) {
        if (!player.technologies.includes(prereq)) return prev;
      }
      
      for (const [res, amt] of Object.entries(techData.cost)) {
        if ((player.resources[res] || 0) < amt) return prev;
      }
      
      for (const [res, amt] of Object.entries(techData.cost)) {
        player.resources[res] -= amt;
      }
      
      player.technologies.push(techId);
      next.actionPoints -= 1;
      
      return next;
    });
  }, []);

  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      
      const player = next.players[next.currentPlayerIndex];
      const maintenance = calculateMaintenance(player, next.map);
      Object.entries(maintenance).forEach(([res, amt]) => {
        player.resources[res] = Math.max(0, (player.resources[res] || 0) - amt);
      });
      
      if (player.resources.food <= 0) player.resources.morale = Math.max(0, player.resources.morale - 5);
      if (player.resources.water <= 0) player.resources.morale = Math.max(0, player.resources.morale - 5);
      if (player.resources.oxygen <= 0) player.resources.morale = Math.max(0, player.resources.morale - 10);
      
      const nextPlayerIndex = (next.currentPlayerIndex + 1) % next.players.length;
      next.currentPlayerIndex = nextPlayerIndex;
      next.actionPoints = next.settings.actionPointsPerTurn || 3;
      
      if (nextPlayerIndex === 0) {
        next.currentRound += 1;
        
        next.players.forEach((p) => {
          const prod = calculateResourceProduction(p, next.map);
          Object.entries(prod).forEach(([res, amt]) => {
            p.resources[res] = (p.resources[res] || 0) + amt;
          });
          p.scores = calculateScores(p, next.map);
        });
        
        const freq = next.settings.eventFrequency || 'normal';
        const eventChance = freq === 'low' ? 0.2 : freq === 'high' ? 0.6 : 0.4;
        if (Math.random() < eventChance) {
          const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
          next.activeEvent = { ...event };
          
          if (event.scope === 'single') {
            const targetPlayer = Math.floor(Math.random() * next.players.length);
            next.activeEvent.targetPlayer = targetPlayer;
            Object.entries(event.effects).forEach(([res, amt]) => {
              next.players[targetPlayer].resources[res] = Math.max(0, (next.players[targetPlayer].resources[res] || 0) + amt);
            });
          } else {
            next.players.forEach(p => {
              Object.entries(event.effects).forEach(([res, amt]) => {
                p.resources[res] = Math.max(0, (p.resources[res] || 0) + amt);
              });
            });
          }
        }
        
        if (next.currentRound > (next.settings.gameLength || 20)) {
          next.gameOver = true;
        }
      }
      
      return next;
    });
  }, []);

  const dismissEvent = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      return { ...prev, activeEvent: null };
    });
  }, []);

  const saveGame = useCallback((name) => {
    if (!gameState) return;
    const saves = JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
    saves[name] = { ...gameState, savedAt: new Date().toISOString() };
    localStorage.setItem('marsNationsSaves', JSON.stringify(saves));
  }, [gameState]);

  const loadGame = useCallback((name) => {
    const saves = JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
    if (saves[name]) {
      setGameState(saves[name]);
      setScreen('playing');
    }
  }, []);

  const getSavedGames = useCallback(() => {
    return JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
  }, []);

  const deleteSave = useCallback((name) => {
    const saves = JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
    delete saves[name];
    localStorage.setItem('marsNationsSaves', JSON.stringify(saves));
  }, []);

  return (
    <GameContext.Provider value={{
      gameState, screen, setScreen,
      startGame, updateGameState,
      exploreHex, claimHex, buildOnHex, researchTech,
      endTurn, dismissEvent,
      saveGame, loadGame, getSavedGames, deleteSave,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}