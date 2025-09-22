"use client";

import { useState } from 'react';
import { WeeklySummaryCards } from '@/components/weekly-summary-cards';
import { DataManagement } from '@/components/data-management';
import { EnergyDistribution } from '@/components/dashboard/energy-distribution';
import { GreenRedRatio } from '@/components/dashboard/green-red-ratio';
import { TagStats } from '@/components/dashboard/tag-stats';
import { Tabs } from '@/components/ui/tabs';
import type { ActivityEntry, WeeklySummary } from '@/lib/types';

interface Dataset {
  summary: WeeklySummary;
  entries: ActivityEntry[];
  rangeLabel: string;
}

interface DashboardClientProps {
  weekly: Dataset;
  monthly: Dataset;
}

export function DashboardClient({ weekly, monthly }: DashboardClientProps) {
  const [active, setActive] = useState<'weekly' | 'monthly'>('weekly');

  return (
    <div className="space-y-6">
      <Tabs
        defaultTab="weekly"
        onTabChange={(id) => setActive(id as 'weekly' | 'monthly')}
        tabs={[
          {
            id: 'weekly',
            label: '今週',
            content: <DashboardContent dataset={weekly} />
          },
          {
            id: 'monthly',
            label: '今月',
            content: <DashboardContent dataset={monthly} />
          }
        ]}
      />
    </div>
  );
}

function DashboardContent({ dataset }: { dataset: Dataset }) {
  return (
    <div className="space-y-6">
      <WeeklySummaryCards summary={dataset.summary} />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-sm font-semibold text-white">Green / Red 比率</h3>
          <div className="mt-4">
            <GreenRedRatio summary={dataset.summary} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:col-span-2">
          <h3 className="text-sm font-semibold text-white">エネルギー分布</h3>
          <div className="mt-4">
            <EnergyDistribution entries={dataset.entries} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:col-span-3">
          <h3 className="text-sm font-semibold text-white">タグ別トップ</h3>
          <div className="mt-4">
            <TagStats summary={dataset.summary} />
          </div>
        </div>
      </div>
      <DataManagement />
    </div>
  );
}
