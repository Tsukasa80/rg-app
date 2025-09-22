'use server';

import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '../lib/supabase-server';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}
