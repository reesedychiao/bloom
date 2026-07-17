import { Link } from "react-router";
import { useApplications } from "../lib/api/hooks";
import { STATUS_LABELS } from "../lib/types";
import { isTerminal } from "../lib/game/growth";

export function Applications() {
  const { data: applications, isLoading } = useApplications();

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← Garden
        </Link>
        <h1 className="text-lg text-ink">All applications</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {isLoading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : (applications ?? []).length === 0 ? (
          <p className="text-ink-soft">Nothing planted yet.</p>
        ) : (
          <ul className="divide-y divide-(--border)">
            {applications!.map((app) => (
              <li key={app.id}>
                <Link
                  to={`/flower/${app.id}`}
                  className="flex items-center justify-between gap-3 px-2 py-3 hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{app.company}</p>
                    <p className="truncate text-sm text-ink-soft">{app.role}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        isTerminal(app.status)
                          ? "border-line text-mist"
                          : "border-leaf/50 text-leaf"
                      }`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                    <p className="mt-1 font-mono text-xs text-ink-soft">
                      {new Date(app.last_activity_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
