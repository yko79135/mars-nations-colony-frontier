// ============ TERRAIN DEFINITIONS ============
export const TERRAIN_TYPES = {
  rockyPlain:      { color: '#8B6914', icon: '🪨', energyMod: 0, waterMod: 0, mineralMod: 0 },
  crater:          { color: '#6B4423', icon: '🕳️', energyMod: 0, waterMod: 0, mineralMod: 1 },
  mountain:        { color: '#5C4033', icon: '⛰️', energyMod: 0, waterMod: 0, mineralMod: 2 },
  canyon:          { color: '#7B3F00', icon: '🏜️', energyMod: 0, waterMod: 1, mineralMod: 0 },
  iceDeposit:      { color: '#A8C8D8', icon: '🧊', energyMod: 0, waterMod: 3, mineralMod: 0 },
  mineralDeposit:  { color: '#B87333', icon: '💎', energyMod: 0, waterMod: 0, mineralMod: 3 },
  lavaField:       { color: '#2D1B0E', icon: '🌋', energyMod: 1, waterMod: 0, mineralMod: 1 },
  dustBasin:       { color: '#C4A35A', icon: '🏖️', energyMod: 1, waterMod: 0, mineralMod: 0 },
  highRadiation:   { color: '#4A0E0E', icon: '☢️', energyMod: 0, waterMod: 0, mineralMod: 1 },
  polarIce:        { color: '#D4E6F1', icon: '❄️', energyMod: 0, waterMod: 4, mineralMod: 0 },
};

// ============ BUILDINGS ============
// Junior buildings: habitat, solarFarm, waterExtractor, greenhouse, mine, researchModule
// Senior buildings: all of the above plus researchLab, advancedResearchLab, and others
export const BUILDINGS = {
  // ---- JUNIOR BUILDINGS ----
  habitat: {
    juniorOnly: true,
    cost: { minerals: 4 },
    maintenance: {},
    production: { population: 5 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['lavaField', 'highRadiation'],
    juniorLabel: 'Habitat',
    juniorLabelKo: '거주지',
  },
  solarFarm: {
    cost: { minerals: 3 },
    maintenance: {},
    production: { energy: 4 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['canyon'],
    juniorLabel: 'Power Station',
    juniorLabelKo: '발전소',
  },
  waterExtractor: {
    cost: { minerals: 3, energy: 1 },
    maintenance: { energy: 1 },
    production: { water: 4 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['lavaField'],
    juniorLabel: 'Water Station',
    juniorLabelKo: '물 공급소',
  },
  greenhouse: {
    cost: { minerals: 4, water: 1 },
    maintenance: { water: 1 },
    production: { food: 4 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['highRadiation', 'lavaField'],
    juniorLabel: 'Farm',
    juniorLabelKo: '농장',
  },
  mine: {
    cost: { energy: 2 },
    maintenance: { energy: 1 },
    production: { minerals: 4 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: [],
    juniorLabel: 'Mine',
    juniorLabelKo: '광산',
  },
  researchModule: {
    cost: {},  // free — placed at capital start
    maintenance: {},
    production: { science: 1 },
    maxLevel: 1,
    techRequired: null,
    terrainRestrictions: [],
    startingBuilding: true,
    juniorLabel: 'Research Station',
    juniorLabelKo: '연구 기지',
  },

  // ---- SENIOR BUILDINGS ----
  landingHabitat: {
    cost: { minerals: 5, energy: 3 },
    maintenance: { energy: 1 },
    production: { population: 5 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['lavaField', 'highRadiation'],
  },
  advancedHabitat: {
    cost: { minerals: 10, energy: 5, science: 3 },
    maintenance: { energy: 2 },
    production: { population: 15 },
    maxLevel: 3,
    techRequired: 'printedHabitats',
    terrainRestrictions: ['lavaField', 'highRadiation'],
  },
  nuclearReactor: {
    cost: { minerals: 15, science: 8 },
    maintenance: { water: 1 },
    production: { energy: 15 },
    maxLevel: 2,
    techRequired: 'smallNuclear',
    terrainRestrictions: [],
  },
  algaeFarm: {
    cost: { minerals: 6, water: 3, science: 2 },
    maintenance: { water: 1, energy: 1 },
    production: { food: 3, oxygen: 4 },
    maxLevel: 2,
    techRequired: 'hydroponics',
    terrainRestrictions: ['highRadiation'],
  },
  factory: {
    cost: { minerals: 8, energy: 5 },
    maintenance: { energy: 3, minerals: 1 },
    production: { science: 2 },
    maxLevel: 3,
    techRequired: 'manufacturing',
    terrainRestrictions: [],
  },
  researchLab: {
    cost: { minerals: 6, energy: 3, science: 2 },
    maintenance: { energy: 2 },
    production: { science: 3 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['lavaField', 'highRadiation'],
    labLevel: 1,
  },
  advancedResearchLab: {
    cost: { minerals: 12, energy: 6, science: 8 },
    maintenance: { energy: 3 },
    production: { science: 5 },
    maxLevel: 1,
    techRequired: 'robotics',
    terrainRestrictions: ['lavaField', 'highRadiation'],
    labLevel: 2,
  },
  medicalCenter: {
    cost: { minerals: 7, energy: 3, science: 2 },
    maintenance: { energy: 1 },
    production: { morale: 2 },
    maxLevel: 2,
    techRequired: 'medicalSystems',
    terrainRestrictions: [],
  },
  recreationCenter: {
    cost: { minerals: 5, science: 2 },
    maintenance: { energy: 1 },
    production: { morale: 4 },
    maxLevel: 2,
    techRequired: 'recreation',
    terrainRestrictions: [],
  },
  commsCenter: {
    cost: { minerals: 6, energy: 4, science: 2 },
    maintenance: { energy: 2 },
    production: { science: 1 },
    maxLevel: 2,
    techRequired: null,
    terrainRestrictions: [],
  },
  tradeHub: {
    cost: { minerals: 8, science: 3 },
    maintenance: { energy: 2 },
    production: { science: 2 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['highRadiation', 'lavaField'],
  },
  roverStation: {
    cost: { minerals: 6, energy: 3 },
    maintenance: { energy: 1 },
    production: {},
    maxLevel: 2,
    techRequired: null,
    terrainRestrictions: [],
  },
  spaceport: {
    cost: { minerals: 20, energy: 10, science: 10 },
    maintenance: { energy: 5 },
    production: { science: 3 },
    maxLevel: 2,
    techRequired: 'orbitalTransport',
    terrainRestrictions: ['mountain', 'canyon', 'lavaField'],
  },
  radiationShelter: {
    cost: { minerals: 8, energy: 4 },
    maintenance: { energy: 1 },
    production: { morale: 1 },
    maxLevel: 2,
    techRequired: 'radiationProtection',
    terrainRestrictions: [],
  },
};

// Junior-mode subset of buildings
export const JUNIOR_BUILDINGS = ['habitat', 'solarFarm', 'waterExtractor', 'greenhouse', 'mine'];

// ============ SENIOR TECH TREE ============
// labRequired: null = no lab needed, 1 = researchLab needed, 2 = advancedResearchLab needed
export const TECH_TREE = {
  // Survival
  improvedLifeSupport: { branch: 'survival', cost: { science: 6 }, prerequisites: [], labRequired: null, effect: { moraleBonus: 5 }, effectDesc: 'Colony morale +5 permanently.', effectDescKo: '식민지 사기 +5 영구 적용.' },
  waterRecycling:      { branch: 'survival', cost: { science: 8 }, prerequisites: ['improvedLifeSupport'], labRequired: 1, effect: { building: 'waterExtractor', resourceBonus: { water: 2 } }, effectDesc: 'Water Extractors produce +2 Water.', effectDescKo: '물 추출 시설이 물 +2 생산.' },
  radiationProtection: { branch: 'survival', cost: { science: 10 }, prerequisites: ['improvedLifeSupport'], labRequired: 1, unlocks: ['radiationShelter'], effect: { eventProtection: true }, effectDesc: 'Unlocks Radiation Shelter. Colony protected from radiation events.', effectDescKo: '방사선 대피소 해금. 방사선 이벤트 보호.' },
  medicalSystems:      { branch: 'survival', cost: { science: 12 }, prerequisites: ['waterRecycling'], labRequired: 1, unlocks: ['medicalCenter'], effect: { populationBonus: 5 }, effectDesc: 'Unlocks Medical Center. Population +5.', effectDescKo: '의료 센터 해금. 인구 +5.' },
  closedLoopHabitats:  { branch: 'survival', cost: { science: 22 }, prerequisites: ['waterRecycling', 'medicalSystems'], labRequired: 2, effect: { sustainabilityScore: 50 }, effectDesc: 'Sustainability score +50. Colony is self-sufficient.', effectDescKo: '지속가능성 점수 +50. 식민지 자급자족.' },
  // Energy
  advancedSolar:  { branch: 'energy', cost: { science: 6 }, prerequisites: [], labRequired: null, effect: { building: 'solarFarm', resourceBonus: { energy: 2 } }, effectDesc: 'Solar Farms produce +2 Energy.', effectDescKo: '태양광 발전소 에너지 +2 생산.' },
  energyStorage:  { branch: 'energy', cost: { science: 8 }, prerequisites: ['advancedSolar'], labRequired: 1, effect: { energyCarryover: true }, effectDesc: 'Unused Energy carries over between turns.', effectDescKo: '미사용 에너지가 턴 사이에 이월됩니다.' },
  smallNuclear:   { branch: 'energy', cost: { science: 16 }, prerequisites: ['energyStorage'], labRequired: 1, unlocks: ['nuclearReactor'], effect: {}, effectDesc: 'Unlocks Nuclear Reactor building.', effectDescKo: '원자로 건물 해금.' },
  fusionResearch: { branch: 'energy', cost: { science: 30 }, prerequisites: ['smallNuclear'], labRequired: 2, effect: { scienceBonus: 10 }, effectDesc: 'Science production +10. Breakthrough achievement.', effectDescKo: '과학 생산 +10. 획기적인 업적.' },
  // Agriculture
  soilTreatment: { branch: 'agriculture', cost: { science: 6 }, prerequisites: [], labRequired: null, effect: { building: 'greenhouse', resourceBonus: { food: 1 } }, effectDesc: 'Greenhouses produce +1 Food.', effectDescKo: '온실 식량 +1 생산.' },
  hydroponics:   { branch: 'agriculture', cost: { science: 10 }, prerequisites: ['soilTreatment'], labRequired: 1, unlocks: ['algaeFarm'], effect: { building: 'greenhouse', resourceBonus: { food: 2 } }, effectDesc: 'Unlocks Algae Farm. Greenhouses +2 Food.', effectDescKo: '조류 농장 해금. 온실 식량 +2.' },
  adaptedCrops:  { branch: 'agriculture', cost: { science: 14 }, prerequisites: ['hydroponics'], labRequired: 1, effect: { building: 'greenhouse', resourceBonus: { food: 2, oxygen: 1 } }, effectDesc: 'Greenhouses +2 Food +1 Oxygen.', effectDescKo: '온실 식량 +2, 산소 +1.' },
  autoFood:      { branch: 'agriculture', cost: { science: 20 }, prerequisites: ['adaptedCrops'], labRequired: 2, effect: { maintenanceReduction: { water: 1 } }, effectDesc: 'Farm maintenance -1 Water per turn.', effectDescKo: '농장 유지비 물 -1 감소.' },
  // Industry
  advancedMining: { branch: 'industry', cost: { science: 8 }, prerequisites: [], labRequired: null, effect: { building: 'mine', resourceBonus: { minerals: 2 } }, effectDesc: 'Mines produce +2 Minerals.', effectDescKo: '광산 광물 +2 생산.' },
  manufacturing:  { branch: 'industry', cost: { science: 12 }, prerequisites: ['advancedMining'], labRequired: 1, unlocks: ['factory'], effect: {}, effectDesc: 'Unlocks Factory building.', effectDescKo: '공장 건물 해금.' },
  robotics:       { branch: 'industry', cost: { science: 18 }, prerequisites: ['manufacturing'], labRequired: 1, unlocks: ['advancedResearchLab'], effect: { buildCostReduction: 0.1 }, effectDesc: 'Unlocks Advanced Research Lab. Building costs -10%.', effectDescKo: '고급 연구소 해금. 건설 비용 -10%.' },
  printedHabitats:{ branch: 'industry', cost: { science: 22 }, prerequisites: ['robotics'], labRequired: 2, unlocks: ['advancedHabitat'], effect: {}, effectDesc: 'Unlocks Advanced Habitat.', effectDescKo: '고급 거주지 해금.' },
  // Transportation
  longRangeRovers:   { branch: 'transportation', cost: { science: 6 }, prerequisites: [], labRequired: null, effect: { exploreRange: 2 }, effectDesc: 'Explore 2 hexes away from owned territory.', effectDescKo: '소유 영토에서 2칸 거리까지 탐사 가능.' },
  pressurizedRoads:  { branch: 'transportation', cost: { science: 10 }, prerequisites: ['longRangeRovers'], labRequired: 1, effect: { claimCostReduction: 1 }, effectDesc: 'Claiming territory costs 1 fewer Energy.', effectDescKo: '영토 점령 에너지 비용 -1.' },
  railways:          { branch: 'transportation', cost: { science: 18 }, prerequisites: ['pressurizedRoads'], labRequired: 1, effect: { territoryScore: 5 }, effectDesc: 'Territory score +5 for each connected hex.', effectDescKo: '연결된 헥스마다 영토 점수 +5.' },
  orbitalTransport:  { branch: 'transportation', cost: { science: 28 }, prerequisites: ['railways'], labRequired: 2, unlocks: ['spaceport'], effect: {}, effectDesc: 'Unlocks Spaceport.', effectDescKo: '우주항 해금.' },
  // Society
  education:   { branch: 'society', cost: { science: 6 }, prerequisites: [], labRequired: null, effect: { scienceBonus: 2 }, effectDesc: 'Science production +2 per turn.', effectDescKo: '과학 생산 턴당 +2.' },
  publicHealth: { branch: 'society', cost: { science: 8 }, prerequisites: ['education'], labRequired: 1, effect: { moraleBonus: 10 }, effectDesc: 'Colony morale +10.', effectDescKo: '식민지 사기 +10.' },
  democracy:    { branch: 'society', cost: { science: 12 }, prerequisites: ['publicHealth'], labRequired: 1, effect: { cooperationBonus: 10 }, effectDesc: 'Cooperation score +10.', effectDescKo: '협력 점수 +10.' },
  recreation:   { branch: 'society', cost: { science: 10 }, prerequisites: ['education'], labRequired: 1, unlocks: ['recreationCenter'], effect: { moraleBonus: 5 }, effectDesc: 'Unlocks Recreation Center. Morale +5.', effectDescKo: '여가 시설 해금. 사기 +5.' },
  governance:   { branch: 'society', cost: { science: 20 }, prerequisites: ['democracy', 'recreation'], labRequired: 2, effect: { actionPointBonus: 1 }, effectDesc: '+1 Action Point per turn.', effectDescKo: '턴당 행동력 +1.' },
  // Planetary Science
  geologicalSurveys:     { branch: 'planetaryScience', cost: { science: 6 }, prerequisites: [], labRequired: null, effect: { building: 'mine', resourceBonus: { minerals: 1 } }, effectDesc: 'Mines produce +1 Minerals. Better deposits visible.', effectDescKo: '광산 광물 +1. 더 나은 매장지 표시.' },
  climateResearch:       { branch: 'planetaryScience', cost: { science: 10 }, prerequisites: ['geologicalSurveys'], labRequired: 1, effect: { eventReduction: 0.5 }, effectDesc: 'Negative event effects reduced by 50%.', effectDescKo: '부정적 이벤트 효과 50% 감소.' },
  undergroundExploration:{ branch: 'planetaryScience', cost: { science: 14 }, prerequisites: ['geologicalSurveys'], labRequired: 1, effect: { building: 'mine', resourceBonus: { minerals: 2, water: 1 } }, effectDesc: 'Mines produce +2 Minerals +1 Water.', effectDescKo: '광산 광물 +2, 물 +1.' },
  terraforming:          { branch: 'planetaryScience', cost: { science: 38 }, prerequisites: ['climateResearch', 'undergroundExploration'], labRequired: 2, effect: { oxygenBonus: 10, sustainabilityScore: 100 }, effectDesc: 'Oxygen +10. Sustainability +100. Terraforming victory!', effectDescKo: '산소 +10. 지속가능성 +100. 테라포밍 승리!' },
};

// ============ EVENTS ============
// ============ DIPLOMACY / TRUST ============

export const TRUST_LABELS = {
  hostile:  { min: 0,  max: 20, en: 'Hostile',        ko: '적대적' },
  poor:     { min: 21, max: 40, en: 'Poor',           ko: '좋지 않음' },
  neutral:  { min: 41, max: 60, en: 'Neutral',        ko: '중립' },
  friendly: { min: 61, max: 80, en: 'Friendly',       ko: '우호적' },
  trusted:  { min: 81, max: 100, en: 'Trusted',       ko: '신뢰함' },
};

export function getTrustLabel(value) {
  for (const [key, range] of Object.entries(TRUST_LABELS)) {
    if (value >= range.min && value <= range.max) return key;
  }
  return 'neutral';
}

export function getTrustKey(a, b) {
  const min = Math.min(a, b), max = Math.max(a, b);
  return `${min}:${max}`;
}

export function getTrust(gameState, a, b) {
  if (!gameState?.diplomacy?.trust) return 50;
  return gameState.diplomacy.trust[getTrustKey(a, b)] ?? 50;
}

export function setTrust(gameState, a, b, value) {
  if (!gameState.diplomacy) gameState.diplomacy = { proposals: [], agreements: [], history: [], trust: {} };
  if (!gameState.diplomacy.trust) gameState.diplomacy.trust = {};
  gameState.diplomacy.trust[getTrustKey(a, b)] = Math.max(0, Math.min(100, value));
}

export function adjustTrust(gameState, a, b, delta) {
  const current = getTrust(gameState, a, b);
  setTrust(gameState, a, b, current + delta);
}

export const DIPLOMACY_RESOURCES = ['energy', 'water', 'food', 'minerals', 'science'];

// ============ DIPLOMATIC INFLUENCE ============

export const DIPLOMATIC_INFLUENCE = {
  initial: 50,
  max: 100,
  min: 0,

  gains: {
    completeFairTrade: 3,
    helpOtherColony: 4,
    honorAgreement: 2,
    maintainAlliance: 2,
    leadSharedProject: 5,
    majorScienceAchievement: 8,
    resolveCrisis: 5,
    strongLivingConditions: 3,
    supportWeakerNation: 6,
    marsCouncilComply: 4,
    successfulMediation: 5,
    ceasefireOffer: 4,
  },

  costs: {
    breakAgreement: 15,
    unreasonableDemand: 5,
    startClash: 20,
    violateNonAggression: 25,
    takeTerritoryByForce: 12,
    refuseObligations: 8,
    causeHumanitarianCrisis: 18,
    applyEconomicPressure: 5,
    issueUltimatum: 12,
    ignoreMarsCouncil: 10,
    repeatedPressure: 8,
  },

  thresholds: {
    applyDiplomaticPressure: 40,
    issueUltimatum: 55,
    requestMarsCouncil: 20,
    marsCouncilVote: 30,
  },
};

// Junior Influence Stars
export const JUNIOR_INFLUENCE = {
  initial: 2,
  max: 5,

  gains: {
    helpAnotherNation: 1,
    completeSharedProject: 1,
    keepPromise: 1,
    discoverImportantLocation: 1,
    successfulColony: 1,
  },

  costs: {
    strongRequest: 1,
    marsCouncilVote: 2,
    challenge: 0,
  },
};

// ============ SECURITY CAPACITY ============

export function calculateSecurityCapacity(player, map) {
  if (!player || !map) return 0;
  let base = 5; // baseline

  // Population contribution
  base += Math.floor((player.resources.population || 0) / 10);

  // Resource contributions
  base += Math.floor((player.resources.energy || 0) / 5);
  base += Math.floor((player.resources.minerals || 0) / 3);

  // Technology bonuses
  if (player.technologies?.includes('robotics')) base += 4;
  if (player.technologies?.includes('smallNuclear')) base += 3;
  if (player.technologies?.includes('longRangeRovers') || player.technologies?.includes('longRangeRover')) base += 2;
  if (player.technologies?.includes('governance')) base += 3;

  // Building contributions
  let securityBuildings = 0;
  Object.values(map.hexes).forEach(hex => {
    if (hex.owner !== player.index) return;
    if (hex.buildings.includes('factory')) securityBuildings += 2;
    if (hex.buildings.includes('commsCenter')) securityBuildings += 1;
    if (hex.buildings.includes('roverStation')) securityBuildings += 1;
    if (hex.buildings.includes('spaceport')) securityBuildings += 3;
  });
  base += securityBuildings;

  // Morale bonus
  base += Math.floor((player.resources.morale || 50) / 25);

  return Math.max(0, base);
}

// ============ CONFLICT STRENGTH ============

export function calculateConflictStrength(player, committedEnergy, committedMinerals, hex, map, gameState) {
  if (!player) return 0;
  const baseSecurity = calculateSecurityCapacity(player, map);

  let techBonus = 0;
  if (player.technologies?.includes('robotics')) techBonus += 3;
  if (player.technologies?.includes('advancedMining')) techBonus += 2;
  if (player.technologies?.includes('pressurizedRoads')) techBonus += 2;

  let terrainBonus = 0;
  if (hex) {
    if (hex.terrain === 'mountain') terrainBonus += 4;
    if (hex.terrain === 'canyon') terrainBonus += 3;
    if (hex.terrain === 'crater') terrainBonus += 2;
  }

  let allianceSupport = 0;
  if (gameState?.diplomacy?.agreements) {
    gameState.diplomacy.agreements.forEach(a => {
      if (a.status === 'active' && a.type === 'alliance' && a.nationIds.includes(player.index)) {
        allianceSupport += 3;
      }
    });
  }

  const moraleMod = Math.floor(((player.resources.morale || 50) - 50) / 10);

  const randomModifier = Math.floor(Math.random() * 5) + 1; // small: 1-5

  return (
    baseSecurity +
    (committedEnergy || 0) +
    (committedMinerals || 0) +
    techBonus +
    terrainBonus +
    allianceSupport +
    moraleMod +
    randomModifier
  );
}

// ============ HEX TRANSFER VALIDATORS ============

export function isBorderHex(hexKey, nationIndex, map) {
  const hex = map?.hexes[hexKey];
  if (!hex || hex.owner !== nationIndex) return false;
  if (hex.isCapital) return false;

  const [q, r] = hexKey.split(',').map(Number);
  const neighbors = getHexNeighbors(q, r);

  return neighbors.some(n => {
    const nk = `${n.q},${n.r}`;
    const nHex = map.hexes[nk];
    // Border: adjacent to unclaimed tile OR another nation's tile
    return nHex && (nHex.owner === null || nHex.owner === undefined || nHex.owner !== nationIndex);
  });
}

export function isHexAdjacentToNation(hexKey, nationIndex, map) {
  const hex = map?.hexes[hexKey];
  if (!hex) return false;
  if (hex.owner === nationIndex) return false; // Already owned

  const [q, r] = hexKey.split(',').map(Number);
  const neighbors = getHexNeighbors(q, r);

  return neighbors.some(n => {
    const nk = `${n.q},${n.r}`;
    const nHex = map.hexes[nk];
    return nHex && nHex.owner === nationIndex;
  });
}

// Flood fill from capital to check connectivity
export function wouldTransferDisconnectCapital(hexKey, nationIndex, map) {
  const playerHexes = Object.entries(map.hexes)
    .filter(([k, h]) => h.owner === nationIndex && k !== hexKey)
    .map(([k]) => k);

  if (playerHexes.length <= 1) return false; // Only one hex left, no split possible

  // Find capital
  const capitalKey = Object.entries(map.hexes).find(([k, h]) => h.owner === nationIndex && h.isCapital)?.[0];
  if (!capitalKey) return false;
  if (capitalKey === hexKey) return true; // Can't transfer the capital itself

  // BFS from capital without the transferred hex
  const visited = new Set();
  const queue = [capitalKey];
  visited.add(capitalKey);

  while (queue.length > 0) {
    const current = queue.shift();
    const [cq, cr] = current.split(',').map(Number);
    const neighbors = getHexNeighbors(cq, cr);

    for (const n of neighbors) {
      const nk = `${n.q},${n.r}`;
      if (visited.has(nk)) continue;
      if (nk === hexKey) continue; // Skip the transferred hex
      const nHex = map.hexes[nk];
      if (nHex && nHex.owner === nationIndex) {
        visited.add(nk);
        queue.push(nk);
      }
    }
  }

  // Check if all other player hexes are reachable
  return playerHexes.some(k => !visited.has(k));
}

export function isHexEligibleForTransfer(hexKey, fromNationIndex, toNationIndex, map) {
  const hex = map?.hexes[hexKey];
  if (!hex) return false;
  if (hex.owner !== fromNationIndex) return false;
  if (hex.isCapital) return false;

  // Must be a border hex
  if (!isBorderHex(hexKey, fromNationIndex, map)) return false;

  // Must not disconnect the sender's capital
  if (wouldTransferDisconnectCapital(hexKey, fromNationIndex, map)) return false;

  // Receiver must be adjacent (for initial implementation)
  if (!isHexAdjacentToNation(hexKey, toNationIndex, map)) return false;

  return true;
}

export function getEligibleHexesForTransfer(fromNationIndex, toNationIndex, map) {
  const eligible = [];
  Object.entries(map.hexes).forEach(([key, hex]) => {
    if (hex.owner === fromNationIndex && isHexEligibleForTransfer(key, fromNationIndex, toNationIndex, map)) {
      eligible.push(key);
    }
  });
  return eligible;
}

// ============ PRESSURE / INFLUENCE SYSTEM ============

export const PRESSURE_CONFIG = {
  junior: {
    baseCost: 2,
    costPerBuilding: 1,
    turnsToRespond: 3,
    maxActivePerNation: 1,
    maxInfluencePerRound: 3,
    influencePer3Hexes: 1,
    influenceNoShortage: 1,
    influenceTechComplete: 1,
    influenceHelpNation: 1,
  },
  senior: {
    baseCost: 15,
    costPerBuilding: 5,
    turnsToRespond: 3,
    maxActivePerNation: 2,
    maxInfluencePerRound: 5,
    influenceFromTradeHub: 2,
    influenceFromCommsCenter: 2,
    influenceFromGovernance: 3,
    influenceFromDemocracy: 1,
    influencePer5Hexes: 1,
    influenceHighMorale: 1,
    influencePerTradeAgreement: 1,
  },
};

export function canPressurizeHex(gameState, nationIndex, hexKey) {
  if (!gameState || !gameState.map) return false;
  const hex = gameState.map.hexes[hexKey];
  if (!hex) return false;
  if (hex.owner === nationIndex) return false;
  if (hex.isCapital) return false;
  if (hex.owner === null || hex.owner === undefined) return false;

  if (!isHexAdjacentToNation(hexKey, nationIndex, gameState.map)) return false;

  const existingPressure = (gameState.pendingPressures || []).find(p =>
    p.attackerIdx === nationIndex && p.hexKey === hexKey && p.status === 'active'
  );
  if (existingPressure) return false;

  const isJunior = gameState.settings?.gradeMode === 'junior';
  const maxActive = isJunior ? PRESSURE_CONFIG.junior.maxActivePerNation : PRESSURE_CONFIG.senior.maxActivePerNation;
  const activeCount = (gameState.pendingPressures || []).filter(p =>
    p.attackerIdx === nationIndex && p.status === 'active'
  ).length;
  if (activeCount >= maxActive) return false;

  if (!isJunior) {
    const hasAlliance = gameState.diplomacy?.agreements?.some(a =>
      a.type === 'alliance' && a.status === 'active' &&
      a.nationIds.includes(nationIndex) && a.nationIds.includes(hex.owner)
    );
    const hasPact = gameState.diplomacy?.agreements?.some(a =>
      a.type === 'nonAggression' && a.status === 'active' &&
      a.nationIds.includes(nationIndex) && a.nationIds.includes(hex.owner)
    );
    if (hasAlliance || hasPact) return false;
  }

  return true;
}

export function getPressureCost(hex, gameState) {
  const isJunior = gameState?.settings?.gradeMode === 'junior';
  const config = isJunior ? PRESSURE_CONFIG.junior : PRESSURE_CONFIG.senior;
  const buildingCount = (hex.buildings || []).length;
  return config.baseCost + buildingCount * config.costPerBuilding;
}

export function calculateInfluenceAccrual(player, gameState, map) {
  if (!player || !gameState || !map) return 0;
  const isJunior = gameState.settings?.gradeMode === 'junior';

  if (isJunior) {
    let gained = 0;
    let territoryCount = 0;
    Object.values(map.hexes).forEach(h => { if (h.owner === player.index) territoryCount++; });
    gained += Math.floor(territoryCount / 3) * PRESSURE_CONFIG.junior.influencePer3Hexes;

    const resources = player.resources || {};
    const hasShortage = ['energy', 'water', 'food', 'minerals'].some(k => (resources[k] || 0) <= 2);
    if (!hasShortage) gained += PRESSURE_CONFIG.junior.influenceNoShortage;

    return Math.min(gained, PRESSURE_CONFIG.junior.maxInfluencePerRound);
  }

  let gained = 0;
  let territoryCount = 0;
  Object.values(map.hexes).forEach(h => { if (h.owner === player.index) territoryCount++; });
  gained += Math.floor(territoryCount / 5) * PRESSURE_CONFIG.senior.influencePer5Hexes;

  Object.values(map.hexes).forEach(h => {
    if (h.owner !== player.index) return;
    if (h.buildings.includes('tradeHub')) gained += PRESSURE_CONFIG.senior.influenceFromTradeHub;
    if (h.buildings.includes('commsCenter')) gained += PRESSURE_CONFIG.senior.influenceFromCommsCenter;
  });

  if (player.technologies?.includes('governance')) gained += PRESSURE_CONFIG.senior.influenceFromGovernance;
  if (player.technologies?.includes('democracy')) gained += PRESSURE_CONFIG.senior.influenceFromDemocracy;
  if ((player.resources.morale || 50) > 70) gained += PRESSURE_CONFIG.senior.influenceHighMorale;

  const tradeAgreementCount = (gameState.diplomacy?.agreements || []).filter(a =>
    a.type === 'trade' && a.status === 'active' && a.nationIds.includes(player.index)
  ).length;
  gained += Math.floor(tradeAgreementCount / 2) * PRESSURE_CONFIG.senior.influencePerTradeAgreement;

  return Math.min(gained, PRESSURE_CONFIG.senior.maxInfluencePerRound);
}

// ============ EVENTS ============

export const EVENTS = [
  { id: 'dustStorm',        type: 'negative', scope: 'single', effects: { energy: -3 } },
  { id: 'solarStorm',       type: 'negative', scope: 'all',    effects: { morale: -2 } },
  { id: 'equipmentFailure', type: 'negative', scope: 'single', effects: { minerals: -3 } },
  { id: 'waterContamination',type:'negative', scope: 'single', effects: { water: -4 } },
  { id: 'cropDisease',      type: 'negative', scope: 'single', effects: { food: -3 } },
  { id: 'meteorStrike',     type: 'negative', scope: 'single', effects: { minerals: -2, energy: -2 } },
  { id: 'supplyDelay',      type: 'negative', scope: 'all',    effects: { science: -1 } },
  { id: 'iceDiscovery',     type: 'positive', scope: 'single', effects: { water: 6 } },
  { id: 'scienceDiscovery', type: 'positive', scope: 'single', effects: { science: 5 } },
  { id: 'populationBoom',   type: 'positive', scope: 'single', effects: { food: 3, minerals: 2 } },
];

// Junior events (simpler, with choice)
export const JUNIOR_EVENTS = [
  { id: 'dustStorm',        type: 'negative', scope: 'single', effects: { energy: -3 }, choice: true },
  { id: 'waterContamination',type:'negative', scope: 'single', effects: { water: -4 }, choice: true },
  { id: 'cropDisease',      type: 'negative', scope: 'single', effects: { food: -3 }, choice: true },
  { id: 'iceDiscovery',     type: 'positive', scope: 'single', effects: { water: 6 } },
  { id: 'populationBoom',   type: 'positive', scope: 'single', effects: { minerals: 4 } },
];

// ============ FLAG EMBLEMS ============
export const FLAG_EMBLEMS = [
  '🚀','⭐','🌟','🔴','🌕','🛸','🔬','⚙️','🏔️','🌊',
  '🔥','💫','🪐','☀️','🌍','🦅','🐉','🦁','🌿','⚡',
  '🏛️','🗡️','🛡️','👑','🎯','💎','🔱','⚓','🌸','🍀'
];

// ============ NATION COLORS ============
export const NATION_COLORS = [
  { name: 'Blue',   hex: '#3B82F6' },
  { name: 'Red',    hex: '#EF4444' },
  { name: 'Green',  hex: '#22C55E' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Cyan',   hex: '#06B6D4' },
  { name: 'Pink',   hex: '#EC4899' },
  { name: 'Yellow', hex: '#EAB308' },
];

// ============ STARTING RESOURCES ============
export const STARTING_RESOURCES = {
  scarce:   { energy: 10, water: 8,  food: 8,  minerals: 8,  science: 2  },
  standard: { energy: 15, water: 12, food: 12, minerals: 12, science: 5  },
  abundant: { energy: 20, water: 16, food: 16, minerals: 16, science: 8  },
};

// ============ MAP GENERATION ============
export function generateHexMap(size) {
  let radius;
  if (size === 'small')  radius = 5;
  else if (size === 'medium') radius = 7;
  else radius = 9;

  const hexes = {};
  const weightedTerrain = [
    'rockyPlain','rockyPlain','rockyPlain','rockyPlain',
    'dustBasin','dustBasin','dustBasin',
    'crater','crater',
    'mountain','mountain',
    'canyon',
    'iceDeposit',
    'mineralDeposit',
    'lavaField',
    'highRadiation',
  ];

  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) > radius) continue;
      const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
      if (dist > radius) continue;
      let terrain;
      if (dist >= radius - 1 && Math.random() < 0.4) terrain = 'polarIce';
      else terrain = weightedTerrain[Math.floor(Math.random() * weightedTerrain.length)];
      hexes[`${q},${r}`] = { q, r, terrain, explored: false, owner: null, buildings: [], settlement: null, isCapital: false };
    }
  }
  return { hexes, radius };
}

// ============ HEX GEOMETRY (flat-top) ============
export function hexToPixel(q, r, size) {
  return {
    x: size * (3/2 * q),
    y: size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r),
  };
}

export function pixelToHex(px, py, size) {
  return hexRound((2/3 * px) / size, (-1/3 * px + Math.sqrt(3)/3 * py) / size);
}

function hexRound(qf, rf) {
  const sf = -qf - rf;
  let q = Math.round(qf), r = Math.round(rf), s = Math.round(sf);
  if (Math.abs(q - qf) > Math.abs(r - rf) && Math.abs(q - qf) > Math.abs(s - sf)) q = -r - s;
  else if (Math.abs(r - rf) > Math.abs(s - sf)) r = -q - s;
  return { q, r };
}

export function getHexCorners(cx, cy, size) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    corners.push({ x: cx + size * Math.cos(angle), y: cy + size * Math.sin(angle) });
  }
  return corners;
}

export function getHexNeighbors(q, r) {
  return [
    { q: q+1, r }, { q: q-1, r },
    { q, r: r+1 }, { q, r: r-1 },
    { q: q+1, r: r-1 }, { q: q-1, r: r+1 },
  ];
}

export function hexDistance(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1+r1 - q2-r2) + Math.abs(r1 - r2)) / 2;
}

// ============ RESOURCE CALCULATIONS ============
// Get lab level a player has (0 = module only, 1 = researchLab, 2 = advancedResearchLab)
export function getPlayerLabLevel(player, map) {
  let level = 0;
  if (!player || !map) return level;
  Object.values(map.hexes).forEach(hex => {
    if (hex.owner !== player.index) return;
    if (hex.buildings.includes('advancedResearchLab')) level = Math.max(level, 2);
    else if (hex.buildings.includes('researchLab')) level = Math.max(level, 1);
  });
  return level;
}

export function calculateResourceProduction(player, map) {
  const production = { energy: 0, water: 0, food: 0, minerals: 0, science: 0, oxygen: 0, morale: 0 };
  if (!player || player.index === undefined || !map) return production;

  // Base science from research module at capital
  production.science += 1;

  // Tech bonuses: collect building production bonuses from researched techs
  const techBonuses = {}; // building -> { resource: amount }
  const techTree = player.gradeMode === 'junior'
    ? {} // junior uses JUNIOR_TECHS effects applied at production time via technologies array
    : {};

  Object.entries(map.hexes).forEach(([, hex]) => {
    if (hex.owner !== player.index) return;
    const terrain = TERRAIN_TYPES[hex.terrain];
    production.water   += terrain.waterMod;
    production.minerals+= terrain.mineralMod;
    production.energy  += terrain.energyMod;

    hex.buildings.forEach(bId => {
      const b = BUILDINGS[bId];
      if (!b || !b.production) return;
      Object.entries(b.production).forEach(([res, amt]) => {
        production[res] = (production[res] || 0) + amt;
      });
    });
  });

  // Technology bonuses are applied via applyTechEffects at research time
  // Additional per-building bonuses stored on player.techBonuses: { buildingId: { resource: totalBonus } }
  if (player.techBonuses) {
    Object.entries(player.techBonuses).forEach(([buildingId, bonuses]) => {
      let count = 0;
      Object.values(map.hexes).forEach(h => {
        if (h.owner === player.index && h.buildings.includes(buildingId)) count++;
      });
      if (count > 0) {
        Object.entries(bonuses).forEach(([res, amt]) => {
          production[res] = (production[res] || 0) + (amt * count);
        });
      }
    });
  }
  // Flat science/morale bonuses from techs
  if (player.flatBonuses) {
    Object.entries(player.flatBonuses).forEach(([res, amt]) => {
      production[res] = (production[res] || 0) + amt;
    });
  }

  return production;
}

export function calculateMaintenance(player, map) {
  const maintenance = { energy: 0, water: 0, food: 0, minerals: 0 };
  if (!player || !map) return maintenance;
  Object.entries(map.hexes).forEach(([, hex]) => {
    if (hex.owner !== player.index) return;
    hex.buildings.forEach(bId => {
      const b = BUILDINGS[bId];
      if (!b || !b.maintenance) return;
      Object.entries(b.maintenance).forEach(([res, amt]) => {
        maintenance[res] = (maintenance[res] || 0) + amt;
      });
    });
  });
  return maintenance;
}

export function calculateScores(player, map) {
  let territory = 0;
  Object.values(map.hexes).forEach(h => { if (h.owner === player.index) territory++; });
  return {
    territory,
    science: (player.technologies || []).length * 5,
    population: player.resources.population || 0,
    livingConditions: 50,
    economic: (player.resources.minerals || 0),
    cooperation: (player.agreements || []).length * 10,
    sustainability: player.technologies?.includes('closedLoopHabitats') ? 50 : 0,
    achievement: (player.technologies || []).length * 2 + territory,
  };
}

// ============ GAME STATE CREATION ============
export function createInitialGameState(settings, nations) {
  const gradeMode = settings.gradeMode || 'senior';
  const map = generateHexMap(settings.mapSize || 'medium');

  const validHexKeys = Object.keys(map.hexes).filter(k => {
    const h = map.hexes[k];
    return h.terrain !== 'highRadiation' && h.terrain !== 'lavaField' && h.terrain !== 'polarIce';
  });

  const startPositions = pickStartingPositions(validHexKeys, nations.length, map);

  const players = nations.map((nation, i) => {
    const hexKey = startPositions[i];
    const hex = map.hexes[hexKey];
    hex.explored = true;
    if (!hex.exploredBy) hex.exploredBy = {};
    hex.exploredBy[i] = true;
    hex.owner = i;
    hex.isCapital = true;
    hex.settlement = { name: nation.colonyName, level: 1 };

    if (gradeMode === 'junior') {
      hex.buildings = ['habitat', 'solarFarm', 'waterExtractor', 'greenhouse', 'researchModule'];
    } else {
      hex.buildings = ['landingHabitat', 'solarFarm', 'waterExtractor', 'greenhouse', 'researchModule'];
    }

    // Explore neighboring hexes for this nation's starting vision
    getHexNeighbors(hex.q, hex.r).forEach(n => {
      const nk = `${n.q},${n.r}`;
      if (map.hexes[nk]) {
        map.hexes[nk].explored = true;
        if (!map.hexes[nk].exploredBy) map.hexes[nk].exploredBy = {};
        map.hexes[nk].exploredBy[i] = true;
      }
    });

    const resKey = settings.startingResources || 'standard';
    const res = { ...STARTING_RESOURCES[resKey] };

    if (gradeMode === 'junior') {
      // Junior: only 4 resources + small science for research
      return {
        ...nation,
        index: i,
        gradeMode,
        resources: { energy: res.energy, water: res.water, food: res.food, minerals: res.minerals, science: 4 },
        technologies: [],
        agreements: [],
        cooperationActions: 0,
        influenceStars: 2,
        scores: { territory: 1, science: 0, cooperation: 0, development: 0 },
        capitalHex: hexKey,
      };
    }

    return {
      ...nation,
      index: i,
      gradeMode,
      resources: { ...res },
      technologies: [],
      agreements: [],
      diplomaticInfluence: 50,
      scores: { territory: 1, science: 0, population: res.population || 0, livingConditions: 50, economic: 0, cooperation: 0, sustainability: 0, achievement: 0 },
      capitalHex: hexKey,
    };
  });

  return {
    settings: { ...settings, gradeMode },
    map,
    players,
    currentPlayerIndex: 0,
    currentRound: 1,
    phase: 'playerActions',
    actionPoints: settings.actionPointsPerTurn || 3,
    events: [],
    activeEvent: null,
    turnHistory: [],
    gameOver: false,
    diplomacy: {
      proposals: [],
      agreements: [],
      history: [],
      trust: {},
    },
    disputes: [],
    conflictCooldowns: {},
    marsCouncilVotes: [],
    pendingPressures: [],
  };
}

// ============ SHARED VALIDATORS ============
// Use these everywhere (HexMap highlights, action handlers, click validation, tooltips).

export function isExploredByNation(hex, nationIndex) {
  if (!hex) return false;
  if (hex.exploredBy) return !!hex.exploredBy[nationIndex];
  return !!hex.explored;
}

export function canExploreHex(gameState, nationIndex, hexKey) {
  if (!gameState || !gameState.map) return false;
  const hex = gameState.map.hexes[hexKey];
  if (!hex) return false;
  if (isExploredByNation(hex, nationIndex)) return false;

  const player = gameState.players[nationIndex];
  const hasLongRange = player?.technologies?.includes('longRangeRovers') || player?.technologies?.includes('longRangeRover');

  const neighbors = getHexNeighbors(hex.q, hex.r);
  const adjToExplored = neighbors.some(n => {
    const nk = `${n.q},${n.r}`;
    return isExploredByNation(gameState.map.hexes[nk], nationIndex);
  });
  if (adjToExplored) return true;

  if (hasLongRange) {
    return Object.values(gameState.map.hexes).some(h => {
      if (!isExploredByNation(h, nationIndex)) return false;
      return hexDistance(h.q, h.r, hex.q, hex.r) <= 2;
    });
  }
  return false;
}

export function canClaimHex(gameState, nationIndex, hexKey) {
  if (!gameState || !gameState.map) return false;
  const hex = gameState.map.hexes[hexKey];
  if (!hex) return false;
  if (!isExploredByNation(hex, nationIndex)) return false;
  if (hex.owner !== null && hex.owner !== undefined) return false;

  return getHexNeighbors(hex.q, hex.r).some(n => {
    const nk = `${n.q},${n.r}`;
    const nHex = gameState.map.hexes[nk];
    return nHex && nHex.owner === nationIndex;
  });
}

export function canBuildOnHex(gameState, nationIndex, hexKey) {
  if (!gameState || !gameState.map) return false;
  const hex = gameState.map.hexes[hexKey];
  if (!hex) return false;
  return hex.owner === nationIndex;
}

function pickStartingPositions(hexKeys, count, map) {
  const positions = [];
  for (let t = 0; t < 200 && positions.length < count; t++) {
    const candidate = hexKeys[Math.floor(Math.random() * hexKeys.length)];
    const hex = map.hexes[candidate];
    const dist = Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(-hex.q-hex.r));
    if (dist > map.radius - 2) continue;
    let tooClose = false;
    for (const pos of positions) {
      const ph = map.hexes[pos];
      if (hexDistance(hex.q, hex.r, ph.q, ph.r) < Math.max(3, Math.floor(map.radius * 0.5))) { tooClose = true; break; }
    }
    if (!tooClose) positions.push(candidate);
  }
  while (positions.length < count) {
    const c = hexKeys[Math.floor(Math.random() * hexKeys.length)];
    if (!positions.includes(c)) positions.push(c);
  }
  return positions;
}