import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LEGEND_ITEMS = [
  {
    icon: '❓',
    bgColor: '#111827',
    en: 'Unexplored Tile',
    ko: '미탐사 타일',
    desc: 'You cannot see what is here. Explore it first!',
    descKo: '아직 탐사하지 않은 타일입니다. 먼저 탐사하세요!',
    tag: null,
  },
  {
    icon: '🪨',
    bgColor: '#8B6914',
    en: 'Rocky Plain',
    ko: '암석 평원',
    desc: 'Basic terrain. Safe to build anything here.',
    descKo: '기본 지형입니다. 어떤 건물이든 지을 수 있어요.',
    tag: null,
  },
  {
    icon: '🕳️',
    bgColor: '#6B4423',
    en: 'Crater',
    ko: '충돌구',
    desc: 'Extra minerals here. Build a Mine for a bonus.',
    descKo: '광물이 더 많습니다. 광산을 지으면 보너스를 받아요.',
    tag: '💎 bonus',
  },
  {
    icon: '⛰️',
    bgColor: '#5C4033',
    en: 'Mountain',
    ko: '산악 지대',
    desc: 'Rich in minerals. Great place for a Mine.',
    descKo: '광물이 풍부합니다. 광산을 짓기 좋아요.',
    tag: '💎 bonus',
  },
  {
    icon: '🏜️',
    bgColor: '#7B3F00',
    en: 'Canyon',
    ko: '협곡',
    desc: 'Extra water flows here. Good for a Water Station.',
    descKo: '물이 더 많이 흐릅니다. 물 공급소에 좋아요.',
    tag: '💧 bonus',
  },
  {
    icon: '🧊',
    bgColor: '#A8C8D8',
    en: 'Ice Deposit',
    ko: '얼음 매장지',
    desc: 'Water Station built here produces much more water.',
    descKo: '여기에 물 공급소를 지으면 물을 훨씬 많이 얻어요.',
    tag: '💧 big bonus',
  },
  {
    icon: '💎',
    bgColor: '#B87333',
    en: 'Mineral Deposit',
    ko: '광물 매장지',
    desc: 'Mine built here produces lots of materials.',
    descKo: '여기에 광산을 지으면 자재를 많이 얻어요.',
    tag: '💎 big bonus',
  },
  {
    icon: '🌋',
    bgColor: '#2D1B0E',
    en: 'Lava Field',
    ko: '용암 지대',
    desc: 'Dangerous! Only a Mine can be built here.',
    descKo: '위험합니다! 광산만 지을 수 있어요.',
    tag: '⚠️ limited',
  },
  {
    icon: '🏖️',
    bgColor: '#C4A35A',
    en: 'Dust Zone',
    ko: '먼지 지대',
    desc: 'Extra energy from sunlight. Good for Power Stations.',
    descKo: '햇빛 에너지가 많습니다. 발전소에 좋아요.',
    tag: '⚡ bonus',
  },
  {
    icon: '☢️',
    bgColor: '#4A0E0E',
    en: 'Radiation Hazard',
    ko: '방사선 위험',
    desc: 'Dangerous! Only a Mine or Power Station can be built here.',
    descKo: '위험합니다! 광산과 발전소만 지을 수 있어요.',
    tag: '☢️ hazard',
  },
  {
    icon: '❄️',
    bgColor: '#D4E6F1',
    en: 'Polar Ice',
    ko: '극지방 얼음',
    desc: 'Huge water bonus. Best place for a Water Station.',
    descKo: '물이 매우 많습니다. 물 공급소를 짓는 최고의 장소예요.',
    tag: '💧 huge bonus',
  },
];

const TILE_STATE_ITEMS = [
  { color: 'border-white', fill: 'bg-transparent', en: 'Selected Tile', ko: '선택된 타일', desc: 'The hex you clicked.', descKo: '클릭한 타일입니다.' },
  { color: 'border-blue-400', fill: 'bg-blue-400/20', en: 'Valid: Explore', ko: '탐사 가능', desc: 'You can explore this tile.', descKo: '이 타일을 탐사할 수 있어요.' },
  { color: 'border-green-400', fill: 'bg-green-400/20', en: 'Valid: Claim', ko: '점령 가능', desc: 'You can claim this tile.', descKo: '이 타일을 점령할 수 있어요.' },
  { color: 'border-yellow-400', fill: 'bg-yellow-400/20', en: 'Valid: Build', ko: '건설 가능', desc: 'You can build on this tile.', descKo: '이 타일에 건물을 지을 수 있어요.' },
];

export default function JuniorMapLegend() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-2 right-2 z-20 w-56">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-900/95 border border-gray-600 rounded-lg text-xs font-heading font-semibold text-gray-200 hover:bg-gray-800 transition-colors shadow-lg"
      >
        <span>🗺️ {lang === 'ko' ? '지도 범례' : 'Map Legend'}</span>
        {open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 right-0 w-64 bg-gray-900/98 border border-gray-600 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {/* Tile States */}
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-heading mb-2">
                {lang === 'ko' ? '타일 상태' : 'Tile States'}
              </p>
              <div className="space-y-1">
                {TILE_STATE_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border-2 shrink-0 ${item.color} ${item.fill}`} />
                    <div>
                      <span className="text-white text-[11px] font-medium">{lang === 'ko' ? item.ko : item.en}</span>
                      <span className="text-gray-400 text-[10px] ml-1">{lang === 'ko' ? item.descKo : item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special symbols */}
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-heading mb-2">
                {lang === 'ko' ? '특수 기호' : 'Special Symbols'}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">★</span>
                  <span className="text-white text-[11px]">{lang === 'ko' ? '수도 식민지' : 'Capital Colony'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">◆</span>
                  <span className="text-white text-[11px]">{lang === 'ko' ? '일반 건물/정착지' : 'Settlement / Building'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-blue-500/20 border border-blue-500/50 rounded px-1 text-blue-300">ABC</span>
                  <span className="text-white text-[11px]">{lang === 'ko' ? '국가 약자' : 'Nation Abbreviation'}</span>
                </div>
              </div>
            </div>

            {/* Terrain */}
            <div className="px-3 pt-2 pb-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-heading mb-2">
                {lang === 'ko' ? '지형 종류' : 'Terrain Types'}
              </p>
              <div className="space-y-1.5">
                {LEGEND_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded shrink-0 flex items-center justify-center text-sm border border-gray-600"
                      style={{ backgroundColor: item.bgColor }}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-white text-[11px] font-medium leading-tight">
                          {lang === 'ko' ? item.ko : item.en}
                        </span>
                        {item.tag && (
                          <span className="text-[9px] bg-gray-700 rounded px-1 text-gray-300 shrink-0">{item.tag}</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-[10px] leading-tight">
                        {lang === 'ko' ? item.descKo : item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}