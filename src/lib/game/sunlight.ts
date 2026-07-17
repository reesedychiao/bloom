/**
 * Sunlight (XP) values — spec §5.1. Rewards effort the user controls;
 * outcomes only move the flower's visuals, never the bulk of the points.
 */

export type SunlightReason =
  | "planted"
  | "tailored_bonus"
  | "outreach"
  | "followup"
  | "prep_task"
  | "mock"
  | "stage_advance"
  | "compost"
  | "quest"
  | "achievement";

export const SUNLIGHT_FOR: Record<Exclude<SunlightReason, "quest" | "achievement">, number> = {
  planted: 20,
  tailored_bonus: 10,
  outreach: 15,
  followup: 10,
  prep_task: 25,
  mock: 40,
  stage_advance: 15,
  compost: 15,
};

/** "Small compost credit" for quietly folding a ghosted lead — deliberately
 *  less than a real compost (15), which requires facing the rejection. */
export const GHOSTED_CREDIT = 10;

export const DAILY_QUEST_REWARD = 20;
export const WEEKLY_QUEST_REWARD = 60;
