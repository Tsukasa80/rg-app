"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createSupabaseServerActionClient, createSupabaseServerComponentClient } from "../lib/supabase-server";
import { LocalDB, OFFLINE_MODE } from "../lib/local-db";
import type {
  ActivityEntry,
  ActivityFilterState,
  WeeklyReflection,
  WeeklySelection,
  WeeklySelectionType,
} from "../lib/types";
import { MAX_WEEKLY_SELECTION } from "../lib/constants";

interface ActivityPayload {
  type: ActivityEntry["type"];
  title: string;
  note?: string;
  energyScore: ActivityEntry["energyScore"];
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
    createdAt: row.created_at,
  };
}

export async function fetchActivities(userId: string, filters?: Partial<ActivityFilterState>) {
  if (OFFLINE_MODE) {
    const rows = LocalDB.listEntries(userId).sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
    const fromTs = filters?.from ? new Date(filters.from).getTime() : null;
    const toTs = filters?.to ? new Date(filters.to).getTime() : null;
    const filtered = rows.filter((row) => {
      if (filters?.types?.length && !filters.types.includes(row.type)) return false;
      if (filters?.tags?.length && !filters.tags.every((t) => row.tags.includes(t))) return false;
      if (filters?.energyScores?.length && !filters.energyScores.includes(row.energy_score as any)) return false;
      const rowTs = new Date(row.occurred_at).getTime();
      if (fromTs !== null && rowTs < fromTs) return false;
      if (toTs !== null && rowTs > toTs) return false;
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        const inTitle = row.title.toLowerCase().includes(s);
        const inNote = (row.note ?? "").toLowerCase().includes(s);
        if (!inTitle && !inNote) return false;
      }
      return true;
    });
    return filtered.map(mapEntry);
  }
  const supabase = createSupabaseServerComponentClient();
  let query = supabase
    .from("activity_entries")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false });

  if (filters?.types?.length) {
    query = query.in("type", filters.types);
  }
  if (filters?.tags?.length) {
    query = query.contains("tags", filters.tags);
  }
  if (filters?.energyScores?.length) {
    query = query.in("energy_score", filters.energyScores as any);
  }
  if (filters?.from) {
    query = query.gte("occurred_at", filters.from);
  }
  if (filters?.to) {
    query = query.lte("occurred_at", filters.to);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,note.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    throw new Error("Failed to fetch activities");
  }
  return (data as any[]).map(mapEntry);
}

export async function createActivity(userId: string, payload: ActivityPayload) {
  if (OFFLINE_MODE) {
    // Ensure guest cookie exists so subsequent SSR uses the same id
    try {
      const store = cookies();
      const has = store.get("guest_id")?.value;
      if (!has && userId?.startsWith("guest_")) {
        store.set("guest_id", userId, { path: "/", sameSite: "lax", httpOnly: false, maxAge: 60 * 60 * 24 * 365 });
      }
    } catch {}

    const row = LocalDB.insertEntry({
      user_id: userId,
      occurred_at: payload.occurredAt,
      type: payload.type,
      title: payload.title,
      note: payload.note,
      energy_score: payload.energyScore,
      duration_min: payload.durationMin,
      tags: payload.tags,
      updated_at: undefined,
    });
    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/weekly");
    return mapEntry(row);
  }
  const supabase = createSupabaseServerActionClient();
  const { data, error } = await (supabase.from as any)("activity_entries")
    .insert(
      {
        user_id: userId,
        occurred_at: payload.occurredAt,
        type: payload.type,
        title: payload.title,
        note: payload.note,
        energy_score: payload.energyScore,
        duration_min: payload.durationMin,
        tags: payload.tags,
      } as any
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Failed to create activity");
  }

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/weekly");
  return mapEntry(data);
}

export async function updateActivity(userId: string, entryId: string, payload: Partial<ActivityPayload>) {
  if (OFFLINE_MODE) {
    const patch: any = {
      ...("occurredAt" in payload ? { occurred_at: payload.occurredAt } : {}),
      ...("type" in payload ? { type: payload.type } : {}),
      ...("title" in payload ? { title: payload.title } : {}),
      ...("note" in payload ? { note: payload.note } : {}),
      ...("energyScore" in payload ? { energy_score: payload.energyScore } : {}),
      ...("durationMin" in payload ? { duration_min: payload.durationMin } : {}),
      ...("tags" in payload ? { tags: payload.tags } : {}),
    };
    const updated = LocalDB.updateEntry(entryId, patch);
    if (!updated || updated.user_id !== userId) {
      throw new Error("Failed to update activity (offline)");
    }
    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/weekly");
    return mapEntry(updated);
  }
  const supabase = createSupabaseServerActionClient();
  const { data, error } = await (supabase.from as any)("activity_entries")
    .update({
      ...("occurredAt" in payload ? { occurred_at: payload.occurredAt } : {}),
      ...("type" in payload ? { type: payload.type } : {}),
      ...("title" in payload ? { title: payload.title } : {}),
      ...("note" in payload ? { note: payload.note } : {}),
      ...("energyScore" in payload ? { energy_score: payload.energyScore } : {}),
      ...("durationMin" in payload ? { duration_min: payload.durationMin } : {}),
      ...("tags" in payload ? { tags: payload.tags } : {}),
      updated_at: new Date().toISOString(),
    } as any)
    .eq("user_id", userId)
    .eq("id", entryId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Failed to update activity");
  }

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/weekly");
  return mapEntry(data);
}

export async function deleteActivity(userId: string, entryId: string) {
  if (OFFLINE_MODE) {
    const ok = LocalDB.deleteEntry(userId, entryId);
    if (!ok) {
      console.error("offline delete failed");
      throw new Error("Failed to delete activity (offline)");
    }
    revalidatePath("/");
    revalidatePath("/history");
    revalidatePath("/weekly");
    return;
  }
  const supabase = createSupabaseServerActionClient();
  const { error } = await (supabase.from as any)("activity_entries")
    .delete()
    .eq("user_id", userId)
    .eq("id", entryId);

  if (error) {
    console.error(error);
    throw new Error("Failed to delete activity");
  }

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/weekly");
}

export async function fetchWeeklySelection(
  userId: string,
  year: number,
  isoWeek: number,
  type: WeeklySelectionType
): Promise<WeeklySelection | null> {
  if (OFFLINE_MODE) {
    const data: any = LocalDB.getWeeklySelection(userId, year, isoWeek, type);
    if (!data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      isoWeek: data.iso_week,
      year: data.year,
      type: data.type,
      entryIds: data.entry_ids ?? [],
      notes: Object.entries((data.notes as Record<string, { hypothesis: string }> | null) ?? {}).map(
        ([entryId, value]) => ({
          entryId,
          hypothesis: value.hypothesis,
        })
      ),
      updatedAt: data.updated_at ?? data.created_at,
    };
  }
  const supabase = createSupabaseServerComponentClient();
  const { data, error } = await (supabase.from as any)("weekly_selections")
    .select("*")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("iso_week", isoWeek)
    .eq("type", type)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Failed to fetch weekly selection");
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    isoWeek: data.iso_week,
    year: data.year,
    type: data.type,
    entryIds: data.entry_ids ?? [],
    notes: Object.entries((data.notes as Record<string, { hypothesis: string }> | null) ?? {}).map(
      ([entryId, value]) => ({
        entryId,
        hypothesis: value.hypothesis,
      })
    ),
    updatedAt: data.updated_at ?? data.created_at,
  };
}

export async function upsertWeeklySelection(
  userId: string,
  year: number,
  isoWeek: number,
  type: WeeklySelectionType,
  entryIds: string[],
  notes: Record<string, string>
) {
  if (OFFLINE_MODE) {
    const payload = {
      user_id: userId,
      year,
      iso_week: isoWeek,
      type,
      entry_ids: entryIds,
      notes: Object.fromEntries(
        Object.entries(notes).map(([entryId, hypothesis]) => [entryId, { hypothesis }])
      ) as Record<string, { hypothesis: string }>,
    };
    LocalDB.upsertWeeklySelection(payload);
    revalidatePath("/weekly");
    return;
  }
  if (entryIds.length > MAX_WEEKLY_SELECTION) {
    throw new Error(`At most ${MAX_WEEKLY_SELECTION} items can be selected`);
  }

  const supabase = createSupabaseServerActionClient();
  const payload = {
    user_id: userId,
    year,
    iso_week: isoWeek,
    type,
    entry_ids: entryIds,
    notes: Object.fromEntries(Object.entries(notes).map(([entryId, hypothesis]) => [entryId, { hypothesis }])),
  };

  const { error } = await (supabase.from as any)("weekly_selections").upsert(payload as any, {
    onConflict: "user_id,year,iso_week,type",
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to save weekly selection");
  }

  revalidatePath("/weekly");
}

export async function upsertWeeklyReflection(
  userId: string,
  year: number,
  isoWeek: number,
  answers: Pick<WeeklyReflection, "q1" | "q2" | "q3" | "summary">
) {
  if (OFFLINE_MODE) {
    LocalDB.upsertWeeklyReflection({
      user_id: userId,
      year,
      iso_week: isoWeek,
      q1: answers.q1,
      q2: answers.q2,
      q3: answers.q3,
      summary: answers.summary,
    });
    revalidatePath("/weekly");
    return;
  }
  const supabase = createSupabaseServerActionClient();
  const payload = {
    user_id: userId,
    year,
    iso_week: isoWeek,
    q1: answers.q1,
    q2: answers.q2,
    q3: answers.q3,
    summary: answers.summary,
  };

  const { error } = await (supabase.from as any)("weekly_reflections").upsert(payload as any, {
    onConflict: "user_id,year,iso_week",
  });

  if (error) {
    console.error(error);
    throw new Error("Failed to save weekly reflection");
  }

  revalidatePath("/weekly");
}