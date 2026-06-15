import React from 'react';
import { useLang } from '@/lib/i18n';
import { GRADE_MODES } from '@/lib/gameModes';

export default function ModeSelector({ value, onChange }) {
  const { lang } = useLang();
  return (
    <div className="space-y-2">
      {Object.values(GRADE_MODES).map(mode => {
        const selected = value === mode.key;
        return (
          <button key={mode.key} onClick={() => onChange(mode.key)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${selected ? 'bg-orange-600/20 border-orange-500 text-white' : 'bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-700/60 hover:border-gray-500'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading font-semibold text-sm">{lang === 'ko' ? mode.labelKo : mode.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lang === 'ko' ? mode.gradesKo : mode.grades}</p>
                <p className="text-xs text-gray-500 mt-1">{lang === 'ko' ? mode.descriptionKo : mode.description}</p>
              </div>
              <div className={`shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 ${selected ? 'bg-orange-500 border-orange-400' : 'border-gray-600'}`} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {mode.resources.map(r => <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-400">{r}</span>)}
            </div>
          </button>
        );
      })}
    </div>
  );
}