import Link from 'next/link';
import { getCurrentUser } from '@/server/session';
import { fetchActivities } from '@/server/activity-service';
import { ActivityList } from '@/components/activity-list';
import { CreateEntryButton } from '@/components/create-entry-button';
import { WeeklySummaryCards } from '@/components/weekly-summary-cards';
import { fetchWeeklySummary } from '@/server/analytics-service';
import { isoWeekIdentifier, isoWeekRange } from '@/lib/utils';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold text-white">ログインして記録を始めましょう</h2>
        <p className="text-sm text-slate-400">メールアドレスまたはGoogleでサインインし、日々の活動を記録できます。</p>
        <div className="flex justify-center">
          <Link
            className="rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white hover:bg-green-600"
            href="/auth/login"
          >
            サインイン
          </Link>
        </div>
      </div>
    );
  }

  const { year, isoWeek } = isoWeekIdentifier(new Date());
  const { start, end } = isoWeekRange(year * 100 + isoWeek);
  const [recentEntries, weekly] = await Promise.all([
    fetchActivities(user.id, { from: start.toISOString(), to: end.toISOString() }),
    fetchWeeklySummary(user.id, start.toISOString(), end.toISOString())
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">今日のエネルギーを記録</h2>
            <p className="text-sm text-slate-400">1ステップでレッド/グリーンを入力できます</p>
          </div>
          <CreateEntryButton userId={user.id} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">今週のスナップショット</h3>
          <Link className="text-sm text-green-400 hover:text-green-300" href="/weekly">
            週次画面へ
          </Link>
        </div>
        <WeeklySummaryCards summary={weekly.summary} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">最新の記録</h3>
          <Link className="text-sm text-slate-400 hover:text-white" href="/history">
            全て見る
          </Link>
        </div>
        <ActivityList entries={recentEntries.slice(0, 5)} />
      </section>
    </div>
  );
}
