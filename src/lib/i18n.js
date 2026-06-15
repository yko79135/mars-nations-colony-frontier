import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    // Game title
    gameTitle: "Mars Nations: Colony Frontier",
    gameSubtitle: "Build your civilization on the Red Planet",
    
    // Navigation
    nav: {
      game: "Game", map: "Map", technology: "Technology", diplomacy: "Diplomacy",
      rankings: "Rankings", rules: "Rules", settings: "Settings", language: "Language"
    },
    
    // Setup
    setup: {
      title: "Game Setup",
      players: "Number of Players",
      mapSize: "Map Size",
      small: "Small", medium: "Medium", large: "Large",
      gameLength: "Game Length (Rounds)",
      preset: "Game Preset",
      presetShort: "Short Classroom Game",
      presetStandard: "Standard Game",
      presetLong: "Long Strategy Game",
      presetCoop: "Fully Cooperative Scenario",
      startGame: "Start Game",
      createNations: "Create Nations",
      educationalMode: "Educational Info Mode",
      tutorialMode: "Tutorial Mode",
      protectionPeriod: "Capital Protection (Rounds)",
      eventFrequency: "Event Frequency",
      low: "Low", normal: "Normal", high: "High",
      startingResources: "Starting Resources",
      scarce: "Scarce", standard: "Standard", abundant: "Abundant",
      back: "Back",
      next: "Next",
      setupOptions: "Setup Options",
      nationCreation: "Nation Creation",
    },
    
    // Nation creation
    nation: {
      countryName: "Country Name",
      abbreviation: "Abbreviation (3 letters)",
      playerName: "Player Name",
      countryColor: "Country Color",
      flagEmblem: "Flag / Emblem",
      colonyName: "Colony Name",
      description: "Country Description (optional)",
      create: "Create Nation",
      edit: "Edit",
      remove: "Remove",
      ready: "Ready",
      duplicate: "already taken",
      required: "Required field",
    },
    
    // Resources
    resources: {
      energy: "Energy", water: "Water", food: "Food", minerals: "Minerals",
      science: "Science", credits: "Credits", population: "Population",
      morale: "Morale", oxygen: "Oxygen"
    },
    
    // Terrain
    terrain: {
      rockyPlain: "Rocky Plain", crater: "Crater", mountain: "Mountain",
      canyon: "Canyon", iceDeposit: "Ice Deposit", mineralDeposit: "Mineral Deposit",
      lavaField: "Lava Field", dustBasin: "Dust Basin", highRadiation: "High-Radiation Zone",
      unexplored: "Unexplored", polarIce: "Polar Ice"
    },
    
    // Buildings
    buildings: {
      landingHabitat: "Landing Habitat", advancedHabitat: "Advanced Habitat",
      solarFarm: "Solar Farm", nuclearReactor: "Nuclear Reactor",
      waterExtractor: "Water Extractor", greenhouse: "Greenhouse",
      algaeFarm: "Algae Farm", mine: "Mine", factory: "Factory",
      researchLab: "Research Laboratory", medicalCenter: "Medical Center",
      recreationCenter: "Recreation Center", commsCenter: "Communications Center",
      tradeHub: "Trade Hub", roverStation: "Rover Station",
      spaceport: "Spaceport", radiationShelter: "Radiation Shelter"
    },
    
    // Actions
    actions: {
      explore: "Explore", claim: "Claim Territory", build: "Build",
      upgrade: "Upgrade", research: "Research", moveRover: "Move Rover",
      newSettlement: "New Settlement", trade: "Trade", alliance: "Alliance",
      shareTech: "Share Technology", repair: "Repair", assist: "Assist Colony",
      jointProject: "Joint Project", endTurn: "End Turn", undo: "Undo",
      actionPoints: "Action Points", cancel: "Cancel", confirm: "Confirm",
      selectAction: "Select an action", cost: "Cost",
    },
    
    // Turn phases
    phases: {
      resourceProduction: "Resource Production",
      eventResolution: "Event Resolution",
      playerActions: "Player Actions",
      colonyMaintenance: "Colony Maintenance",
      endTurn: "End Turn"
    },
    
    // Tech tree
    tech: {
      survival: "Survival", energy: "Energy", agriculture: "Agriculture",
      industry: "Industry", transportation: "Transportation",
      society: "Society", planetaryScience: "Planetary Science",
      improvedLifeSupport: "Improved Life Support",
      waterRecycling: "Water Recycling",
      radiationProtection: "Radiation Protection",
      medicalSystems: "Medical Systems",
      closedLoopHabitats: "Closed-Loop Habitats",
      advancedSolar: "Advanced Solar Power",
      energyStorage: "Energy Storage",
      smallNuclear: "Small Nuclear Reactors",
      fusionResearch: "Fusion Research",
      soilTreatment: "Martian Soil Treatment",
      hydroponics: "Hydroponics",
      adaptedCrops: "Genetically Adapted Crops",
      autoFood: "Automated Food Production",
      advancedMining: "Advanced Mining",
      manufacturing: "Martian Manufacturing",
      robotics: "Robotics",
      printedHabitats: "3D-Printed Habitats",
      longRangeRovers: "Long-Range Rovers",
      pressurizedRoads: "Pressurized Roads",
      railways: "Martian Railways",
      orbitalTransport: "Orbital Transport",
      education: "Education Systems",
      publicHealth: "Public Health",
      democracy: "Democratic Institutions",
      recreation: "Recreation and Culture",
      governance: "Advanced Colony Governance",
      geologicalSurveys: "Geological Surveys",
      climateResearch: "Climate Research",
      undergroundExploration: "Underground Exploration",
      terraforming: "Terraforming Research",
      researched: "Researched",
      available: "Available",
      locked: "Locked",
      researchBtn: "Research",
    },
    
    // Events
    events: {
      dustStorm: "Dust Storm",
      dustStormDesc: "A massive dust storm sweeps across the region, reducing solar energy production.",
      solarStorm: "Solar Radiation Storm",
      solarStormDesc: "A solar radiation storm hits Mars. Unprotected colonies take damage.",
      equipmentFailure: "Equipment Failure",
      equipmentFailureDesc: "Critical equipment has malfunctioned. Repair costs required.",
      waterContamination: "Water Contamination",
      waterContaminationDesc: "Water supply contaminated. Water production halved this turn.",
      cropDisease: "Crop Disease",
      cropDiseaseDesc: "A disease affects greenhouse crops. Food production reduced.",
      medicalEmergency: "Medical Emergency",
      medicalEmergencyDesc: "A medical crisis hits. Morale and population at risk.",
      meteorStrike: "Meteor Strike",
      meteorStrikeDesc: "A small meteor impacts near a colony. Infrastructure damaged.",
      supplyDelay: "Supply Delay from Earth",
      supplyDelayDesc: "Expected supply ship delayed. No bonus resources this turn.",
      earthFunding: "Earth Funding Increase",
      earthFundingDesc: "Earth increases Mars funding! Receive bonus credits.",
      iceDiscovery: "New Ice Deposit Found",
      iceDiscoveryDesc: "Surveyors discover a new underground ice deposit nearby.",
      scienceDiscovery: "Major Scientific Discovery",
      scienceDiscoveryDesc: "Researchers make a breakthrough! Bonus science points awarded.",
      colonistProtest: "Colonist Protest",
      colonistProtestDesc: "Colonists protest living conditions. Morale drops sharply.",
      populationBoom: "Population Boom",
      populationBoomDesc: "Birth rate increases and new arrivals from Earth boost population.",
      dispute: "International Dispute",
      disputeDesc: "A territorial dispute arises between neighboring nations.",
      commsFailure: "Communications Failure",
      commsFailureDesc: "Communication systems offline. Cannot trade this turn.",
      dismiss: "Dismiss",
    },
    
    // Scoring
    scoring: {
      territory: "Territory", science: "Science", populationScore: "Population",
      livingConditions: "Living Conditions", economic: "Economic",
      cooperation: "Cooperation", sustainability: "Sustainability",
      achievement: "Achievement", total: "Total Score",
    },
    
    // Victory
    victory: {
      scientific: "Scientific Victory",
      selfSufficiency: "Self-Sufficiency Victory",
      populationV: "Population Victory",
      economic: "Economic Victory",
      cooperation: "Cooperation Victory",
      terraforming: "Terraforming Victory",
      overall: "Overall Mars Leadership Victory",
      gameOver: "Game Over",
      rankings: "Final Rankings",
      awards: "Special Awards",
      bestLiving: "Best Living Conditions",
      greatestScience: "Greatest Scientific Contribution",
      mostSustainable: "Most Sustainable Colony",
      strongestEconomy: "Strongest Economy",
      bestPartner: "Best International Partner",
      largestTerritory: "Largest Territory",
      mostResilient: "Most Resilient Colony",
      newGame: "New Game",
      continuePlay: "Continue Playing",
    },
    
    // Living conditions
    living: {
      housing: "Housing", foodSecurity: "Food Security", waterSecurity: "Water Security",
      oxygenSupply: "Oxygen Supply", health: "Health", safety: "Safety",
      educationL: "Education", recreationL: "Recreation",
      politicalStability: "Political Stability", moraleL: "Morale",
      score: "Living Conditions Score",
    },
    
    // Diplomacy
    diplomacy: {
      proposeTrade: "Propose Trade", resourceAgreement: "Resource Agreement",
      formAlliance: "Form Alliance", nonAggression: "Non-Aggression Pact",
      shareTech: "Share Technology", requestHelp: "Request Emergency Help",
      offerHelp: "Offer Emergency Help", jointResearch: "Joint Research",
      intlBuilding: "International Building", endAgreement: "End Agreement",
      agreements: "Active Agreements", noAgreements: "No active agreements",
      pending: "Pending", active: "Active",
    },
    
    // Save/Load
    save: {
      saveGame: "Save Game", loadGame: "Load Game", newGame: "New Game",
      exportSummary: "Export Summary", resetGame: "Reset Game",
      savedGames: "Saved Games", noSaves: "No saved games found",
      saveName: "Save Name", saveSuccess: "Game saved!",
      loadSuccess: "Game loaded!", confirmReset: "Are you sure? All progress will be lost.",
      delete: "Delete", load: "Load", save: "Save",
    },
    
    // General
    general: {
      round: "Round", turn: "Turn", player: "Player", of: "of",
      currentPlayer: "Current Player", capital: "Capital",
      yes: "Yes", no: "No", ok: "OK", close: "Close",
      hexInfo: "Hex Information", coordinates: "Coordinates",
      owner: "Owner", unclaimed: "Unclaimed", noBuildings: "No buildings",
      hazards: "Hazards", deposits: "Deposits", none: "None",
      availableActions: "Available Actions", protection: "Protected",
      protectionDesc: "Capital protected for first {n} rounds",
      selectHex: "Select a hex on the map",
    },
    
    // Hex info panel
    hexPanel: {
      terrainType: "Terrain Type",
      resourceDeposits: "Resource Deposits",
      constructionDifficulty: "Construction Difficulty",
      radiationRisk: "Radiation Risk",
      buildings: "Buildings",
      settlement: "Settlement",
      low: "Low", medium: "Medium", high: "High", extreme: "Extreme",
    },
    
    // Educational
    edu: {
      learnMore: "Learn More",
      waterRecyclingInfo: "On Mars, every drop of water must be recycled. NASA's ISS already recycles about 90% of water, including from humidity and even urine. Mars colonies would need even higher efficiency since resupply from Earth takes 6-9 months.",
      radiationInfo: "Mars has no global magnetic field and a very thin atmosphere, exposing the surface to cosmic rays and solar radiation. Colonists would need shielding — underground habitats, regolith covers, or water-filled walls can block harmful radiation.",
      closedLoopInfo: "A closed-loop ecosystem recycles all waste into usable resources — CO2 becomes oxygen via plants, waste becomes fertilizer, water is purified and reused. Earth's biosphere does this naturally; on Mars, we must engineer it.",
      cooperationInfo: "International cooperation is essential for large space projects. The ISS involves 15 nations working together. Mars colonization would likely require even greater cooperation to share costs, technology, and resources.",
      scarcityInfo: "When resources are scarce, political tensions rise. On Mars, nations would need to negotiate over water rights, mineral deposits, and energy sources — just as countries on Earth compete over oil, water, and rare minerals.",
    },
  },
  ko: {
    gameTitle: "화성 국가: 식민지 개척",
    gameSubtitle: "붉은 행성에 문명을 건설하세요",
    
    nav: {
      game: "게임", map: "지도", technology: "기술", diplomacy: "외교",
      rankings: "순위", rules: "규칙", settings: "설정", language: "언어"
    },
    
    setup: {
      title: "게임 설정",
      players: "플레이어 수",
      mapSize: "맵 크기",
      small: "소형", medium: "중형", large: "대형",
      gameLength: "게임 길이 (라운드)",
      preset: "게임 프리셋",
      presetShort: "짧은 수업용 게임",
      presetStandard: "기본 게임",
      presetLong: "장기 전략 게임",
      presetCoop: "완전 협동 시나리오",
      startGame: "게임 시작",
      createNations: "국가 만들기",
      educationalMode: "교육 정보 모드",
      tutorialMode: "튜토리얼 모드",
      protectionPeriod: "수도 보호 기간 (라운드)",
      eventFrequency: "이벤트 빈도",
      low: "낮음", normal: "보통", high: "높음",
      startingResources: "시작 자원",
      scarce: "부족", standard: "표준", abundant: "풍부",
      back: "뒤로",
      next: "다음",
      setupOptions: "설정 옵션",
      nationCreation: "국가 생성",
    },
    
    nation: {
      countryName: "국가 이름",
      abbreviation: "국가 약칭 (3자)",
      playerName: "플레이어 이름",
      countryColor: "국가 색상",
      flagEmblem: "국기 또는 상징",
      colonyName: "식민지 이름",
      description: "국가 소개 (선택)",
      create: "국가 만들기",
      edit: "편집",
      remove: "삭제",
      ready: "준비 완료",
      duplicate: "이미 사용 중",
      required: "필수 항목",
    },
    
    resources: {
      energy: "에너지", water: "물", food: "식량", minerals: "광물",
      science: "과학", credits: "자금", population: "인구",
      morale: "사기", oxygen: "산소"
    },
    
    terrain: {
      rockyPlain: "암석 평원", crater: "충돌구", mountain: "산악 지대",
      canyon: "협곡", iceDeposit: "얼음 매장지", mineralDeposit: "광물 매장지",
      lavaField: "용암 지대", dustBasin: "먼지 분지", highRadiation: "고방사선 지대",
      unexplored: "미탐사", polarIce: "극지 얼음"
    },
    
    buildings: {
      landingHabitat: "착륙 거주지", advancedHabitat: "고급 거주지",
      solarFarm: "태양광 발전소", nuclearReactor: "원자로",
      waterExtractor: "물 추출 시설", greenhouse: "온실",
      algaeFarm: "조류 농장", mine: "광산", factory: "공장",
      researchLab: "연구소", medicalCenter: "의료 센터",
      recreationCenter: "여가 시설", commsCenter: "통신 센터",
      tradeHub: "무역 중심지", roverStation: "탐사차 기지",
      spaceport: "우주항", radiationShelter: "방사선 대피소"
    },
    
    actions: {
      explore: "탐사", claim: "영토 주장", build: "건설",
      upgrade: "업그레이드", research: "연구", moveRover: "탐사차 이동",
      newSettlement: "새 정착지", trade: "무역", alliance: "동맹",
      shareTech: "기술 공유", repair: "수리", assist: "식민지 지원",
      jointProject: "공동 프로젝트", endTurn: "턴 종료", undo: "되돌리기",
      actionPoints: "행동력", cancel: "취소", confirm: "확인",
      selectAction: "행동을 선택하세요", cost: "비용",
    },
    
    phases: {
      resourceProduction: "자원 생산",
      eventResolution: "사건 해결",
      playerActions: "플레이어 행동",
      colonyMaintenance: "식민지 유지",
      endTurn: "턴 종료"
    },
    
    tech: {
      survival: "생존", energy: "에너지", agriculture: "농업",
      industry: "산업", transportation: "교통",
      society: "사회", planetaryScience: "행성과학",
      improvedLifeSupport: "개선된 생명 유지 장치",
      waterRecycling: "물 재활용",
      radiationProtection: "방사선 보호",
      medicalSystems: "의료 시스템",
      closedLoopHabitats: "폐쇄형 거주지",
      advancedSolar: "고급 태양광 발전",
      energyStorage: "에너지 저장",
      smallNuclear: "소형 원자로",
      fusionResearch: "핵융합 연구",
      soilTreatment: "화성 토양 처리",
      hydroponics: "수경 재배",
      adaptedCrops: "유전자 적응 작물",
      autoFood: "자동화 식량 생산",
      advancedMining: "고급 채굴",
      manufacturing: "화성 제조업",
      robotics: "로봇 공학",
      printedHabitats: "3D 프린팅 거주지",
      longRangeRovers: "장거리 탐사차",
      pressurizedRoads: "가압 도로",
      railways: "화성 철도",
      orbitalTransport: "궤도 수송",
      education: "교육 시스템",
      publicHealth: "공중 보건",
      democracy: "민주적 제도",
      recreation: "여가와 문화",
      governance: "고급 식민지 거버넌스",
      geologicalSurveys: "지질 조사",
      climateResearch: "기후 연구",
      undergroundExploration: "지하 탐사",
      terraforming: "테라포밍 연구",
      researched: "연구 완료",
      available: "연구 가능",
      locked: "잠김",
      researchBtn: "연구하기",
    },
    
    events: {
      dustStorm: "먼지 폭풍",
      dustStormDesc: "거대한 먼지 폭풍이 지역을 휩쓸어 태양 에너지 생산이 감소합니다.",
      solarStorm: "태양 방사선 폭풍",
      solarStormDesc: "태양 방사선 폭풍이 화성을 강타합니다. 보호되지 않은 식민지가 피해를 입습니다.",
      equipmentFailure: "장비 고장",
      equipmentFailureDesc: "핵심 장비가 고장났습니다. 수리 비용이 필요합니다.",
      waterContamination: "물 오염",
      waterContaminationDesc: "수자원이 오염되었습니다. 이번 턴 물 생산이 절반으로 줄어듭니다.",
      cropDisease: "작물 질병",
      cropDiseaseDesc: "온실 작물에 질병이 발생했습니다. 식량 생산이 감소합니다.",
      medicalEmergency: "의료 비상",
      medicalEmergencyDesc: "의료 위기가 발생했습니다. 사기와 인구가 위험합니다.",
      meteorStrike: "운석 충돌",
      meteorStrikeDesc: "소형 운석이 식민지 근처에 충돌했습니다. 기반시설이 손상되었습니다.",
      supplyDelay: "지구 보급 지연",
      supplyDelayDesc: "예정된 보급선이 지연되었습니다. 이번 턴 보너스 자원이 없습니다.",
      earthFunding: "지구 자금 증가",
      earthFundingDesc: "지구가 화성 자금을 늘렸습니다! 보너스 자금을 받습니다.",
      iceDiscovery: "새 얼음 매장지 발견",
      iceDiscoveryDesc: "탐사팀이 새로운 지하 얼음 매장지를 발견했습니다.",
      scienceDiscovery: "주요 과학적 발견",
      scienceDiscoveryDesc: "연구진이 획기적인 발견을 했습니다! 보너스 과학 점수를 받습니다.",
      colonistProtest: "식민지 시위",
      colonistProtestDesc: "식민지 주민들이 생활 환경에 항의합니다. 사기가 급격히 떨어집니다.",
      populationBoom: "인구 급증",
      populationBoomDesc: "출생률 증가와 지구에서의 새 도착으로 인구가 늘어납니다.",
      dispute: "국제 분쟁",
      disputeDesc: "이웃 국가 간 영토 분쟁이 발생했습니다.",
      commsFailure: "통신 장애",
      commsFailureDesc: "통신 시스템이 오프라인입니다. 이번 턴 무역이 불가합니다.",
      dismiss: "확인",
    },
    
    scoring: {
      territory: "영토", science: "과학", populationScore: "인구",
      livingConditions: "생활 환경", economic: "경제",
      cooperation: "협력", sustainability: "지속가능성",
      achievement: "업적", total: "총점",
    },
    
    victory: {
      scientific: "과학적 승리",
      selfSufficiency: "자급자족 승리",
      populationV: "인구 승리",
      economic: "경제 승리",
      cooperation: "협력 승리",
      terraforming: "테라포밍 승리",
      overall: "화성 전체 지도자 승리",
      gameOver: "게임 종료",
      rankings: "최종 순위",
      awards: "특별 수상",
      bestLiving: "최고의 생활 환경",
      greatestScience: "최고의 과학 공헌",
      mostSustainable: "가장 지속 가능한 식민지",
      strongestEconomy: "최강의 경제",
      bestPartner: "최고의 국제 협력국",
      largestTerritory: "가장 넓은 영토",
      mostResilient: "가장 회복력 있는 식민지",
      newGame: "새 게임",
      continuePlay: "계속 플레이",
    },
    
    living: {
      housing: "주거", foodSecurity: "식량 안정성", waterSecurity: "물 안정성",
      oxygenSupply: "산소 공급", health: "건강", safety: "안전",
      educationL: "교육", recreationL: "여가",
      politicalStability: "정치적 안정", moraleL: "사기",
      score: "생활 환경 점수",
    },
    
    diplomacy: {
      proposeTrade: "무역 제안", resourceAgreement: "자원 협정",
      formAlliance: "동맹 결성", nonAggression: "불가침 조약",
      shareTech: "기술 공유", requestHelp: "긴급 지원 요청",
      offerHelp: "긴급 지원 제공", jointResearch: "공동 연구",
      intlBuilding: "국제 건물", endAgreement: "협정 종료",
      agreements: "활성 협정", noAgreements: "활성 협정 없음",
      pending: "대기중", active: "활성",
    },
    
    save: {
      saveGame: "게임 저장", loadGame: "게임 불러오기", newGame: "새 게임",
      exportSummary: "요약 내보내기", resetGame: "게임 초기화",
      savedGames: "저장된 게임", noSaves: "저장된 게임이 없습니다",
      saveName: "저장 이름", saveSuccess: "게임이 저장되었습니다!",
      loadSuccess: "게임을 불러왔습니다!", confirmReset: "정말로 초기화하시겠습니까? 모든 진행 상황이 사라집니다.",
      delete: "삭제", load: "불러오기", save: "저장",
    },
    
    general: {
      round: "라운드", turn: "턴", player: "플레이어", of: "/",
      currentPlayer: "현재 플레이어", capital: "수도",
      yes: "예", no: "아니오", ok: "확인", close: "닫기",
      hexInfo: "헥스 정보", coordinates: "좌표",
      owner: "소유자", unclaimed: "미점령", noBuildings: "건물 없음",
      hazards: "위험 요소", deposits: "자원 매장지", none: "없음",
      availableActions: "가능한 행동", protection: "보호",
      protectionDesc: "수도는 처음 {n}라운드 동안 보호됩니다",
      selectHex: "지도에서 헥스를 선택하세요",
    },
    
    hexPanel: {
      terrainType: "지형 유형",
      resourceDeposits: "자원 매장지",
      constructionDifficulty: "건설 난이도",
      radiationRisk: "방사선 위험",
      buildings: "건물",
      settlement: "정착지",
      low: "낮음", medium: "보통", high: "높음", extreme: "극심",
    },
    
    edu: {
      learnMore: "더 알아보기",
      waterRecyclingInfo: "화성에서는 모든 물방울을 재활용해야 합니다. NASA의 국제우주정거장(ISS)은 이미 습기와 소변을 포함하여 약 90%의 물을 재활용합니다. 화성 식민지는 지구로부터의 재보급에 6~9개월이 걸리므로 더 높은 효율이 필요합니다.",
      radiationInfo: "화성에는 전지구적 자기장이 없고 대기가 매우 얇아 표면이 우주선과 태양 방사선에 노출됩니다. 식민지 주민들은 차폐가 필요합니다 — 지하 거주지, 레골리스 덮개, 물로 채운 벽 등이 유해한 방사선을 차단할 수 있습니다.",
      closedLoopInfo: "폐쇄형 생태계는 모든 폐기물을 사용 가능한 자원으로 재활용합니다 — 식물을 통해 CO2가 산소로, 폐기물이 비료로, 물이 정화되어 재사용됩니다. 지구의 생물권이 이를 자연적으로 수행하지만, 화성에서는 엔지니어링해야 합니다.",
      cooperationInfo: "국제 협력은 대규모 우주 프로젝트에 필수적입니다. ISS는 15개국이 협력합니다. 화성 식민지화는 비용, 기술, 자원을 공유하기 위해 더 큰 협력이 필요할 것입니다.",
      scarcityInfo: "자원이 부족하면 정치적 긴장이 고조됩니다. 화성에서 국가들은 수권, 광물 매장지, 에너지원을 놓고 협상해야 할 것입니다 — 지구에서 석유, 물, 희소 광물을 놓고 경쟁하는 것처럼.",
    },
  }
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}