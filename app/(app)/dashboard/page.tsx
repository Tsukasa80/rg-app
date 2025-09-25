import { endOfMonth, startOfMonth, formatISO } from 'date-fns';
import { getUserIdOrGuest } from '@/server/session';
import { isoWeekIdentifier, isoWeekRange } from '@/lib/utils';
import { fetchWeeklySummary } from '@/server/analytics-service';
import { DashboardClient } from './dashboard-client';
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userId = await getUserIdOrGuest();

  const now = new Date();
  const { identifier } = isoWeekIdentifier(now);
  const weekRange = isoWeekRange(identifier);
  let weekly: any = { summary: { greenCount: 0, redCount: 0, averageEnergy: 0, medianEnergy: 0, durationMinutes: 0, topTags: [] }, entries: [] };

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  let monthly: any = { summary: { greenCount: 0, redCount: 0, averageEnergy: 0, medianEnergy: 0, durationMinutes: 0, topTags: [] }, entries: [] };
  try {
    weekly = await fetchWeeklySummary(userId, formatISO(weekRange.start), formatISO(weekRange.end));
    monthly = await fetchWeeklySummary(userId, formatISO(monthStart), formatISO(monthEnd));
  } catch (e) {
    console.error('DashboardPage load failed:', e);
  }

  return (
    <DashboardClient
      weekly={{ ...weekly, rangeLabel: '今週' }}
      monthly={{ ...monthly, rangeLabel: '今月' }}
    />
  );
}
