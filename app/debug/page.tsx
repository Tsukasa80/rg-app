import Link from 'next/link';
import { cookies } from 'next/headers';
import { createSupabaseServerComponentClient } from '@/lib/supabase-server';
import { OFFLINE_MODE } from '@/lib/local-db';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
  const cookieStore = cookies();
  const guestId = cookieStore.get('guest_id')?.value ?? null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasEnv = Boolean(supabaseUrl && supabaseAnon);

  let dbReachable = false;
  let entriesCount: number | null = null;
  let dbError: string | null = null;
  try {
    if (hasEnv && !OFFLINE_MODE) {
      const supabase = createSupabaseServerComponentClient();
      const { count, error } = await supabase
        .from('activity_entries')
        .select('*', { count: 'exact', head: true })
        .limit(1);
      if (error) {
        dbError = error.message;
      } else {
        dbReachable = true;
        entriesCount = count ?? 0;
      }
    }
  } catch (e: any) {
    dbError = e?.message ?? String(e);
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-white">Debug / Connectivity</h1>
      <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm">
        <p><span className="text-slate-400">OFFLINE_MODE:</span> <span className="text-white">{String(OFFLINE_MODE)}</span></p>
        <p><span className="text-slate-400">guest_id cookie:</span> <span className="text-white">{guestId ?? 'none'}</span></p>
        <p><span className="text-slate-400">Env present (URL/ANON):</span> <span className="text-white">{String(hasEnv)}</span></p>
        <p><span className="text-slate-400">DB reachable:</span> <span className="text-white">{String(dbReachable)}</span></p>
        {entriesCount !== null ? (
          <p><span className="text-slate-400">activity_entries count (visible rows):</span> <span className="text-white">{entriesCount}</span></p>
        ) : null}
        {dbError ? (
          <p className="text-red-400">DB error: {dbError}</p>
        ) : null}
      </div>

      <div>
        <Link href="/" className="text-green-400 hover:text-green-300">← Back to Home</Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
        <p>To enable persistence on Vercel:</p>
        <ul className="list-disc pl-5">
          <li>Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>Set SUPABASE_SERVICE_ROLE_KEY (server only)</li>
          <li>Run supabase/schema.sql and supabase/policies.sql in your Supabase project</li>
          <li>Use a consistent production domain when installing the PWA</li>
        </ul>
      </div>
    </div>
  );
}
