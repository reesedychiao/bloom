import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ensureNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from "../lib/api/settings";
import { getPushStatus, subscribeToPush, unsubscribeFromPush, type PushStatus } from "../lib/push";
import { useUI } from "../stores/ui";

const SETTINGS_KEY = ["settings", "notifications"] as const;

export function Settings() {
  const { data: settings } = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: ensureNotificationSettings,
  });

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← Garden
        </Link>
        <h1 className="text-lg text-ink">Settings</h1>
      </header>

      <main className="mx-auto max-w-md px-6 py-8">
        <h2 className="text-xl text-ink">Reminders</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Prep-task reminders arrive at 9:00 your time on their due day.
        </p>

        {settings ? <ReminderControls settings={settings} /> : <p className="mt-4 text-ink-soft">Loading…</p>}
      </main>
    </div>
  );
}

function ReminderControls({ settings }: { settings: NotificationSettings }) {
  const queryClient = useQueryClient();
  const pushToast = useUI((s) => s.pushToast);
  const [pushStatus, setPushStatus] = useState<PushStatus>("unsupported");

  useEffect(() => {
    getPushStatus().then(setPushStatus);
  }, []);

  const update = useMutation({
    mutationFn: (patch: Partial<NotificationSettings>) =>
      updateNotificationSettings(settings.id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });

  const togglePushDevice = useMutation({
    mutationFn: async () => {
      if (pushStatus === "subscribed") {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush();
      }
      return getPushStatus();
    },
    onSuccess: (status) => {
      setPushStatus(status);
      pushToast(
        status === "subscribed" ? "This device will get push reminders" : "Push off for this device",
        "notice",
      );
    },
    onError: (err) => pushToast((err as Error).message, "notice"),
  });

  return (
    <div className="mt-6 flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink">Push notifications</h3>
            <p className="mt-0.5 text-xs text-ink-soft">
              {pushStatus === "unsupported" && "This browser doesn’t support push."}
              {pushStatus === "denied" && "Blocked in browser settings."}
              {pushStatus === "subscribed" && "This device is subscribed."}
              {pushStatus === "unsubscribed" && "This device isn’t subscribed yet."}
              {" "}On iPhone, install Bloom to your home screen first.
            </p>
          </div>
          <button
            type="button"
            disabled={
              pushStatus === "unsupported" || pushStatus === "denied" || togglePushDevice.isPending
            }
            onClick={() => togglePushDevice.mutate()}
            className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:border-leaf disabled:opacity-50"
          >
            {pushStatus === "subscribed" ? "Unsubscribe" : "Enable on this device"}
          </button>
        </div>
        <Toggle
          label="Send push reminders"
          checked={settings.push_enabled}
          onChange={(v) => update.mutate({ push_enabled: v })}
        />
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold text-ink">Email fallback</h3>
        <p className="mt-0.5 text-xs text-ink-soft">The reliable channel — lands even when push doesn’t.</p>
        <Toggle
          label="Send email reminders"
          checked={settings.email_enabled}
          onChange={(v) => update.mutate({ email_enabled: v })}
        />
        <input
          aria-label="Reminder email address"
          type="email"
          defaultValue={settings.email ?? ""}
          onBlur={(e) => e.target.value !== settings.email && update.mutate({ email: e.target.value })}
          className="mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
        />
      </section>

      <p className="font-mono text-xs text-ink-soft">
        Timezone: {settings.timezone}
        {settings.timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone && (
          <button
            type="button"
            onClick={() =>
              update.mutate({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
            }
            className="ml-2 text-leaf underline"
          >
            update to {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </button>
        )}
      </p>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mt-3 flex items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-leaf"
      />
      {label}
    </label>
  );
}
