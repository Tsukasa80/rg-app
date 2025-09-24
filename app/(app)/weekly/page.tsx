import { getUserIdOrGuest } from '@/server/session';
import { isoWeekIdentifier, isoWeekRange } from '@/lib/utils';
import { fetchWeeklySummary } from '@/server/analytics-service';
import { fetchWeeklySelection } from '@/server/activity-service';
import { WeeklyClient } from './weekly-client';
export const dynamic = 'force-dynamic';

export default async function WeeklyPage() {
  const userId = await getUserIdOrGuest();

  const now = new Date();
  const { year, isoWeek, identifier } = isoWeekIdentifier(now);
  const range = isoWeekRange(identifier);
  let weeklyData: any = { summary: { greenCount: 0, redCount: 0, averageEnergy: 0, medianEnergy: 0, durationMinutes: 0, topTags: [] }, entries: [] };
  let greenSelection: any = null;
  let redSelection: any = null;
  try {
    weeklyData = await fetchWeeklySummary(userId, range.start.toISOString(), range.end.toISOString());
    [greenSelection, redSelection] = await Promise.all([
      fetchWeeklySelection(userId, year, isoWeek, 'GREEN_BEST'),
      fetchWeeklySelection(userId, year, isoWeek, 'RED_WORST')
    ]);
  } catch (e) {
    console.error('WeeklyPage load failed:', e);
  }

  return (
    <WeeklyClient
      userId={userId}
      year={year}
      isoWeek={isoWeek}
      weekRange={range}
      weeklySummary={weeklyData.summary}
      entries={weeklyData.entries}
      initialSelections={{
        green: greenSelection,
        red: redSelection
      }}
    />
  );
}
