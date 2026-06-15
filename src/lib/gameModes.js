// ============ GAME MODE CONFIGURATIONS (Junior + Senior only) ============

export const GRADE_MODES = {
  junior: {
    key: 'junior',
    label: 'Junior Mode',
    labelKo: '초급 모드',
    grades: 'Grades 4–6',
    gradesKo: '4–6학년',
    resources: ['energy', 'water', 'food', 'minerals'],
    gameLength: 8,
    actionPointsPerTurn: 3,
    startingResources: 'abundant',
    mapSize: 'small',
    eventFrequency: 'low',
    protectionPeriod: 4,
    description: 'Simple one-screen game — great for classrooms',
    descriptionKo: '간단한 한 화면 게임 — 교실에 적합',
  },
  senior: {
    key: 'senior',
    label: 'Senior Mode',
    labelKo: '고급 모드',
    grades: 'Grades 7–12',
    gradesKo: '7–12학년',
    resources: ['energy', 'water', 'food', 'minerals', 'science'],
    gameLength: 20,
    actionPointsPerTurn: 3,
    startingResources: 'standard',
    mapSize: 'medium',
    eventFrequency: 'normal',
    protectionPeriod: 3,
    description: 'Full strategy — technology, diplomacy, and sustainability',
    descriptionKo: '완전한 전략 — 기술, 외교, 지속가능성',
  },
};

// Which resources are active for a given mode
export function getActiveResources(gradeMode) {
  return GRADE_MODES[gradeMode]?.resources || GRADE_MODES.senior.resources;
}

// ============ JUNIOR TECH TREE ============
export const JUNIOR_TECHS = {
  betterSolar: {
    id: 'betterSolar',
    cost: { science: 2 },
    prerequisites: [],
    labRequired: null,
    effect: { building: 'solarFarm', resourceBonus: { energy: 2 } },
    effectDesc: 'Power Stations produce +2 Energy per turn.',
    effectDescKo: '발전소가 턴당 에너지를 +2 더 생산합니다.',
  },
  waterRecycling: {
    id: 'waterRecycling',
    cost: { science: 2 },
    prerequisites: [],
    labRequired: null,
    effect: { building: 'waterExtractor', resourceBonus: { water: 2 } },
    effectDesc: 'Water Stations produce +2 Water per turn.',
    effectDescKo: '물 공급소가 턴당 물을 +2 더 생산합니다.',
  },
  betterGreenhouses: {
    id: 'betterGreenhouses',
    cost: { science: 2 },
    prerequisites: [],
    labRequired: null,
    effect: { building: 'greenhouse', resourceBonus: { food: 2 } },
    effectDesc: 'Farms produce +2 Food per turn.',
    effectDescKo: '농장이 턴당 식량을 +2 더 생산합니다.',
  },
  improvedMining: {
    id: 'improvedMining',
    cost: { science: 3 },
    prerequisites: [],
    labRequired: null,
    effect: { building: 'mine', resourceBonus: { minerals: 2 } },
    effectDesc: 'Mines produce +2 Materials per turn.',
    effectDescKo: '광산이 턴당 자재를 +2 더 생산합니다.',
  },
  saferHabitats: {
    id: 'saferHabitats',
    cost: { science: 3 },
    prerequisites: [],
    labRequired: null,
    effect: { eventProtection: true },
    effectDesc: 'Habitats resist negative events this game.',
    effectDescKo: '거주지가 이번 게임에서 부정적 이벤트에 저항합니다.',
  },
  longRangeRover: {
    id: 'longRangeRover',
    cost: { science: 4 },
    prerequisites: [],
    labRequired: null,
    effect: { exploreRange: 2 },
    effectDesc: 'Explore 2 hexes away instead of just adjacent.',
    effectDescKo: '인접 칸만이 아닌 2칸 거리까지 탐사할 수 있습니다.',
  },
};

// Action definition: whether an action requires selecting a hex on the map
export const ACTION_DEFS = {
  explore:   { requiresHexTarget: true },
  claim:     { requiresHexTarget: true },
  build:     { requiresHexTarget: true },
  repair:    { requiresHexTarget: true },
  research:  { requiresHexTarget: false },
  diplomacy: { requiresHexTarget: false },
  help:      { requiresHexTarget: false },
  endTurn:   { requiresHexTarget: false },
};