'use server';

import { createSupabaseServerComponentClient } from '../lib/supabase-server';
import { LocalDB, OFFLINE_MODE } from '../lib/local-db';
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
  if (OFFLINE_MODE) {
    const rows = LocalDB
      .listEntries(userId)
      .filter((r) => { const t = new Date(r.occurred_at).getTime(); const f = new Date(from).getTime(); const tt = new Date(to).getTime(); return t >= f && t <= tt; })
      .sort((a, b) => (a.occurred_at < b.occurred_at ? -1 : 1));
    const entries = rows.map(mapEntry);
    const energyScores = entries.map((entry) => entry.energyScore);
    const totalEnergy = energyScores.reduce<number>((acc, score) => acc + score, 0);
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
      .map(([tag, value]) => ({ tag, count: value.count, averageEnergy: value.energyTotal / value.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const summary: WeeklySummary = {
      greenCount,
      redCount,
      averageEnergy: energyScores.length ? totalEnergy / energyScores.length : 0,
      medianEnergy: calcMedian(energyScores),
      durationMinutes: durationSum,
      topTags
    };

    return { entries, summary };
  }
  const supabase = createSupabaseServerComponentClient();
  const { data, error } = await supabase
    .from('activity_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('occurred_at', from)
    .lte('occurred_at', to)
    .order('occurred_at', { ascending: true });

  if (error) {
    console.error(error);
    throw new Error('Failed to fetch weekly data');
  }

  const entries = data.map(mapEntry);
  const energyScores = entries.map((entry) => entry.energyScore);
  const totalEnergy = energyScores.reduce<number>((acc, score) => acc + score, 0);
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
    averageEnergy: energyScores.length ? totalEnergy / energyScores.length : 0,
    medianEnergy: calcMedian(energyScores),
    durationMinutes: durationSum,
    topTags
  };

  return { entries, summary };
}

