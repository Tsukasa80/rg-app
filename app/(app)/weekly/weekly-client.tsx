"use client";

import { useMemo, useState, useTransition } from 'react';
import type { ActivityEntry, WeeklySelection, WeeklySummary } from '@/lib/types';
import { WeeklySelectionList } from '@/components/weekly-selection-list';
import { WeeklySummaryCards } from '@/components/weekly-summary-cards';
import { WeeklyReflectionForm } from '@/components/weekly-reflection-form';
import { upsertWeeklySelection, upsertWeeklyReflection } from '@/server/activity-service';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GreenRedRatio } from '@/components/dashboard/green-red-ratio';
import { EnergyDistribution } from '@/components/dashboard/energy-distribution';
import { TagStats } from '@/components/dashboard/tag-stats';
import { format } from 'date-fns';
import { dateLocale } from '@/lib/utils';

interface WeeklyClientProps {
  userId: string;
  year: number;
  isoWeek: number;
  weekRange: { start: Date; end: Date };
  weeklySummary: WeeklySummary;
  entries: ActivityEntry[];
  initialSelections: {
    green: WeeklySelection | null;
    red: WeeklySelection | null;
  };
}

export function WeeklyClient({ userId, year, isoWeek, weekRange, weeklySummary, entries, initialSelections }: WeeklyClientProps) {
  const greenEntries = useMemo(() => entries.filter((entry) => entry.type === 'GREEN').sort((a, b) => b.energyScore - a.energyScore), [entries]);
  const redEntries = useMemo(() => entries.filter((entry) => entry.type === 'RED').sort((a, b) => a.energyScore - b.energyScore), [entries]);

  const [greenSelected, setGreenSelected] = useState(initialSelections.green?.entryIds ?? []);
  const [greenNotes, setGreenNotes] = useState<Record<string, string>>(
    Object.fromEntries(initialSelections.green?.notes?.map((note) => [note.entryId, note.hypothesis]) ?? [])
  );

  const [redSelected, setRedSelected] = useState(initialSelections.red?.entryIds ?? []);
  const [redNotes, setRedNotes] = useState<Record<string, string>>(
    Object.fromEntries(initialSelections.red?.notes?.map((note) => [note.entryId, note.hypothesis]) ?? [])
  );

  const [selectionPending, startSelectionTransition] = useTransition();
  const [reflectionPending, startReflectionTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleGreenChange(selected: string[], notes: Record<string, string>) {
    setGreenSelected(selected);
    setGreenNotes(notes);
    startSelectionTransition(async () => {
      await upsertWeeklySelection(userId, year, isoWeek, 'GREEN_BEST', selected, notes);
      setFeedback('グリーンベストを保存しました');
    });
  }

  function handleRedChange(selected: string[], notes: Record<string, string>) {
    setRedSelected(selected);
    setRedNotes(notes);
    startSelectionTransition(async () => {
      await upsertWeeklySelection(userId, year, isoWeek, 'RED_WORST', selected, notes);
      setFeedback('レッドワーストを保存しました');
    });
  }

  function handleReflection(values: { q1?: string; q2?: string; q3?: string }) {
    startReflectionTransition(async () => {
      await upsertWeeklyReflection(userId, year, isoWeek, {
        ...values,
        summary: {
          avgEnergy: weeklySummary.averageEnergy,
          greenRatio: weeklySummary.greenCount / Math.max(weeklySummary.greenCount + weeklySummary.redCount, 1),
          topTags: weeklySummary.topTags.map((tag) => tag.tag),
          totalDuration: weeklySummary.durationMinutes,
          entryCount: entries.length
        }
      });
      setFeedback('振り返りを保存しました');
    });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{year}年 第{isoWeek}週</p>
            <h2 className="text-xl font-semibold text-white">
              {format(weekRange.start, 'M月d日', { locale: dateLocale })} ~ {format(weekRange.end, 'M月d日', { locale: dateLocale })}
            </h2>
          </div>
          {feedback ? <p className="text-xs text-green-300">{feedback}</p> : null}
        </div>
      </header>

      <WeeklySummaryCards summary={weeklySummary} />

      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-white">グリーン・ベスト5</h3>
        <WeeklySelectionList
          entries={greenEntries}
          initialSelected={greenSelected}
          initialNotes={greenNotes}
          type="GREEN_BEST"
          onChange={handleGreenChange}
        />
        {selectionPending ? <p className="text-xs text-slate-400">保存中...</p> : null}
      </section>

      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-white">レッド・ワースト5</h3>
        <WeeklySelectionList
          entries={redEntries}
          initialSelected={redSelected}
          initialNotes={redNotes}
          type="RED_WORST"
          onChange={handleRedChange}
        />
        {selectionPending ? <p className="text-xs text-slate-400">保存中...</p> : null}
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white">週次リフレクション</h3>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>振り返りフォーム</CardTitle>
              <CardDescription>週の終わりに3つの問いに答えて、次のアクションを考えます。</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4 p-6">
            <WeeklyReflectionForm onSubmit={handleReflection} />
            {reflectionPending ? <p className="text-xs text-slate-400">保存中...</p> : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Green / Red 比率</CardTitle>
          </CardHeader>
          <div className="p-6">
            <GreenRedRatio summary={weeklySummary} />
          </div>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>エネルギー分布</CardTitle>
          </CardHeader>
          <div className="p-6">
            <EnergyDistribution entries={entries} />
          </div>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>タグ別インサイト</CardTitle>
          </CardHeader>
          <div className="p-6">
            <TagStats summary={weeklySummary} />
          </div>
        </Card>
      </section>
    </div>
  );
}
