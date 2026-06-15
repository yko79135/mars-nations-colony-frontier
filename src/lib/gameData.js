// ============ TERRAIN DEFINITIONS ============
export const TERRAIN_TYPES = {
  rockyPlain: { color: '#8B6914', icon: '🪨', energyMod: 0, waterMod: 0, mineralMod: 0, constructionDifficulty: 'low', radiationRisk: 'medium' },
  crater: { color: '#6B4423', icon: '🕳️', energyMod: 0, waterMod: 0, mineralMod: 1, constructionDifficulty: 'medium', radiationRisk: 'medium' },
  mountain: { color: '#5C4033', icon: '⛰️', energyMod: 0, waterMod: 0, mineralMod: 2, constructionDifficulty: 'high', radiationRisk: 'low' },
  canyon: { color: '#7B3F00', icon: '🏜️', energyMod: 0, waterMod: 1, mineralMod: 0, constructionDifficulty: 'high', radiationRisk: 'low' },
  iceDeposit: { color: '#A8C8D8', icon: '🧊', energyMod: 0, waterMod: 3, mineralMod: 0, constructionDifficulty: 'medium', radiationRisk: 'medium' },
  mineralDeposit: { color: '#B87333', icon: '💎', energyMod: 0, waterMod: 0, mineralMod: 3, constructionDifficulty: 'medium', radiationRisk: 'medium' },
  lavaField: { color: '#2D1B0E', icon: '🌋', energyMod: 1, waterMod: 0, mineralMod: 1, constructionDifficulty: 'extreme', radiationRisk: 'high' },
  dustBasin: { color: '#C4A35A', icon: '🏖️', energyMod: 1, waterMod: 0, mineralMod: 0, constructionDifficulty: 'low', radiationRisk: 'medium' },
  highRadiation: { color: '#4A0E0E', icon: '☢️', energyMod: 0, waterMod: 0, mineralMod: 1, constructionDifficulty: 'high', radiationRisk: 'extreme' },
  polarIce: { color: '#D4E6F1', icon: '❄️', energyMod: 0, waterMod: 4, mineralMod: 0, constructionDifficulty: 'high', radiationRisk: 'low' },
};

// ============ BUILDING DEFINITIONS ============
export const BUILDINGS = {
  landingHabitat: {
    cost: { minerals: 5, energy: 3 },
    maintenance: { energy: 1 },
    production: { population: 5 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['lavaField', 'highRadiation'],
  },
  advancedHabitat: {
    cost: { minerals: 10, energy: 5, credits: 5 },
    maintenance: { energy: 2 },
    production: { population: 15 },
    maxLevel: 3,
    techRequired: 'printedHabitats',
    terrainRestrictions: ['lavaField', 'highRadiation'],
  },
  solarFarm: {
    cost: { minerals: 4, credits: 2 },
    maintenance: {},
    production: { energy: 5 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['canyon'],
  },
  nuclearReactor: {
    cost: { minerals: 15, credits: 10, science: 5 },
    maintenance: { water: 1 },
    production: { energy: 15 },
    maxLevel: 2,
    techRequired: 'smallNuclear',
    terrainRestrictions: [],
  },
  waterExtractor: {
    cost: { minerals: 4, energy: 2 },
    maintenance: { energy: 1 },
    production: { water: 4 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['lavaField'],
  },
  greenhouse: {
    cost: { minerals: 5, water: 2, energy: 2 },
    maintenance: { water: 1, energy: 1 },
    production: { food: 4, oxygen: 2 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['highRadiation', 'lavaField'],
  },
  algaeFarm: {
    cost: { minerals: 6, water: 3, science: 2 },
    maintenance: { water: 1, energy: 1 },
    production: { food: 3, oxygen: 4 },
    maxLevel: 2,
    techRequired: 'hydroponics',
    terrainRestrictions: ['highRadiation'],
  },
  mine: {
    cost: { energy: 3, credits: 2 },
    maintenance: { energy: 2 },
    production: { minerals: 5 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: [],
  },
  factory: {
    cost: { minerals: 8, energy: 5 },
    maintenance: { energy: 3, minerals: 1 },
    production: { credits: 5 },
    maxLevel: 3,
    techRequired: 'manufacturing',
    terrainRestrictions: [],
  },
  researchLab: {
    cost: { minerals: 6, energy: 3, credits: 3 },
    maintenance: { energy: 2 },
    production: { science: 4 },
    maxLevel: 3,
    techRequired: null,
    terrainRestrictions: ['lavaField', 'highRadiation'],
  },
  medicalCenter: {
    cost: { minerals: 7, energy: 3, credits: 4 },
    maintenance: { energy: 1, credits: 1 },
    production: { morale: 2 },
    maxLevel: 2,
    techRequired: 'medicalSystems',
    terrainRestrictions: [],
  },
  recreationCenter: {
    cost: { minerals: 5, credits: 5 },
    maintenance: { energy: 1, credits: 1 },
    production: { morale: 4 },
    maxLevel: 2,
    techRequired: 'recreation',
    terrainRestrictions: [],
  },
  commsCenter: {
    cost: { minerals: 6, energy: 4, science: 2 },
    maintenance: { energy: 2 },
    production: { credits: 2, science: 1 },
    maxLevel: 2,
    techRequired: null,
    terrainRestrictions: [],
  },
  tradeHub: {
    cost: { minerals: 8, credits: 5 },
    maintenance: { energy: 2 },
    production: { credits: 6 },
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
    cost: { minerals: 20, energy: 10, credits: 15, science: 5 },
    maintenance: { energy: 5, credits: 3 },
    production: { credits: 8, science: 2 },
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

// ============ TECH TREE ============
export const TECH_TREE = {
  // Survival
  improvedLifeSupport: { branch: 'survival', cost: { science: 8 }, prerequisites: [], unlocks: [] },
  waterRecycling: { branch: 'survival', cost: { science: 10 }, prerequisites: ['improvedLifeSupport'], unlocks: [] },
  radiationProtection: { branch: 'survival', cost: { science: 12 }, prerequisites: ['improvedLifeSupport'], unlocks: ['radiationShelter'] },
  medicalSystems: { branch: 'survival', cost: { science: 14 }, prerequisites: ['waterRecycling'], unlocks: ['medicalCenter'] },
  closedLoopHabitats: { branch: 'survival', cost: { science: 25 }, prerequisites: ['waterRecycling', 'medicalSystems'], unlocks: [] },
  // Energy
  advancedSolar: { branch: 'energy', cost: { science: 8 }, prerequisites: [], unlocks: [] },
  energyStorage: { branch: 'energy', cost: { science: 10 }, prerequisites: ['advancedSolar'], unlocks: [] },
  smallNuclear: { branch: 'energy', cost: { science: 18 }, prerequisites: ['energyStorage'], unlocks: ['nuclearReactor'] },
  fusionResearch: { branch: 'energy', cost: { science: 35 }, prerequisites: ['smallNuclear'], unlocks: [] },
  // Agriculture
  soilTreatment: { branch: 'agriculture', cost: { science: 8 }, prerequisites: [], unlocks: [] },
  hydroponics: { branch: 'agriculture', cost: { science: 12 }, prerequisites: ['soilTreatment'], unlocks: ['algaeFarm'] },
  adaptedCrops: { branch: 'agriculture', cost: { science: 16 }, prerequisites: ['hydroponics'], unlocks: [] },
  autoFood: { branch: 'agriculture', cost: { science: 22 }, prerequisites: ['adaptedCrops'], unlocks: [] },
  // Industry
  advancedMining: { branch: 'industry', cost: { science: 10 }, prerequisites: [], unlocks: [] },
  manufacturing: { branch: 'industry', cost: { science: 14 }, prerequisites: ['advancedMining'], unlocks: ['factory'] },
  robotics: { branch: 'industry', cost: { science: 20 }, prerequisites: ['manufacturing'], unlocks: [] },
  printedHabitats: { branch: 'industry', cost: { science: 25 }, prerequisites: ['robotics'], unlocks: ['advancedHabitat'] },
  // Transportation
  longRangeRovers: { branch: 'transportation', cost: { science: 8 }, prerequisites: [], unlocks: [] },
  pressurizedRoads: { branch: 'transportation', cost: { science: 12 }, prerequisites: ['longRangeRovers'], unlocks: [] },
  railways: { branch: 'transportation', cost: { science: 20 }, prerequisites: ['pressurizedRoads'], unlocks: [] },
  orbitalTransport: { branch: 'transportation', cost: { science: 30 }, prerequisites: ['railways'], unlocks: ['spaceport'] },
  // Society
  education: { branch: 'society', cost: { science: 8 }, prerequisites: [], unlocks: [] },
  publicHealth: { branch: 'society', cost: { science: 10 }, prerequisites: ['education'], unlocks: [] },
  democracy: { branch: 'society', cost: { science: 14 }, prerequisites: ['publicHealth'], unlocks: [] },
  recreation: { branch: 'society', cost: { science: 12 }, prerequisites: ['education'], unlocks: ['recreationCenter'] },
  governance: { branch: 'society', cost: { science: 22 }, prerequisites: ['democracy', 'recreation'], unlocks: [] },
  // Planetary Science
  geologicalSurveys: { branch: 'planetaryScience', cost: { science: 8 }, prerequisites: [], unlocks: [] },
  climateResearch: { branch: 'planetaryScience', cost: { science: 12 }, prerequisites: ['geologicalSurveys'], unlocks: [] },
  undergroundExploration: { branch: 'planetaryScience', cost: { science: 16 }, prerequisites: ['geologicalSurveys'], unlocks: [] },
  terraforming: { branch: 'planetaryScience', cost: { science: 40 }, prerequisites: ['climateResearch', 'undergroundExploration'], unlocks: [] },
};

// ============ EVENTS ============
export const EVENTS = [
  { id: 'dustStorm', type: 'negative', scope: 'single', effects: { energy: -3 } },
  { id: 'solarStorm', type: 'negative', scope: 'all', effects: { morale: -2, population: -1 } },
  { id: 'equipmentFailure', type: 'negative', scope: 'single', effects: { credits: -5, minerals: -2 } },
  { id: 'waterContamination', type: 'negative', scope: 'single', effects: { water: -4 } },
  { id: 'cropDisease', type: 'negative', scope: 'single', effects: { food: -3 } },
  { id: 'medicalEmergency', type: 'negative', scope: 'single', effects: { morale: -3, population: -2 } },
  { id: 'meteorStrike', type: 'negative', scope: 'single', effects: { minerals: -3, energy: -2 } },
  { id: 'supplyDelay', type: 'negative', scope: 'all', effects: { credits: -2 } },
  { id: 'earthFunding', type: 'positive', scope: 'single', effects: { credits: 10 } },
  { id: 'iceDiscovery', type: 'positive', scope: 'single', effects: { water: 8 } },
  { id: 'scienceDiscovery', type: 'positive', scope: 'single', effects: { science: 8 } },
  { id: 'colonistProtest', type: 'negative', scope: 'single', effects: { morale: -5 } },
  { id: 'populationBoom', type: 'positive', scope: 'single', effects: { population: 5 } },
  { id: 'dispute', type: 'negative', scope: 'all', effects: { morale: -1, credits: -1 } },
  { id: 'commsFailure', type: 'negative', scope: 'single', effects: { credits: -2 } },
];

// ============ FLAG EMBLEMS ============
export const FLAG_EMBLEMS = [
  '🚀', '⭐', '🌟', '🔴', '🌕', '🛸', '🔬', '⚙️', '🏔️', '🌊',
  '🔥', '💫', '🪐', '☀️', '🌍', '🦅', '🐉', '🦁', '🌿', '⚡',
  '🏛️', '🗡️', '🛡️', '👑', '🎯', '💎', '🔱', '⚓', '🌸', '🍀'
];

// ============ NATION COLORS ============
export const NATION_COLORS = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Yellow', hex: '#EAB308' },
];

// ============ STARTING RESOURCES ============
export const STARTING_RESOURCES = {
  scarce: { energy: 10, water: 8, food: 8, minerals: 8, science: 3, credits: 5, population: 10, morale: 50, oxygen: 10 },
  standard: { energy: 15, water: 12, food: 12, minerals: 12, science: 5, credits: 10, population: 20, morale: 60, oxygen: 15 },
  abundant: { energy: 25, water: 20, food: 20, minerals: 20, science: 10, credits: 20, population: 30, morale: 70, oxygen: 25 },
};

// ============ MAP GENERATION ============
export function generateHexMap(size) {
  const hexes = {};
  let radius;
  if (size === 'small') radius = 5;
  else if (size === 'medium') radius = 7;
  else radius = 9;

  const terrainKeys = Object.keys(TERRAIN_TYPES);
  const weightedTerrain = [
    'rockyPlain', 'rockyPlain', 'rockyPlain', 'rockyPlain',
    'dustBasin', 'dustBasin', 'dustBasin',
    'crater', 'crater',
    'mountain', 'mountain',
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
      if (dist >= radius - 1 && Math.random() < 0.4) {
        terrain = 'polarIce';
      } else {
        terrain = weightedTerrain[Math.floor(Math.random() * weightedTerrain.length)];
      }

      const key = `${q},${r}`;
      hexes[key] = {
        q, r,
        terrain,
        explored: false,
        owner: null,
        buildings: [],
        settlement: null,
        isCapital: false,
      };
    }
  }
  return { hexes, radius };
}

// ============ HEX GEOMETRY (flat-top) ============
export function hexToPixel(q, r, size) {
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
}

export function pixelToHex(px, py, size) {
  const q = (2/3 * px) / size;
  const r = (-1/3 * px + Math.sqrt(3)/3 * py) / size;
  return hexRound(q, r);
}

function hexRound(qf, rf) {
  const sf = -qf - rf;
  let q = Math.round(qf);
  let r = Math.round(rf);
  let s = Math.round(sf);
  const qd = Math.abs(q - qf);
  const rd = Math.abs(r - rf);
  const sd = Math.abs(s - sf);
  if (qd > rd && qd > sd) q = -r - s;
  else if (rd > sd) r = -q - s;
  return { q, r };
}

export function getHexCorners(cx, cy, size) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    corners.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    });
  }
  return corners;
}

export function getHexNeighbors(q, r) {
  return [
    { q: q+1, r: r }, { q: q-1, r: r },
    { q: q, r: r+1 }, { q: q, r: r-1 },
    { q: q+1, r: r-1 }, { q: q-1, r: r+1 },
  ];
}

// ============ GAME STATE HELPERS ============
export function createInitialGameState(settings, nations) {
  const map = generateHexMap(settings.mapSize);
  
  // Assign starting positions
  const hexKeys = Object.keys(map.hexes).filter(k => {
    const h = map.hexes[k];
    return h.terrain !== 'highRadiation' && h.terrain !== 'lavaField' && h.terrain !== 'polarIce';
  });
  
  // Pick spread-out starting positions
  const startPositions = pickStartingPositions(hexKeys, nations.length, map);
  
  const players = nations.map((nation, i) => {
    const hexKey = startPositions[i];
    const hex = map.hexes[hexKey];
    hex.explored = true;
    hex.owner = i;
    hex.isCapital = true;
    hex.settlement = { name: nation.colonyName, level: 1 };
    hex.buildings = ['landingHabitat', 'solarFarm', 'waterExtractor', 'greenhouse', 'researchLab'];
    
    // Explore neighbors
    const neighbors = getHexNeighbors(hex.q, hex.r);
    neighbors.forEach(n => {
      const nk = `${n.q},${n.r}`;
      if (map.hexes[nk]) {
        map.hexes[nk].explored = true;
      }
    });
    
    const res = { ...STARTING_RESOURCES[settings.startingResources] };
    
    return {
      ...nation,
      index: i,
      resources: res,
      technologies: [],
      agreements: [],
      scores: { territory: 1, science: 0, population: res.population, livingConditions: 50, economic: 0, cooperation: 0, sustainability: 0, achievement: 0 },
      capitalHex: hexKey,
    };
  });
  
  return {
    settings,
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
  };
}

function pickStartingPositions(hexKeys, count, map) {
  // Try to pick positions that are spread apart
  const positions = [];
  const tries = 100;
  
  for (let t = 0; t < tries && positions.length < count; t++) {
    const candidate = hexKeys[Math.floor(Math.random() * hexKeys.length)];
    const hex = map.hexes[candidate];
    const dist = Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(-hex.q - hex.r));
    
    // Prefer positions not too close to edge and not too close to each other
    if (dist > map.radius - 2) continue;
    
    let tooClose = false;
    for (const pos of positions) {
      const ph = map.hexes[pos];
      const d = hexDistance(hex.q, hex.r, ph.q, ph.r);
      if (d < Math.max(3, Math.floor(map.radius * 0.6))) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) positions.push(candidate);
  }
  
  // Fallback if we didn't get enough
  while (positions.length < count) {
    const candidate = hexKeys[Math.floor(Math.random() * hexKeys.length)];
    if (!positions.includes(candidate)) positions.push(candidate);
  }
  
  return positions;
}

export function hexDistance(q1, r1, q2, r2) {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

export function calculateResourceProduction(player, map) {
  const production = { energy: 0, water: 0, food: 0, minerals: 0, science: 0, credits: 0, oxygen: 0, morale: 0, population: 0 };
  
  Object.entries(map.hexes).forEach(([key, hex]) => {
    if (hex.owner !== player.index) return;
    
    const terrainData = TERRAIN_TYPES[hex.terrain];
    production.water += terrainData.waterMod;
    production.minerals += terrainData.mineralMod;
    production.energy += terrainData.energyMod;
    
    hex.buildings.forEach(bId => {
      const bData = BUILDINGS[bId];
      if (bData && bData.production) {
        Object.entries(bData.production).forEach(([res, amt]) => {
          production[res] = (production[res] || 0) + amt;
        });
      }
    });
  });
  
  return production;
}

export function calculateMaintenance(player, map) {
  const maintenance = { energy: 0, water: 0, food: 0, minerals: 0, credits: 0 };
  
  Object.entries(map.hexes).forEach(([key, hex]) => {
    if (hex.owner !== player.index) return;
    hex.buildings.forEach(bId => {
      const bData = BUILDINGS[bId];
      if (bData && bData.maintenance) {
        Object.entries(bData.maintenance).forEach(([res, amt]) => {
          maintenance[res] = (maintenance[res] || 0) + amt;
        });
      }
    });
  });
  
  // Population consumes food, water, oxygen
  const pop = player.resources.population;
  maintenance.food += Math.ceil(pop / 5);
  maintenance.water += Math.ceil(pop / 8);
  maintenance.oxygen = (maintenance.oxygen || 0) + Math.ceil(pop / 6);
  
  return maintenance;
}

export function calculateLivingConditions(player, map) {
  const r = player.resources;
  const pop = Math.max(r.population, 1);
  
  let housing = 0;
  Object.entries(map.hexes).forEach(([key, hex]) => {
    if (hex.owner !== player.index) return;
    hex.buildings.forEach(b => {
      if (b === 'landingHabitat') housing += 15;
      if (b === 'advancedHabitat') housing += 40;
    });
  });
  
  const housingScore = Math.min(100, (housing / pop) * 100);
  const foodScore = Math.min(100, (r.food / Math.max(1, Math.ceil(pop / 5))) * 50);
  const waterScore = Math.min(100, (r.water / Math.max(1, Math.ceil(pop / 8))) * 50);
  const oxygenScore = Math.min(100, (r.oxygen / Math.max(1, Math.ceil(pop / 6))) * 50);
  const healthScore = player.technologies.includes('medicalSystems') ? 70 : 40;
  const safetyScore = player.technologies.includes('radiationProtection') ? 70 : 40;
  const educationScore = player.technologies.includes('education') ? 60 : 20;
  const recreationScore = player.technologies.includes('recreation') ? 60 : 20;
  const stabilityScore = r.morale > 50 ? 60 : 30;
  const moraleScore = r.morale;
  
  return Math.round((housingScore + foodScore + waterScore + oxygenScore + healthScore + safetyScore + educationScore + recreationScore + stabilityScore + moraleScore) / 10);
}

export function calculateScores(player, map) {
  let territory = 0;
  Object.values(map.hexes).forEach(h => { if (h.owner === player.index) territory++; });
  
  return {
    territory,
    science: player.technologies.length * 5,
    population: player.resources.population,
    livingConditions: calculateLivingConditions(player, map),
    economic: player.resources.credits + Math.floor(player.resources.minerals / 2),
    cooperation: player.agreements.length * 10,
    sustainability: player.technologies.includes('closedLoopHabitats') ? 50 : (player.technologies.includes('waterRecycling') ? 25 : 0),
    achievement: player.technologies.length * 2 + territory,
  };
}