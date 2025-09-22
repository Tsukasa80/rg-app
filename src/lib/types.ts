export type EnergyScore = -2 | -1 | 0 | 1 | 2;

export type ActivityType = 'GREEN' | 'RED';

export interface ActivityEntry {
  id: string;
  userId: string;
  occurredAt: string;
  type: ActivityType;
  title: string;
  note?: string;
  energyScore: EnergyScore;
  durationMin?: number;
  tags: string[];
  createdAt: string;
}

export type WeeklySelectionType = 'GREEN_BEST' | 'RED_WORST';

export interface WeeklySelectionNote {
  entryId: string;
  hypothesis: string;
}

export interface WeeklySelection {
  id: string;
  userId: string;
  isoWeek: number;
  year: number;
  type: WeeklySelectionType;
  entryIds: string[];
  notes: WeeklySelectionNote[];
  updatedAt: string;
}

export interface WeeklyReflectionSummary {
  avgEnergy: number;
  greenRatio: number;
  topTags: string[];
  totalDuration: number;
  entryCount: number;
}

export interface WeeklyReflection {
  id: string;
  userId: string;
  isoWeek: number;
  year: number;
  q1?: string;
  q2?: string;
  q3?: string;
  summary: WeeklyReflectionSummary;
  createdAt: string;
}

export interface ActivityFilterState {
  range: '7d' | '30d' | 'custom';
  from?: string;
  to?: string;
  types: ActivityType[];
  tags: string[];
  energyScores: EnergyScore[];
  search: string;
}

export interface WeeklySummary {
  greenCount: number;
  redCount: number;
  averageEnergy: number;
  medianEnergy: number;
  durationMinutes: number;
  topTags: { tag: string; count: number; averageEnergy: number }[];
}
