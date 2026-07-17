import { describe, expect, it } from "vitest";
import { avgDaysPerStage, funnel, responseRateBySource, sunlightOverTime } from "./aggregate";
import type { Application, StageEvent, SunlightEvent } from "../../lib/types";

function app(over: Partial<Application>): Application {
  return {
    id: "a",
    created_at: "2026-07-01T00:00:00Z",
    company: "Co",
    role: "Role",
    url: null,
    source: null,
    location: null,
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    species: "sunflower",
    is_dream: false,
    tailored: false,
    status: "planted",
    growth_stage: 0,
    notes: null,
    applied_at: null,
    last_activity_at: "2026-07-01T00:00:00Z",
    ...over,
  };
}

function ev(over: Partial<StageEvent>): StageEvent {
  return {
    id: Math.random().toString(),
    application_id: "a",
    from_status: null,
    to_status: "planted",
    occurred_at: "2026-07-01T00:00:00Z",
    note: null,
    ...over,
  };
}

describe("funnel", () => {
  it("is monotonically non-increasing and counts furthest stage reached", () => {
    const apps = [
      app({ id: "1", status: "interviewing" }),
      app({ id: "2", status: "screening" }),
      app({ id: "3", status: "planted" }),
    ];
    const events = [
      ev({ application_id: "1", to_status: "screening" }),
      ev({ application_id: "1", to_status: "interviewing" }),
      ev({ application_id: "2", to_status: "screening" }),
    ];
    const f = funnel(apps, events);
    expect(f.find((s) => s.status === "planted")!.count).toBe(3);
    expect(f.find((s) => s.status === "screening")!.count).toBe(2);
    expect(f.find((s) => s.status === "interviewing")!.count).toBe(1);
    expect(f.find((s) => s.status === "offer")!.count).toBe(0);
    // never increases down the funnel
    const counts = f.map((s) => s.count);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });
});

describe("responseRateBySource", () => {
  it("counts employer engagement (including rejections), not ghosting", () => {
    const apps = [
      app({ id: "1", source: "linkedin", status: "screening", growth_stage: 1 }),
      app({ id: "2", source: "linkedin", status: "ghosted", growth_stage: 0 }),
      app({ id: "3", source: "referral", status: "rejected", growth_stage: 0 }),
    ];
    const rates = responseRateBySource(apps);
    const linkedin = rates.find((r) => r.source === "linkedin")!;
    expect(linkedin.total).toBe(2);
    expect(linkedin.responded).toBe(1);
    expect(linkedin.rate).toBe(0.5);
    expect(rates.find((r) => r.source === "referral")!.rate).toBe(1);
  });
});

describe("sunlightOverTime", () => {
  it("zero-fills and sums per day, oldest first", () => {
    const events: SunlightEvent[] = [
      { id: "1", amount: 20, reason: "planted", ref_id: null, occurred_on: "2026-07-17" },
      { id: "2", amount: 10, reason: "tailored_bonus", ref_id: null, occurred_on: "2026-07-17" },
      { id: "3", amount: 15, reason: "outreach", ref_id: null, occurred_on: "2026-07-15" },
    ];
    const series = sunlightOverTime(events, 3, "2026-07-17");
    expect(series).toEqual([
      { date: "2026-07-15", amount: 15 },
      { date: "2026-07-16", amount: 0 },
      { date: "2026-07-17", amount: 30 },
    ]);
  });
});

describe("avgDaysPerStage", () => {
  it("averages time between consecutive events by the stage left behind", () => {
    const events = [
      ev({ application_id: "1", to_status: "planted", occurred_at: "2026-07-01T00:00:00Z" }),
      ev({ application_id: "1", to_status: "screening", occurred_at: "2026-07-05T00:00:00Z" }),
      ev({ application_id: "2", to_status: "planted", occurred_at: "2026-07-01T00:00:00Z" }),
      ev({ application_id: "2", to_status: "screening", occurred_at: "2026-07-03T00:00:00Z" }),
    ];
    const durations = avgDaysPerStage(events);
    const planted = durations.find((d) => d.status === "planted")!;
    expect(planted.avgDays).toBe(3); // (4 + 2) / 2
    expect(planted.samples).toBe(2);
  });
});
