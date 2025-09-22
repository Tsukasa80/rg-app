import type { WeeklySummary } from '../../lib/types';

export interface TagStatsProps {
  summary: WeeklySummary;
}

export function TagStats({ summary }: TagStatsProps) {
  if (!summary.topTags.length) {
    return <p className="text-sm text-slate-400">タグのデータはまだありません。</p>;
  }
  return (
    <dl className="space-y-3">
      {summary.topTags.map((tag) => (
        <div key={tag.tag} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <div>
            <dt className="text-sm font-semibold text-slate-100">#{tag.tag}</dt>
            <dd className="text-xs text-slate-400">{tag.count} 件・平均 {tag.averageEnergy.toFixed(1)}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
