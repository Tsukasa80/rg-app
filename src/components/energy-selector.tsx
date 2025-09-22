'use client';

import { ENERGY_SCALE } from '@/lib/constants';
import type { EnergyScore } from '@/lib/types';
import { cn } from '@/lib/cn';

export interface EnergySelectorProps {
  value: EnergyScore;
  onChange: (value: EnergyScore) => void;
}

export function EnergySelector({ value, onChange }: EnergySelectorProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-2">
      {ENERGY_SCALE.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'flex h-12 w-12 flex-col items-center justify-center rounded-2xl border text-sm transition',
            value === item.value
              ? 'border-green-400 bg-green-500/20 text-green-100'
              : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
          )}
          aria-label={`${item.symbol} ${item.description}`}
        >
          <span className="text-base font-semibold">{item.symbol}</span>
          <span className="text-[11px] text-slate-400">{item.value}</span>
        </button>
      ))}
    </div>
  );
}

