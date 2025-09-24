import Link from 'next/link';
import { getUserIdOrGuest } from '@/server/session';
import { fetchActivities } from '@/server/activity-service';
import { ActivityList } from '@/components/activity-list';
import { CreateEntryButton } from '@/components/create-entry-button';
import { WeeklySummaryCards } from '@/components/weekly-summary-cards';
import { fetchWeeklySummary } from '@/server/analytics-service';
import { isoWeekIdentifier, isoWeekRange } from '@/lib/utils';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const userId = await getUserIdOrGuest();

  const { year, isoWeek } = isoWeekIdentifier(new Date());
  const { start, end } = isoWeekRange(year * 100 + isoWeek);
  let recentEntries: any[] = [];
  let weekly: any = { summary: { greenCount: 0, redCount: 0, averageEnergy: 0, medianEnergy: 0, durationMinutes: 0, topTags: [] } };
  try {
    const [r, w] = await Promise.all([
      fetchActivities(userId, { from: start.toISOString(), to: end.toISOString() }),
      fetchWeeklySummary(userId, start.toISOString(), end.toISOString())
    ]);
    recentEntries = r;
    weekly = w;
  } catch (e) {
    console.error('HomePage data load failed:', e);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">最近のエネルギー記録</h2>
            <p className="text-sm text-slate-400">1ステップでレッド/グリーン記録ができます</p>
          </div>
          <CreateEntryButton userId={userId} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">今週のスナップショット</h3>
          <Link className="text-sm text-green-400 hover:text-green-300" href="/weekly">
            詳細を見る
          </Link>
        </div>
        <WeeklySummaryCards summary={weekly.summary} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">最新の記録</h3>
          <Link className="text-sm text-slate-400 hover:text-white" href="/history">
            すべて見る
          </Link>
        </div>
        <ActivityList entries={recentEntries.slice(0, 5)} />
      </section>
    </div>
  );
}
