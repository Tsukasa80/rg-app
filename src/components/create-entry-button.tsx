"use client";

import { useState, useTransition } from 'react';
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

  function handleSubmit(values: ActivityEntryFormValues) {
    startTransition(async () => {
      await createActivity(userId, values);
      setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg">
        すぐに記録する
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="活動を記録する"
        description="Green / Red を選び、エネルギー指標をセット"
        footer={null}
      >
        <ActivityEntryForm submitting={isPending} onSubmit={handleSubmit} />
      </Modal>
    </>
  );
}
