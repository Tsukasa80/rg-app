"use client";

import { useRef, useState } from 'react';
import { Button } from './ui/button';

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('エクスポートに失敗しました');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rg-exercise-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('エクスポートしました');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'エクスポートに失敗しました');
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const text = await file.text();
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'インポートに失敗しました');
      }
      setMessage('インポートしました（最新データを読み込むには再読込してください）');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'インポートに失敗しました');
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white">データ管理</h3>
        <p className="text-xs text-slate-400">JSONエクスポート/インポートでバックアップできます。</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleExport} disabled={busy}>
          エクスポート
        </Button>
        <Button type="button" variant="secondary" disabled={busy} onClick={() => fileInputRef.current?.click()}>
          インポート
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      </div>
      {message ? <p className="text-xs text-green-300">{message}</p> : null}
    </div>
  );
}
