import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const EntrySchema = z.object({
  id: z.string().uuid().optional(),
  occurred_at: z.string(),
  type: z.enum(['GREEN', 'RED']),
  title: z.string(),
  note: z.string().optional(),
  energy: z.number().min(-2).max(2),
  duration_min: z.number().optional(),
  tags: z.array(z.string()).optional()
});

const WeeklySchema = z.object({
  year: z.number(),
  iso_week: z.number(),
  green_best_ids: z.array(z.string().uuid()).optional(),
  red_worst_ids: z.array(z.string().uuid()).optional(),
  strength_notes: z.record(z.string()).optional(),
  weakness_notes: z.record(z.string()).optional(),
  reflection: z
    .object({
      q1: z.string().optional(),
      q2: z.string().optional(),
      q3: z.string().optional()
    })
    .optional()
});

const ImportSchema = z.object({
  version: z.string(),
  entries: z.array(EntrySchema).default([]),
  weekly: WeeklySchema.optional()
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  if (payload.entries.length) {
    const formatted = payload.entries.map((entry) => ({
      id: entry.id,
      user_id: user.id,
      occurred_at: entry.occurred_at,
      type: entry.type,
      title: entry.title,
      note: entry.note,
      energy_score: entry.energy,
      duration_min: entry.duration_min,
      tags: entry.tags ?? []
    }));
    const { error } = await supabase.from('activity_entries').upsert(formatted, { onConflict: 'id' });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (payload.weekly) {
    const { year, iso_week } = payload.weekly;
    if (payload.weekly.green_best_ids?.length) {
      const { error } = await supabase.from('weekly_selections').upsert({
        user_id: user.id,
        year,
        iso_week,
        type: 'GREEN_BEST',
        entry_ids: payload.weekly.green_best_ids,
        notes: Object.fromEntries(
          Object.entries(payload.weekly.strength_notes ?? {}).map(([key, value]) => [key, { hypothesis: value }])
        )
      }, { onConflict: 'user_id,year,iso_week,type' });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    if (payload.weekly.red_worst_ids?.length) {
      const { error } = await supabase.from('weekly_selections').upsert({
        user_id: user.id,
        year,
        iso_week,
        type: 'RED_WORST',
        entry_ids: payload.weekly.red_worst_ids,
        notes: Object.fromEntries(
          Object.entries(payload.weekly.weakness_notes ?? {}).map(([key, value]) => [key, { hypothesis: value }])
        )
      }, { onConflict: 'user_id,year,iso_week,type' });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    if (payload.weekly.reflection) {
      const { error } = await supabase.from('weekly_reflections').upsert({
        user_id: user.id,
        year,
        iso_week,
        q1: payload.weekly.reflection.q1,
        q2: payload.weekly.reflection.q2,
        q3: payload.weekly.reflection.q3
      }, { onConflict: 'user_id,year,iso_week' });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/history');
  revalidatePath('/weekly');
  revalidatePath('/dashboard');

  return NextResponse.json({ status: 'ok' });
}
