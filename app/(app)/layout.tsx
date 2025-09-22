import type { ReactNode } from 'react';
import { Navigation } from './navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Red & Green Exercise</h1>
          <p className="text-sm text-slate-400">活力と消耗を可視化し、週次の洞察につなげる</p>
        </div>
        <Navigation />
      </header>
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
