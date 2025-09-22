import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PwaProvider } from '@/components/pwa-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Red & Green Exercise Tracker',
  description:
    'Capture and review energy-giving (green) and energy-draining (red) activities with weekly reflections.',
  manifest: '/manifest.webmanifest',
  icons: {
    apple: '/icons/icon-192x192.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#29a36a'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="bg-slate-950 text-slate-100">
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <PwaProvider />
          {children}
        </div>
      </body>
    </html>
  );
}
