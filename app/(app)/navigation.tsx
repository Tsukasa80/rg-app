"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/', label: 'ホーム' },
  { href: '/history', label: '履歴' },
  { href: '/weekly', label: '週次' },
  { href: '/dashboard', label: 'ダッシュボード' }
];

export function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 p-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition',
            pathname === item.href ? 'bg-green-500 text-white shadow-inner' : 'hover:text-white'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
