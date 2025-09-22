'use client';

import { useState } from 'react';
import { cn } from '../../lib/cn';

export interface TabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  defaultTab?: string;
  onTabChange?: (id: string) => void;
}

export function Tabs({ tabs, defaultTab, onTabChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActive(tab.id);
              onTabChange?.(tab.id);
            }}
            className={cn(
              'flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              active === tab.id ? 'bg-green-500 text-white' : 'text-slate-300 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.map((tab) => (
          <div key={tab.id} className={cn(active === tab.id ? 'block' : 'hidden')}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
