import { endOfMonth, startOfMonth } from 'date-fns';
import { getCurrentUser } from '@/server/session';
import { isoWeekIdentifier, isoWeekRange } from '@/lib/utils';
import { fetchWeeklySummary } from '@/server/analytics-service';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <p className="text-slate-400">ダッシュボードを表示するにはログインしてください。</p>;
  }

  const now = new Date();
  const { identifier } = isoWeekIdentifier(now);
  const weekRange = isoWeekRange(identifier);
  const weekly = await fetchWeeklySummary(user.id, weekRange.start.toISOString(), weekRange.end.toISOString());

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthly = await fetchWeeklySummary(user.id, monthStart.toISOString(), monthEnd.toISOString());

  return (
    <DashboardClient
      weekly={{ ...weekly, rangeLabel: '今週' }}
      monthly={{ ...monthly, rangeLabel: '今月' }}
    />
  );
}
