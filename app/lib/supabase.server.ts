import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface SupabaseEnv {
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export function createClient(env: SupabaseEnv) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Service-role client for trusted server operations (webhooks, cron). */
export function createAdminClient(env: SupabaseEnv) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase admin environment variables are missing');
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
