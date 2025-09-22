import type { WeeklySummary } from '../../lib/types';

export interface GreenRedRatioProps {
  summary: WeeklySummary;
}

export function GreenRedRatio({ summary }: GreenRedRatioProps) {
  const total = summary.greenCount + summary.redCount || 1;
  const greenRatio = (summary.greenCount / total) * 100;
  const redRatio = (summary.redCount / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between text-xs text-slate-400">
        <span>Green / Red 比率</span>
        <span>
          {summary.greenCount} / {summary.redCount}
        </span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full border border-slate-800">
        <div className="h-full bg-green-500" style={{ width: `${greenRatio}%` }} />
        <div className="h-full bg-red-500" style={{ width: `${redRatio}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-green-200">{greenRatio.toFixed(1)}%</span>
        <span className="text-red-200">{redRatio.toFixed(1)}%</span>
      </div>
    </div>
  );
}
