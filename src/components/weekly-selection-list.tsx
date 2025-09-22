'use client';

import { useState } from 'react';
import type { ActivityEntry, WeeklySelectionType } from '../lib/types';
import { MAX_WEEKLY_SELECTION } from '../lib/constants';
import { Badge } from './ui/badge';
import { cn } from '../lib/cn';

export interface WeeklySelectionListProps {
  entries: ActivityEntry[];
  initialSelected: string[];
  type: WeeklySelectionType;
  onChange: (selected: string[], noteMap: Record<string, string>) => void;
  initialNotes?: Record<string, string>;
}

export function WeeklySelectionList({ entries, type, initialSelected, onChange, initialNotes = {} }: WeeklySelectionListProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes);

  function toggle(entryId: string) {
    const next = selected.includes(entryId)
      ? selected.filter((id) => id !== entryId)
      : [...selected, entryId].slice(-MAX_WEEKLY_SELECTION);
    setSelected(next);
    onChange(next, notes);
  }

  function updateNote(entryId: string, value: string) {
    const next = { ...notes, [entryId]: value };
    setNotes(next);
    onChange(selected, next);
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const isSelected = selected.includes(entry.id);
        return (
          <div
            key={entry.id}
            className={cn(
              'rounded-3xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700',
              isSelected ? (type === 'GREEN_BEST' ? 'border-green-400/60 bg-green-500/10' : 'border-red-400/60 bg-red-500/10') : undefined
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{entry.title}</h4>
                {entry.note ? <p className="mt-1 text-sm text-slate-300">{entry.note}</p> : null}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={entry.type === 'GREEN' ? 'positive' : 'negative'}>Energy {entry.energyScore}</Badge>
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(entry.id)}
                className={cn(
                  'h-10 w-10 rounded-full border text-sm font-semibold transition',
                  isSelected
                    ? type === 'GREEN_BEST'
                      ? 'border-green-300 bg-green-500/40 text-white'
                      : 'border-red-300 bg-red-500/40 text-white'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                )}
              >
                {isSelected ? selected.indexOf(entry.id) + 1 : '+'}
              </button>
            </div>
            {isSelected ? (
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-300">
                  {type === 'GREEN_BEST' ? 'こんな強みを使っているかも' : 'こんな弱みのせいかも'}
                </label>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200"
                  placeholder="自由記述"
                  value={notes[entry.id] ?? ''}
                  onChange={(event) => updateNote(entry.id, event.target.value)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
