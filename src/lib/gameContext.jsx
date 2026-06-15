import { createContext, useContext, useState, useCallback } from 'react';
import { createInitialGameState, calculateResourceProduction, calculateMaintenance, calculateScores, EVENTS, JUNIOR_EVENTS, BUILDINGS, TECH_TREE, getHexNeighbors, getPlayerLabLevel } from './gameData';
import { JUNIOR_TECHS } from './gameModes';

const GameContext = createContext();

// Apply the effect of a researched technology immediately to the player object
function applyTechEffect(player, techId, techData) {
  const effect = techData.effect || {};

  // Building production bonus (stored on player.techBonuses for production calc)
  if (effect.building && effect.resourceBonus) {
    if (!player.techBonuses) player.techBonuses = {};
    if (!player.techBonuses[effect.building]) player.techBonuses[effect.building] = {};
    Object.entries(effect.resourceBonus).forEach(([res, amt]) => {
      player.techBonuses[effect.building][res] = (player.techBonuses[effect.building][res] || 0) + amt;
    });
  }
  // Flat production bonus
  if (effect.scienceBonus) {
    if (!player.flatBonuses) player.flatBonuses = {};
    player.flatBonuses.science = (player.flatBonuses.science || 0) + effect.scienceBonus;
  }
  if (effect.moraleBonus) {
    if (!player.flatBonuses) player.flatBonuses = {};
    player.flatBonuses.morale = (player.flatBonuses.morale || 0) + effect.moraleBonus;
    player.resources.morale = Math.min(100, (player.resources.morale || 50) + effect.moraleBonus);
  }
  if (effect.populationBonus) {
    player.resources.population = (player.resources.population || 0) + effect.populationBonus;
  }
  if (effect.actionPointBonus) {
    if (!player.actionPointBonus) player.actionPointBonus = 0;
    player.actionPointBonus += effect.actionPointBonus;
  }
  if (effect.sustainabilityScore) {
    if (!player.scores) player.scores = {};
    player.scores.sustainability = (player.scores.sustainability || 0) + effect.sustainabilityScore;
  }
  if (effect.cooperationBonus) {
    if (!player.scores) player.scores = {};
    player.scores.cooperation = (player.scores.cooperation || 0) + effect.cooperationBonus;
  }
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);
  const [screen, setScreen] = useState('menu');

  const startGame = useCallback((settings, nations) => {
    const state = createInitialGameState(settings, nations);
    setGameState(state);
    setScreen('playing');
  }, []);

  const updateGameState = useCallback((updater) => {
    if (updater === null) { setGameState(null); return; }
    setGameState(prev => {
      if (!prev) return prev;
      return typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    });
  }, []);

  // ---- MAP ACTIONS (requiresHexTarget: true) ----

  const exploreHex = useCallback((hexKey) => {
    setGameState(prev => {
      if (!prev || prev.actionPoints <= 0) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const hex = next.map.hexes[hexKey];
      if (!hex || hex.explored) return prev;

      const player = next.players[next.currentPlayerIndex];
      const hasLongRange = player.technologies.includes('longRangeRovers') || player.technologies.includes('longRangeRover');
      const range = hasLongRange ? 2 : 1;

      const neighbors = getHexNeighbors(hex.q, hex.r);
      let isReachable = neighbors.some(n => {
        const nk = `${n.q},${n.r}`;
        return next.map.hexes[nk] && next.map.hexes[nk].owner === next.currentPlayerIndex;
      });

      if (!isReachable && range >= 2) {
        // Check if any owned hex is within 2 steps
        isReachable = Object.values(next.map.hexes).some(h => {
          if (h.owner !== next.currentPlayerIndex) return false;
          const dist = Math.max(Math.abs(h.q - hex.q), Math.abs(h.r - hex.r), Math.abs((-h.q - h.r) - (-hex.q - hex.r)));
          return dist <= range;
        });
      }

      if (!isReachable) {
        isReachable = neighbors.some(n => {
          const nk = `${n.q},${n.r}`;
          return next.map.hexes[nk] && next.map.hexes[nk].explored;
        });
      }

      if (!isReachable) return prev;

      hex.explored = true;
      next.actionPoints -= 1;
      neighbors.forEach(n => {
        const nk = `${n.q},${n.r}`;
        if (next.map.hexes[nk]) next.map.hexes[nk].explored = true;
      });
      return next;
    });
  }, []);

  const claimHex = useCallback((hexKey) => {
    setGameState(prev => {
      if (!prev || prev.actionPoints <= 0) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const player = next.players[next.currentPlayerIndex];
      const hex = next.map.hexes[hexKey];
      if (!hex || !hex.explored || hex.owner !== null) return prev;

      const neighbors = getHexNeighbors(hex.q, hex.r);
      const hasAdj = neighbors.some(n => {
        const nk = `${n.q},${n.r}`;
        return next.map.hexes[nk] && next.map.hexes[nk].owner === next.currentPlayerIndex;
      });
      if (!hasAdj) return prev;

      const claimCost = player.technologies.includes('pressurizedRoads') ? { energy: 0, minerals: 1 } : { energy: 1, minerals: 2 };
      for (const [res, amt] of Object.entries(claimCost)) {
        if ((player.resources[res] || 0) < amt) return prev;
      }
      for (const [res, amt] of Object.entries(claimCost)) {
        player.resources[res] -= amt;
      }

      hex.owner = next.currentPlayerIndex;
      next.actionPoints -= 1;
      return next;
    });
  }, []);

  const buildOnHex = useCallback((hexKey, buildingId) => {
    setGameState(prev => {
      if (!prev || prev.actionPoints <= 0) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const player = next.players[next.currentPlayerIndex];
      const hex = next.map.hexes[hexKey];
      if (!hex || hex.owner !== next.currentPlayerIndex) return prev;

      const bData = BUILDINGS[buildingId];
      if (!bData) return prev;
      if (bData.terrainRestrictions?.includes(hex.terrain)) return prev;
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

  // ---- RESEARCH ACTION (requiresHexTarget: false) ----

  const researchTech = useCallback((techId) => {
    setGameState(prev => {
      if (!prev || prev.actionPoints <= 0) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const player = next.players[next.currentPlayerIndex];
      if (player.technologies.includes(techId)) return prev;

      const isJunior = prev.settings?.gradeMode === 'junior';
      const techData = isJunior ? JUNIOR_TECHS[techId] : TECH_TREE[techId];
      if (!techData) return prev;

      // Check prerequisites
      for (const prereq of (techData.prerequisites || [])) {
        if (!player.technologies.includes(prereq)) return prev;
      }

      // Check lab requirement
      if (techData.labRequired) {
        const labLevel = getPlayerLabLevel(player, next.map);
        if (labLevel < techData.labRequired) return prev;
      }

      // Check resource costs
      for (const [res, amt] of Object.entries(techData.cost)) {
        if ((player.resources[res] || 0) < amt) return prev;
      }
      for (const [res, amt] of Object.entries(techData.cost)) {
        player.resources[res] -= amt;
      }

      player.technologies.push(techId);
      next.actionPoints -= 1;

      // Apply tech effect immediately
      applyTechEffect(player, techId, techData);

      next.lastResearched = techId;
      return next;
    });
  }, []);

  // ---- COOPERATION (Junior) ----

  const giveResource = useCallback((toPlayerIndex, resource, amount) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const fromPlayer = next.players[next.currentPlayerIndex];
      const toPlayer = next.players[toPlayerIndex];
      if (!toPlayer) return prev;
      if ((fromPlayer.resources[resource] || 0) < amount) return prev;
      fromPlayer.resources[resource] -= amount;
      toPlayer.resources[resource] = (toPlayer.resources[resource] || 0) + amount;
      fromPlayer.cooperationActions = (fromPlayer.cooperationActions || 0) + 1;
      fromPlayer.scores.cooperation = (fromPlayer.scores.cooperation || 0) + 5;
      return next;
    });
  }, []);

  // ---- TURN MANAGEMENT ----

  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const isJunior = next.settings?.gradeMode === 'junior';

      // Deduct maintenance from current player
      const player = next.players[next.currentPlayerIndex];
      if (!isJunior) {
        const maintenance = calculateMaintenance(player, next.map);
        Object.entries(maintenance).forEach(([res, amt]) => {
          player.resources[res] = Math.max(0, (player.resources[res] || 0) - amt);
        });
      }

      const nextPlayerIndex = (next.currentPlayerIndex + 1) % next.players.length;
      next.currentPlayerIndex = nextPlayerIndex;
      const baseAP = next.settings.actionPointsPerTurn || 3;
      next.actionPoints = baseAP + (player.actionPointBonus || 0);
      next.lastResearched = null;

      if (nextPlayerIndex === 0) {
        next.currentRound += 1;

        // Production for all players
        next.players.forEach(p => {
          const prod = calculateResourceProduction(p, next.map);
          Object.entries(prod).forEach(([res, amt]) => {
            if (amt > 0) p.resources[res] = (p.resources[res] || 0) + amt;
          });
          if (!isJunior) {
            p.scores = calculateScores(p, next.map);
          } else {
            // Junior scoring
            let territory = 0;
            Object.values(next.map.hexes).forEach(h => { if (h.owner === p.index) territory++; });
            p.scores = {
              territory,
              science: p.technologies.length * 3,
              cooperation: p.cooperationActions * 5,
              development: Object.values(next.map.hexes).reduce((sum, h) => h.owner === p.index ? sum + h.buildings.length : sum, 0) * 2,
            };
          }
        });

        // Random event
        const eventPool = isJunior ? JUNIOR_EVENTS : EVENTS;
        const freq = next.settings.eventFrequency || 'normal';
        const eventChance = freq === 'low' ? 0.25 : freq === 'high' ? 0.6 : 0.4;
        if (Math.random() < eventChance) {
          const event = eventPool[Math.floor(Math.random() * eventPool.length)];
          next.activeEvent = { ...event };
          if (event.scope === 'single') {
            const target = Math.floor(Math.random() * next.players.length);
            next.activeEvent.targetPlayer = target;
            // For negative events, check saferHabitats protection
            const targetP = next.players[target];
            const protected_ = isJunior && targetP.technologies.includes('saferHabitats') && event.type === 'negative';
            if (!protected_) {
              Object.entries(event.effects).forEach(([res, amt]) => {
                targetP.resources[res] = Math.max(0, (targetP.resources[res] || 0) + amt);
              });
            } else {
              next.activeEvent.wasProtected = true;
            }
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
    setGameState(prev => prev ? { ...prev, activeEvent: null } : prev);
  }, []);

  // ---- SAVE / LOAD ----

  const saveGame = useCallback((name) => {
    if (!gameState) return;
    const saves = JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
    saves[name] = { ...gameState, savedAt: new Date().toISOString() };
    localStorage.setItem('marsNationsSaves', JSON.stringify(saves));
  }, [gameState]);

  const loadGame = useCallback((name) => {
    const saves = JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
    if (saves[name]) { setGameState(saves[name]); setScreen('playing'); }
  }, []);

  const getSavedGames = useCallback(() => JSON.parse(localStorage.getItem('marsNationsSaves') || '{}'), []);
  const deleteSave = useCallback((name) => {
    const saves = JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
    delete saves[name];
    localStorage.setItem('marsNationsSaves', JSON.stringify(saves));
  }, []);

  return (
    <GameContext.Provider value={{
      gameState, screen, setScreen,
      startGame, updateGameState,
      exploreHex, claimHex, buildOnHex, researchTech, giveResource,
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