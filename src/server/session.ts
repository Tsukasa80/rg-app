'use server';

import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { createSupabaseServerComponentClient } from '../lib/supabase-server';

// 既存互換: 必要時にSupabaseのユーザー情報を取得
export async function getCurrentUser() {
  const supabase = createSupabaseServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

// サインイン不要運用: 実効ユーザーID（サインイン済み or ゲストID）を返す
export async function getUserIdOrGuest(): Promise<string> {
  const user = await getCurrentUser();
  if (user?.id) return user.id;

  const existing = cookies().get('guest_id')?.value;
  if (existing) return existing;

  // ここではCookieは設定せず、そのまま使うIDを返すだけにする。
  // Cookieの発行は middleware で行う（Next.jsの制約に対応）。
  return `guest_${randomUUID()}`;
}
