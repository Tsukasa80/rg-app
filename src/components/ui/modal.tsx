'use client';

import { useEffect } from 'react';
import { cn } from '../../lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (open) {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
    return undefined;
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-xl">
        <button
          type="button"
          className="absolute right-4 top-4 text-slate-400 transition hover:text-white"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <div className="px-6 pb-4 pt-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        <div className={cn('px-6 pb-6', footer ? 'space-y-4' : 'pb-8')}>{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-slate-800 bg-slate-900/60 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
