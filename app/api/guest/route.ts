import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const preferId = url.searchParams.get('id');
  const cookieStore = cookies();
  const existing = cookieStore.get('guest_id')?.value;

  // 既存Cookieを優先
  if (existing) {
    return NextResponse.json({ ok: true, guestId: existing, source: 'cookie' });
  }

  // クライアント側の保持IDがあればそれを復元
  if (preferId && /^guest_[a-f0-9\-]{8,}$/i.test(preferId)) {
    const res = NextResponse.json({ ok: true, guestId: preferId, source: 'client' });
    res.cookies.set('guest_id', preferId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365
    });
    return res;
  }

  // どちらも無い場合は新規発行
  const id = `guest_${randomUUID()}`;
  const res = NextResponse.json({ ok: true, guestId: id, source: 'new' });
  res.cookies.set('guest_id', id, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365
  });
  return res;
}
