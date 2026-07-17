import type { GrowthStage, Status } from "../types";

/**
 * Growth is driven by pipeline progress: 0 seed, 1 sprout, 2 bud, 3 bloom.
 * Terminal statuses have no stage of their own — the flower wilts at whatever
 * stage it reached, so they resolve to the previous stage.
 *
 * Mirrors stage_for_status() in supabase/migrations/0001_init.sql — keep in sync.
 */
const STAGE_BY_STATUS: Partial<Record<Status, GrowthStage>> = {
  planted: 0,
  outreach: 0,
  screening: 1,
  interviewing: 2,
  offer: 3,
  accepted: 3,
};

export const TERMINAL_STATUSES: Status[] = ["rejected", "withdrawn", "ghosted"];

export function isTerminal(status: Status): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function stageForStatus(status: Status, previousStage: GrowthStage = 0): GrowthStage {
  return STAGE_BY_STATUS[status] ?? previousStage;
}

/**
 * Full growth rule (mirrors growth_stage_for in 0005_bloom_on_interview.sql):
 * a booked interview blooms the flower regardless of status. Terminal statuses
 * preserve the stage they had reached, so a bloom that's later rejected stays
 * at bloom — which is what keeps it in the bouquet.
 */
export function stageForApplication(
  status: Status,
  hasInterview: boolean,
  previousStage: GrowthStage = 0,
): GrowthStage {
  if (isTerminal(status)) return previousStage;
  const base = stageForStatus(status, previousStage);
  return Math.max(base, hasInterview ? 3 : 0) as GrowthStage;
}
