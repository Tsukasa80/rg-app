'use client';

import type { ActivityType } from '../lib/types';
import { cn } from '../lib/cn';

export interface ActivityTypeToggleProps {
  value: ActivityType;
  onChange: (value: ActivityType) => void;
}

export function ActivityTypeToggle({ value, onChange }: ActivityTypeToggleProps) {
  const options: { value: ActivityType; label: string; description: string }[] = [
    { value: 'GREEN', label: 'Green', description: '活力を与える' },
    { value: 'RED', label: 'Red', description: 'エネルギーを消耗する' }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-3xl border p-4 text-left transition',
            option.value === 'GREEN'
              ? value === 'GREEN'
                ? 'border-green-400 bg-green-500/15 text-green-100'
                : 'border-slate-800 bg-slate-900/60 text-slate-100 hover:border-green-400/50'
              : value === 'RED'
              ? 'border-red-400 bg-red-500/15 text-red-100'
              : 'border-slate-800 bg-slate-900/60 text-slate-100 hover:border-red-400/50'
          )}
        >
          <div className="text-lg font-semibold">{option.label}</div>
          <div className="text-xs text-slate-400">{option.description}</div>
        </button>
      ))}
    </div>
  );
}
