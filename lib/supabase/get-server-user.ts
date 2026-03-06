import type { User } from '@supabase/supabase-js';

import { createSupabaseServerClient } from './server';

export async function getServerUser(): Promise<{ user: User } | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { user };
}
