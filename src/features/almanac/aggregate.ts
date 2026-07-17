import type { Application, StageEvent, SunlightEvent, Status } from "../../lib/types";
import { STATUS_LABELS } from "../../lib/types";
import { addDays, daysBetween, localDateString } from "../../lib/game/dates";

/** Pure aggregations for the almanac. UI stays thin; these are unit tested. */

const PIPELINE_ORDER: Status[] = [
  "planted",
  "outreach",
  "screening",
  "interviewing",
  "offer",
  "accepted",
];

export interface FunnelStep {
  status: Status;
  label: string;
  count: number;
}

/** How many applications ever reached each pipeline stage (a true funnel:
 *  monotonically non-increasing as stages advance). */
export function funnel(apps: Application[], events: StageEvent[]): FunnelStep[] {
  const furthest = new Map<string, number>();
  const consider = (appId: string, status: Status) => {
    const idx = PIPELINE_ORDER.indexOf(status);
    if (idx < 0) return;
    furthest.set(appId, Math.max(furthest.get(appId) ?? -1, idx));
  };
  for (const e of events) consider(e.application_id, e.to_status);
  for (const a of apps) consider(a.id, a.status);

  const reached = [...furthest.values()];
  return PIPELINE_ORDER.map((status, i) => ({
    status,
    label: STATUS_LABELS[status],
    count: reached.filter((v) => v >= i).length,
  }));
}

export interface SourceRate {
  source: string;
  total: number;
  responded: number;
  rate: number; // 0..1
}

// employer engaged at all — reached screening+ (growth_stage climbs) or replied
// with a rejection; ghosted/withdrawn are silence, not responses
function responded(app: Application): boolean {
  return app.growth_stage >= 1 || app.status === "rejected";
}

export function responseRateBySource(apps: Application[]): SourceRate[] {
  const groups = new Map<string, Application[]>();
  for (const app of apps) {
    const key = app.source ?? "unknown";
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(app);
  }
  return [...groups.entries()]
    .map(([source, group]) => {
      const respondedCount = group.filter(responded).length;
      return {
        source,
        total: group.length,
        responded: respondedCount,
        rate: group.length ? respondedCount / group.length : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface DayPoint {
  date: string;
  amount: number;
}

/** Daily Sunlight for the last `days` days, oldest first (zero-filled). */
export function sunlightOverTime(
  events: SunlightEvent[],
  days = 30,
  today = localDateString(),
): DayPoint[] {
  const byDay = new Map<string, number>();
  for (const e of events) byDay.set(e.occurred_on, (byDay.get(e.occurred_on) ?? 0) + e.amount);
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    out.push({ date, amount: byDay.get(date) ?? 0 });
  }
  return out;
}

export interface StageDuration {
  status: Status;
  label: string;
  avgDays: number;
  samples: number;
}

/** Average days an application spends in each stage before moving on,
 *  measured from consecutive stage_events. */
export function avgDaysPerStage(events: StageEvent[]): StageDuration[] {
  const byApp = new Map<string, StageEvent[]>();
  for (const e of events) {
    (byApp.get(e.application_id) ?? byApp.set(e.application_id, []).get(e.application_id)!).push(e);
  }

  const totals = new Map<Status, { days: number; samples: number }>();
  for (const appEvents of byApp.values()) {
    const ordered = [...appEvents].sort((a, b) => (a.occurred_at < b.occurred_at ? -1 : 1));
    for (let i = 1; i < ordered.length; i++) {
      const from = ordered[i - 1].to_status; // the stage they were sitting in
      const gap = daysBetween(ordered[i - 1].occurred_at.slice(0, 10), ordered[i].occurred_at.slice(0, 10));
      const acc = totals.get(from) ?? { days: 0, samples: 0 };
      acc.days += gap;
      acc.samples += 1;
      totals.set(from, acc);
    }
  }

  return PIPELINE_ORDER.filter((s) => totals.has(s)).map((status) => {
    const acc = totals.get(status)!;
    return {
      status,
      label: STATUS_LABELS[status],
      avgDays: acc.samples ? Math.round((acc.days / acc.samples) * 10) / 10 : 0,
      samples: acc.samples,
    };
  });
}
