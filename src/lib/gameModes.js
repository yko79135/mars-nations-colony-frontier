// ============ GRADE MODE CONFIGURATIONS ============

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
    description: 'Simple and guided — great for classrooms',
    descriptionKo: '간단하고 안내된 — 교실에 적합',
  },
  standard: {
    key: 'standard',
    label: 'Standard Mode',
    labelKo: '기본 모드',
    grades: 'Grades 7–9',
    gradesKo: '7–9학년',
    resources: ['energy', 'water', 'food', 'minerals', 'science'],
    gameLength: 12,
    actionPointsPerTurn: 3,
    startingResources: 'standard',
    mapSize: 'medium',
    eventFrequency: 'normal',
    protectionPeriod: 3,
    description: 'Trade, territory, and technology',
    descriptionKo: '무역, 영토, 기술',
  },
  advanced: {
    key: 'advanced',
    label: 'Advanced Mode',
    labelKo: '고급 모드',
    grades: 'Grades 10–12',
    gradesKo: '10–12학년',
    resources: ['energy', 'water', 'food', 'minerals', 'science', 'credits', 'oxygen', 'population', 'morale'],
    gameLength: 20,
    actionPointsPerTurn: 3,
    startingResources: 'standard',
    mapSize: 'large',
    eventFrequency: 'normal',
    protectionPeriod: 3,
    description: 'Full complexity — economics, diplomacy, and sustainability',
    descriptionKo: '완전한 복잡성 — 경제, 외교, 지속가능성',
  },
};

export const CLASSROOM_PRESETS = [
  { key: 'juniorClass', labelEn: 'Junior Classroom', labelKo: '초급 수업', mode: 'junior', gameLength: 8, eventFrequency: 'low', mapSize: 'small' },
  { key: 'standardClass', labelEn: 'Standard Classroom', labelKo: '기본 수업', mode: 'standard', gameLength: 12, eventFrequency: 'normal', mapSize: 'medium' },
  { key: 'advancedClass', labelEn: 'Advanced Classroom', labelKo: '고급 수업', mode: 'advanced', gameLength: 20, eventFrequency: 'normal', mapSize: 'large' },
  { key: 'cooperative', labelEn: 'Cooperative Mission', labelKo: '협동 임무', mode: 'junior', gameLength: 10, eventFrequency: 'high', mapSize: 'small' },
  { key: 'competitive', labelEn: 'Competitive Nations', labelKo: '경쟁 국가들', mode: 'standard', gameLength: 15, eventFrequency: 'normal', mapSize: 'medium' },
  { key: 'crisis', labelEn: 'Survival Crisis', labelKo: '생존 위기', mode: 'advanced', gameLength: 12, eventFrequency: 'high', startingResources: 'scarce', mapSize: 'medium' },
];

// Which resources are active for a given mode
export function getActiveResources(gradeMode) {
  return GRADE_MODES[gradeMode]?.resources || GRADE_MODES.standard.resources;
}