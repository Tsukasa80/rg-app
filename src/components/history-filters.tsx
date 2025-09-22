"use client";

import { useEffect } from 'react';
import { useActivityFilters } from '../hooks/use-activity-filters';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { ActivityType } from '../lib/types';

const typeOptions: Array<{ value: ActivityType; label: string }> = [
  { value: 'GREEN', label: 'Green' },
  { value: 'RED', label: 'Red' }
];

export interface HistoryFiltersProps {
  onChange: () => void;
}

export function HistoryFilters({ onChange }: HistoryFiltersProps) {
  const { state, setState, reset } = useActivityFilters();

  useEffect(() => {
    onChange();
  }, [state, onChange]);

  function toggleType(value: ActivityType) {
    const active = state.types.includes(value);
    setState({
      types: active ? state.types.filter((type) => type !== value) : [...state.types, value]
    });
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">期間（開始）</label>
          <Input
            type="date"
            value={state.from}
            onChange={(event) => setState({ from: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">期間（終了）</label>
          <Input
            type="date"
            value={state.to}
            onChange={(event) => setState({ to: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">タイプ</label>
          <div className="flex gap-2">
            {typeOptions.map((option) => {
              const active = state.types.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleType(option.value)}
                  className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition ${
                    active ? 'border-green-400 bg-green-500/20 text-green-100' : 'border-slate-700 text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">キーワード</label>
          <Input value={state.search} onChange={(event) => setState({ search: event.target.value })} placeholder="タイトル/メモ" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => reset()}>
          リセット
        </Button>
      </div>
    </div>
  );
}
