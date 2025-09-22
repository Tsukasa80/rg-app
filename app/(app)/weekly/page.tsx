import { getCurrentUser } from '@/server/session';
import { isoWeekIdentifier, isoWeekRange } from '@/lib/utils';
import { fetchWeeklySummary } from '@/server/analytics-service';
import { fetchWeeklySelection } from '@/server/activity-service';
import { WeeklyClient } from './weekly-client';

export default async function WeeklyPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <p className="text-slate-400">週次機能を使うにはログインしてください。</p>;
  }

  const now = new Date();
  const { year, isoWeek, identifier } = isoWeekIdentifier(now);
  const range = isoWeekRange(identifier);
  const weeklyData = await fetchWeeklySummary(user.id, range.start.toISOString(), range.end.toISOString());
  const greenSelection = await fetchWeeklySelection(user.id, year, isoWeek, 'GREEN_BEST');
  const redSelection = await fetchWeeklySelection(user.id, year, isoWeek, 'RED_WORST');

  return (
    <WeeklyClient
      userId={user.id}
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
