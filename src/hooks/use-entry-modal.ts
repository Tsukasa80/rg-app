'use client';

import { useState } from 'react';
import type { ActivityEntry } from '../lib/types';

export function useEntryModal() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityEntry | null>(null);

  function showCreate() {
    setEditing(null);
    setOpen(true);
  }

  function showEdit(entry: ActivityEntry) {
    setEditing(entry);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  return {
    open,
    editing,
    showCreate,
    showEdit,
    close
  };
}
