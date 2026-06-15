import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createInitialGameState, calculateResourceProduction, calculateMaintenance, calculateScores, EVENTS, JUNIOR_EVENTS, BUILDINGS, TECH_TREE, getHexNeighbors, getPlayerLabLevel, isExploredByNation, canExploreHex, canClaimHex, DIPLOMACY_RESOURCES, getTrust, adjustTrust } from './gameData';
import { JUNIOR_TECHS } from './gameModes';

const GameContext = createContext();

// Stable default viewBox for a fresh camera
const DEFAULT_VIEWBOX = { x: 0, y: 0, w: 800, h: 600 };

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

  // Camera state — completely separate from gameState, never reset by game actions.
  // Keyed by mapId (radius-hexCount) so Junior and Senior each preserve their own view.
  // Only reset explicitly: new game, load game, or player calls resetView/fitToScreen.
  const [cameraViews, setCameraViews] = useState({});
  const fittedMapsRef = useRef(new Set());

  const getMapId = (gs) => {
    if (!gs?.map) return null;
    return `${gs.map.radius}-${Object.keys(gs.map.hexes).length}`;
  };

  const getViewBox = useCallback((gs) => {
    const id = getMapId(gs);
    if (!id) return DEFAULT_VIEWBOX;
    return cameraViews[id] || DEFAULT_VIEWBOX;
  }, [cameraViews]);

  const setViewBox = useCallback((gs, updater) => {
    const id = getMapId(gs);
    if (!id) return;
    setCameraViews(prev => {
      const current = prev[id] || DEFAULT_VIEWBOX;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [id]: next };
    });
  }, []);

  // Called by HexMap on first render of a new map — only runs once per mapId
  const fitMapToScreen = useCallback((gs, computedViewBox) => {
    const id = getMapId(gs);
    if (!id || fittedMapsRef.current.has(id)) return;
    fittedMapsRef.current.add(id);
    setCameraViews(prev => ({ ...prev, [id]: computedViewBox }));
  }, []);

  const resetMapView = useCallback((gs) => {
    const id = getMapId(gs);
    if (!id) return;
    setCameraViews(prev => ({ ...prev, [id]: DEFAULT_VIEWBOX }));
  }, []);

  const startGame = useCallback((settings, nations) => {
    const state = createInitialGameState(settings, nations);
    // Clear all camera views for new game so fresh fit-to-screen runs
    fittedMapsRef.current = new Set();
    setCameraViews({});
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
      // Use shared validator for consistency with HexMap highlights
      if (!canExploreHex(prev, prev.currentPlayerIndex, hexKey)) return prev;

      const next = JSON.parse(JSON.stringify(prev));
      const hex = next.map.hexes[hexKey];
      const pidx = next.currentPlayerIndex;

      // Mark this hex as explored by this nation (per-nation tracking)
      if (!hex.exploredBy) hex.exploredBy = {};
      hex.exploredBy[pidx] = true;
      // Keep legacy field in sync for HexInfoPanel / other legacy reads
      hex.explored = true;

      next.actionPoints -= 1;
      return next;
    });
  }, []);

  const claimHex = useCallback((hexKey) => {
    setGameState(prev => {
      if (!prev || prev.actionPoints <= 0) return prev;
      // Use shared validator for consistency with HexMap highlights
      if (!canClaimHex(prev, prev.currentPlayerIndex, hexKey)) return prev;

      const next = JSON.parse(JSON.stringify(prev));
      const pidx = next.currentPlayerIndex;
      const player = next.players[pidx];
      const hex = next.map.hexes[hexKey];

      const claimCost = player.technologies.includes('pressurizedRoads') ? { energy: 0, minerals: 1 } : { energy: 1, minerals: 2 };
      for (const [res, amt] of Object.entries(claimCost)) {
        if ((player.resources[res] || 0) < amt) return prev;
      }
      for (const [res, amt] of Object.entries(claimCost)) {
        player.resources[res] -= amt;
      }

      hex.owner = pidx;
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

  // ---- DIPLOMACY ----

  let nextProposalId = 1;
  const genProposalId = () => `prop_${Date.now()}_${nextProposalId++}`;
  let nextAgreementId = 1;
  const genAgreementId = () => `agr_${Date.now()}_${nextAgreementId++}`;

  const proposeAgreement = useCallback((type, recipientIndex, data) => {
    setGameState(prev => {
      if (!prev || prev.actionPoints <= 0) return prev;
      const pidx = prev.currentPlayerIndex;
      if (recipientIndex === pidx) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.diplomacy) next.diplomacy = { proposals: [], agreements: [], history: [], trust: {} };

      // Prevent duplicate active alliances
      if (type === 'alliance') {
        const existing = next.diplomacy.agreements.find(a =>
          a.type === 'alliance' && a.status === 'active' &&
          a.nationIds.includes(pidx) && a.nationIds.includes(recipientIndex)
        );
        if (existing) return prev;
        const pending = next.diplomacy.proposals.find(p =>
          p.type === 'alliance' && p.status === 'pending' &&
          ((p.proposerIndex === pidx && p.recipientIndex === recipientIndex) ||
           (p.proposerIndex === recipientIndex && p.recipientIndex === pidx))
        );
        if (pending) return prev;
      }

      const proposal = {
        id: genProposalId(),
        type,
        proposerIndex: pidx,
        recipientIndex,
        status: 'pending',
        createdRound: next.currentRound,
        ...data,
      };

      next.diplomacy.proposals.push(proposal);
      next.actionPoints -= 1;
      return next;
    });
  }, []);

  const acceptProposal = useCallback((proposalId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.diplomacy) return prev;
      const propIdx = next.diplomacy.proposals.findIndex(p => p.id === proposalId);
      if (propIdx === -1) return prev;
      const proposal = next.diplomacy.proposals[propIdx];
      if (proposal.status !== 'pending') return prev;
      const pidx = next.currentPlayerIndex;
      if (proposal.recipientIndex !== pidx) return prev;

      const proposer = next.players[proposal.proposerIndex];
      const recipient = next.players[pidx];

      // Validate resources for trade
      if (proposal.type === 'trade') {
        const offered = proposal.offeredResources || {};
        const requested = proposal.requestedResources || {};
        for (const [res, amt] of Object.entries(offered)) {
          if ((proposer.resources[res] || 0) < amt) return prev;
        }
        for (const [res, amt] of Object.entries(requested)) {
          if ((recipient.resources[res] || 0) < amt) return prev;
        }
        // Transfer resources
        for (const [res, amt] of Object.entries(offered)) {
          proposer.resources[res] -= amt;
          recipient.resources[res] = (recipient.resources[res] || 0) + amt;
        }
        for (const [res, amt] of Object.entries(requested)) {
          recipient.resources[res] -= amt;
          proposer.resources[res] = (proposer.resources[res] || 0) + amt;
        }
        const trustGain = Object.keys(offered).length + Object.keys(requested).length > 0 ? 5 : 0;
        adjustTrust(next, proposal.proposerIndex, pidx, trustGain);
      }

      // Alliance
      if (proposal.type === 'alliance') {
        const agreement = {
          id: genAgreementId(),
          type: 'alliance',
          nationIds: [proposal.proposerIndex, pidx],
          startRound: next.currentRound,
          duration: proposal.duration || 5,
          status: 'active',
        };
        next.diplomacy.agreements.push(agreement);
        adjustTrust(next, proposal.proposerIndex, pidx, 10);
        proposer.scores.cooperation = (proposer.scores.cooperation || 0) + 10;
        recipient.scores.cooperation = (recipient.scores.cooperation || 0) + 10;
      }

      // Non-aggression
      if (proposal.type === 'nonAggression') {
        const agreement = {
          id: genAgreementId(),
          type: 'nonAggression',
          nationIds: [proposal.proposerIndex, pidx],
          startRound: next.currentRound,
          duration: proposal.pactDuration || 5,
          status: 'active',
        };
        next.diplomacy.agreements.push(agreement);
        adjustTrust(next, proposal.proposerIndex, pidx, 5);
        proposer.scores.cooperation = (proposer.scores.cooperation || 0) + 5;
        recipient.scores.cooperation = (recipient.scores.cooperation || 0) + 5;
      }

      // Tech share
      if (proposal.type === 'shareTech') {
        const techId = proposal.techId;
        if (!recipient.technologies.includes(techId)) {
          if (!recipient.techCostReductions) recipient.techCostReductions = {};
          recipient.techCostReductions[techId] = 0.5;
        }
        adjustTrust(next, proposal.proposerIndex, pidx, 5);
        proposer.scores.cooperation = (proposer.scores.cooperation || 0) + 5;
      }

      // Emergency aid
      if (proposal.type === 'emergencyAid') {
        const resource = proposal.aidResource;
        const amount = proposal.aidAmount;
        if ((proposer.resources[resource] || 0) < amount) return prev;
        proposer.resources[resource] -= amount;
        recipient.resources[resource] = (recipient.resources[resource] || 0) + amount;
        adjustTrust(next, proposal.proposerIndex, pidx, 10);
        proposer.scores.cooperation = (proposer.scores.cooperation || 0) + 8;
      }

      proposal.status = 'accepted';
      next.diplomacy.history.push({ ...proposal, resolvedRound: next.currentRound });
      next.diplomacy.proposals.splice(propIdx, 1);
      return next;
    });
  }, []);

  const rejectProposal = useCallback((proposalId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.diplomacy) return prev;
      const propIdx = next.diplomacy.proposals.findIndex(p => p.id === proposalId);
      if (propIdx === -1) return prev;
      const proposal = next.diplomacy.proposals[propIdx];
      if (proposal.status !== 'pending') return prev;
      if (proposal.recipientIndex !== next.currentPlayerIndex) return prev;
      proposal.status = 'rejected';
      // Slight trust penalty for repeated rejections
      adjustTrust(next, proposal.proposerIndex, next.currentPlayerIndex, -2);
      next.diplomacy.history.push({ ...proposal, resolvedRound: next.currentRound });
      next.diplomacy.proposals.splice(propIdx, 1);
      return next;
    });
  }, []);

  const withdrawProposal = useCallback((proposalId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.diplomacy) return prev;
      const propIdx = next.diplomacy.proposals.findIndex(p => p.id === proposalId);
      if (propIdx === -1) return prev;
      const proposal = next.diplomacy.proposals[propIdx];
      if (proposal.proposerIndex !== next.currentPlayerIndex) return prev;
      proposal.status = 'withdrawn';
      next.diplomacy.history.push({ ...proposal, resolvedRound: next.currentRound });
      next.diplomacy.proposals.splice(propIdx, 1);
      return next;
    });
  }, []);

  const cancelAgreement = useCallback((agreementId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.diplomacy) return prev;
      const agr = next.diplomacy.agreements.find(a => a.id === agreementId);
      if (!agr || agr.status !== 'active') return prev;
      if (!agr.nationIds.includes(next.currentPlayerIndex)) return prev;
      agr.status = 'cancelled';
      adjustTrust(next, agr.nationIds[0], agr.nationIds[1], -15);
      next.players[agr.nationIds[0]].scores.cooperation = Math.max(0, (next.players[agr.nationIds[0]].scores.cooperation || 0) - 5);
      next.players[agr.nationIds[1]].scores.cooperation = Math.max(0, (next.players[agr.nationIds[1]].scores.cooperation || 0) - 5);
      next.diplomacy.history.push({ ...agr, cancelledRound: next.currentRound, cancelledBy: next.currentPlayerIndex });
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

        // Expire agreements + alliance trust maintenance
        if (next.diplomacy) {
          next.diplomacy.agreements = next.diplomacy.agreements.map(a => {
            if (a.status !== 'active') return a;
            const elapsed = next.currentRound - a.startRound;
            if (elapsed >= a.duration) {
              if (a.type === 'alliance') {
                // Alliance expired — move to history
                next.diplomacy.history.push({ ...a, expiredRound: next.currentRound, status: 'completed' });
                return { ...a, status: 'completed' };
              }
              if (a.type === 'nonAggression') {
                next.diplomacy.history.push({ ...a, expiredRound: next.currentRound, status: 'completed' });
                return { ...a, status: 'completed' };
              }
            }
            // Alliance maintenance: +2 trust per round
            if (a.type === 'alliance' && a.status === 'active') {
              adjustTrust(next, a.nationIds[0], a.nationIds[1], 2);
            }
            return a;
          });
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
    // Persist camera views alongside game state
    saves[name] = { ...gameState, _cameraViews: cameraViews, savedAt: new Date().toISOString() };
    localStorage.setItem('marsNationsSaves', JSON.stringify(saves));
  }, [gameState, cameraViews]);

  const loadGame = useCallback((name) => {
    const saves = JSON.parse(localStorage.getItem('marsNationsSaves') || '{}');
    if (saves[name]) {
      const saved = saves[name];
      // Restore saved camera views; if none saved, clear so fit-to-screen runs once
      fittedMapsRef.current = new Set();
      if (saved._cameraViews) {
        // Mark all saved maps as already fitted so we restore rather than re-fit
        Object.keys(saved._cameraViews).forEach(id => fittedMapsRef.current.add(id));
        setCameraViews(saved._cameraViews);
      } else {
        setCameraViews({});
      }
      setGameState(saved);
      setScreen('playing');
    }
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
      proposeAgreement, acceptProposal, rejectProposal, withdrawProposal, cancelAgreement,
      endTurn, dismissEvent,
      saveGame, loadGame, getSavedGames, deleteSave,
      // Camera API — stable, never touched by game actions
      getViewBox, setViewBox, fitMapToScreen, resetMapView,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}