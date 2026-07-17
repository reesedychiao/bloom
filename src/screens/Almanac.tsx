import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useApplications } from "../lib/api/hooks";
import { supabase } from "../lib/supabase";
import {
  avgDaysPerStage,
  funnel,
  responseRateBySource,
  sunlightOverTime,
} from "../features/almanac/aggregate";
import { AlmanacView } from "../features/almanac/AlmanacView";
import type { StageEvent, SunlightEvent } from "../lib/types";

export function Almanac() {
  const { data: apps = [] } = useApplications();
  const { data: allEvents = [] } = useAllStageEvents();
  const { data: sunlight = [] } = useAllSunlight();

  const data = {
    hasApps: apps.length > 0,
    funnelData: funnel(apps, allEvents),
    sourceData: responseRateBySource(apps).map((s) => ({ ...s, pct: Math.round(s.rate * 100) })),
    sunlightData: sunlightOverTime(sunlight).map((d) => ({ ...d, short: d.date.slice(5) })),
    sunlightCount: sunlight.length,
    stageData: avgDaysPerStage(allEvents),
  };

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <Link to="/" className="text-sm text-ink-soft hover:text-ink">
          ← Garden
        </Link>
        <h1 className="text-lg text-ink">Almanac</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-5 text-sm text-ink-soft">
          A quiet weekly read on how your season is going — effort first, outcomes second.
        </p>
        <AlmanacView data={data} />
      </main>
    </div>
  );
}

// Almanac needs every stage_event and sunlight_event, not one application's.
function useAllStageEvents() {
  return useQuery({
    queryKey: ["almanac", "stage_events"],
    queryFn: async (): Promise<StageEvent[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("stage_events").select("*");
      if (error) throw error;
      return data as StageEvent[];
    },
  });
}

function useAllSunlight() {
  return useQuery({
    queryKey: ["almanac", "sunlight_events"],
    queryFn: async (): Promise<SunlightEvent[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase.from("sunlight_events").select("*");
      if (error) throw error;
      return data as SunlightEvent[];
    },
  });
}
