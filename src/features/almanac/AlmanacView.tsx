import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayPoint, FunnelStep, SourceRate, StageDuration } from "./aggregate";

const AXIS = { fontSize: 11, fill: "var(--ink-soft)", fontFamily: "var(--font-mono)" };
const GRID = "var(--border)";
const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--ink)",
  fontSize: 12,
};

export interface AlmanacData {
  hasApps: boolean;
  funnelData: FunnelStep[];
  sourceData: (SourceRate & { pct: number })[];
  sunlightData: (DayPoint & { short: string })[];
  sunlightCount: number;
  stageData: StageDuration[];
}

/** Presentational charts — pure props, so a dev preview can feed mock data. */
export function AlmanacView({ data }: { data: AlmanacData }) {
  return (
    <>
      <ChartCard title="Pipeline funnel" empty={!data.hasApps} emptyHint="Plant a few seeds to see your funnel.">
        <ResponsiveContainer width="100%" height={Math.max(160, data.funnelData.length * 34)}>
          <BarChart data={data.funnelData} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis type="number" allowDecimals={false} tick={AXIS} stroke={GRID} />
            <YAxis type="category" dataKey="label" width={84} tick={AXIS} stroke={GRID} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--border)" }} />
            <Bar dataKey="count" fill="var(--leaf)" radius={[0, 4, 4, 0]} name="Reached" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Response rate by source"
        empty={data.sourceData.length === 0}
        emptyHint="Add a source when you plant, and this fills in."
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.sourceData} margin={{ left: -12, right: 8 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="source" tick={AXIS} stroke={GRID} />
            <YAxis unit="%" domain={[0, 100]} tick={AXIS} stroke={GRID} />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "var(--border)" }}
              formatter={((value: number, _name: string, item: { payload?: { responded: number; total: number } }) => {
                const p = item.payload;
                return [`${value}%${p ? ` (${p.responded}/${p.total})` : ""}`, "Responded"];
              }) as never}
            />
            <Bar dataKey="pct" fill="var(--leaf)" radius={[4, 4, 0, 0]} name="Responded" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Sunlight, last 30 days"
        empty={data.sunlightCount === 0}
        emptyHint="Every bit of tending earns Sunlight — it'll show here."
      >
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.sunlightData} margin={{ left: -12, right: 8 }}>
            <defs>
              <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--marigold)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--marigold)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="short" tick={AXIS} stroke={GRID} minTickGap={24} />
            <YAxis allowDecimals={false} tick={AXIS} stroke={GRID} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--marigold)" }} />
            <Area type="monotone" dataKey="amount" stroke="var(--marigold)" strokeWidth={2} fill="url(#sun)" name="Sunlight" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Average days per stage"
        empty={data.stageData.length === 0}
        emptyHint="As flowers move through stages, their pace shows here."
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.stageData} margin={{ left: -12, right: 8 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tick={AXIS} stroke={GRID} />
            <YAxis unit="d" tick={AXIS} stroke={GRID} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--border)" }} />
            <Bar dataKey="avgDays" fill="var(--mist)" radius={[4, 4, 0, 0]} name="Avg days" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

function ChartCard({
  title,
  empty,
  emptyHint,
  children,
}: {
  title: string;
  empty: boolean;
  emptyHint: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5 rounded-xl border border-line bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-ink">{title}</h2>
      {empty ? <p className="py-8 text-center text-sm text-mist">{emptyHint}</p> : children}
    </section>
  );
}
