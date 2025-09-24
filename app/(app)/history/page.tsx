import { getUserIdOrGuest } from '@/server/session';
import { fetchActivities } from '@/server/activity-service';
import { formatIsoDate } from '@/lib/utils';
import { HistoryClient } from './history-client';
export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const userId = await getUserIdOrGuest();

  const to = formatIsoDate(new Date());
  const from = formatIsoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  let initialEntries = [] as any[];
  try {
    initialEntries = await fetchActivities(userId, {
      from: new Date(from).toISOString(),
      to: new Date(`${to}T23:59:59`).toISOString()
    });
  } catch (e) {
    console.error('HistoryPage load failed:', e);
  }

  return <HistoryClient userId={userId} initialEntries={initialEntries} initialRange={{ from, to }} />;
}
