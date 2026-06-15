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
    hex.owner = i;
    hex.isCapital = true;
    hex.settlement = { name: nation.colonyName, level: 1 };

    if (gradeMode === 'junior') {
      hex.buildings = ['habitat', 'solarFarm', 'waterExtractor', 'greenhouse', 'researchModule'];
    } else {
      hex.buildings = ['landingHabitat', 'solarFarm', 'waterExtractor', 'greenhouse', 'researchModule'];
    }

    // Explore neighbors
    getHexNeighbors(hex.q, hex.r).forEach(n => {
      const nk = `${n.q},${n.r}`;
      if (map.hexes[nk]) map.hexes[nk].explored = true;
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
  };
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