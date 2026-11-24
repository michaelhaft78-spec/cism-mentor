import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client: omzeilt RLS. ALLEEN gebruiken in de cron-route,
 * nooit met een user-id uit een request body.
 */
export function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
