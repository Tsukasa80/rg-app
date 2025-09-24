"use client";

import { useEffect } from 'react';

export function PwaProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((error) => console.error('Service worker registration failed', error));
    }
  }, []);

  return null;
}
