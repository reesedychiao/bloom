import { AlmanacView } from "../features/almanac/AlmanacView";

/** Dev-only: renders the almanac charts with mock data so the visuals can be
 *  reviewed without auth or a seeded database. Not linked from the app. */
export function AlmanacPreview() {
  const data = {
    hasApps: true,
    funnelData: [
      { status: "planted" as const, label: "Planted", count: 24 },
      { status: "outreach" as const, label: "Outreach", count: 15 },
      { status: "screening" as const, label: "Screening", count: 9 },
      { status: "interviewing" as const, label: "Interviewing", count: 5 },
      { status: "offer" as const, label: "Offer", count: 2 },
      { status: "accepted" as const, label: "Accepted", count: 1 },
    ],
    sourceData: [
      { source: "linkedin", total: 12, responded: 5, rate: 0.42, pct: 42 },
      { source: "referral", total: 6, responded: 5, rate: 0.83, pct: 83 },
      { source: "company_site", total: 5, responded: 1, rate: 0.2, pct: 20 },
      { source: "recruiter", total: 3, responded: 2, rate: 0.67, pct: 67 },
    ],
    sunlightData: Array.from({ length: 30 }, (_, i) => {
      const date = `2026-06-${String(18 + i).padStart(2, "0")}`;
      return { date, amount: Math.round(30 + 60 * Math.abs(Math.sin(i / 3))), short: date.slice(5) };
    }),
    sunlightCount: 30,
    stageData: [
      { status: "planted" as const, label: "Planted", avgDays: 4.2, samples: 15 },
      { status: "outreach" as const, label: "Outreach", avgDays: 6.1, samples: 9 },
      { status: "screening" as const, label: "Screening", avgDays: 8.5, samples: 5 },
      { status: "interviewing" as const, label: "Interviewing", avgDays: 11.3, samples: 2 },
    ],
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-lg text-ink">Almanac preview (mock data)</h1>
        <AlmanacView data={data} />
      </main>
    </div>
  );
}
