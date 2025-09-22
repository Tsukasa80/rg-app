'use server';

import { createSupabaseServerClient } from '../lib/supabase-server';
import type { ActivityEntry, WeeklySummary } from '../lib/types';
import { calcMedian } from '../lib/utils';

function mapEntry(row: any): ActivityEntry {
  return {
    id: row.id,
    userId: row.user_id,
    occurredAt: row.occurred_at,
    type: row.type,
    title: row.title,
    note: row.note ?? undefined,
    energyScore: row.energy_score,
    durationMin: row.duration_min ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at
  };
}

export async function fetchWeeklySummary(userId: string, from: string, to: string): Promise<{ entries: ActivityEntry[]; summary: WeeklySummary }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('activity_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('occurred_at', from)
    .lte('occurred_at', to)
    .order('occurred_at', { ascending: true });

  if (error) {
    console.error(error);
    throw new Error('週次データの取得に失敗しました');
  }

  const entries = data.map(mapEntry);
  const energyScores = entries.map((entry) => entry.energyScore);
  const durationSum = entries.reduce((acc, entry) => acc + (entry.durationMin ?? 0), 0);
  const greenCount = entries.filter((entry) => entry.type === 'GREEN').length;
  const redCount = entries.filter((entry) => entry.type === 'RED').length;

  const tagAggregate = new Map<string, { count: number; energyTotal: number }>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      const current = tagAggregate.get(tag) ?? { count: 0, energyTotal: 0 };
      tagAggregate.set(tag, {
        count: current.count + 1,
        energyTotal: current.energyTotal + entry.energyScore
      });
    }
  }

  const topTags = Array.from(tagAggregate.entries())
    .map(([tag, value]) => ({
      tag,
      count: value.count,
      averageEnergy: value.energyTotal / value.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const summary: WeeklySummary = {
    greenCount,
    redCount,
    averageEnergy: energyScores.length ? energyScores.reduce((acc, score) => acc + score, 0) / energyScores.length : 0,
    medianEnergy: calcMedian(energyScores),
    durationMinutes: durationSum,
    topTags
  };

  return { entries, summary };
}
