"use client";

import { useCallback, useEffect, useState, useTransition } from 'react';
import { formatISO } from 'date-fns';
import { ActivityList } from '@/components/activity-list';
import { HistoryFilters } from '@/components/history-filters';
import type { ActivityEntry } from '@/lib/types';
import { useActivityFilters } from '@/hooks/use-activity-filters';
import { fetchActivities, updateActivity, deleteActivity } from '@/server/activity-service';
import { ActivityEntryForm, type ActivityEntryFormValues } from '@/components/activity-entry-form';
import { Modal } from '@/components/ui/modal';

interface HistoryClientProps {
  userId: string;
  initialEntries: ActivityEntry[];
  initialRange: { from: string; to: string };
}

export function HistoryClient({ userId, initialEntries, initialRange }: HistoryClientProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>(initialEntries);
  const [updatePending, setUpdatePending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { state, setState } = useActivityFilters();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityEntry | null>(null);

  useEffect(() => {
    setState({ from: initialRange.from, to: initialRange.to });
  }, [initialRange.from, initialRange.to, setState]);

  const refresh = useCallback(() => {
    startTransition(async () => {
      const next = await fetchActivities(userId, {
        from: state.from ? formatISO(new Date(`${state.from}T00:00:00`)) : undefined,
        to: state.to ? formatISO(new Date(`${state.to}T23:59:59`)) : undefined,
        types: state.types,
        energyScores: state.energyScores,
        tags: state.tags,
        search: state.search
      });
      setEntries(next);
    });
  }, [startTransition, state.energyScores, state.from, state.search, state.tags, state.to, state.types, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleEdit(entry: ActivityEntry) {
    setEditing(entry);
    setModalOpen(true);
  }

  function handleDelete(entry: ActivityEntry) {
    startTransition(async () => {
      await deleteActivity(userId, entry.id);
      refresh();
    });
  }

  function handleClose() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleUpdate(values: ActivityEntryFormValues) {
    if (!editing) return;
    setUpdatePending(true);
    try {
      await updateActivity(userId, editing.id, {
        title: values.title,
        note: values.note,
        energyScore: values.energyScore,
        type: values.type,
        durationMin: values.durationMin,
        tags: values.tags,
        occurredAt: values.occurredAt
      });
      handleClose();
      refresh();
    } finally {
      setUpdatePending(false);
    }
  }

  return (
    <div className="space-y-6">
      <HistoryFilters onChange={refresh} />
      {isPending ? <p className="text-sm text-slate-400">読み込み中...</p> : null}
      <ActivityList entries={entries} onEdit={handleEdit} onDelete={handleDelete} />
      <Modal
        open={modalOpen}
        onClose={handleClose}
        title="記録を編集する"
        description="活動内容とエネルギー指標を更新できます"
      >
        {editing ? (
          <ActivityEntryForm
            initialValues={{
              title: editing.title,
              note: editing.note ?? '',
              energyScore: editing.energyScore,
              type: editing.type,
              durationMin: editing.durationMin,
              tags: editing.tags,
              occurredAt: editing.occurredAt
            }}
            onSubmit={handleUpdate}
            submitting={updatePending}
          />
        ) : null}
      </Modal>
    </div>
  );
}
