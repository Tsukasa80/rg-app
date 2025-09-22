'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '../lib/supabase-server';
import type {
  ActivityEntry,
  ActivityFilterState,
  WeeklyReflection,
  WeeklySelection,
  WeeklySelectionType
} from '../lib/types';
import { MAX_WEEKLY_SELECTION } from '../lib/constants';

interface ActivityPayload {
  type: ActivityEntry['type'];
  title: string;
  note?: string;
  energyScore: ActivityEntry['energyScore'];
  durationMin?: number;
  tags: string[];
  occurredAt: string;
}

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

export async function fetchActivities(userId: string, filters?: Partial<ActivityFilterState>) {
  const supabase = createSupabaseServerClient();
  let query = supabase.from('activity_entries').select('*').eq('user_id', userId).order('occurred_at', { ascending: false });

  if (filters?.types?.length) {
    query = query.in('type', filters.types);
  }
  if (filters?.tags?.length) {
    query = query.contains('tags', filters.tags);
  }
  if (filters?.energyScores?.length) {
    query = query.in('energy_score', filters.energyScores);
  }
  if (filters?.from) {
    query = query.gte('occurred_at', filters.from);
  }
  if (filters?.to) {
    query = query.lte('occurred_at', filters.to);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,note.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    throw new Error('活動の取得に失敗しました');
  }
  return data.map(mapEntry);
}

export async function createActivity(userId: string, payload: ActivityPayload) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('activity_entries')
    .insert({
      user_id: userId,
      occurred_at: payload.occurredAt,
      type: payload.type,
      title: payload.title,
      note: payload.note,
      energy_score: payload.energyScore,
      duration_min: payload.durationMin,
      tags: payload.tags
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('活動の作成に失敗しました');
  }

  revalidatePath('/');
  revalidatePath('/history');
  revalidatePath('/weekly');
  return mapEntry(data);
}

export async function updateActivity(userId: string, entryId: string, payload: Partial<ActivityPayload>) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('activity_entries')
    .update({
      ...('occurredAt' in payload ? { occurred_at: payload.occurredAt } : {}),
      ...('type' in payload ? { type: payload.type } : {}),
      ...('title' in payload ? { title: payload.title } : {}),
      ...('note' in payload ? { note: payload.note } : {}),
      ...('energyScore' in payload ? { energy_score: payload.energyScore } : {}),
      ...('durationMin' in payload ? { duration_min: payload.durationMin } : {}),
      ...('tags' in payload ? { tags: payload.tags } : {}),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error('活動の更新に失敗しました');
  }

  revalidatePath('/');
  revalidatePath('/history');
  revalidatePath('/weekly');
  return mapEntry(data);
}

export async function deleteActivity(userId: string, entryId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('activity_entries')
    .delete()
    .eq('user_id', userId)
    .eq('id', entryId);

  if (error) {
    console.error(error);
    throw new Error('活動の削除に失敗しました');
  }

  revalidatePath('/');
  revalidatePath('/history');
  revalidatePath('/weekly');
}

export async function fetchWeeklySelection(userId: string, year: number, isoWeek: number, type: WeeklySelectionType): Promise<WeeklySelection | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('weekly_selections')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('iso_week', isoWeek)
    .eq('type', type)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error('週次選定の取得に失敗しました');
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    isoWeek: data.iso_week,
    year: data.year,
    type: data.type,
    entryIds: data.entry_ids ?? [],
    notes: Object.entries((data.notes as Record<string, { hypothesis: string }> | null) ?? {}).map(([entryId, value]) => ({
      entryId,
      hypothesis: value.hypothesis
    })),
    updatedAt: data.updated_at ?? data.created_at
  };
}

export async function upsertWeeklySelection(userId: string, year: number, isoWeek: number, type: WeeklySelectionType, entryIds: string[], notes: Record<string, string>) {
  if (entryIds.length > MAX_WEEKLY_SELECTION) {
    throw new Error(`選定できるのは最大${MAX_WEEKLY_SELECTION}件までです`);
  }

  const supabase = createSupabaseServerClient();
  const payload = {
    user_id: userId,
    year,
    iso_week: isoWeek,
    type,
    entry_ids: entryIds,
    notes: Object.fromEntries(Object.entries(notes).map(([entryId, hypothesis]) => [entryId, { hypothesis }]))
  };

  const { error } = await supabase
    .from('weekly_selections')
    .upsert(payload, { onConflict: 'user_id,year,iso_week,type' });

  if (error) {
    console.error(error);
    throw new Error('週次選定の保存に失敗しました');
  }

  revalidatePath('/weekly');
}

export async function upsertWeeklyReflection(userId: string, year: number, isoWeek: number, answers: Pick<WeeklyReflection, 'q1' | 'q2' | 'q3' | 'summary'>) {
  const supabase = createSupabaseServerClient();
  const payload = {
    user_id: userId,
    year,
    iso_week: isoWeek,
    q1: answers.q1,
    q2: answers.q2,
    q3: answers.q3,
    summary: answers.summary
  };

  const { error } = await supabase
    .from('weekly_reflections')
    .upsert(payload, { onConflict: 'user_id,year,iso_week' });

  if (error) {
    console.error(error);
    throw new Error('週次振り返りの保存に失敗しました');
  }

  revalidatePath('/weekly');
}
