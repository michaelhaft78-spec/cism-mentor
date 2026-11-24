import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_STATE } from './initial-state';
import { DOMAIN_KEYS, normalizeState } from './state';
import type { CismState } from './types';

/** Haalt de state op; maakt hem aan met de startstatus als hij nog niet bestaat. */
export async function getOrCreateState(supabase: SupabaseClient, userId: string): Promise<CismState> {
  const { data, error } = await supabase
    .from('user_cism_state')
    .select('state_data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(`State ophalen mislukt: ${error.message}`);

  if (data?.state_data) {
    // Vul ontbrekende velden aan met de startstatus, daarna normaliseren.
    const stored = data.state_data as Partial<CismState>;
    const domains = { ...INITIAL_STATE.domains };
    for (const key of DOMAIN_KEYS) domains[key] = { ...INITIAL_STATE.domains[key], ...(stored.domains?.[key] ?? {}) };
    const base: CismState = {
      user_profile: { ...INITIAL_STATE.user_profile, ...(stored.user_profile ?? {}) },
      domains,
      error_analytics: { ...INITIAL_STATE.error_analytics, ...(stored.error_analytics ?? {}) },
      weekly_intel_log: Array.isArray(stored.weekly_intel_log) ? stored.weekly_intel_log : [],
      progress_history: Array.isArray(stored.progress_history) ? stored.progress_history : [],
    };
    return normalizeState(base, base);
  }

  const { error: insertError } = await supabase
    .from('user_cism_state')
    .insert({ user_id: userId, state_data: INITIAL_STATE });
  if (insertError) throw new Error(`Startstatus opslaan mislukt: ${insertError.message}`);
  return INITIAL_STATE;
}

export async function saveState(supabase: SupabaseClient, userId: string, state: CismState) {
  const { error } = await supabase
    .from('user_cism_state')
    .upsert({ user_id: userId, state_data: state, updated_at: new Date().toISOString() });
  if (error) throw new Error(`State opslaan mislukt: ${error.message}`);
}
