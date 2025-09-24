"use client";

import { useEffect, useState, useTransition } from 'react';
import { ActivityEntryForm, type ActivityEntryFormValues } from './activity-entry-form';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { createActivity } from '../server/activity-service';

export interface CreateEntryButtonProps {
  userId: string;
}

export function CreateEntryButton({ userId }: CreateEntryButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [effectiveUserId, setEffectiveUserId] = useState<string>(userId);

  // Ensure guest cookie exists and prefer it as the effective user id
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/guest', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { ok: boolean; guestId?: string };
        if (!cancelled && data?.guestId) setEffectiveUserId(data.guestId);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(values: ActivityEntryFormValues) {
    startTransition(async () => {
      await createActivity(effectiveUserId, values);
      setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg">
        記録を追加する
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="新しい記録を追加"
        description="Green / Red を選び、エネルギー指標をセット"
        footer={null}
      >
        <ActivityEntryForm submitting={isPending} onSubmit={handleSubmit} />
      </Modal>
    </>
  );
}