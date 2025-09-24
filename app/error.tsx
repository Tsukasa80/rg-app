"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="m-6 space-y-4 rounded-2xl border border-red-800 bg-red-900/20 p-6 text-sm text-red-200">
      <h2 className="text-lg font-semibold text-red-300">エラーが発生しました</h2>
      {error?.message ? <p className="whitespace-pre-wrap">{error.message}</p> : null}
      {error?.stack ? (
        <details className="mt-2">
          <summary>スタックトレース</summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs text-red-300">{error.stack}</pre>
        </details>
      ) : null}
      <div className="pt-2">
        <button
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
          onClick={() => reset()}
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}

