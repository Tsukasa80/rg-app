import type { ActivityEntry } from '../../lib/types';

export interface EnergyDistributionProps {
  entries: ActivityEntry[];
}

const energyOrder = [2, 1, 0, -1, -2];

export function EnergyDistribution({ entries }: EnergyDistributionProps) {
  const total = entries.length || 1;
  const counts = energyOrder.map((score) => ({
    score,
    label: score > 0 ? `+${score}` : score,
    count: entries.filter((entry) => entry.energyScore === score).length
  }));

  return (
    <div className="space-y-3">
      {counts.map((bucket) => (
        <div key={bucket.score} className="space-y-1">
          <div className="flex items-baseline justify-between text-xs text-slate-400">
            <span>Energy {bucket.label}</span>
            <span>{bucket.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 via-green-400 to-red-400"
              style={{ width: `${(bucket.count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
