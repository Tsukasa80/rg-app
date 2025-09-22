'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import type { ActivityFilterState } from '../lib/types';
import { formatIsoDate } from '../lib/utils';

interface ActivityFilterStore {
  state: ActivityFilterState;
  setState: (update: Partial<ActivityFilterState>) => void;
  reset: () => void;
}

const initialState: ActivityFilterState = {
  range: '7d',
  from: formatIsoDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)),
  to: formatIsoDate(new Date()),
  types: [],
  tags: [],
  energyScores: [],
  search: ''
};

const useActivityFilterStore = create<ActivityFilterStore>((set) => ({
  state: initialState,
  setState: (update) => set((prev) => ({ state: { ...prev.state, ...update } })),
  reset: () => set({ state: initialState })
}));

export function useActivityFilters() {
  const state = useActivityFilterStore((store) => store.state);
  const setState = useActivityFilterStore((store) => store.setState);
  const reset = useActivityFilterStore((store) => store.reset);

  return useMemo(() => ({ state, setState, reset }), [state, setState, reset]);
}
