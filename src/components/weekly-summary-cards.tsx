import type { WeeklySummary } from '../lib/types';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { formatDuration } from '../lib/utils';

export interface WeeklySummaryCardsProps {
  summary: WeeklySummary;
}

export function WeeklySummaryCards({ summary }: WeeklySummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>エネルギー指標</CardTitle>
            <CardDescription>平均・中央値のスナップショット</CardDescription>
          </div>
        </CardHeader>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-200">{summary.averageEnergy.toFixed(1)}</div>
            <div className="text-xs text-slate-400">平均</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-200">{summary.medianEnergy.toFixed(1)}</div>
            <div className="text-xs text-slate-400">中央値</div>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>件数</CardTitle>
            <CardDescription>グリーン・レッドの比率</CardDescription>
          </div>
        </CardHeader>
        <div className="mt-4 flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-semibold text-green-200">{summary.greenCount}</div>
            <div className="text-xs text-slate-400">Green</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-red-200">{summary.redCount}</div>
            <div className="text-xs text-slate-400">Red</div>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>時間合計</CardTitle>
            <CardDescription>活動に費やした時間</CardDescription>
          </div>
        </CardHeader>
        <div className="mt-4 text-center text-2xl font-semibold text-slate-200">
          {formatDuration(summary.durationMinutes)}
        </div>
      </Card>
    </div>
  );
}
