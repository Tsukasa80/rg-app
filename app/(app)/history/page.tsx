import { getCurrentUser } from '@/server/session';
import { fetchActivities } from '@/server/activity-service';
import { formatIsoDate } from '@/lib/utils';
import { HistoryClient } from './history-client';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <p className="text-slate-400">履歴を表示するにはログインしてください。</p>;
  }

  const to = formatIsoDate(new Date());
  const from = formatIsoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  const initialEntries = await fetchActivities(user.id, {
    from: new Date(from).toISOString(),
    to: new Date(`${to}T23:59:59`).toISOString()
  });

  return <HistoryClient userId={user.id} initialEntries={initialEntries} initialRange={{ from, to }} />;
}
