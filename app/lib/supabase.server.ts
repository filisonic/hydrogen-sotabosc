import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Define a type for your Env if not already available globally
export interface SupabaseEnv {
  PUBLIC_SUPABASE_URL: string;
  PUBLIC_SUPABASE_ANON_KEY: string;
}

export function createClient(env: SupabaseEnv) {
  const supabaseUrl = env.PUBLIC_SUPABASE_URL;
  const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing');
  }

  // We are creating a standard server-side client. 
  // If you need SSR cookie management in Hydrogen later, you would integrate it here.
  // For now, since we are handling secure operations on the server side, 
  // the standard supabase-js client is sufficient.
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Since this runs on the server, we don't persist sessions locally
      autoRefreshToken: false,
    }
  });
}
