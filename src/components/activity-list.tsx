import type { ActivityEntry } from '../lib/types';
import { ActivityCard } from './activity-card';

export interface ActivityListProps {
  entries: ActivityEntry[];
  onEdit?: (entry: ActivityEntry) => void;
  onDelete?: (entry: ActivityEntry) => void;
}

export function ActivityList({ entries, onEdit, onDelete }: ActivityListProps) {
  if (!entries.length) {
    return <p className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">まだ記録がありません。まずは今日の活動を記録してみましょう。</p>;
  }

  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <ActivityCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
