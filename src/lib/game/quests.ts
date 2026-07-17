import { DAILY_QUEST_REWARD, WEEKLY_QUEST_REWARD, type SunlightReason } from "./sunlight";
import { addDays, weekStart } from "./dates";

/**
 * Quests — spec §5.4. Two rotating dailies + one weekly, all achievable in
 * under an hour total. Generated on first app-open of the day (client-side;
 * fine for a single user). DB quest rows carry no def key, so titles are the
 * join key — they must stay unique here and never be edited mid-week.
 */

export interface QuestDef {
  kind: "daily" | "weekly";
  title: string;
  target: number;
  reward: number;
}

/** What just happened, for quest matching. */
export interface QuestAction {
  reason: SunlightReason;
  /** days the touched application had been idle (outreach/followup only) */
  idleDays?: number;
  /** the touched application is a dream company */
  isDream?: boolean;
}

export const DAILY_POOL: QuestDef[] = [
  { kind: "daily", title: "Plant 1 seed", target: 1, reward: DAILY_QUEST_REWARD },
  { kind: "daily", title: "Log 1 outreach", target: 1, reward: DAILY_QUEST_REWARD },
  { kind: "daily", title: "Water a wilting lead", target: 1, reward: DAILY_QUEST_REWARD },
  { kind: "daily", title: "Complete 1 prep task", target: 1, reward: DAILY_QUEST_REWARD },
];

export const WEEKLY_POOL: QuestDef[] = [
  { kind: "weekly", title: "Plant 5 seeds", target: 5, reward: WEEKLY_QUEST_REWARD },
  { kind: "weekly", title: "Reach out at 2 dream companies", target: 2, reward: WEEKLY_QUEST_REWARD },
  { kind: "weekly", title: "Complete a full prep checklist", target: 5, reward: WEEKLY_QUEST_REWARD },
];

/** Plain-language hints shown in the UI (titles are the DB join key — never edit those). */
export const QUEST_HINTS: Record<string, string> = {
  "Plant 1 seed": "Submit one application today.",
  "Log 1 outreach": "Message someone — recruiter, alum, future teammate.",
  "Water a wilting lead": "Follow up on any flower that's been quiet 7+ days (they droop when thirsty).",
  "Plant 5 seeds": "Five applications this week.",
  "Reach out at 2 dream companies": "Outreach on flowers marked as dream companies.",
  "Complete 1 prep task": "Tick any task on an interview prep checklist.",
  "Complete a full prep checklist": "Five prep tasks this week — a whole checklist's worth.",
};

function seededIndex(seed: string, mod: number, salt = 0): number {
  let h = salt;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h) % mod;
}

/** Two distinct dailies for the date, rotating deterministically. */
export function pickDaily(dateStr: string): QuestDef[] {
  const first = seededIndex(dateStr, DAILY_POOL.length);
  const second = (first + 1 + seededIndex(dateStr, DAILY_POOL.length - 1, 7)) % DAILY_POOL.length;
  return [DAILY_POOL[first], DAILY_POOL[second]];
}

export function pickWeekly(dateStr: string): QuestDef {
  return WEEKLY_POOL[seededIndex(weekStart(dateStr), WEEKLY_POOL.length)];
}

export function questWindow(def: QuestDef, today: string): { assigned_on: string; expires_on: string } {
  if (def.kind === "daily") return { assigned_on: today, expires_on: today };
  const start = weekStart(today);
  return { assigned_on: start, expires_on: addDays(start, 6) };
}

/** Does this action advance a quest with this title? */
export function actionMatchesQuest(title: string, action: QuestAction): boolean {
  switch (title) {
    case "Plant 1 seed":
    case "Plant 5 seeds":
      return action.reason === "planted";
    case "Log 1 outreach":
      return action.reason === "outreach";
    case "Water a wilting lead":
      return (
        (action.reason === "followup" || action.reason === "outreach") &&
        (action.idleDays ?? 0) >= 7
      );
    case "Reach out at 2 dream companies":
      return action.reason === "outreach" && action.isDream === true;
    case "Complete 1 prep task":
    case "Complete a full prep checklist":
      return action.reason === "prep_task" || action.reason === "mock";
    default:
      return false;
  }
}
