'use client';

import { useState } from 'react';
import type { WeeklyReflection } from '../lib/types';
import { TextArea } from './ui/textarea';
import { Button } from './ui/button';

export interface WeeklyReflectionFormProps {
  defaultValues?: Partial<Pick<WeeklyReflection, 'q1' | 'q2' | 'q3'>>;
  onSubmit: (values: Pick<WeeklyReflection, 'q1' | 'q2' | 'q3'>) => Promise<void> | void;
}

export function WeeklyReflectionForm({ defaultValues, onSubmit }: WeeklyReflectionFormProps) {
  const [values, setValues] = useState({
    q1: defaultValues?.q1 ?? '',
    q2: defaultValues?.q2 ?? '',
    q3: defaultValues?.q3 ?? ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await onSubmit(values);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Question
        label="どうしたらもっと自分の強みを活かせるだろうか？"
        value={values.q1}
        onChange={(value) => setValues((prev) => ({ ...prev, q1: value }))}
      />
      <Question
        label="もっとエネルギーが増えるような活動はできないだろうか？"
        value={values.q2}
        onChange={(value) => setValues((prev) => ({ ...prev, q2: value }))}
      />
      <Question
        label="エネルギーを消耗するような状況に効果的に対処するには、どうしたらよいだろうか？"
        value={values.q3}
        onChange={(value) => setValues((prev) => ({ ...prev, q3: value }))}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-green-300">保存しました</p> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? '保存中...' : '振り返りを保存'}
        </Button>
      </div>
    </form>
  );
}

interface QuestionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function Question({ label, value, onChange }: QuestionProps) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-100">{label}</label>
      <TextArea
        rows={3}
        className="mt-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
