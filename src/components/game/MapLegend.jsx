import React, { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { TERRAIN_TYPES } from '@/lib/gameData';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function MapLegend() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-3 right-3 z-10">
      <div className="bg-gray-900/90 border border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white w-full"
        >
          <span className="font-heading">Legend</span>
          {open ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
        {open && (
          <div className="px-3 pb-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(TERRAIN_TYPES).map(([key, data]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="text-sm">{data.icon}</span>
                <span className="text-[10px] text-gray-400">{t.terrain[key] || key}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 col-span-2 border-t border-gray-700 pt-1 mt-1">
              <span className="text-sm">★</span>
              <span className="text-[10px] text-gray-400">{t.general.capital}</span>
              <span className="text-sm ml-2">◆</span>
              <span className="text-[10px] text-gray-400">Settlement</span>
              <span className="text-sm ml-2">❓</span>
              <span className="text-[10px] text-gray-400">{t.terrain.unexplored}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}