"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { createSupabaseBrowserClient } from '../../lib/supabase-browser';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'サインインに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuthサインインに失敗しました');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200">メールアドレス</label>
          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200">パスワード</label>
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
        </div>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '処理中...' : 'サインイン'}
        </Button>
      </form>
      <div className="relative">
        <div className="my-4 flex items-center text-xs text-slate-500 before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">
          <span className="px-2">または</span>
        </div>
        <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle} disabled={loading}>
          Googleでサインイン
        </Button>
      </div>
    </div>
  );
}
