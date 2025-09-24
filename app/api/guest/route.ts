import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function GET() {
  const res = NextResponse.json({ ok: true });
  const cookie = res.cookies.get('guest_id');
  if (!cookie) {
    const id = `guest_${randomUUID()}`;
    res.cookies.set('guest_id', id, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365
    });
    return NextResponse.json({ ok: true, guestId: id }, { headers: res.headers });
  }
  return res;
}

