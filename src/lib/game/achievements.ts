/**
 * Achievements — unlock logic only in Phase 2; the pressed-flower wall
 * screen arrives in Phase 4. Badges carry no Sunlight (effort actions and
 * quests are the XP sources); they're keepsakes.
 */

export interface AchievementStats {
  totalApplications: number;
  totalComposted: number; // compost-reason sunlight events
  currentStreak: number;
  everReachedBloom: boolean; // any application hit offer/accepted
  totalInterviews: number;
}

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  earned: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_seed",
    title: "First seed",
    description: "Planted your first application.",
    earned: (s) => s.totalApplications >= 1,
  },
  {
    key: "ten_seeds",
    title: "Ten seeds",
    description: "Ten applications in the ground.",
    earned: (s) => s.totalApplications >= 10,
  },
  {
    key: "first_compost",
    title: "First compost",
    description: "Turned a rejection into richer soil.",
    earned: (s) => s.totalComposted >= 1,
  },
  {
    key: "week_streak",
    title: "A week of rain",
    description: "Watered your garden seven days running.",
    earned: (s) => s.currentStreak >= 7,
  },
  {
    key: "first_interview",
    title: "First interview",
    description: "A flower budded — someone wants to talk.",
    earned: (s) => s.totalInterviews >= 1,
  },
  {
    key: "first_bloom",
    title: "First bloom",
    description: "An application reached an offer.",
    earned: (s) => s.everReachedBloom,
  },
  // full_bouquet_5 arrives with the bouquet screen in Phase 4
];

/** Newly earned achievements, given current stats and already-unlocked keys. */
export function evaluateAchievements(
  stats: AchievementStats,
  unlocked: ReadonlySet<string>,
): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !unlocked.has(a.key) && a.earned(stats));
}
