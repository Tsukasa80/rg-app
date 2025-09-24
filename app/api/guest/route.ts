import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const existing = cookieStore.get('guest_id')?.value;
  if (existing) {
    return NextResponse.json({ ok: true, guestId: existing });
  }
  const id = `guest_${randomUUID()}`;
  const res = NextResponse.json({ ok: true, guestId: id });
  res.cookies.set('guest_id', id, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365
  });
  return res;
}
