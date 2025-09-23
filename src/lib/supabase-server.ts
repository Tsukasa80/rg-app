import { cookies } from 'next/headers';
import { createServerActionClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// Use the helper return types to avoid generic mismatches
type ServerComponentClient = ReturnType<typeof createServerComponentClient>;
type ServerActionClient = ReturnType<typeof createServerActionClient>;

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are missing');
  }
  return { supabaseUrl, supabaseKey } as const;
}

// For Server Components (data fetching during render)
export function createSupabaseServerComponentClient(): ServerComponentClient {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseKey } = getEnv();
  return createServerComponentClient(
    { cookies: () => cookieStore },
    { supabaseUrl, supabaseKey }
  );
}

// For Server Actions / Route Handlers (mutations that may update auth cookies)
export function createSupabaseServerActionClient(): ServerActionClient {
  const cookieStore = cookies();
  const { supabaseUrl, supabaseKey } = getEnv();
  return createServerActionClient(
    { cookies: () => cookieStore },
    { supabaseUrl, supabaseKey }
  );
}
