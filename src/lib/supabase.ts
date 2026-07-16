import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Null when env vars are missing so the app renders a "not connected yet"
 * notice instead of crashing — keys are provided per environment
 * (.env.local locally, project env vars on Vercel), never committed.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
