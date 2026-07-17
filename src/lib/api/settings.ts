import { supabase } from "../supabase";

export interface NotificationSettings {
  id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  email: string | null;
  timezone: string;
  quiet_start: number | null;
  quiet_end: number | null;
}

function client() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

/** Fetch the settings row, creating it with sensible defaults on first visit
 *  (your auth email, the browser's timezone). */
export async function ensureNotificationSettings(): Promise<NotificationSettings> {
  const c = client();
  const { data: existing, error } = await c.from("notification_settings").select("*").maybeSingle();
  if (error) throw error;
  if (existing) return existing as NotificationSettings;

  const { data: session } = await c.auth.getSession();
  const { data: created, error: insertError } = await c
    .from("notification_settings")
    .insert({
      email: session.session?.user.email ?? null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    .select()
    .single();
  if (insertError) throw insertError;
  return created as NotificationSettings;
}

export async function updateNotificationSettings(
  id: string,
  patch: Partial<Omit<NotificationSettings, "id">>,
): Promise<void> {
  const { error } = await client().from("notification_settings").update(patch).eq("id", id);
  if (error) throw error;
}
