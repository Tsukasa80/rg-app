"use client";

import { useEffect } from 'react';

export function GuestProvider() {
  useEffect(() => {
    try {
      const hasGuest = typeof document !== 'undefined' && document.cookie.includes('guest_id=');
      if (!hasGuest) {
        fetch('/api/guest').catch(() => {});
      }
    } catch {}
  }, []);
  return null;
}

