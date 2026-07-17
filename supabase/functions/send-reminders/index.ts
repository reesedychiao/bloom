// Reminder dispatch — called by pg_cron every 15 minutes (see 0004_cron.sql).
// Sends prep-task reminders at/after 9:00 in the user's timezone via web push
// (best-effort) and Resend email (reliable channel). Idempotent: a task is
// marked notified_at once any channel succeeds; total failure retries next tick.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

interface Settings {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  email: string | null;
  timezone: string;
  quiet_start: number | null;
  quiet_end: number | null;
}

interface DueTask {
  id: string;
  title: string;
  due_on: string;
  interviews: {
    scheduled_at: string;
    applications: { id: string; company: string; role: string } | null;
  } | null;
}

function localParts(timezone: string): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) % 24,
  };
}

function inQuietHours(hour: number, start: number | null, end: number | null): boolean {
  if (start === null || end === null) return false;
  // window may wrap midnight (e.g. 22 → 8)
  return start <= end ? hour >= start && hour < end : hour >= start || hour < end;
}

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "mailto:reminders@bloom.app",
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!,
  );

  const { data: allSettings, error: settingsError } = await supabase
    .from("notification_settings")
    .select("*");
  if (settingsError) return Response.json({ error: settingsError.message }, { status: 500 });

  let dispatched = 0;
  const results: Record<string, unknown>[] = [];

  for (const settings of (allSettings ?? []) as Settings[]) {
    const { date: localDate, hour } = localParts(settings.timezone);
    if (hour < 9) {
      results.push({ user: settings.user_id, skipped: "before 9:00 local", hour });
      continue;
    }
    if (inQuietHours(hour, settings.quiet_start, settings.quiet_end)) {
      results.push({ user: settings.user_id, skipped: "quiet hours", hour });
      continue;
    }

    const { data: tasks, error: taskError } = await supabase
      .from("prep_tasks")
      .select("id, title, due_on, interviews(scheduled_at, applications(id, company, role))")
      .eq("user_id", settings.user_id)
      .lte("due_on", localDate) // catches backlog, not just today
      .is("completed_at", null)
      .is("notified_at", null);
    if (taskError) {
      results.push({ user: settings.user_id, error: taskError.message });
      continue;
    }

    results.push({ user: settings.user_id, localDate, hour, dueTasks: (tasks ?? []).length });

    const { data: subscriptions } = settings.push_enabled
      ? await supabase.from("push_subscriptions").select("*").eq("user_id", settings.user_id)
      : { data: [] };

    for (const task of (tasks ?? []) as unknown as DueTask[]) {
      const app = task.interviews?.applications;
      const title = "Bloom — today’s tending";
      const body = app ? `${task.title} (${app.company} · ${app.role})` : task.title;
      const url = app ? `/flower/${app.id}` : "/";
      let delivered = false;

      for (const sub of subscriptions ?? []) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({ title, body, url }),
          );
          delivered = true;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            // subscription expired — prune it
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }

      if (settings.email_enabled && settings.email) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Bloom <onboarding@resend.dev>",
            to: [settings.email],
            subject: `🌱 ${task.title}`,
            text: `${body}\n\nDue ${task.due_on}. Open your garden to tick it off.`,
          }),
        });
        if (res.ok) delivered = true;
        else results.push({ task: task.id, resend: await res.text() });
      }

      if (delivered) {
        await supabase
          .from("prep_tasks")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", task.id);
        dispatched++;
      }
    }
  }

  return Response.json({ dispatched, settingsRows: (allSettings ?? []).length, results });
});
