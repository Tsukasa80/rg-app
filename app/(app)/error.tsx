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
    <div className="m-6 space-y-4 rounded-2xl border border-yellow-800 bg-yellow-900/20 p-6 text-sm text-yellow-100">
      <h2 className="text-lg font-semibold text-yellow-300">ページ内でエラーが発生しました</h2>
      {error?.message ? <p className="whitespace-pre-wrap">{error.message}</p> : null}
      <div className="pt-2">
        <button
          className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-500"
          onClick={() => reset()}
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}

