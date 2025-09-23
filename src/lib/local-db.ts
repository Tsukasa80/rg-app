import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export const OFFLINE_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || /example\./i.test(process.env.NEXT_PUBLIC_SUPABASE_URL);

const DATA_DIR = path.join(process.cwd(), '.data');
const ENTRIES_FILE = path.join(DATA_DIR, 'activity_entries.json');
const WEEKLY_SEL_FILE = path.join(DATA_DIR, 'weekly_selections.json');
const WEEKLY_REF_FILE = path.join(DATA_DIR, 'weekly_reflections.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(file: string, data: T) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

export type EntryRow = {
  id: string;
  user_id: string;
  occurred_at: string;
  type: 'GREEN' | 'RED';
  title: string;
  note?: string;
  energy_score: number;
  duration_min?: number;
  tags: string[];
  created_at: string;
  updated_at?: string;
};

export type WeeklySelectionRow = {
  id: string;
  user_id: string;
  iso_week: number;
  year: number;
  type: 'GREEN_BEST' | 'RED_WORST';
  entry_ids: string[];
  notes: Record<string, { hypothesis: string }>; 
  created_at: string;
  updated_at?: string;
};

export type WeeklyReflectionRow = {
  id: string;
  user_id: string;
  iso_week: number;
  year: number;
  q1?: string;
  q2?: string;
  q3?: string;
  summary?: any;
  created_at: string;
  updated_at?: string;
};

export const LocalDB = {
  listEntries(userId: string): EntryRow[] {
    const all = readJson<EntryRow[]>(ENTRIES_FILE, []);
    return all.filter((e) => e.user_id === userId);
  },
  saveEntries(entries: EntryRow[]) {
    const all = readJson<EntryRow[]>(ENTRIES_FILE, []);
    // replace by id for provided entries, keep others
    const keep = all.filter((e) => !entries.some((x) => x.id === e.id));
    writeJson(ENTRIES_FILE, [...keep, ...entries]);
  },
  insertEntry(row: Omit<EntryRow, 'id' | 'created_at'>): EntryRow {
    const newRow: EntryRow = { ...row, id: randomUUID(), created_at: new Date().toISOString() };
    const all = readJson<EntryRow[]>(ENTRIES_FILE, []);
    all.push(newRow);
    writeJson(ENTRIES_FILE, all);
    return newRow;
  },
  updateEntry(id: string, patch: Partial<EntryRow>): EntryRow | null {
    const all = readJson<EntryRow[]>(ENTRIES_FILE, []);
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const updated: EntryRow = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
    all[idx] = updated;
    writeJson(ENTRIES_FILE, all);
    return updated;
  },
  deleteEntry(userId: string, id: string): boolean {
    const all = readJson<EntryRow[]>(ENTRIES_FILE, []);
    const next = all.filter((e) => !(e.id === id && e.user_id === userId));
    writeJson(ENTRIES_FILE, next);
    return next.length !== all.length;
  },

  getWeeklySelection(userId: string, year: number, isoWeek: number, type: 'GREEN_BEST' | 'RED_WORST') {
    const all = readJson<WeeklySelectionRow[]>(WEEKLY_SEL_FILE, []);
    return all.find((w) => w.user_id === userId && w.year === year && w.iso_week === isoWeek && w.type === type) || null;
  },
  upsertWeeklySelection(row: Omit<WeeklySelectionRow, 'id' | 'created_at'>) {
    const all = readJson<WeeklySelectionRow[]>(WEEKLY_SEL_FILE, []);
    const idx = all.findIndex(
      (w) => w.user_id === row.user_id && w.year === row.year && w.iso_week === row.iso_week && w.type === row.type
    );
    if (idx === -1) {
      all.push({ ...row, id: randomUUID(), created_at: new Date().toISOString() });
    } else {
      all[idx] = { ...all[idx], ...row, updated_at: new Date().toISOString() };
    }
    writeJson(WEEKLY_SEL_FILE, all);
  },

  upsertWeeklyReflection(row: Omit<WeeklyReflectionRow, 'id' | 'created_at'>) {
    const all = readJson<WeeklyReflectionRow[]>(WEEKLY_REF_FILE, []);
    const idx = all.findIndex((w) => w.user_id === row.user_id && w.year === row.year && w.iso_week === row.iso_week);
    if (idx === -1) {
      all.push({ ...row, id: randomUUID(), created_at: new Date().toISOString() });
    } else {
      all[idx] = { ...all[idx], ...row, updated_at: new Date().toISOString() };
    }
    writeJson(WEEKLY_REF_FILE, all);
  }
};

