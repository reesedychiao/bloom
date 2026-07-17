import { useState } from "react";
import { Link, useParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  useAdvanceStatus,
  useApplication,
  useLogTouch,
  useMarkGhosted,
  useStageEvents,
} from "../lib/api/hooks";
import { isTerminal } from "../lib/game/growth";
import { daysBetween, localDateString } from "../lib/game/dates";
import {
  STATUS_LABELS,
  STATUSES,
  type Application,
  type StageEvent,
  type Status,
} from "../lib/types";
import { Flower } from "../assets/flowers/Flower";
import { CompostDialog } from "../features/compost/CompostDialog";
import { InterviewSection } from "../features/interviews/InterviewSection";

export function FlowerDetail() {
  const { id = "" } = useParams();
  const { data: app, isLoading } = useApplication(id);
  const { data: events } = useStageEvents(id);
  const [compostOpen, setCompostOpen] = useState(false);

  if (isLoading) {
    return <p className="p-8 text-ink-soft">Fetching your flower…</p>;
  }
  if (!app) {
    return (
      <div className="p-8">
        <p className="text-ink-soft">This flower isn’t in your garden.</p>
        <Link to="/" className="text-leaf underline">
          Back to the garden
        </Link>
      </div>
    );
  }

  const wilted = isTerminal(app.status);
  const idleDays = daysBetween(app.last_activity_at.slice(0, 10), localDateString());

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line px-5 py-4">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← Garden
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${app.growth_stage}-${wilted}`}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={wilted ? { filter: "saturate(0.35)", rotate: "3deg", opacity: 0.85 } : undefined}
            >
              <Flower species={app.species} stage={app.growth_stage} className="h-56 w-40" />
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <h1 className="text-3xl text-ink">{app.company}</h1>
            <p className="mt-1 text-lg text-ink-soft">{app.role}</p>
            <p className="mt-2 font-mono text-xs text-ink-soft">
              {[app.location, app.source && `via ${app.source}`, app.applied_at]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {app.url && (
              <a
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-leaf underline"
              >
                Job posting
              </a>
            )}

            <StatusControls app={app} onCompost={() => setCompostOpen(true)} />
          </div>
        </div>

        {!wilted && idleDays >= 21 && <GhostBanner app={app} idleDays={idleDays} />}

        {app.notes && (
          <section className="mt-8 rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold text-ink">Notes</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{app.notes}</p>
          </section>
        )}

        <InterviewSection app={app} />

        <section className="mt-10">
          <h2 className="text-lg text-ink">Growth so far</h2>
          <Vine events={events ?? []} />
        </section>
      </main>

      <CompostDialog app={app} open={compostOpen} onClose={() => setCompostOpen(false)} />
    </div>
  );
}

function StatusControls({ app, onCompost }: { app: Application; onCompost: () => void }) {
  const advance = useAdvanceStatus(app);
  const logTouch = useLogTouch(app);
  const wilted = isTerminal(app.status);

  function handleStatusChange(status: Status) {
    if (status === "rejected") {
      onCompost();
    } else {
      advance.mutate(status);
    }
  }

  return (
    <div className="mt-4">
      <div>
        <label htmlFor="status" className="mr-2 text-sm text-ink">
          Stage
        </label>
        <select
          id="status"
          value={app.status}
          disabled={advance.isPending}
          onChange={(e) => handleStatusChange(e.target.value as Status)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-ink"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {!wilted && (
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            disabled={logTouch.isPending}
            onClick={() => logTouch.mutate("outreach")}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:border-leaf disabled:opacity-60"
          >
            Log outreach <span className="font-mono text-xs text-marigold">+15 ☀</span>
          </button>
          <button
            type="button"
            disabled={logTouch.isPending}
            onClick={() => logTouch.mutate("followup")}
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:border-leaf disabled:opacity-60"
          >
            Log follow-up <span className="font-mono text-xs text-marigold">+10 ☀</span>
          </button>
        </div>
      )}
    </div>
  );
}

function GhostBanner({ app, idleDays }: { app: Application; idleDays: number }) {
  const ghost = useMarkGhosted(app);
  return (
    <section className="mt-8 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-ink-soft">
        {idleDays} days of quiet. You can let this one rest — the garden keeps what it taught you.
      </p>
      <button
        type="button"
        disabled={ghost.isPending}
        onClick={() => ghost.mutate()}
        className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-soft hover:text-ink disabled:opacity-60"
      >
        Mark ghosted
      </button>
    </section>
  );
}

/** The stage timeline as a growing vine: a leaf node per event. */
function Vine({ events }: { events: StageEvent[] }) {
  if (events.length === 0) {
    return <p className="mt-3 text-sm text-ink-soft">No growth recorded yet.</p>;
  }
  return (
    <ol className="mt-4 border-l-2 border-leaf/60 pl-5">
      {events.map((event) => (
        <li key={event.id} className="relative pb-6 last:pb-0">
          <svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="absolute -left-6.75 top-1 h-3.5 w-3.5"
          >
            <path
              d="M1 11 Q1 3 11 1 Q11 9 3 11 Z"
              fill="var(--leaf)"
              stroke="var(--soil)"
              strokeWidth="0.8"
            />
          </svg>
          <p className="text-sm text-ink">
            {event.from_status
              ? `${STATUS_LABELS[event.from_status]} → ${STATUS_LABELS[event.to_status]}`
              : "Seed planted"}
          </p>
          <p className="font-mono text-xs text-ink-soft">
            {new Date(event.occurred_at).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {event.note && <p className="mt-1 text-sm text-ink-soft">“{event.note}”</p>}
        </li>
      ))}
    </ol>
  );
}
