"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="m-6 space-y-4 rounded-2xl border border-red-800 bg-red-900/20 p-6 text-sm text-red-200">
          <h2 className="text-lg font-semibold text-red-300">致命的なエラーが発生しました</h2>
          <p className="opacity-80">{error?.message || 'Unknown error'}</p>
          <div className="pt-2">
            <button
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
              onClick={() => reset()}
            >
              再試行
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

