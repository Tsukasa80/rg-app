import type { EnergyScore } from './types';

export const ENERGY_SCALE: Array<{ value: EnergyScore; label: string; symbol: string; description: string }> = [
  { value: 2, label: '++', symbol: '++', description: '多くの肯定的エネルギー' },
  { value: 1, label: '+', symbol: '+', description: 'やや肯定的' },
  { value: 0, label: '0', symbol: '0', description: 'どちらでもない' },
  { value: -1, label: '-', symbol: '-', description: 'やや消耗' },
  { value: -2, label: '--', symbol: '--', description: '大きく消耗' }
];

export const TAG_SUGGESTIONS = ['仕事', '家事', '運動', '学習', '創作', '人間関係', '休息'];

export const MAX_WEEKLY_SELECTION = 5;
