'use client';

import { useEffect, useState } from 'react';
import type { ActivityEntry, ActivityType, EnergyScore } from '../lib/types';
import { TagInput } from './ui/tag-input';
import { Input } from './ui/input';
import { TextArea } from './ui/textarea';
import { EnergySelector } from './energy-selector';
import { ActivityTypeToggle } from './activity-type-toggle';
import { formatIsoDateTime } from '../lib/utils';
import { ENERGY_SCALE, TAG_SUGGESTIONS } from '../lib/constants';

export interface ActivityEntryFormValues {
  type: ActivityType;
  title: string;
  note: string;
  energyScore: EnergyScore;
  tags: string[];
  durationMin?: number;
  occurredAt: string;
}

export interface ActivityEntryFormProps {
  initialValues?: Partial<ActivityEntryFormValues>;
  onSubmit: (values: ActivityEntryFormValues) => Promise<void> | void;
  submitting?: boolean;
}

const defaultValues: ActivityEntryFormValues = {
  type: 'GREEN',
  title: '',
  note: '',
  energyScore: 2,
  tags: [],
  durationMin: undefined,
  occurredAt: formatIsoDateTime(new Date())
};

export function ActivityEntryForm({ initialValues, onSubmit, submitting }: ActivityEntryFormProps) {
  const [values, setValues] = useState<ActivityEntryFormValues>({ ...defaultValues, ...initialValues });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim()) {
      setError('活動名は必須です');
      return;
    }

    try {
      setError(null);
      await onSubmit(values);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <ActivityTypeToggle value={values.type} onChange={(type) => setValues((prev) => ({ ...prev, type }))} />
        <div>
          <label className="block text-sm font-medium text-slate-200">活動名</label>
          <Input
            value={values.title}
            onChange={(event) => setValues((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="例: 朝ラン、経費精算"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">メモ</label>
          <TextArea
            rows={3}
            value={values.note}
            onChange={(event) => setValues((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="振り返りに役立つ短いメモ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">エネルギー指標</label>
          <EnergySelector
            value={values.energyScore}
            onChange={(energyScore) => setValues((prev) => ({ ...prev, energyScore }))}
          />
          <p className="mt-2 text-xs text-slate-400">
            {ENERGY_SCALE.find((scale) => scale.value === values.energyScore)?.description}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-200">タグ</label>
            <TagInput
              value={values.tags}
              onChange={(tags) => setValues((prev) => ({ ...prev, tags }))}
              suggestions={TAG_SUGGESTIONS}
              placeholder="タグを追加"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">所要時間（分）</label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={values.durationMin?.toString() ?? ''}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  durationMin: event.target.value ? Number(event.target.value) : undefined
                }))
              }
              placeholder="例: 45"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-200">日時</label>
          <Input
            type="datetime-local"
            value={values.occurredAt.slice(0, 16)}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, occurredAt: new Date(event.target.value).toISOString() }))
            }
          />
        </div>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-full bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-70"
          disabled={submitting}
        >
          {submitting ? '保存中...' : '保存する'}
        </button>
      </div>
    </form>
  );
}