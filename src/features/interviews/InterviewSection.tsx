import { useState, type FormEvent } from "react";
import {
  useCompletePrepTask,
  useCreateInterview,
  useInterviews,
  useSetInterviewOutcome,
} from "../../lib/api/hooks";
import { downloadIcs } from "../../lib/ics";
import { DateTimePicker } from "../../components/DateTimePicker";
import {
  INTERVIEW_KIND_LABELS,
  type Application,
  type InterviewKind,
  type InterviewWithPrep,
} from "../../lib/types";

export function InterviewSection({ app }: { app: Application }) {
  const { data: interviews } = useInterviews(app.id);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-ink">Interviews</h2>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink hover:border-leaf"
        >
          {formOpen ? "Close" : "Schedule interview"}
        </button>
      </div>

      {formOpen && <InterviewForm app={app} onDone={() => setFormOpen(false)} />}

      {(interviews ?? []).length === 0 && !formOpen && (
        <p className="mt-3 text-sm text-ink-soft">
          None yet. When one lands, Bloom builds your prep checklist automatically.
        </p>
      )}

      <ul className="mt-4 space-y-4">
        {(interviews ?? []).map((interview) => (
          <InterviewCard key={interview.id} app={app} interview={interview} />
        ))}
      </ul>
    </section>
  );
}

function InterviewForm({ app, onDone }: { app: Application; onDone: () => void }) {
  const create = useCreateInterview(app.id);
  const [scheduledAt, setScheduledAt] = useState("");
  const [kind, setKind] = useState<InterviewKind>("recruiter");
  const [locationOrLink, setLocationOrLink] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      {
        application_id: app.id,
        scheduled_at: new Date(scheduledAt).toISOString(),
        kind,
        location_or_link: locationOrLink.trim() || undefined,
      },
      { onSuccess: () => onDone() },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-col gap-1 text-sm text-ink">
        When
        <DateTimePicker value={scheduledAt} onChange={setScheduledAt} required />
      </div>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Kind
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as InterviewKind)}
          className="rounded-lg border border-line bg-canvas px-3 py-2 text-ink"
        >
          {Object.entries(INTERVIEW_KIND_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <input
        aria-label="Location or link"
        placeholder="Location or meeting link"
        value={locationOrLink}
        onChange={(e) => setLocationOrLink(e.target.value)}
        className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mist"
      />
      {create.isError && (
        <p role="alert" className="text-sm text-petal">
          {(create.error as Error).message}
        </p>
      )}
      <button
        type="submit"
        disabled={create.isPending}
        className="self-start rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-parchment hover:opacity-90 disabled:opacity-60"
      >
        {create.isPending ? "Scheduling…" : "Schedule + build prep list"}
      </button>
    </form>
  );
}

function exportIcs(app: Application, interview: InterviewWithPrep) {
  downloadIcs(
    {
      uid: `${interview.id}@bloom`,
      title: `${interview.kind ? INTERVIEW_KIND_LABELS[interview.kind] : "Interview"} — ${app.company}`,
      startsAt: new Date(interview.scheduled_at),
      location: interview.location_or_link ?? undefined,
      description: `${app.role} at ${app.company}. Tend your garden: review the prep checklist in Bloom.`,
    },
    `bloom-${app.company.toLowerCase().replace(/\s+/g, "-")}.ics`,
  );
}

function InterviewCard({ app, interview }: { app: Application; interview: InterviewWithPrep }) {
  const completeTask = useCompletePrepTask(app);
  const setOutcome = useSetInterviewOutcome(app.id);
  const when = new Date(interview.scheduled_at);
  const done = interview.prep_tasks.filter((t) => t.completed_at).length;

  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-ink">
          {interview.kind ? INTERVIEW_KIND_LABELS[interview.kind] : "Interview"}
        </span>
        <span className="font-mono text-xs text-ink-soft">
          {when.toLocaleString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
        {interview.location_or_link && (
          <span className="truncate font-mono text-xs text-ink-soft">{interview.location_or_link}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportIcs(app, interview)}
            className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-soft hover:text-ink"
          >
            Add to calendar
          </button>
          <select
            aria-label="Outcome"
            value={interview.outcome}
            onChange={(e) =>
              setOutcome.mutate({ id: interview.id, outcome: e.target.value as never })
            }
            className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs text-ink"
          >
            <option value="pending">Pending</option>
            <option value="passed">Passed</option>
            <option value="failed">Didn’t pass</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {interview.prep_tasks.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-xs text-ink-soft">
            Prep · {done}/{interview.prep_tasks.length}
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {interview.prep_tasks.map((task) => {
              const checked = task.completed_at !== null;
              return (
                <li key={task.id} className="flex items-start gap-2">
                  <input
                    id={`prep-${task.id}`}
                    type="checkbox"
                    checked={checked}
                    disabled={checked || completeTask.isPending}
                    onChange={() => completeTask.mutate(task)}
                    className="mt-1 h-4 w-4 accent-leaf"
                  />
                  <label
                    htmlFor={`prep-${task.id}`}
                    className={`text-sm ${checked ? "text-ink-soft line-through" : "text-ink"}`}
                  >
                    {task.title}
                    <span className="ml-2 font-mono text-xs text-ink-soft">
                      {new Date(`${task.due_on}T12:00:00`).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · +{task.sunlight_reward} ☀
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
