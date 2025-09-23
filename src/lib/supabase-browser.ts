import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
type BrowserClient = ReturnType<typeof createBrowserSupabaseClient>;

let browserClient: BrowserClient | undefined;

export function createSupabaseBrowserClient(): BrowserClient {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or anon key is missing');
  }

  const client = createBrowserSupabaseClient({
    supabaseUrl,
    supabaseKey
  });

  browserClient = client;

  return browserClient;
}
