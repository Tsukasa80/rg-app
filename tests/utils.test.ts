import { describe, expect, it } from 'vitest';
import { formatDuration, calcMedian } from '@/lib/utils';

describe('utils', () => {
  it('formats duration in Japanese', () => {
    expect(formatDuration(45)).toBe('45分');
    expect(formatDuration(60)).toBe('1時間');
    expect(formatDuration(90)).toBe('1時間30分');
  });

  it('calculates median correctly', () => {
    expect(calcMedian([2, 1, -1, -2, 0])).toBe(0);
    expect(calcMedian([1, 4])).toBe(2.5);
    expect(calcMedian([])).toBe(0);
  });
});
