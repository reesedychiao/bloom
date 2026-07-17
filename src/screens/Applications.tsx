import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useApplications } from "../lib/api/hooks";
import { STATUS_LABELS, STATUSES, type Status } from "../lib/types";
import { isTerminal } from "../lib/game/growth";

type Filter = "all" | "active" | Status;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  ...STATUSES.map((s) => ({ key: s as Filter, label: STATUS_LABELS[s] })),
];

export function Applications() {
  const { data: applications, isLoading } = useApplications();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (applications ?? []).filter((app) => {
      if (filter === "active" && isTerminal(app.status)) return false;
      if (filter !== "all" && filter !== "active" && app.status !== filter) return false;
      if (!q) return true;
      return (
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        (app.location?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [applications, query, filter]);

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← Garden
        </Link>
        <h1 className="text-lg text-ink">All applications</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="sticky top-0 z-10 -mx-4 bg-canvas px-4 pb-3 pt-1">
          <label className="relative block">
            <span className="sr-only">Search applications</span>
            <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist">
              ⌕
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, role, or location"
              className="w-full rounded-lg border border-line bg-surface py-2 pl-8 pr-3 text-sm text-ink placeholder:text-mist"
            />
          </label>
          <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                  filter === f.key ? "bg-leaf-deep text-parchment" : "border border-line text-ink-soft hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="mt-4 text-ink-soft">Loading…</p>
        ) : (applications ?? []).length === 0 ? (
          <p className="mt-4 text-ink-soft">Nothing planted yet.</p>
        ) : results.length === 0 ? (
          <p className="mt-6 text-center text-sm text-ink-soft">
            No flowers match{query ? ` “${query}”` : " that filter"}.
          </p>
        ) : (
          <ul className="mt-1 divide-y divide-line">
            {results.map((app) => (
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
                        isTerminal(app.status) ? "border-line text-mist" : "border-leaf/50 text-leaf"
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
