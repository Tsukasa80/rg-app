import { NextResponse } from 'next/server';
import { createSupabaseServerActionClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_code', request.url));
  }

  const supabase = createSupabaseServerActionClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${error.message}`, request.url));
  }

  return NextResponse.redirect(new URL('/', request.url));
}

