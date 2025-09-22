import { Badge } from './ui/badge';
import { formatDateTime, formatDuration, relativeDaysFromNow } from '../lib/utils';
import type { ActivityEntry } from '../lib/types';
import { cn } from '../lib/cn';

export interface ActivityCardProps {
  entry: ActivityEntry;
  onEdit?: (entry: ActivityEntry) => void;
  onDelete?: (entry: ActivityEntry) => void;
}

export function ActivityCard({ entry, onEdit, onDelete }: ActivityCardProps) {
  const isGreen = entry.type === 'GREEN';

  return (
    <article
      className={cn(
        'rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-xl',
        isGreen
          ? 'border-green-500/40 bg-green-500/10 text-green-100'
          : 'border-red-500/40 bg-red-500/10 text-red-100'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-lg font-semibold text-white">{entry.title}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>{formatDateTime(entry.occurredAt)}</span>
          <span className="text-slate-500">·</span>
          <span>{relativeDaysFromNow(entry.occurredAt)}</span>
        </div>
      </div>
      {entry.note ? <p className="mt-2 text-sm text-slate-200">{entry.note}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={isGreen ? 'positive' : 'negative'}>{isGreen ? 'Green' : 'Red'}</Badge>
        <Badge variant={isGreen ? 'positive' : 'negative'}>{entry.energyScore}</Badge>
        {entry.durationMin ? <Badge variant="outline">{formatDuration(entry.durationMin)}</Badge> : null}
        {entry.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-slate-200">
            #{tag}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-xs">
        {onEdit ? (
          <button type="button" onClick={() => onEdit(entry)} className="text-slate-300 hover:text-white">
            編集
          </button>
        ) : null}
        {onDelete ? (
          <button type="button" onClick={() => onDelete(entry)} className="text-slate-500 hover:text-red-300">
            削除
          </button>
        ) : null}
      </div>
    </article>
  );
}
